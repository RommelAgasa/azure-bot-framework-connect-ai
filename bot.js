// Install required packages first:
// npm install botbuilder dotenv openai

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  deployment: process.env.AZURE_OPENAI_MODEL
});

class EchoBot extends ActivityHandler {
  constructor() {
    super();
    
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      const replyText = await this.getAIResponse(context.activity.text);
        // Facebook message limit: 2000 characters
        const MAX_FB_MSG_LENGTH = 2000;
        if (replyText && replyText.length > MAX_FB_MSG_LENGTH) {
          for (let i = 0; i < replyText.length; i += MAX_FB_MSG_LENGTH) {
            const chunk = replyText.substring(i, i + MAX_FB_MSG_LENGTH);
            await context.sendActivity(MessageFactory.text(chunk, chunk));
          }
        } else {
          await context.sendActivity(MessageFactory.text(replyText, replyText));
        }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = 'Hello! I am an AI assistant. How can I help you today?';
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  async getAIResponse(userMessage) {
    try {
      console.log(`User message: ${userMessage}`);

      const response = await client.chat.completions.create({
        input: [
          {
            role: 'system',
            content: 'You are a helpful and friendly AI assistant. Respond concisely and helpfully to user questions.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: process.env.AZURE_OPENAI_MODEL
      });
      // console.log('Full Azure OpenAI response:', JSON.stringify(response, null, 2));
      // New Azure OpenAI response format: extract from response.output
      if (response.output && Array.isArray(response.output)) {
        const messageObj = response.output.find(item => item.type === 'message' && item.content && Array.isArray(item.content) && item.content.length > 0 && item.content[0].text);
        if (messageObj) {
          const aiResponse = messageObj.content[0].text;
          console.log(`AI response: ${aiResponse}`);
          return aiResponse;
        }
      }
      console.error('Unexpected response format from Azure OpenAI:', response);
      return 'Sorry, I could not get a response from the AI. Please try again later.';
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error.message);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }
}

module.exports.EchoBot = EchoBot;
module.exports.getAIResponse = async function(userMessage) {
  const bot = new EchoBot();
  return await bot.getAIResponse(userMessage);
};