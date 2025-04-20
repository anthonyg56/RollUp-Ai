export function generateKeywordsPrompt(transcript: string) {
  return `Generate keywords for the following transcript: ${transcript}`;
}

export function generateBrollPrompt(transcript: string) {
  return `Generate a broll for the following transcript: ${transcript}`;
}
