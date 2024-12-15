import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
  ListSubscriptionsByTopicCommand,
} from "@aws-sdk/client-sns";
import { fetchAuthSession } from "aws-amplify/auth";
import { getCurrentUser } from "aws-amplify/auth";

const TOPIC_ARN = "arn:aws:sns:us-east-1:911167894190:loginMessage";
const REGION = "us-east-1";

// Create SNS client with credentials
async function getSNSClient() {
  try {
    // First ensure we have a current user
    await getCurrentUser();
    const { credentials } = await fetchAuthSession();

    if (!credentials) {
      throw new Error("No credentials available");
    }

    return new SNSClient({
      region: REGION,
      credentials: credentials,
    });
  } catch (error) {
    console.error("Error getting SNS client:", error);
    throw error;
  }
}

// Check if email is already subscribed
async function isEmailSubscribed(email: string) {
  try {
    const sns = await getSNSClient();
    const command = new ListSubscriptionsByTopicCommand({
      TopicArn: TOPIC_ARN,
    });

    const response = await sns.send(command);
    return response.Subscriptions?.some((sub) => sub.Endpoint === email);
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
}

// Subscribe email to SNS topic
async function subscribeEmail(email: string) {
  try {
    // Check if already subscribed
    const alreadySubscribed = await isEmailSubscribed(email);
    if (alreadySubscribed) {
      console.log("Email already subscribed");
      return;
    }

    const sns = await getSNSClient();
    const command = new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: "email",
      Endpoint: email,
      ReturnSubscriptionArn: true,
    });

    await sns.send(command);
    console.log("Subscription request sent to:", email);
  } catch (error) {
    console.error("Error subscribing email:", error);
    throw error;
  }
}

export const sendLoginNotification = async (userEmail: string) => {
  try {
    // First, ensure the user is subscribed
    await subscribeEmail(userEmail);

    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userEmail: userEmail,
      timestamp: new Date().toISOString(),
      message: `New login detected from ${getBrowserName(navigator.userAgent)}`,
    };

    const sns = await getSNSClient();
    const command = new PublishCommand({
      Message: JSON.stringify(browserInfo),
      TopicArn: TOPIC_ARN,
      Subject: "New Login Alert",
    });

    await sns.send(command);
    console.log("Login notification sent successfully to:", userEmail);
  } catch (error) {
    console.error("Error sending SNS notification:", error);
    throw error;
  }
};

function getBrowserName(userAgent: string) {
  if (userAgent.includes("Edge") || userAgent.includes("Edg"))
    return "Microsoft Edge";
  if (userAgent.includes("Chrome")) return "Google Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  return "Unknown Browser";
}
