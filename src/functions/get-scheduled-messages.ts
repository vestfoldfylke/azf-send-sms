import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";

import type { MyLinkScheduledSmsMessage } from "../../types/mylink-scheduled-sms-message.js";
import type { MyLinkScheduledSmsMessagesResponse } from "../../types/mylink-scheduled-sms-messages-response.js";

import { config } from "../config.js";
import { GetAsync } from "../lib/mylink-caller.js";
import { errorHandling } from "../middleware/error-handling.js";

export async function getScheduledMessages(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const url = `${config.myLink.baseUrl}/schedules${request.query.has("size") ? `?size=${request.query.get("size")}` : ""}`;
  logger.info("Fetching scheduled messages from MyLink API: {Url}", url);

  const messages: MyLinkScheduledSmsMessage[] = [];
  let response = await GetAsync<MyLinkScheduledSmsMessagesResponse>(url);

  while (response.currentPage < response.pages) {
    messages.push(...response.items);

    const nextPageUrl = `${url}${url.includes("?") ? "&" : "?"}page=${response.currentPage + 1}`;
    logger.info("Fetching scheduled messages from MyLink API: {NextPageUrl}", nextPageUrl);
    response = await GetAsync<MyLinkScheduledSmsMessagesResponse>(nextPageUrl);
  }

  messages.push(...response.items);
  logger.info("Fetched {MessageCount} scheduled messages from MyLink API", messages.length);

  return {
    status: 200,
    jsonBody: messages
  };
}

app.get("getScheduledMessages", {
  authLevel: "function",
  route: "scheduled/messages",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> =>
    await errorHandling(request, context, getScheduledMessages)
});
