const path = require('path');
const dotenv = require('dotenv');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const restify = require('restify');
const axios = require('axios');
const { EchoBot } = require('./bot');

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const bot = new EchoBot();

// Webhook verification from Facebook
server.get('/api/messages', (req, res, next) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`Webhook request - Mode: ${mode}, Token: ${token}`);

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(challenge);
  } else {
    console.log('Webhook verification failed');
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
  }
  
  return next();
});

// Handle incoming messages from Facebook
server.post('/api/messages', async (req, res) => {
  const body = req.body;

  try {
    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const messaging_event of entry.messaging) {
          const sender_id = messaging_event.sender.id;
          const recipient_id = messaging_event.recipient.id;

          if (messaging_event.message) {
            const text = messaging_event.message.text;
            
            if (text) {
              console.log(`Message from ${sender_id}: ${text}`);

              // Get AI response
              const aiResponse = await bot.getAIResponse(text);
              
              // Send response back to Facebook
              await sendFacebookMessage(sender_id, aiResponse);
            }
          }
        }
      }

      // Always return 200 to acknowledge receipt
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not a page object' }));
    }
  } catch (error) {
    console.error('Error handling message:', error);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Function to send message back to Facebook
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
    console.log(`Sent message to ${recipientId}: ${messageText}`);
  } catch (error) {
    console.error('Error sending Facebook message:', error.response?.data || error.message);
  }
}

// Health check
server.get('/health', (req, res, next) => {
  res.send('Bot is running');
  return next();
});

const PORT = process.env.PORT || 3978;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});