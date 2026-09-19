import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ok } from "../lib/response";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return ok({ status: "healthy", service: "trustreview-api", time: new Date().toISOString() });
};
