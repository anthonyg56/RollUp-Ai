import { betterAuth } from "better-auth";
import { customSession, emailOTP } from "better-auth/plugins";
import { HTTPException } from "hono/http-exception";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import db from "@server/db";
import { polarAuthPlugin } from "@server/lib/configs/polar";
import { BASE_URL, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@server/lib/constants";

import { users } from "@server/db/models/users";
import { sessions } from "@server/db/models/sessions";
import { accounts } from "@server/db/models/accounts";
import { verifications } from "@server/db/models/verifications";

import { getUserById } from "@server/services/db/user.services";
import { resendOTPCode } from "@server/emails/sendVerification";
import { sendWelcomeEmail } from "@server/emails/sendEmail";

export type AuthType = typeof auth;

export const auth = betterAuth({
  baseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:5173", "http://localhost:3000", "https://rollup-ai.dev", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "https://rollup-ai.fly.dev"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: users,
      sessions: sessions,
      accounts: accounts,
      verifications: verifications,
    },
  }),
  user: {
    modelName: "users",
    changeEmail: {
      enabled: false,
    },
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
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
    },
  },
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  account: {
    modelName: "accounts",
    fields: {},
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendWelcomeEmail(user.email, user.name || user.email.split('@')[0]);
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      mapProfileToUser: (profile) => {
        return {
          image: profile.picture || "/default-avatar.png",
          name: profile.name || profile.email.split("@")[0],
          username: null,
          displayName: profile.name || null,
          profileUrl: null,
          avatarUrl: profile.picture || null,
        };
      },
      redirectUri: `${BASE_URL}/api/auth/callback/google`,
    },
  },
  advanced: {

    generateId: false,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
    },
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          partitioned: true,
        }
      }
    },
  },
  plugins: [
    polarAuthPlugin,
    // organization({
    //   organizationLimit: 25,
    //   allowUserToCreateOrganization: async (user) => {
    //     // Determined if the user is allowed to create an organization based on their subscription plan
    //     // and the number of organizations they already have
    //     const [polarResults, ownedOrganizations] = await Promise.all([
    //       polarClient.customers.getStateExternal({
    //         externalId: user.id,
    //       })
    //         .then(data => data)
    //         .catch(async (error) => {
    //           console.error("Error getting polar customer state:", error);

    //           if (error instanceof ResourceNotFound && error.error === "ResourceNotFound") {
    //             const customerList = await polarClient.customers.list({
    //               email: user.email,
    //             })

    //             const customerId = customerList.result.items[0].id;

    //             await polarClient.customers.update({
    //               id: customerId,
    //               customerUpdate: {
    //                 externalId: user.id,
    //               },
    //             })

    //             const customerState = await polarClient.customers.getStateExternal({
    //               externalId: user.id,
    //             })

    //             return customerState;
    //           }

    //           throw error;
    //         }),
    //       getMemberOrganizations(user.id),
    //     ]);

    //     const { activeSubscriptions } = polarResults;

    //     const isFreePlan = activeSubscriptions.length === 0;
    //     const isCreatorPlan = activeSubscriptions.some(subscription => subscription.productId === '1308361b-fa85-445f-ad24-fecf50f48491' || subscription.productId === '29f023b7-5a1c-4b55-bee3-ba0bbabd8a39');
    //     const isEnterprisePlan = activeSubscriptions.some(subscription => subscription.productId === 'dd2a9f79-e335-4e6d-ac08-39ad61c2c27f' || subscription.productId === 'd0ba02d2-7107-41c3-a764-8fb3dda53033');

    //     if (isFreePlan && ownedOrganizations.length < 1) {
    //       return true;
    //     } else if (isCreatorPlan && ownedOrganizations.length < 10) {
    //       return true;
    //     } else if (isEnterprisePlan && ownedOrganizations.length < 25) {
    //       return true;
    //     }

    //     return false;
    //   },

    // }),
    emailOTP({
      otpLength: 6,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await resendOTPCode({ email, code: otp, type });
      },
    }),
    customSession(async ({ user: userFromSession, session }) => {
      const results = await getUserById(userFromSession.id);

      if (!results) {
        throw new HTTPException(404, {
          message: "User not found",
          cause: new Error("User not found"),
        });
      }

      return {
        session: {
          ...session,
        },
        user: {
          ...userFromSession,
          showOnboardingSurvey: results.showOnboardingSurvey || false,
          showWelcomeTour: results.showWelcomeTour || true,
        },
      };
    }),
  ],
});
