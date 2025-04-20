import { Polar } from '@polar-sh/sdk'
import { polar } from "@polar-sh/better-auth";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: 'production'
});

export const polarAuthPlugin = polar({
  client: polarClient,
  createCustomerOnSignUp: true,
  enableCustomerPortal: true,
  checkout: {
    enabled: true,
    products: [
      {
        productId: "1308361b-fa85-445f-ad24-fecf50f48491",
        slug: "creator/monthly"
      },
      {
        productId: "29f023b7-5a1c-4b55-bee3-ba0bbabd8a39",
        slug: "creator/yearly"
      },
      {
        productId: "dd2a9f79-e335-4e6d-ac08-39ad61c2c27f",
        slug: "enterprise/monthly"
      },
      {
        productId: "d0ba02d2-7107-41c3-a764-8fb3dda53033",
        slug: "enterprise/yearly"
      },
    ],
    successUrl: "/success?checkout_id={CHECKOUT_ID}"
  },
  webhooks: {
    secret: process.env.POLAR_WEBHOOK_SECRET || '',
    onPayload: async (payload: any) => {
      console.log(payload);

      switch (payload.type) {
        case 'checkout.created':
          // Handle checkout created
          break;
        case 'checkout.updated':
          // Handle checkout updated
          break;
        case 'order.created':
          // Handle order created
          break;
        case 'order.refunded':
          // Handle order refunded
          break;
        case 'refund.created':
          // Handle refund created
          break;
        case 'refund.updated':
          // Handle refund updated
          break;
        case 'subscription.created':
          // Handle subscription created
          break;
        case 'subscription.updated':
          // Handle subscription updated
          break;
        case 'subscription.active':
          // Handle subscription active
          break;
        case 'subscription.canceled':
          // Handle subscription canceled
          break;
        case 'subscription.revoked':
          // Handle subscription revoked
          break;
        case 'subscription.uncanceled':
          // Handle subscription uncanceled
          break;
        case 'product.created':
          // Handle product created
          break;
        case 'product.updated':
          // Handle product updated
          break;
        case 'organization.updated':
          // Handle organization updated
          break;
        case 'benefit.created':
          // Handle benefit created
          break;
        case 'benefit.updated':
          // Handle benefit updated
          break;
        case 'benefit_grant.created':
          // Handle benefit grant created
          break;
        case 'benefit_grant.updated':
          // Handle benefit grant updated
          break;
        case 'benefit_grant.revoked':
          // Handle benefit grant revoked
          break;
        case 'customer.created':
          // Handle customer created
          break;
        case 'customer.updated':
          // Handle customer updated
          break;
        case 'customer.deleted':
          // Handle customer deleted
          break;
        case 'customer.state_changed':
          // Handle customer state changed
          break;
        default:
          console.log(`Unhandled webhook event: ${payload.type}`);
          break;
      }
    },
  }
})