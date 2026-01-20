import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import { BotFrameworkAdapter } from 'botbuilder';
import { EchoBot } from '../../bot';
import { config } from '../../config';
import { sendFacebookMessage } from '../../facebook';

const adapter = new BotFrameworkAdapter({
  appId: config.microsoftAppId,
  appPassword: config.microsoftAppPassword
});

const bot = new EchoBot();

async function messagesHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Handle Facebook webhook verification (GET request)
    if (request.method === 'GET') {
      const mode = request.query.get('hub.mode');
      const token = request.query.get('hub.verify_token');
      const challenge = request.query.get('hub.challenge');

      if (mode === 'subscribe' && token === config.facebookVerifyToken) {
        context.log('Facebook webhook verified');
        return {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
          body: challenge
        };
      } else {
        context.log('Facebook webhook verification failed');
        return {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Forbidden'
        };
      }
    }

    // Handle messages (POST request)
    if (request.method === 'POST') {
      const body = await request.json() as any;

      // Handle Facebook messages
      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const messaging_event of entry.messaging) {
            const sender_id = messaging_event.sender.id;
            const text = messaging_event.message?.text;

            if (text) {
              context.log(`Facebook message from ${sender_id}: ${text}`);
              const aiResponse = await bot.getAIResponse(text);
              await sendFacebookMessage(sender_id, aiResponse);
            }
          }
        }
        return { status: 200, body: 'OK' };
      }

      // Handle Azure Bot Framework (Web Chat)
      return new Promise((resolve: (value: HttpResponseInit) => void) => {
        adapter.processActivity(request as any, {} as any, async (botContext) => {
          if (botContext.activity.type === 'message') {
            const aiResponse = await bot.getAIResponse(botContext.activity.text);
            await botContext.sendActivity(aiResponse);
          }
          resolve({ status: 200, body: 'OK' });
        });
      });
    }

    return { status: 405, body: 'Method Not Allowed' };
  } catch (error: any) {
    context.error(`Error handling message: ${error.message}`);
    return {
      status: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

app.http('messages', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: messagesHandler
});
