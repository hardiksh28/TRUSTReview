# TrustReview

**Proof-of-visit reviews for local businesses.**

> Every review on the internet is an unverified claim. TrustReview makes the visit itself the
> proof — a one-time QR code issued at the counter, spent once, tied to exactly one review. You
> cannot buy a review you did not earn.

Built for the Bharat Builds Tour (WeMakeDevs × AWS) hackathon, Ship It + Best UI tracks.

- **Live URL:** https://claude-admiring-cray-5mdfmc.d3tz9isp3b5bjs.amplifyapp.com
- **Demo Trust Profile:** https://claude-admiring-cray-5mdfmc.d3tz9isp3b5bjs.amplifyapp.com/b/?id=biz_demo001

## The problem

Small Indian businesses cannot prove they are good. Review farms are cheap. A new café with 12
honest reviews loses to a ghost kitchen with 400 bought ones. TrustReview gives a small business a
receipt for every real customer: a review can only exist if it is tied to a single-use QR code
that was redeemed at the counter and never redeemed again.

## Architecture

```
Customer phone            Amazon CloudFront /            Business laptop
  (scans QR)  ─────────►  AWS Amplify Hosting       ◄───── (shows rotating QR)
                           Next.js 14 App Router
                                    │  HTTPS (Cognito JWT)
                                    ▼
                           Amazon API Gateway
                              (HTTP API)
                                    │
        ┌───────────┬──────────────┼──────────────┬────────────┐
        ▼            ▼              ▼              ▼            ▼
   issueToken   redeemToken    submitReview    getProfile   respondToReview
   (Lambda)      (Lambda)       (Lambda)        (Lambda)       (Lambda)
        │            │              │              │            │
        └────────────┴──────┬───────┴──────────────┴────────────┘
                             ▼
                   Amazon DynamoDB              Amazon Cognito
                   Businesses                    User Pool
                   Tokens (TTL!)                 (owners + admins group)
                   Reviews
                   Summaries (AI cache)
                             │ on new review (PutEvents)
                             ▼
                   Amazon EventBridge
                             │
                ┌────────────┴─────────────┐
                ▼                           ▼
         riskScorer Lambda           summarise Lambda
         (4 boolean rules)           (→ Amazon Bedrock,
                                       cached in DynamoDB)

   Amazon CloudWatch Logs across every Lambda
```

### AWS services used (and why)

| Service | Why this one |
|---|---|
| **Amplify Hosting** | Hosts the Next.js 14 frontend on a global CDN, connected straight to the Git repo — push to deploy. |
| **API Gateway (HTTP API)** | Cheaper/faster than REST API; verifies Cognito JWTs natively via a JWT authorizer, so no auth code lives in the Lambdas. |
| **Lambda** | Traffic is spiky — one burst per customer visit. Scale-to-zero keeps cost near nothing. |
| **DynamoDB (TTL)** | Token expiry is enforced by the database itself, not a cron job. Single-digit-ms reads for the profile page. |
| **DynamoDB conditional writes** | Single-use token enforcement is atomic at the DB layer — two simultaneous scans of the same token cannot both succeed. This is the entire product. |
| **Cognito** | Managed auth for business owners (and an `admins` group for moderation) — no password handling in application code. |
| **EventBridge** | Risk scoring and AI summarisation happen off the request path, so submitting a review stays fast. |
| **Bedrock** | Managed LLM inference (Claude 3.5 Haiku) for the review summary card — no model hosting, IAM-scoped access. |
| **CloudWatch** | Logs and metrics for every Lambda. |

## Repository layout

```
infra/      AWS SAM template — every AWS resource in one file
backend/    TypeScript Lambda handlers + the seed script
frontend/   Next.js 14 App Router site (all 7 screens)
```

## Data model (DynamoDB)

Four on-demand tables, deliberately not single-table design:

- **Businesses** — `PK businessId`. Running rating sums (`{sum, n}` per axis) so averages are O(1)
  to read. GSI `ownerId-index` resolves "my business" after a Cognito owner logs in.
- **Tokens** — `PK tokenId`. `expiresAt` is a DynamoDB TTL attribute (epoch seconds), so expired
  tokens are deleted by the database itself. QR codes rotate every 60s for display, but each
  issued token stays redeemable for 60 minutes so a customer who scans and then takes a few
  minutes to write a review never gets locked out — while a screenshotted/posted token still dies
  within the hour and can only ever be spent once.
- **Reviews** — `PK reviewId`. GSI `businessId-createdAt-index` for the newest-first public feed,
  GSI `authorId-createdAt-index` for the RAPID_POSTING risk rule.
- **Summaries** — `PK businessId`. Cached Bedrock output.

## The core guarantee

A token can be redeemed exactly once. This is enforced with a single DynamoDB `UpdateItem` call
and a `ConditionExpression`, not application logic:

```
ConditionExpression: attribute_exists(tokenId) AND used = :false AND expiresAt > :now
```

`ConditionalCheckFailedException` → HTTP 409, never a 500. The client is then told apart whether
the code was already used or has expired (`backend/src/handlers/redeemToken.ts`). The same pattern
protects review submission: a token can produce at most one review, enforced by a second
conditional update on a `reviewSubmitted` flag (`backend/src/handlers/submitReview.ts`).

## Risk signals (F8) — deterministic, not AI

Four plain boolean rules, each worth points, capped at 100. Two or more signals firing shows a
⚠ **Flagged** badge on the business dashboard and in the admin panel — **the review is never
auto-hidden**. A human (the platform admin) decides.

| Signal | Condition | Points |
|---|---|---|
| `NEW_ACCOUNT` | Reviewer's anonymous identity is < 10 minutes old | 30 |
| `RAPID_POSTING` | Same reviewer has > 3 reviews in the last 5 minutes | 35 |
| `DUPLICATE_TEXT` | Review text is ≥ 85% trigram-similar to another review for the business | 40 |
| `STALE_TOKEN` | Token was redeemed > 24h after it was issued | 20 |

Customers review anonymously (F6), so "account age" for `NEW_ACCOUNT` is the age of a per-browser
identity persisted in `localStorage` (`frontend/lib/anon.ts`), sent with the review and trusted the
same way the rest of the risk model is: as a signal to a human, not a verdict.

## AI summary (F7)

`backend/src/handlers/summarise.ts` calls Bedrock with the exact prompt from the build plan and
caches the result in the `Summaries` table. **The Bedrock call is wrapped in try/catch with a
hardcoded fallback** — if Bedrock throttles, the model needs an inference profile, or the region is
wrong, the Trust Profile still renders.

Bedrock is not enabled in every region (notably not reliably in `ap-south-1`), so the rest of the
stack can deploy in one region while `summarise.ts` calls Bedrock in another — controlled
independently via the `BedrockRegion` / `BedrockModelId` SAM parameters.

## Setup / deploy

### Prerequisites

- Node.js 22.x
- AWS CLI v2, configured with credentials that can create IAM roles, Lambda, API Gateway,
  DynamoDB, Cognito, EventBridge, and invoke Bedrock
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- `esbuild` available on `PATH` (`npm install -g esbuild`) — SAM's TypeScript build method needs it
- An AWS account with **Bedrock model access enabled** for `anthropic.claude-3-5-haiku-20241022-v1:0`
  (or an inference profile ID) in your chosen Bedrock region. Request this in the Bedrock console
  under "Model access" — it is not on by default.

### 1. Deploy the backend infrastructure

```bash
cd backend && npm install && cd ..
cd infra
sam build
sam deploy --guided
```

On the guided prompts: stack name `trustreview`, region `ap-south-1` (or your preferred region —
see the Bedrock note above), allow SAM to create IAM roles, save the config for future deploys.

Note the `Outputs` printed at the end (`ApiUrl`, `UserPoolId`, `UserPoolClientId`) — the seed
script reads these automatically from the stack, and the frontend needs them in its environment.

### 2. Seed demo data

```bash
cd backend
STACK_NAME=trustreview npm run seed
```

Creates one demo business ("Sharma Ji Ka Dhaba") with 15 realistic reviews (one deliberately
flagged), plus two Cognito logins printed to the console:

- **Owner** — signs into `/dashboard` and owns the demo business
- **Admin** — signs into `/admin` and can see/hide the flagged review

(Override `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD`, etc. as environment variables if you want
different demo credentials.)

### 3. Deploy the frontend (AWS Amplify Hosting, static export)

The frontend is a **static export** (`next.config.mjs` sets `output: "export"`): every page fetches
its data from the API at runtime, so there's no server-side rendering to host. This sidesteps
Amplify's SSR "compute" hosting mode entirely, which expects a specific `.amplify-hosting`
build-output contract that a bare `next build` doesn't produce on its own. The three screens that
need a dynamic ID (Trust Profile, scan result, review form) read it from a query string
(`/b/?id=`, `/scan/?token=`, `/review/?token=`) rather than a path segment, since static export
can't pre-render unknown future IDs as path segments.

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In the Amplify console → **New app → Host web app**, connect this GitHub repo and branch.
3. On the build settings screen, click **Edit YML file** and use:
   ```yaml
   version: 1
   applications:
     - appRoot: frontend
       frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: out
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```
4. Add these environment variables in **Advanced settings** (values from the `sam deploy` outputs):
   - `NEXT_PUBLIC_API_URL` — the `ApiUrl` output
   - `NEXT_PUBLIC_USER_POOL_ID` — the `UserPoolId` output
   - `NEXT_PUBLIC_USER_POOL_CLIENT_ID` — the `UserPoolClientId` output
   - `NEXT_PUBLIC_DEMO_BUSINESS_ID` — `biz_demo001` (or leave unset to use that default)
5. Save and deploy. If the app was ever created/detected as platform `WEB_COMPUTE` (Amplify's SSR
   mode), switch it back to plain `WEB` static hosting first — `aws amplify update-app --app-id
   <id> --platform WEB` — otherwise it will look for the SSR manifest and fail with "Failed to find
   the deploy-manifest.json file."
6. (Optional hardening) Once you have the Amplify URL, re-run `sam deploy` with
   `--parameter-overrides AllowedOrigin=https://your-amplify-url` to restrict API CORS from `*` to
   the real frontend origin.

### Local frontend development

```bash
cd frontend
cp .env.local.example .env.local   # fill in the values from the deploy outputs
npm install
npm run dev
```

## API contract

| Method | Path | Auth | Behaviour |
|---|---|---|---|
| POST | `/businesses` | Owner | Create a business. Returns `businessId`. |
| GET | `/businesses/mine` | Owner | Resolve the signed-in owner's business (dashboard glue, not in the original spec table). |
| GET | `/businesses/{id}` | Public | Trust Profile payload: business + averages + conversion % + cached AI summary. |
| GET | `/businesses/{id}/reviews` | Public | Reviews newest-first. Excludes hidden. |
| POST | `/businesses/{id}/tokens` | Owner | Issue a fresh token. Dashboard calls this every 60s. |
| POST | `/tokens/{tokenId}/redeem` | Public | The critical endpoint — single-use, conditional write, 409 on reuse/expiry. |
| POST | `/reviews` | Public | Body includes `tokenId`. Server re-verifies the token was redeemed for this business and claims it for exactly one review. |
| POST | `/reviews/{id}/response` | Owner | One reply per review. Rejects if a response already exists. |
| GET | `/admin/flagged` | Admin | Reviews with `riskScore >= 50`. |
| PATCH | `/admin/reviews/{id}` | Admin | Set `hidden` true/false. |

## What's deliberately not built

Per the build plan's scope: categories, maps, geolocation, semantic search, filters, sentiment pie
charts, trend graphs, notifications, follows, photos, payments, loyalty, a mobile app. If time ran
out, this is also the cut order: admin panel → owner replies → risk signals → Bedrock summary →
dashboard polish. The single-use token, the rejection screen, the Trust Profile, and the seed data
were never on the table to cut.

## Known limitations

- **Next.js dependency version.** The build uses the latest available Next.js 14.2.x patch. One
  remaining critical CVE (RCE via the Image Optimization API's AVIF handling) has no backport to
  the 14.x line — but `next.config.mjs` sets `images.unoptimized: true`, which disables that API
  route entirely, so the vulnerable code path is not reachable in this deployment. Worth upgrading
  to Next 15/16 post-hackathon.
- **Admin flagged-review lookup is a table `Scan`.** Fine at hackathon scale; a GSI on `riskScore`
  (or a stream-driven projection) would be the real-scale fix.
- **`NEW_ACCOUNT` risk signal trusts a client-supplied timestamp** (the anonymous reviewer's
  first-seen time in `localStorage`), since customers never authenticate. It's a signal for a human
  moderator, not a cryptographic guarantee — consistent with "we flag, a human decides."

## What I learned

_(Fill this in after the hackathon — name a real bug you hit. Judges score this explicitly.)_
