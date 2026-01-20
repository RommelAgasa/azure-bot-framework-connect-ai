import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';

async function healthHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return {
    status: 200,
    body: 'Bot is running'
  };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: healthHandler
});
