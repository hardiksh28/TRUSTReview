import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES, REVIEWS_GSI } from "../lib/dynamo";
import { badRequest, ok, serverError } from "../lib/response";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const businessId = event.pathParameters?.id;
    if (!businessId) return badRequest("businessId is required");

    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.REVIEWS,
        IndexName: REVIEWS_GSI,
        KeyConditionExpression: "businessId = :businessId",
        ExpressionAttributeValues: { ":businessId": businessId },
        ScanIndexForward: false, // newest first
      })
    );

    const reviews = (result.Items ?? [])
      .filter((r) => r.hidden !== true)
      .map((r) => ({
        reviewId: r.reviewId,
        authorName: r.authorName,
        ratings: r.ratings,
        overall: r.overall,
        text: r.text,
        createdAt: r.createdAt,
        verified: r.verified,
        flagged: (r.riskSignals?.length ?? 0) >= 2,
        response: r.response ?? null,
      }));

    return ok({ reviews });
  } catch (err) {
    console.error("getReviews failed", err);
    return serverError();
  }
};
