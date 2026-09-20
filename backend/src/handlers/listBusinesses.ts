import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { ok, serverError } from "../lib/response";
import { axisAverage } from "../lib/ratings";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    const res = await ddb.send(new ScanCommand({ TableName: TABLES.BUSINESSES }));

    const businesses = (res.Items ?? [])
      .map((business) => {
        const subRatings = {
          food: axisAverage(business.ratings?.food),
          service: axisAverage(business.ratings?.service),
          cleanliness: axisAverage(business.ratings?.cleanliness),
          value: axisAverage(business.ratings?.value),
        };
        const overall =
          Math.round(
            ((subRatings.food + subRatings.service + subRatings.cleanliness + subRatings.value) /
              4) *
              100
          ) / 100;

        return {
          businessId: business.businessId,
          name: business.name,
          category: business.category,
          city: business.city,
          overall,
          reviewCount: business.reviewCount ?? 0,
          visitCount: business.visitCount ?? 0,
        };
      })
      .sort((a, b) => b.reviewCount - a.reviewCount);

    return ok({ businesses });
  } catch (err) {
    console.error("listBusinesses failed", err);
    return serverError();
  }
};
