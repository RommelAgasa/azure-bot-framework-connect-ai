# Azure Bot Framework Project

This project is a Node.js application that utilizes the Microsoft Azure Bot Framework to create and run a chatbot server.

## Project Structure

- `bot.js` - Main bot logic and configuration.
- `server.js` - Entry point for starting the bot server.
- `package.json` - Project metadata and dependencies.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- An Azure account (for deploying to Azure)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
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
az webapp up --name name --resource-group your-resource-group
```

## Check Deployment

After deployment, visit your app in the Azure Portal and navigate to your Azure App Service to verify it is running correctly.
