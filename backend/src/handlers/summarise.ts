import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES, REVIEWS_GSI } from "../lib/dynamo";

// Bedrock is not available in every region. The rest of the stack can live
// in ap-south-1; this client can be pointed at a Bedrock-enabled region
// (default us-east-1) independently via BEDROCK_REGION.
const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || process.env.AWS_REGION });

// If your account requires an inference profile instead of the bare model
// id (common for Claude 3.5 on-demand access), set BEDROCK_MODEL_ID to
// something like "us.anthropic.claude-3-5-haiku-20241022-v1:0".
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-haiku-20241022-v1:0";

const SYSTEM_PROMPT =
  "You analyse customer reviews for a local business. Respond with ONLY a JSON object, no preamble, no markdown fences.";

type ReviewCreatedDetail = {
  reviewId: string;
  businessId: string;
};

type EventBridgeEnvelope = {
  "detail-type": string;
  detail: ReviewCreatedDetail;
};

type SummaryShape = {
  summary: string;
  positives: string[];
  concerns: string[];
};

function fallbackSummary(businessName: string): SummaryShape {
  return {
    summary: `Customers reviewing ${businessName} have shared a mix of feedback. A detailed AI summary is temporarily unavailable, but individual verified reviews below tell the full story.`,
    positives: ["Verified customer feedback", "Consistent visit history", "Transparent review record"],
    concerns: ["AI summary temporarily unavailable"],
  };
}

function buildPrompt(businessName: string, reviewLines: string[]): string {
  return [
    `Here are the most recent verified reviews for "${businessName}":`,
    "",
    ...reviewLines,
    "",
    "Return exactly this shape:",
    "{",
    '  "summary": "two sentences, neutral tone, no marketing language",',
    '  "positives": ["three short noun phrases"],',
    '  "concerns": ["two short noun phrases"]',
    "}",
    "Base everything only on the reviews given. Do not invent details.",
  ].join("\n");
}

function parseModelOutput(raw: string): SummaryShape | null {
  try {
    // Model is instructed not to use fences, but strip them defensively.
    const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.summary === "string" &&
      Array.isArray(parsed.positives) &&
      Array.isArray(parsed.concerns)
    ) {
      return {
        summary: parsed.summary,
        positives: parsed.positives.slice(0, 3).map(String),
        concerns: parsed.concerns.slice(0, 2).map(String),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const handler = async (event: EventBridgeEnvelope) => {
  const { businessId } = event.detail;
  console.log("summarise processing", event.detail);

  const businessRes = await ddb.send(
    new GetCommand({ TableName: TABLES.BUSINESSES, Key: { businessId } })
  );
  const business = businessRes.Item;
  const businessName = business?.name ?? "this business";

  const reviewsRes = await ddb.send(
    new QueryCommand({
      TableName: TABLES.REVIEWS,
      IndexName: REVIEWS_GSI,
      KeyConditionExpression: "businessId = :businessId",
      ExpressionAttributeValues: { ":businessId": businessId },
      ScanIndexForward: false,
      Limit: 15,
    })
  );
  const reviews = (reviewsRes.Items ?? []).filter((r) => r.hidden !== true);

  let result: SummaryShape;

  // Non-negotiable: the page must render even if Bedrock throttles, the
  // region is wrong, or the model id needs an inference profile.
  try {
    if (reviews.length === 0) {
      throw new Error("no reviews yet");
    }

    const reviewLines = reviews.map(
      (r) => `[${r.overall}/5] ${String(r.text).slice(0, 300)}`
    );

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(businessName, reviewLines) }],
    };

    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(body),
      })
    );

    const payload = JSON.parse(new TextDecoder().decode(response.body));
    const text = payload?.content?.[0]?.text ?? "";
    const parsed = parseModelOutput(text);
    result = parsed ?? fallbackSummary(businessName);
  } catch (err) {
    console.error("Bedrock call failed, using fallback", err);
    result = fallbackSummary(businessName);
  }

  await ddb.send(
    new PutCommand({
      TableName: TABLES.SUMMARIES,
      Item: {
        businessId,
        summary: result.summary,
        positives: result.positives,
        concerns: result.concerns,
        basedOnReviews: reviews.length,
        generatedAt: new Date().toISOString(),
      },
    })
  );

  console.log("summarise done", { businessId, basedOnReviews: reviews.length });
};
