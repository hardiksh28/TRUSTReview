import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, conflict, notFound, ok, parseBody, serverError } from "../lib/response";
import { haversineMeters } from "../lib/geo";

/**
 * The critical endpoint. A token can be redeemed exactly once.
 * Enforced with a DynamoDB conditional UpdateItem, not application logic:
 * two simultaneous scans of the same token cannot both succeed.
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const tokenId = event.pathParameters?.tokenId;
    if (!tokenId) return badRequest("tokenId is required");

    const body = parseBody(event);
    const who = typeof body.who === "string" ? body.who : "anon";
    const scannerLat = typeof body.lat === "number" ? body.lat : null;
    const scannerLng = typeof body.lng === "number" ? body.lng : null;
    const nowSeconds = Math.floor(Date.now() / 1000);

    try {
      const result = await ddb.send(
        new UpdateCommand({
          TableName: TABLES.TOKENS,
          Key: { tokenId },
          UpdateExpression: "SET used = :true, usedAt = :now, usedBy = :who",
          ConditionExpression:
            "attribute_exists(tokenId) AND used = :false AND expiresAt > :now",
          ExpressionAttributeValues: {
            ":true": true,
            ":false": false,
            ":now": nowSeconds,
            ":who": who,
          },
          ReturnValues: "ALL_NEW",
        })
      );

      const businessId = result.Attributes?.businessId as string;

      // Best-effort visit counter bump. Does not gate the redeem response —
      // the token is already spent at this point regardless of this call's outcome.
      // ReturnValues also hands back the business's registered location (if
      // any) in the same round trip, so a distance check costs no extra read.
      let redeemDistanceMeters: number | null = null;
      try {
        const bizUpdate = await ddb.send(
          new UpdateCommand({
            TableName: TABLES.BUSINESSES,
            Key: { businessId },
            UpdateExpression: "SET visitCount = if_not_exists(visitCount, :zero) + :one",
            ExpressionAttributeValues: { ":zero": 0, ":one": 1 },
            ReturnValues: "ALL_NEW",
          })
        );
        const location = bizUpdate.Attributes?.location as
          | { lat: number; lng: number }
          | null
          | undefined;
        if (location && scannerLat !== null && scannerLng !== null) {
          redeemDistanceMeters = Math.round(
            haversineMeters(location, { lat: scannerLat, lng: scannerLng })
          );
        }
      } catch (e) {
        console.error("visitCount bump failed", e);
      }

      // Soft signal only, read later by riskScorer — never gates this response.
      if (redeemDistanceMeters !== null) {
        await ddb
          .send(
            new UpdateCommand({
              TableName: TABLES.TOKENS,
              Key: { tokenId },
              UpdateExpression: "SET redeemDistanceMeters = :d",
              ExpressionAttributeValues: { ":d": redeemDistanceMeters },
            })
          )
          .catch((e) => console.error("redeemDistanceMeters store failed", e));
      }

      return ok({
        redeemed: true,
        businessId,
        tokenId,
        usedAt: nowSeconds,
      });
    } catch (err: any) {
      if (err?.name !== "ConditionalCheckFailedException") throw err;

      // Distinguish the failure for the UI.
      const existing = await ddb.send(
        new GetCommand({ TableName: TABLES.TOKENS, Key: { tokenId } })
      );

      if (!existing.Item) {
        return conflict("EXPIRED", "This code has expired.");
      }
      if (existing.Item.used === true) {
        return conflict("ALREADY_USED", "This code has already been used.");
      }
      // Item exists, used === false, so the condition failed on expiresAt.
      return conflict("EXPIRED", "This code has expired.");
    }
  } catch (err) {
    console.error("redeemToken failed", err);
    return serverError();
  }
};
