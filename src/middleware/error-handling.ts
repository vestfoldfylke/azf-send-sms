// This line is necessary to enable source map support for better error stack traces in Node.js
import "source-map-support/register.js";

import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { logger } from "@vestfoldfylke/loglady";

import type { LogConfig } from "@vestfoldfylke/loglady/dist/types/types/log-config.types";

import { count } from "@vestfoldfylke/vestfold-metrics";
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName, MetricsResultSuccessLabelValue } from "../constants.js";
import { HTTPError } from "../lib/HTTPError.js";
import { runInContext } from "./async-local-context.js";

export async function errorHandling(
  request: HttpRequest,
  context: InvocationContext,
  next: (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>
): Promise<HttpResponseInit> {
  const logContext: LogConfig = {
    contextId: context.invocationId
  };

  return await runInContext<HttpResponseInit>(logContext, async (): Promise<HttpResponseInit> => {
    try {
      const result: HttpResponseInit = await next(request, context);
      count(`${MetricsPrefix}_${next.name}_called`, `Number of times ${next.name} endpoint is called`, [
        MetricsResultLabelName,
        MetricsResultSuccessLabelValue
      ]);

      return result;
    } catch (error) {
      count(`${MetricsPrefix}_${next.name}_called`, `Number of times ${next.name} endpoint is called`, [
        MetricsResultLabelName,
        MetricsResultFailedLabelValue
      ]);

      if (error instanceof HTTPError) {
        logger.errorException(
          error,
          "Error on {Method} to {Url} with status {Status}. Data: {@Data}",
          request.method,
          request.url,
          error.status,
          error.data
        );
        return error.toResponse(true);
      }

      logger.errorException(error, "Error on {Method} to {Url} with status {Status}", request.method, request.url, 400);
      return {
        status: 400,
        body: error.message
      };
    } finally {
      await logger.flush();
    }
  });
}
