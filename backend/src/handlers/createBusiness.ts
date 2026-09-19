import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, created, serverError, unauthorized } from "../lib/response";
import { getUserSub } from "../lib/auth";
import { EMPTY_RATING_SUMS } from "../lib/ratings";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const ev = event as APIGatewayProxyEventV2WithJWTAuthorizer;
    const ownerId = getUserSub(ev);
    if (!ownerId) return unauthorized();

    const body = event.body ? JSON.parse(event.body) : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";

    if (!name) return badRequest("name is required");

    const businessId = `biz_${uuid().slice(0, 8)}`;
    const item = {
      businessId,
      name,
      category: category || "Business",
      city: city || "",
      ownerId,
      logoUrl: null,
      createdAt: new Date().toISOString(),
      visitCount: 0,
      reviewCount: 0,
      ratings: EMPTY_RATING_SUMS,
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLES.BUSINESSES,
        Item: item,
      })
    );

    return created({ businessId, business: item });
  } catch (err) {
    console.error("createBusiness failed", err);
    return serverError();
  }
};
