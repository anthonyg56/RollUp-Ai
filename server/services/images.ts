import { createFetch, createSchema } from '@better-fetch/fetch';
import { BunFile } from 'bun';
import { z } from 'zod';
import { zfd } from "zod-form-data";

const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

const $fetch = createFetch({
  baseUrl: `https://api.cloudflare.com`,
  headers: {
    Authorization: `Bearer ${cloudflareApiToken}`,
    'Content-Type': 'multipart/form-data',
  },
  schema: createSchema({
    "/client/v4/accounts/:accountId/images/v1": {
      method: 'post',
      params: z.object({
        accountId: z.string(),
      }),
      input: zfd.formData({
        file: zfd.file(),
        requireSignedURLs: z.boolean(),
        metadata: z.record(z.string(), z.string()),
      }),
      output: z.object({
        result: z.object({
          id: z.string(),
          filename: z.string(),
          metadata: z.record(z.string(), z.string()),
          uploaded: z.string(),
          requireSignedURLs: z.boolean(),
          variants: z.array(z.string()),
        }),
        success: z.boolean(),
        errors: z.array(z.any()),
        messages: z.array(z.string()),
      })
    }
  })
});

export type CloudflareImageUploadResponse = {
  result: {
    id: string;
    filename: string;
    metadata: Record<string, string>;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: Array<any>; // Cloudflare doesn't specify the error type in their docs
  messages: string[];
};

export async function uploadToCloudflareImages(file: File | BunFile) {
  if (!cloudflareAccountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is not set');
  }

  const formData = new FormData();

  formData.append('file', file);

  const response = await $fetch('/client/v4/accounts/:accountId/images/v1', {
    params: {
      accountId: cloudflareAccountId,
    },
    body: formData,
  });

  const data = response.data;

  if (!data?.success) {
    throw new Error(`Failed to upload image: ${data?.errors[0]?.message || 'Unknown error'}`);
  }

  const resultsData = data.result;

  return resultsData;
}
