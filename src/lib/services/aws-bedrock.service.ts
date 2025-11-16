import { AwsClient } from "aws4fetch";

/**
 * Interface for calorie counting response from AWS Bedrock
 */
export interface CalorieCountResponse {
  kcal: number;
  breakdown: string;
}

/**
 * Custom error thrown when AWS Bedrock service is unavailable or fails.
 */
export class BedrockServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BedrockServiceError";
  }
}

/**
 * Counts calories in a recipe using AWS Bedrock (Claude model).
 *
 * @param title - Recipe title
 * @param ingredients - Recipe ingredients
 * @param instructions - Recipe instructions
 * @returns Calorie count and breakdown
 * @throws BedrockServiceError if API call fails or response is invalid
 */
export async function countCaloriesWithBedrock(
  title: string,
  ingredients: string,
  instructions: string
): Promise<CalorieCountResponse> {
  try {
    // Get AWS credentials from environment
    const accessKeyId = import.meta.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.AWS_SECRET_ACCESS_KEY;
    const sessionToken = import.meta.env.AWS_SESSION_TOKEN;
    const region = import.meta.env.AWS_BEDROCK_REGION || "eu-central-1";

    if (!accessKeyId || !secretAccessKey) {
      throw new BedrockServiceError(
        "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required"
      );
    }

    // Initialize AWS client for signing requests with SigV4
    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      sessionToken, // Required for temporary credentials (access keys starting with ASIA)
      region,
      service: "bedrock", // Required for proper credential scoping
    });

    // eslint-disable-next-line no-console
    console.log("AWS Bedrock configuration:", {
      region,
      accessKeyIdLength: accessKeyId.length,
      accessKeyStart: accessKeyId.substring(0, 4),
    });

    // Construct the prompt for calorie counting
    const prompt = `You are a nutritionist AI. Calculate the total estimated calories (kcal) for this recipe based on the ingredients and portions described.

Recipe Title: ${title}

Ingredients:
${ingredients}

Instructions:
${instructions}

Please provide:
1. Total estimated calories (kcal) as a single number
2. A brief breakdown of major calorie contributors

Respond ONLY with valid JSON in this exact format:
{
  "kcal": <number>,
  "breakdown": "<string describing main calorie sources>"
}`;

    // Prepare the request for Claude 3 Sonnet
    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent numerical outputs
    };

    const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";
    const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${modelId}/invoke`;

    // eslint-disable-next-line no-console
    console.log("Calling Bedrock API:", { url, region });

    // Use AWS Signature V4 authentication (required by Bedrock)
    const response = await aws.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error("Bedrock API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new BedrockServiceError(`Bedrock API error (${response.status}): ${errorText}`);
    }

    // Parse the response
    const responseBody = await response.json();

    if (!responseBody.content || !responseBody.content[0]?.text) {
      throw new BedrockServiceError("Invalid response structure from Bedrock");
    }

    // Extract the JSON from the response text
    const responseText = responseBody.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new BedrockServiceError("No JSON found in Bedrock response");
    }

    const calorieData: CalorieCountResponse = JSON.parse(jsonMatch[0]);

    // Validate the response
    if (typeof calorieData.kcal !== "number" || !calorieData.breakdown) {
      throw new BedrockServiceError("Invalid calorie data format from Bedrock");
    }

    return calorieData;
  } catch (error) {
    if (error instanceof BedrockServiceError) {
      throw error;
    }

    // eslint-disable-next-line no-console
    console.error("AWS Bedrock API error:", error);
    throw new BedrockServiceError(
      `Failed to count calories with Bedrock: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
