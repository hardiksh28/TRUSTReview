import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, conflict, forbidden, notFound, ok, parseBody, serverError, unauthorized } from "../lib/response";
import { getUserSub } from "../lib/auth";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    const ownerId = getUserSub(ev);
    if (!ownerId) return unauthorized();

    const reviewId = event.pathParameters?.id;
    if (!reviewId) return badRequest("reviewId is required");

    const body = parseBody(event);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return badRequest("text is required");
    if (text.length > 1000) return badRequest("response too long");

    const reviewRes = await ddb.send(new GetCommand({ TableName: TABLES.REVIEWS, Key: { reviewId } }));
    const review = reviewRes.Item;
    if (!review) return notFound("Review not found");
    if (review.response) return conflict("ALREADY_RESPONDED", "This review already has a response");

    const businessRes = await ddb.send(
      new GetCommand({ TableName: TABLES.BUSINESSES, Key: { businessId: review.businessId } })
    );
    if (businessRes.Item?.ownerId !== ownerId) return forbidden("Not the owner of this business");

    const response = { text, respondedAt: new Date().toISOString() };

    try {
      await ddb.send(
        new UpdateCommand({
          TableName: TABLES.REVIEWS,
          Key: { reviewId },
          UpdateExpression: "SET #response = :response",
          ConditionExpression: "attribute_not_exists(#response) OR #response = :null",
          ExpressionAttributeNames: { "#response": "response" },
          ExpressionAttributeValues: { ":response": response, ":null": null },
        })
      );
    } catch (err: any) {
      if (err?.name === "ConditionalCheckFailedException") {
        return conflict("ALREADY_RESPONDED", "This review already has a response");
      }
      throw err;
    }

    return ok({ reviewId, response });
  } catch (err) {
    console.error("respondToReview failed", err);
    return serverError();
  }
};
