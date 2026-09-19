import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, notFound, ok, serverError } from "../lib/response";
import { axisAverage } from "../lib/ratings";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const businessId = event.pathParameters?.id;
    if (!businessId) return badRequest("businessId is required");

    const [businessRes, summaryRes] = await Promise.all([
      ddb.send(new GetCommand({ TableName: TABLES.BUSINESSES, Key: { businessId } })),
      ddb.send(new GetCommand({ TableName: TABLES.SUMMARIES, Key: { businessId } })),
    ]);

    const business = businessRes.Item;
    if (!business) return notFound("Business not found");

    const subRatings = {
      food: axisAverage(business.ratings?.food),
      service: axisAverage(business.ratings?.service),
      cleanliness: axisAverage(business.ratings?.cleanliness),
      value: axisAverage(business.ratings?.value),
    };
    const overall =
      Math.round(
        ((subRatings.food + subRatings.service + subRatings.cleanliness + subRatings.value) / 4) * 100
      ) / 100;

    const visitCount = business.visitCount ?? 0;
    const reviewCount = business.reviewCount ?? 0;
    const conversionPct = visitCount > 0 ? Math.round((reviewCount / visitCount) * 1000) / 10 : 0;

    return ok({
      business: {
        businessId: business.businessId,
        name: business.name,
        category: business.category,
        city: business.city,
        logoUrl: business.logoUrl,
        createdAt: business.createdAt,
      },
      overall,
      subRatings,
      visitCount,
      reviewCount,
      conversionPct,
      summary: summaryRes.Item ?? null,
    });
  } catch (err) {
    console.error("getProfile failed", err);
    return serverError();
  }
};
