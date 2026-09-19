import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLES = {
  BUSINESSES: process.env.BUSINESSES_TABLE ?? "Businesses",
  TOKENS: process.env.TOKENS_TABLE ?? "Tokens",
  REVIEWS: process.env.REVIEWS_TABLE ?? "Reviews",
  SUMMARIES: process.env.SUMMARIES_TABLE ?? "Summaries",
};

export const REVIEWS_GSI = "businessId-createdAt-index";
export const REVIEWS_AUTHOR_GSI = "authorId-createdAt-index";
export const BUSINESSES_OWNER_GSI = "ownerId-index";
