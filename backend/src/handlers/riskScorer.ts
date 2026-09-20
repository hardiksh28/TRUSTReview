import { GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES, REVIEWS_GSI, REVIEWS_AUTHOR_GSI } from "../lib/dynamo";
import { trigramSimilarity } from "../lib/similarity";

const POINTS = {
  NEW_ACCOUNT: 30,
  RAPID_POSTING: 35,
  DUPLICATE_TEXT: 40,
  STALE_TOKEN: 20,
  LOCATION_MISMATCH: 25,
  BUSINESS_BURST: 30,
};

const TEN_MINUTES_MS = 10 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const DUPLICATE_THRESHOLD = 0.85;
const STALE_TOKEN_SECONDS = 24 * 60 * 60;
const LOCATION_MISMATCH_METERS = 500;
const BUSINESS_BURST_WINDOW_MS = 15 * 60 * 1000;
const BUSINESS_BURST_THRESHOLD = 5;

type ReviewCreatedDetail = {
  reviewId: string;
  businessId: string;
  tokenId: string;
  tokenIssuedAt?: number;
  tokenUsedAt?: number;
  tokenDistanceMeters?: number | null;
};

type EventBridgeEnvelope = {
  "detail-type": string;
  detail: ReviewCreatedDetail;
};

/**
 * Plain deterministic rules, not an LLM. "We flag, a human decides":
 * this Lambda only ever raises riskScore/riskSignals — it never hides
 * or deletes a review.
 */
export const handler = async (event: EventBridgeEnvelope) => {
  const { reviewId, businessId, tokenIssuedAt, tokenUsedAt, tokenDistanceMeters } = event.detail;
  console.log("riskScorer processing", event.detail);

  const reviewRes = await ddb.send(new GetCommand({ TableName: TABLES.REVIEWS, Key: { reviewId } }));
  const review = reviewRes.Item;
  if (!review) {
    console.error("riskScorer: review not found", reviewId);
    return;
  }

  const signals: string[] = [];
  const reviewCreatedMs = Date.parse(review.createdAt);

  // NEW_ACCOUNT: author's first-seen timestamp is < 10 minutes before this review.
  const authorSince = typeof review.authorSince === "number" ? review.authorSince : reviewCreatedMs;
  if (reviewCreatedMs - authorSince < TEN_MINUTES_MS) {
    signals.push("NEW_ACCOUNT");
  }

  // RAPID_POSTING: same author has > 3 reviews in the last 5 minutes.
  const authorReviews = await ddb.send(
    new QueryCommand({
      TableName: TABLES.REVIEWS,
      IndexName: REVIEWS_AUTHOR_GSI,
      KeyConditionExpression: "authorId = :authorId AND createdAt >= :since",
      ExpressionAttributeValues: {
        ":authorId": review.authorId,
        ":since": new Date(reviewCreatedMs - FIVE_MINUTES_MS).toISOString(),
      },
    })
  );
  if ((authorReviews.Items?.length ?? 0) > 3) {
    signals.push("RAPID_POSTING");
  }

  // DUPLICATE_TEXT: >= 85% trigram-similar to another review of this business.
  const businessReviews = await ddb.send(
    new QueryCommand({
      TableName: TABLES.REVIEWS,
      IndexName: REVIEWS_GSI,
      KeyConditionExpression: "businessId = :businessId",
      ExpressionAttributeValues: { ":businessId": businessId },
      ScanIndexForward: false,
      Limit: 50,
    })
  );
  const isDuplicate = (businessReviews.Items ?? []).some(
    (r) => r.reviewId !== reviewId && trigramSimilarity(r.text, review.text) >= DUPLICATE_THRESHOLD
  );
  if (isDuplicate) {
    signals.push("DUPLICATE_TEXT");
  }

  // STALE_TOKEN: token redeemed > 24h after it was issued.
  if (typeof tokenIssuedAt === "number" && typeof tokenUsedAt === "number") {
    if (tokenUsedAt - tokenIssuedAt > STALE_TOKEN_SECONDS) {
      signals.push("STALE_TOKEN");
    }
  }

  // LOCATION_MISMATCH: the scanner's GPS position (if granted) was far from
  // the business's registered location. Only evaluated when both are known
  // (business opted into location, customer granted browser geolocation) —
  // silently skipped otherwise, so it never penalizes businesses or
  // customers who didn't opt in.
  if (typeof tokenDistanceMeters === "number" && tokenDistanceMeters > LOCATION_MISMATCH_METERS) {
    signals.push("LOCATION_MISMATCH");
  }

  // BUSINESS_BURST: this business received an unusually high number of
  // verified reviews in a short window, e.g. an owner or friends cycling
  // through the rotating code themselves rather than real, spread-out visits.
  const recentBusinessReviews = (businessReviews.Items ?? []).filter(
    (r) => r.reviewId !== reviewId && reviewCreatedMs - Date.parse(r.createdAt) < BUSINESS_BURST_WINDOW_MS
  ).length;
  if (recentBusinessReviews >= BUSINESS_BURST_THRESHOLD) {
    signals.push("BUSINESS_BURST");
  }

  const riskScore = Math.min(
    100,
    signals.reduce((sum, s) => sum + (POINTS[s as keyof typeof POINTS] ?? 0), 0)
  );

  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.REVIEWS,
      Key: { reviewId },
      UpdateExpression: "SET riskScore = :score, riskSignals = :signals",
      ExpressionAttributeValues: { ":score": riskScore, ":signals": signals },
    })
  );

  console.log("riskScorer done", { reviewId, riskScore, signals });
};
