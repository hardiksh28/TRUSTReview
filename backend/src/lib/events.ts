import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

export const eventBridge = new EventBridgeClient({});
export const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME ?? "default";
export const EVENT_SOURCE = "trustreview.reviews";
