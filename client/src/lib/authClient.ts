import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import { BASE_URL } from "./constants";

const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        showOnboardingSurvey: {
          type: "boolean",
          defaultValue: true,
          required: false,
        },
        showWelcomeTour: {
          type: "boolean",
          defaultValue: true,
          required: false,
        },
      }
    }),
  ]
});

export default authClient;