import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

/**
 * HTTP API JWT authorizer puts verified Cognito claims on the event.
 * `sub` is the stable Cognito user id we use as ownerId / authorId.
 */
export function getClaims(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  return event.requestContext.authorizer?.jwt?.claims;
}

export function getUserSub(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): string | null {
  const claims = getClaims(event);
  const sub = claims?.sub;
  return typeof sub === "string" ? sub : null;
}

export function getUserName(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): string {
  const claims = getClaims(event);
  const name = (claims?.email as string) ?? (claims?.["cognito:username"] as string);
  return typeof name === "string" ? name : "Business owner";
}

export function isInGroup(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  group: string
): boolean {
  const claims = getClaims(event);
  const raw = claims?.["cognito:groups"];
  if (!raw) return false;
  // API Gateway JWT authorizer serialises list claims as a
  // space/comma separated string or a JSON-looking string.
  const value = typeof raw === "string" ? raw : String(raw);
  return value
    .replace(/[[\]"]/g, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .includes(group);
}
