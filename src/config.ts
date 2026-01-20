import * as dotenv from 'dotenv';
import path from 'path';

const ENV_FILE = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: ENV_FILE });

export const config = {
  // Bot Framework
  microsoftAppId: process.env.MicrosoftAppId,
  microsoftAppPassword: process.env.MicrosoftAppPassword,
  microsoftTenantId: process.env.MicrosoftTenantId,

  // Azure OpenAI
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIKey: process.env.AZURE_OPENAI_KEY,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIModel: process.env.AZURE_OPENAI_MODEL,

  // Facebook
  facebookVerifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
  facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,

  // Azure Functions
  port: process.env.PORT || 3978
};
