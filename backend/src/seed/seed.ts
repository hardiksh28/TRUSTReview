/**
 * Seed script (F12). Creates one demo business with ~15 realistic reviews
 * so the Trust Profile, dashboard and admin screens never look empty on
 * camera, plus a demo owner + demo admin Cognito login.
 *
 * Usage:
 *   STACK_NAME=trustreview npm run seed
 * (STACK_NAME defaults to "trustreview". Reads all table/user-pool names
 * from the CloudFormation stack outputs, so nothing needs to be copy-pasted.)
 */
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { EMPTY_RATING_SUMS, overallOf, type RatingSums } from "../lib/ratings";
import { SEED_REVIEWS } from "./reviewData";

const STACK_NAME = process.env.STACK_NAME || "trustreview";
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || "owner@trustreview.demo";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || "TrustReview!2026";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@trustreview.demo";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "TrustReview!2026";

const BUSINESS_ID = "biz_demo001";
const EXTRA_NON_CONVERTING_VISITS = 7; // visits that never turned into a review

async function getStackOutputs(region: string) {
  const cfn = new CloudFormationClient({ region });
  const res = await cfn.send(new DescribeStacksCommand({ StackName: STACK_NAME }));
  const outputs = res.Stacks?.[0]?.Outputs ?? [];
  const map: Record<string, string> = {};
  for (const o of outputs) {
    if (o.OutputKey && o.OutputValue) map[o.OutputKey] = o.OutputValue;
  }
  return map;
}

async function ensureCognitoUser(
  cognito: CognitoIdentityProviderClient,
  userPoolId: string,
  email: string,
  password: string,
  group?: string
) {
  try {
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS",
      })
    );
  } catch (err: any) {
    if (err?.name !== "UsernameExistsException") throw err;
  }

  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email,
      Password: password,
      Permanent: true,
    })
  );

  if (group) {
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: email,
        GroupName: group,
      })
    );
  }
}

async function main() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
  console.log(`Reading stack outputs for "${STACK_NAME}" in ${region}...`);
  const outputs = await getStackOutputs(region);

  const businessesTable = outputs.BusinessesTableName;
  const tokensTable = outputs.TokensTableName;
  const reviewsTable = outputs.ReviewsTableName;
  const summariesTable = outputs.SummariesTableName;
  const userPoolId = outputs.UserPoolId;
  const apiUrl = outputs.ApiUrl;

  if (!businessesTable || !tokensTable || !reviewsTable || !summariesTable || !userPoolId) {
    throw new Error(
      `Missing stack outputs. Got: ${JSON.stringify(outputs, null, 2)}. ` +
        `Did "sam deploy" finish successfully for stack "${STACK_NAME}"?`
    );
  }

  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
  const cognito = new CognitoIdentityProviderClient({ region });

  console.log("Creating demo owner + demo admin Cognito users...");
  await ensureCognitoUser(cognito, userPoolId, OWNER_EMAIL, OWNER_PASSWORD);
  await ensureCognitoUser(cognito, userPoolId, ADMIN_EMAIL, ADMIN_PASSWORD, "admins");

  // The owner Cognito user doubles as the business's ownerId for this demo;
  // read back its `sub` so dashboard login (JWT sub) matches ownerId.
  const ownerUser = await cognito.send(
    new AdminGetUserCommand({ UserPoolId: userPoolId, Username: OWNER_EMAIL })
  );
  const ownerId =
    ownerUser.UserAttributes?.find((a) => a.Name === "sub")?.Value ?? OWNER_EMAIL;

  console.log("Building business + reviews...");
  const now = Date.now();
  const ratings: RatingSums = JSON.parse(JSON.stringify(EMPTY_RATING_SUMS));

  const reviewItems = SEED_REVIEWS.map((r, i) => {
    const createdAtMs = now - r.daysAgo * 24 * 60 * 60 * 1000;
    const createdAt = new Date(createdAtMs).toISOString();
    const authorSince = createdAtMs - r.authorAgeHours * 60 * 60 * 1000;
    const tokenIssuedAt = Math.floor((createdAtMs - 15 * 60 * 1000) / 1000);
    const tokenUsedAt = Math.floor((createdAtMs - 10 * 60 * 1000) / 1000);
    const isFlaggedSeed = i === SEED_REVIEWS.length - 1;

    (["food", "service", "cleanliness", "value"] as const).forEach((axis) => {
      ratings[axis].sum += r.ratings[axis];
      ratings[axis].n += 1;
    });

    return {
      tokenId: `tok_demo_${i}`,
      review: {
        reviewId: `rev_demo_${i}`,
        businessId: BUSINESS_ID,
        tokenId: `tok_demo_${i}`,
        authorId: isFlaggedSeed ? "anon_demo_flagged" : `anon_demo_${i}`,
        authorName: r.authorName,
        authorSince,
        ratings: r.ratings,
        overall: overallOf(r.ratings),
        text: r.text,
        createdAt,
        verified: true,
        riskScore: isFlaggedSeed ? 70 : 0,
        riskSignals: isFlaggedSeed ? ["NEW_ACCOUNT", "DUPLICATE_TEXT"] : [],
        hidden: false,
        response: r.response ? { text: r.response, respondedAt: createdAt } : null,
      },
      tokenIssuedAt,
      tokenUsedAt,
    };
  });

  const visitCount = SEED_REVIEWS.length + EXTRA_NON_CONVERTING_VISITS;

  await ddb.send(
    new PutCommand({
      TableName: businessesTable,
      Item: {
        businessId: BUSINESS_ID,
        name: "Sharma Ji Ka Dhaba",
        category: "Restaurant",
        city: "Jaipur",
        ownerId,
        logoUrl: null,
        createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
        visitCount,
        reviewCount: SEED_REVIEWS.length,
        ratings,
      },
    })
  );

  console.log(`Writing ${reviewItems.length} tokens + reviews...`);
  for (const item of reviewItems) {
    await ddb.send(
      new PutCommand({
        TableName: tokensTable,
        Item: {
          tokenId: item.tokenId,
          businessId: BUSINESS_ID,
          issuedAt: item.tokenIssuedAt,
          expiresAt: item.tokenIssuedAt + 3600,
          used: true,
          usedAt: item.tokenUsedAt,
          usedBy: item.review.authorId,
          reviewSubmitted: true,
        },
      })
    );
    await ddb.send(new PutCommand({ TableName: reviewsTable, Item: item.review }));
  }

  console.log(`Writing ${EXTRA_NON_CONVERTING_VISITS} non-converting visit tokens...`);
  for (let i = 0; i < EXTRA_NON_CONVERTING_VISITS; i++) {
    const issuedAt = Math.floor((now - (i + 1) * 36 * 60 * 60 * 1000) / 1000);
    await ddb.send(
      new PutCommand({
        TableName: tokensTable,
        Item: {
          tokenId: `tok_demo_novisit_${i}`,
          businessId: BUSINESS_ID,
          issuedAt,
          expiresAt: issuedAt + 3600,
          used: true,
          usedAt: issuedAt + 120,
          usedBy: `anon_novisit_${i}`,
          reviewSubmitted: false,
        },
      })
    );
  }

  console.log("Writing cached AI summary...");
  await ddb.send(
    new PutCommand({
      TableName: summariesTable,
      Item: {
        businessId: BUSINESS_ID,
        summary:
          "Customers consistently praise the food quality and value for money, especially the thali and dal makhani. Service speed during peak hours and occasional inconsistency in food temperature are the most repeated concerns.",
        positives: ["Food quality", "Value for money", "Staff friendliness"],
        concerns: ["Peak-hour service speed", "Occasional inconsistency"],
        basedOnReviews: SEED_REVIEWS.length,
        generatedAt: new Date().toISOString(),
      },
    })
  );

  console.log("\nSeed complete.\n");
  console.log(`Business:        ${BUSINESS_ID} (Sharma Ji Ka Dhaba)`);
  if (apiUrl) console.log(`Trust Profile:   GET ${apiUrl}/businesses/${BUSINESS_ID}`);
  console.log(`Owner login:     ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
  console.log(`Admin login:     ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Visits: ${visitCount}, Reviews: ${SEED_REVIEWS.length}, Conversion: ${Math.round((SEED_REVIEWS.length / visitCount) * 1000) / 10}%`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
