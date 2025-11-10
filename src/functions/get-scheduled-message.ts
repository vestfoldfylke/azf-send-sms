import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { count } from "@vestfoldfylke/vestfold-metrics";

import type { MyLinkScheduledSmsMessage } from "../../types/mylink-scheduled-sms-message.js";

import { config } from "../config.js";
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName } from "../constants.js";
import { HTTPError } from "../lib/HTTPError.js";
import { GetAsync } from "../lib/mylink-caller.js";
import { errorHandling } from "../middleware/error-handling.js";

const MetricsFilePrefix = "getScheduledMessage";

export async function getScheduledMessage(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.params.messageId;

  if (!messageId) {
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [
      MetricsResultLabelName,
      MetricsResultFailedLabelValue
    ]);
    throw new HTTPError(400, "Bad Request: Missing messageId in path parameters");
  }

  const url = `${config.myLink.baseUrl}/schedules/${messageId}`;
  logger.info("Fetching scheduled message from MyLink API: {Url}", url);

  const response = await GetAsync<MyLinkScheduledSmsMessage>(url);

  return {
    status: 200,
    jsonBody: response
  };
}

app.get("getScheduledMessage", {
  authLevel: "function",
  route: "scheduled/messages/{messageId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> =>
    await errorHandling(request, context, getScheduledMessage)
});
