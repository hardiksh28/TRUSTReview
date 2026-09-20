import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLES } from "../lib/dynamo";
import { badRequest, created, parseBody, serverError } from "../lib/response";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = parseBody(event);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name) return badRequest("name is required");
    if (!EMAIL_RE.test(email)) return badRequest("a valid email is required");
    if (!message) return badRequest("message is required");
    if (name.length > 200) return badRequest("name too long");
    if (message.length > 5000) return badRequest("message too long");

    const item = {
      messageId: `msg_${uuid().slice(0, 8)}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    await ddb.send(new PutCommand({ TableName: TABLES.CONTACT_MESSAGES, Item: item }));

    return created({ ok: true });
  } catch (err) {
    console.error("contact failed", err);
    return serverError();
  }
};
