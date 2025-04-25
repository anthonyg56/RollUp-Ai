import OpenAI from "openai";
import { createStreamFromPath } from "@server/services/FileIO.service";

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTranscripts(inputPath: string, format: 'srt' | 'text') {
  const audioFileStream = await createStreamFromPath(inputPath, 'read');

  const transcript = await openAIClient
    .audio
    .transcriptions
    .create({
      file: audioFileStream,
      model: "whisper-1",
      response_format: format,
      language: "en",
    });

  return transcript;
};

export type KeywordsResponse = {
  count: number;
  summary: string;
  topics: Array<{
    count: number;
    segments: number[];
    title: string;
    summary: string;
    start: string;
    end: string;
    keywords: {
      mood: string[];
      topic: string[];
    };
  }>;
};

export async function generateKeywords(srtTranscript: string): Promise<KeywordsResponse> {
  const prompt = `
    You are an expert Video Content Analyzer and Topic Extractor. Your primary task is to process the provided SRT transcript, identify distinct conversational topics, analyze each topic, and structure the results in a specific JSON format.

    **Input:** You will receive the full text of an SRT transcript below.

    **Output:** You MUST output ONLY a single JSON object, adhering strictly to the following structure. Do NOT include any explanatory text before or after the JSON block.

    Example output:
    
    {
      // Total number of segments found in the SRT
      "count": 42,
      
      // A concise summary of the entire video's content
      "summary": "Example summary of the video content",
      
      // Array of distinct topics identified in the transcript
      "topics": [
        {
          // Number of segments in this topic
          "count": 15,
          
          // Array of segment numbers belonging to this topic
          "segments": [1, 2, 3, 4, 5],
          
          // Short descriptive title for the topic
          "title": "Introduction to Topic",
          
          // Concise summary of this specific topic
          "summary": "Example topic summary",
          
          // Timestamps for topic boundaries
          "start": "00:00:00,000",
          "end": "00:01:30,500",
          
          "keywords": {
            // Up to 6 mood-related keywords
            "mood": ["instructional", "enthusiastic", "engaging"],
            
            // Up to 6 subject-related keywords
            "topic": ["concept1", "concept2", "concept3"]
          }
        }
      ]
    }

    Instructions:

    1. Parse SRT: Carefully parse the entire provided SRT transcript. Identify each distinct segment, noting its:
      - Segment number (integer).
      - Start timestamp (HH:MM:SS,ms).
      - End timestamp (HH:MM:SS,ms).
      - Text content.

    2. Overall Analysis:
      - Calculate the total count of segments parsed.
      - Read the text content of all segments and generate the overall summary (1-2 sentences) capturing the main purpose or narrative of the entire video.
    
    3. Topic Identification and Grouping:
      - Analyze the flow of the conversation throughout the transcript.
      - Identify distinct logical topics or subject shifts in the discussion. A topic should cover a coherent part of the conversation.
      - Group the transcript's segments sequentially based on these identified topics. Each segment should ideally belong to one topic group.
      - Determine the natural start and end points for each topic based on the conversation flow. Aim for a reasonable number of topics based on the content (e.g., 3-6 topics for a few minutes of conversation).
    
    4. Process Each Identified Topic: For each topic you identified:
      - Create a topic object for the topics array.
      - Determine the array of segments (integer numbers) that constitute this topic. Ensure the numbers are in ascending order.
      - Calculate the count of segments in this topic group.
      - Find the start timestamp (from the first segment number in this topic's group) and the end timestamp (from the last segment number in this topic's group).
      - Generate a short, descriptive title for the topic (like a chapter heading).
      - Write a concise summary (1-2 sentences) describing what was discussed specifically within this topic.
      - Analyze the text and tone within this topic's segments to generate the keywords:
        - mood: Provide up to 6 keywords describing the dominant sentiment or feeling (e.g., "instructional", "fearful", "reminiscent", "encouraging", "frustrated", "excited").
        - topic: Provide up to 6 keywords identifying the core subjects or concepts discussed in this topic (e.g., "bike setup", "balancing technique", "initial fears", "pedaling", "steering", "braking", "overcoming challenges", "feeling of success").
    
    5. Final Output: Assemble the top-level count, summary, and the array of generated topics objects into the final JSON object. Ensure the output is only this JSON object, matching the structure exactly.
    
    - Start of SRT Transcript Data:
    
    \\\`\\\`\\\`srt
    ${srtTranscript}
    \\\`\\\`\\\`
    
    - End of SRT Transcript Data

    Now, generate the JSON output based on the provided SRT data and the instructions.
  `;

  const response = await openAIClient.responses.create({
    model: "gpt-4o-mini",
    input: [{
      role: "user",
      content: prompt
    }],
    temperature: 1,
    text: {
      format: {
        type: "json_schema",
        name: "keywords",
        strict: true,
        schema: {
          title: "Keywords",
          description: "Keywords for the video",
          type: "object",
          properties: {
            count: {
              type: "integer",
              description: "Total number of segments found in the SRT",
            },
            summary: {
              type: "string",
              description: "A concise summary of the entire video's content based on the whole transcript",
            },
            topics: {
              type: "array",
              description: "Array of topics found in the SRT",
              items: {
                type: "object",
                properties: {
                  count: {
                    type: "integer",
                    description: "Number of segments belonging to this topic",
                  },
                  segments: {
                    type: "array",
                    items: {
                      type: "integer",
                      description: "Array of segment integer numbers belonging to this topic, in ascending order",
                    },
                  },
                  title: {
                    type: "string",
                    description: "Short title describing the topic",
                  },
                  summary: {
                    type: "string",
                    description: "A concise summary of this specific topic",
                  },
                  start: {
                    type: "string",
                    description: "Start timestamp of the first segment in this topic",
                  },
                  end: {
                    type: "string",
                    description: "End timestamp of the last segment in this topic",
                  },
                  keywords: {
                    type: "object",
                    properties: {
                      mood: {
                        type: "array",
                        items: {
                          type: "string",
                          description: "Max 6 keywords describing the topic's mood",
                        },
                      },
                      topic: {
                        type: "array",
                        items: { type: "string" },
                        description: "Max 6 keywords describing the topic's subject",
                      },
                    },
                    required: ["mood", "topic"],
                    additionalProperties: false,
                  },
                  required: ["count", "segments", "title", "summary", "start", "end"],
                  additionalProperties: false,
                },
              },
              minItems: 1,
            },
            required: ["count", "summary", "topics"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  return JSON.parse(response.output_text);

}



export default openAIClient;