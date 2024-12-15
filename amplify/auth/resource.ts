// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  authenticatedRole: {
    statements: [
      {
        effect: "Allow",
        actions: [
          "sns:Publish",
          "sns:Subscribe",
          "sns:ListSubscriptionsByTopic",
        ],
        resources: ["arn:aws:sns:us-east-1:911167894190:loginMessage"],
      },
    ],
  },
});
