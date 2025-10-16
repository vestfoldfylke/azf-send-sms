// This line is necessary to enable source map support for better error stack traces in Node.js
import 'source-map-support/register.js'

import { count } from '@vestfoldfylke/vestfold-metrics'
import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger, logConfig } from '@vtfk/logger'

import { HTTPError } from '../lib/HTTPError.js'
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName, MetricsResultSuccessLabelValue } from '../constants.js'

export async function errorHandling(request: HttpRequest, context: InvocationContext, next: (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>): Promise<HttpResponseInit> {
  try {
    logConfig({
      azure: {
        context: {
          invocationId: context.invocationId,
        }
      }
    })

    const result = await next(request, context)
    count(`${MetricsPrefix}_${next.name}_called`, `Number of times ${next.name} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])

    return result
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.data !== undefined) {
        logger('error', [request.method, request.url, error.status.toString(), error.message, error.data, error.stack])
          .catch()
      } else {
        logger('error', [request.method, request.url, error.status.toString(), error.message, error.stack])
          .catch()
      }

      count(`${MetricsPrefix}_${next.name}_called`, `Number of times ${next.name} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
      return error.toResponse(true)
    }

    logger('error', [request.method, request.url, 400, error.message, error.stack])
      .catch()
    count(`${MetricsPrefix}_${next.name}_called`, `Number of times ${next.name} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])

    return {
      status: 400,
      body: error.message
    }
  }
}
