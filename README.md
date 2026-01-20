# Facebook AI Bot - Azure Functions TypeScript Version

This is a TypeScript conversion of your Facebook AI Bot for deployment to **Azure Functions**.

## Project Structure

```
src/
├── functions/
│   ├── messages/       # HTTP trigger for /api/messages endpoint
│   └── health/         # HTTP trigger for health check
├── bot.ts              # Main bot logic (TypeScript version)
├── config.ts           # Configuration management
├── facebook.ts         # Facebook Messenger utilities
```

## Prerequisites

1. **Node.js** - v18 or higher
2. **Azure Functions Core Tools** - Latest version
3. **Azure CLI** - For deployment
4. **TypeScript** - Will be installed via npm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MicrosoftAppId": "your_app_id",
    "MicrosoftAppPassword": "your_app_password",
    "AZURE_OPENAI_ENDPOINT": "your_endpoint",
    "AZURE_OPENAI_KEY": "your_key",
    "AZURE_OPENAI_API_VERSION": "2024-02-15-preview",
    "AZURE_OPENAI_MODEL": "your_deployment_name",
    "FACEBOOK_VERIFY_TOKEN": "your_verify_token",
    "FACEBOOK_PAGE_ACCESS_TOKEN": "your_page_token"
  }
}
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Run Locally

```bash
npm run local
```

The bot will be available at:
- Messages endpoint: `http://localhost:7071/api/messages`
- Health check: `http://localhost:7071/api/health`

## Deployment to Azure Functions

### 1. Create Azure Function App (if not exists)

```bash
az functionapp create \
  --resource-group <resource-group> \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name <function-app-name>
```

### 2. Deploy

```bash
func azure functionapp publish <function-app-name>
```

### 3. Configure Application Settings

In Azure Portal, add these Application settings:

- `MicrosoftAppId`
- `MicrosoftAppPassword`
- `MicrosoftTenantId`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_MODEL`
- `FACEBOOK_VERIFY_TOKEN`
- `FACEBOOK_PAGE_ACCESS_TOKEN`

### 4. Configure Facebook Webhook

In Facebook App Settings, set Webhook URL to:
```
https://<function-app-name>.azurewebsites.net/api/messages
```

## Key Benefits of TypeScript + Azure Functions

✅ **Type Safety** - Catch errors at compile time  
✅ **Serverless** - Auto-scaling and pay-per-use pricing  
✅ **No infrastructure** - Azure manages all server operations  
✅ **High availability** - Built-in redundancy  
✅ **Better performance** - Optimized for event-driven workloads  

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm start` - Start Azure Functions locally
- `npm run local` - Build and start locally

## Documentation

- [Azure Functions Node.js](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Bot Framework SDK](https://github.com/microsoft/botbuilder-js)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/)

   ```

2. **Run the bot locally:**
   ```bash
   node server.js
   ```

3. **Configure your bot:**
   - Update `bot.js` with your bot logic and Azure credentials as needed.
   - Create a `.env` file in the project root to securely store environment variables (such as Azure credentials, API keys, etc.).
   - Example `.env` file:
     ```env
     MICROSOFT_APP_ID=your-app-id
     MICROSOFT_APP_PASSWORD=your-app-password
     # Add other environment variables as needed
     ```
   - Make sure to add `.env` to your `.gitignore` file to avoid committing sensitive information.

## Deployment
## Azure CLI Commands

Use the following Azure CLI commands for authentication, viewing logs, and deploying your bot:

If you haven't already, install the Azure CLI by following the instructions at:
[https://docs.microsoft.com/en-us/cli/azure/install-azure-cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

```bash
# Log in to Azure
az login

# Stream logs from your web app
az webapp log tail --name name --resource-group your-resource-group

# Deploy the app to Azure
az webapp up --name name --resource-group your-resource-group --location southeastasia --sku F1
```

## Deployment using the .zip file

Open powershell Execute the command

# Get all items except the excluded ones
$items = Get-ChildItem -Path . | Where-Object { $_.Name -notin @('.azure', '.env', '.git', '.gitignore', 'node_modules') }

# Create the ZIP file
Compress-Archive -Path $items.FullName -DestinationPath "Path\azure-bot-framework.zip"

# Deploy

az webapp deploy source config-zip --resource-group your-resource-group --name name-of-web-app --src "Path-of-zip-file"

## Check Deployment

After deployment, visit your app in the Azure Portal and navigate to your Azure App Service to verify it is running correctly.
