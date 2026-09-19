import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES, BUSINESSES_OWNER_GSI } from "../lib/dynamo";
import { notFound, ok, serverError, unauthorized } from "../lib/response";
import { getUserSub } from "../lib/auth";

/**
 * GET /businesses/mine (owner auth)
 * Not in the original API contract table, but required glue: after login,
 * the dashboard (S3) needs to resolve "my business" without the owner
 * having to remember/paste their businessId.
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    const ownerId = getUserSub(ev);
    if (!ownerId) return unauthorized();

    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.BUSINESSES,
        IndexName: BUSINESSES_OWNER_GSI,
        KeyConditionExpression: "ownerId = :ownerId",
        ExpressionAttributeValues: { ":ownerId": ownerId },
        Limit: 1,
      })
    );

    const business = result.Items?.[0];
    if (!business) return notFound("No business found for this owner");

    return ok({ business });
  } catch (err) {
    console.error("getMyBusiness failed", err);
    return serverError();
  }
};
