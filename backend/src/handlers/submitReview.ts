import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { ddb, TABLES } from "../lib/dynamo";
import { eventBridge, EVENT_BUS_NAME, EVENT_SOURCE } from "../lib/events";
import { badRequest, conflict, created, notFound, parseBody, serverError } from "../lib/response";
import { getUserSub, getUserName } from "../lib/auth";
import { isValidRatings, overallOf } from "../lib/ratings";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = parseBody(event);
    const { tokenId, businessId, ratings, text, anonId, anonSince } = body;

    if (typeof tokenId !== "string" || !tokenId) return badRequest("tokenId is required");
    if (typeof businessId !== "string" || !businessId) return badRequest("businessId is required");
    if (!isValidRatings(ratings)) return badRequest("ratings must be food/service/cleanliness/value numbers 1-5");
    if (typeof text !== "string" || text.trim().length === 0) return badRequest("text is required");
    if (text.length > 2000) return badRequest("text too long");

    // Server re-checks the token belongs to this business and was redeemed.
    const tokenRes = await ddb.send(new GetCommand({ TableName: TABLES.TOKENS, Key: { tokenId } }));
    const token = tokenRes.Item;
    if (!token) return notFound("Token not found");
    if (token.businessId !== businessId) return conflict("TOKEN_MISMATCH", "Token does not belong to this business");
    if (token.used !== true) return conflict("NOT_REDEEMED", "Token has not been redeemed");

    // Atomically claim the token for exactly one review. Ties the review to
    // exactly one verified visit, the same way redeem ties one visit to one token.
    try {
      await ddb.send(
        new UpdateCommand({
          TableName: TABLES.TOKENS,
          Key: { tokenId },
          UpdateExpression: "SET reviewSubmitted = :true",
          ConditionExpression:
            "attribute_exists(tokenId) AND used = :true AND (attribute_not_exists(reviewSubmitted) OR reviewSubmitted = :false)",
          ExpressionAttributeValues: { ":true": true, ":false": false },
        })
      );
    } catch (err: any) {
      if (err?.name === "ConditionalCheckFailedException") {
        return conflict("ALREADY_REVIEWED", "A review has already been submitted for this visit");
      }
      throw err;
    }

    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    const cognitoSub = getUserSub(ev);
    // Customers review anonymously (F6): the client persists a per-browser
    // anonId + first-seen timestamp so "account age" is meaningful for risk
    // scoring even without a Cognito identity.
    const authorId = cognitoSub ?? (typeof anonId === "string" && anonId ? anonId : `anon_${uuid().slice(0, 8)}`);
    const authorName = cognitoSub ? getUserName(ev) : "Verified customer";
    const authorSince =
      typeof anonSince === "number" && Number.isFinite(anonSince) ? anonSince : Date.now();

    const reviewId = `rev_${uuid().slice(0, 8)}`;
    const overall = overallOf(ratings);
    const createdAt = new Date().toISOString();

    const review = {
      reviewId,
      businessId,
      tokenId,
      authorId,
      authorName,
      authorSince,
      ratings,
      overall,
      text: text.trim(),
      createdAt,
      verified: true,
      riskScore: 0,
      riskSignals: [] as string[],
      hidden: false,
      response: null,
    };

    await ddb.send(new PutCommand({ TableName: TABLES.REVIEWS, Item: review }));

    await ddb.send(
      new UpdateCommand({
        TableName: TABLES.BUSINESSES,
        Key: { businessId },
        // "sum" and "value" are reserved words in DynamoDB's expression
        // grammar, so every nested attribute name here is aliased rather
        // than risk relying on which ones happen to be safe unescaped.
        UpdateExpression:
          "SET reviewCount = if_not_exists(reviewCount, :zero) + :one, " +
          "ratings.#food.#s = if_not_exists(ratings.#food.#s, :zero) + :food, " +
          "ratings.#food.#n = if_not_exists(ratings.#food.#n, :zero) + :one, " +
          "ratings.#service.#s = if_not_exists(ratings.#service.#s, :zero) + :service, " +
          "ratings.#service.#n = if_not_exists(ratings.#service.#n, :zero) + :one, " +
          "ratings.#cleanliness.#s = if_not_exists(ratings.#cleanliness.#s, :zero) + :cleanliness, " +
          "ratings.#cleanliness.#n = if_not_exists(ratings.#cleanliness.#n, :zero) + :one, " +
          "ratings.#value.#s = if_not_exists(ratings.#value.#s, :zero) + :value, " +
          "ratings.#value.#n = if_not_exists(ratings.#value.#n, :zero) + :one",
        ExpressionAttributeNames: {
          "#s": "sum",
          "#n": "n",
          "#food": "food",
          "#service": "service",
          "#cleanliness": "cleanliness",
          "#value": "value",
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":food": ratings.food,
          ":service": ratings.service,
          ":cleanliness": ratings.cleanliness,
          ":value": ratings.value,
        },
      })
    );

    // Off the request path: risk scoring + AI summarisation react to this event.
    await eventBridge
      .send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: EVENT_BUS_NAME,
              Source: EVENT_SOURCE,
              DetailType: "ReviewCreated",
              Detail: JSON.stringify({
                reviewId,
                businessId,
                tokenId,
                tokenIssuedAt: token.issuedAt,
                tokenUsedAt: token.usedAt,
                tokenDistanceMeters:
                  typeof token.redeemDistanceMeters === "number" ? token.redeemDistanceMeters : null,
              }),
            },
          ],
        })
      )
      .catch((e) => console.error("EventBridge publish failed", e));

    return created({ review });
  } catch (err) {
    console.error("submitReview failed", err);
    return serverError();
  }
};
