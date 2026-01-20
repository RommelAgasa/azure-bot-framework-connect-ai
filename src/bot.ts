import { ActivityHandler, MessageFactory, TurnContext } from 'botbuilder';
import { AzureOpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  defaultQuery: {},
  defaultHeaders: {}
});

export class EchoBot extends ActivityHandler {
  constructor() {
    super();

    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context: TurnContext, next: Function) => {
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

    this.onMembersAdded(async (context: TurnContext, next: Function) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = 'Hello! I am an AI assistant. How can I help you today?';
      if (membersAdded) {
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
            await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
          }
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  async getAIResponse(userMessage: string): Promise<string> {
    try {
      console.log(`User message: ${userMessage}`);

      const response = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful and friendly AI assistant. Respond concisely and helpfully to user questions.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: process.env.AZURE_OPENAI_MODEL!,
        max_tokens: 1024
      });

      if (response.choices && response.choices.length > 0) {
        const firstChoice = response.choices[0];
        if (firstChoice.message && firstChoice.message.content) {
          const aiResponse = firstChoice.message.content;
          console.log(`AI response: ${aiResponse}`);
          return aiResponse;
        }
      }

      console.error('Unexpected response format from Azure OpenAI:', response);
      return 'Sorry, I could not get a response from the AI. Please try again later.';
    } catch (error: any) {
      console.error('Error calling Azure OpenAI:', error.message);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }
}
