import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, forbidden, ok, serverError, unauthorized } from "../lib/response";
import { getUserSub, isInGroup } from "../lib/auth";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    if (!getUserSub(ev)) return unauthorized();
    if (!isInGroup(ev, "admins")) return forbidden("Admin access required");

    const reviewId = event.pathParameters?.id;
    if (!reviewId) return badRequest("reviewId is required");

    const body = event.body ? JSON.parse(event.body) : {};
    if (typeof body.hidden !== "boolean") return badRequest("hidden must be a boolean");

    await ddb.send(
      new UpdateCommand({
        TableName: TABLES.REVIEWS,
        Key: { reviewId },
        UpdateExpression: "SET hidden = :hidden",
        ConditionExpression: "attribute_exists(reviewId)",
        ExpressionAttributeValues: { ":hidden": body.hidden },
      })
    );

    return ok({ reviewId, hidden: body.hidden });
  } catch (err: any) {
    if (err?.name === "ConditionalCheckFailedException") {
      return badRequest("Review not found");
    }
    console.error("adminModerateReview failed", err);
    return serverError();
  }
};
