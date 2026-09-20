import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * API Gateway HTTP API base64-encodes the body for some request Content-Types
 * (e.g. clients that omit Content-Type or send a non-JSON one), signalled via
 * isBase64Encoded. Parsing event.body directly then throws on valid requests.
 */
export function parseBody(event: Pick<APIGatewayProxyEventV2, "body" | "isBase64Encoded">): any {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;
  return JSON.parse(raw);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
};

export function json(
  statusCode: number,
  body: unknown
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

export function ok(body: unknown) {
  return json(200, body);
}

export function created(body: unknown) {
  return json(201, body);
}

export function badRequest(message: string) {
  return json(400, { error: "BAD_REQUEST", message });
}

export function unauthorized(message = "Unauthorized") {
  return json(401, { error: "UNAUTHORIZED", message });
}

export function forbidden(message = "Forbidden") {
  return json(403, { error: "FORBIDDEN", message });
}

export function notFound(message = "Not found") {
  return json(404, { error: "NOT_FOUND", message });
}

export function conflict(reason: "ALREADY_USED" | "EXPIRED" | string, message: string) {
  return json(409, { error: "CONFLICT", reason, message });
}

export function serverError(message = "Internal server error") {
  return json(500, { error: "INTERNAL", message });
}
