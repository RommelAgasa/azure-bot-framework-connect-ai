const path = require('path');
const dotenv = require('dotenv');
const restify = require('restify');
const axios = require('axios');
const { EchoBot } = require('./bot');
const { BotFrameworkAdapter } = require('botbuilder');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const bot = new EchoBot();

// ✅ Create the Bot Framework adapter for Web Chat / Bot Service
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  tenantId: process.env.MicrosoftTenantId
});

// ✅ Facebook webhook verification
server.get('/api/messages', (req, res, next) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('✅ Facebook webhook verified');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(challenge);
  } else {
    console.log('❌ Facebook webhook verification failed');
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
  }
  return next();
});

// ✅ Unified endpoint for Facebook and Azure Bot messages
server.post('/api/messages', async (req, res) => {
  const body = req.body;

  try {
    // 1️⃣ Handle Facebook messages
    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const messaging_event of entry.messaging) {
          const sender_id = messaging_event.sender.id;
          const text = messaging_event.message?.text;

          if (text) {
            console.log(`📩 Facebook message from ${sender_id}: ${text}`);
            const aiResponse = await bot.getAIResponse(text);
            await sendFacebookMessage(sender_id, aiResponse);
          }
        }
      }
      res.send(200);
      return;
    }

    // 2️⃣ Handle Azure Bot Framework (Web Chat)
    await adapter.processActivity(req, res, async (context) => {
      if (context.activity.type === 'message') {
        const aiResponse = await bot.getAIResponse(context.activity.text);
        await context.sendActivity(aiResponse);
      }
    });

  } catch (error) {
    console.error('❌ Error handling message:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

// ✅ Send message back to Facebook
async function sendFacebookMessage(recipientId, messageText) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        }
      }
    );
    console.log(`✅ Sent message to ${recipientId}: ${messageText}`);
  } catch (error) {
    console.error('❌ Error sending Facebook message:', error.response?.data || error.message);
  }
}

// ✅ Health check
server.get('/health', (req, res, next) => {
  res.send('Bot is running');
  return next();
});

const PORT = process.env.PORT || 3978;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
