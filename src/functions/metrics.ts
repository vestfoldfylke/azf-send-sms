import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { register } from '@vestfoldfylke/vestfold-metrics'

export async function metrics(_: HttpRequest, __: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    headers: { 'Content-Type': register.contentType },
    body: await register.metrics()
  }
}

app.get('metrics', {
  authLevel: 'function',
  handler: metrics
})
