import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  access: (allow) => [
    allow.resource({
      service: "sns",
      actions: ["Publish", "Subscribe", "ListSubscriptionsByTopic"],
      resourceArn: "arn:aws:sns:us-east-1:911167894190:loginMessage",
    }),
  ],
});
