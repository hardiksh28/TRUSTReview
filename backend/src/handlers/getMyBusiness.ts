import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES, BUSINESSES_OWNER_GSI } from "../lib/dynamo";
import { ok, serverError, unauthorized } from "../lib/response";
import { getUserSub } from "../lib/auth";

/**
 * GET /businesses/mine (owner auth)
 * Not in the original API contract table, but required glue: after login,
 * the dashboard needs to resolve every business this owner has (multi-location
 * support — one owner can run several Trust Profiles) without them having to
 * remember/paste a businessId.
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
      })
    );

    return ok({ businesses: result.Items ?? [] });
  } catch (err) {
    console.error("getMyBusiness failed", err);
    return serverError();
  }
};
