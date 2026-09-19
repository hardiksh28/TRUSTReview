import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, created, forbidden, notFound, serverError, unauthorized } from "../lib/response";
import { getUserSub } from "../lib/auth";

const TOKEN_TTL_SECONDS = 60 * 60; // token stays redeemable for 60 minutes

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    const ownerId = getUserSub(ev);
    if (!ownerId) return unauthorized();

    const businessId = event.pathParameters?.id;
    if (!businessId) return badRequest("businessId is required");

    const business = await ddb.send(
      new GetCommand({ TableName: TABLES.BUSINESSES, Key: { businessId } })
    );
    if (!business.Item) return notFound("Business not found");
    if (business.Item.ownerId !== ownerId) return forbidden("Not the owner of this business");

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenId = `tok_${uuid().slice(0, 8)}`;
    const item = {
      tokenId,
      businessId,
      issuedAt: nowSeconds,
      expiresAt: nowSeconds + TOKEN_TTL_SECONDS,
      used: false,
      usedAt: null,
      usedBy: null,
      reviewSubmitted: false,
    };

    await ddb.send(new PutCommand({ TableName: TABLES.TOKENS, Item: item }));

    return created({ tokenId, businessId, issuedAt: item.issuedAt, expiresAt: item.expiresAt });
  } catch (err) {
    console.error("issueToken failed", err);
    return serverError();
  }
};
