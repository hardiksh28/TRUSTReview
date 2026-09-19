import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { forbidden, ok, serverError, unauthorized } from "../lib/response";
import { getUserSub, isInGroup } from "../lib/auth";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    if (!getUserSub(ev)) return unauthorized();
    if (!isInGroup(ev, "admins")) return forbidden("Admin access required");

    // Hackathon scale: a Scan with a filter is fine. At real scale this would
    // be a GSI on riskScore, or a stream-driven "flagged" projection table.
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLES.REVIEWS,
        FilterExpression: "riskScore >= :min",
        ExpressionAttributeValues: { ":min": 50 },
      })
    );

    const reviews = (result.Items ?? []).sort(
      (a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)
    );

    return ok({ reviews });
  } catch (err) {
    console.error("adminListFlagged failed", err);
    return serverError();
  }
};
