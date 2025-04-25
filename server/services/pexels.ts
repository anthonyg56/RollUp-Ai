import { createClient } from "pexels";

const apiKey = process.env.PEXELS_API_KEY;

if (!apiKey) {
  throw new Error("PEXELS_API_KEY is not set");
}

export const pexelsClient = createClient(apiKey);

export const getPexelsVideo = async (query: string, perPage = 5) => {
  const results = await pexelsClient.videos.search({ query, per_page: perPage });

  if ("error" in results) {
    return null;
  } else if (!results?.videos?.length) {
    return null;
  }

  return results.videos;
}

