import axios from 'axios';
import { config } from './config';

export async function sendFacebookMessage(
  recipientId: string,
  messageText: string
): Promise<void> {
  try {
    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: config.facebookPageAccessToken
        }
      }
    );
    console.log(`Sent message to ${recipientId}: ${messageText}`);
  } catch (error: any) {
    console.error(
      'Error sending Facebook message:',
      error.response?.data || error.message
    );
  }
}
