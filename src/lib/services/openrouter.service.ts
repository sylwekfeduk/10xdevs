import type { ChatCompletionRequest, ChatCompletionResponse } from "../../types";
import { AuthError, BadRequestError, ModelServiceError, ParsingError, RateLimitError } from "../../types";

/**
 * Service for communicating with the OpenRouter Chat Completions API.
 *
 * @description This service provides an abstraction layer for interacting with
 * the OpenRouter API (https://openrouter.ai/api/v1/chat/completions). It handles
 * API authentication, request construction, response parsing, and error handling.
 *
 * IMPORTANT: This service must ONLY be used in server-side contexts (Astro API
 * routes or Astro Actions) to keep the API key secure.
 *
 * @see {@link OPENROUTER_FREE_MODELS} in '@/lib/constants' for available free models
 * @see {@link OPENROUTER_DEFAULT_FREE_MODEL} for the recommended free model (Google Gemini 2.0 Flash)
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";
  private readonly requestTimeout: number = 60000; // 60 seconds

  /**
   * Creates a new instance of OpenRouterService.
   *
   * @param apiKey - The OpenRouter API key. Must be passed from a secure server context.
   * @throws {Error} If the API key is missing or empty.
   *
   * @example
   * ```typescript
   * const apiKey = process.env.OPENROUTER_API_KEY;
   * if (!apiKey) {
   *   throw new Error('OPENROUTER_API_KEY is not configured');
   * }
   * const service = new OpenRouterService(apiKey);
   * ```
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenRouter API Key is required for service initialization.");
    }
    this.apiKey = apiKey;
  }

  /**
   * Generates a chat completion using the OpenRouter API.
   *
   * @param request - The chat completion request configuration.
   * @returns A promise that resolves to the chat completion response.
   * @throws {AuthError} If the API key is invalid (401).
   * @throws {RateLimitError} If the rate limit is exceeded (429).
   * @throws {BadRequestError} If the request payload is invalid (400).
   * @throws {ModelServiceError} If the API or model provider is unavailable (5xx).
   * @throws {ParsingError} If the structured response cannot be parsed.
   *
   * @example
   * ```typescript
   * import { OPENROUTER_DEFAULT_FREE_MODEL } from '@/lib/constants';
   *
   * const response = await service.completeChat({
   *   model: OPENROUTER_DEFAULT_FREE_MODEL, // Uses Google Gemini 2.0 Flash (Free)
   *   messages: [
   *     { role: 'system', content: 'You are a helpful cooking assistant.' },
   *     { role: 'user', content: 'Suggest a quick pasta recipe.' }
   *   ],
   *   temperature: 0.7,
   *   max_tokens: 500
   * });
   * console.log(response.choices[0].message.content);
   * ```
   */
  async completeChat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Create AbortController for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.requestTimeout);

    try {
      // Construct the full API URL
      const url = `${this.baseUrl}/chat/completions`;

      // Build headers
      const headers = this.buildHeaders();

      // Execute the fetch request
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      // Check if the response is successful
      if (!response.ok) {
        await this.handleError(response);
      }

      // Parse the response body
      const data: ChatCompletionResponse = await response.json();

      // If structured output was requested, validate that the content is valid JSON
      if (request.response_format) {
        const messageContent = data.choices[0]?.message?.content;

        if (!messageContent) {
          throw new ParsingError("Model response is empty.");
        }

        // Attempt to parse the structured JSON response
        try {
          JSON.parse(messageContent);
        } catch {
          throw new ParsingError("Model response is malformed and cannot be parsed as JSON.");
        }
      }

      return data;
    } catch (error) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);

      // Re-throw custom errors
      if (
        error instanceof AuthError ||
        error instanceof RateLimitError ||
        error instanceof BadRequestError ||
        error instanceof ModelServiceError ||
        error instanceof ParsingError
      ) {
        throw error;
      }

      // Handle AbortController timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new ModelServiceError(`Request timeout after ${this.requestTimeout}ms`);
      }

      // Handle network errors or other unexpected errors
      if (error instanceof Error) {
        throw new ModelServiceError(`Network error: ${error.message}`);
      }

      // Fallback for unknown errors
      throw new ModelServiceError("An unexpected error occurred.");
    }
  }

  /**
   * Builds the HTTP headers required for OpenRouter API requests.
   *
   * @returns Headers object with Authorization and Content-Type.
   * @private
   */
  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Content-Type", "application/json");
    return headers;
  }

  /**
   * Handles HTTP response errors and throws appropriate custom errors.
   *
   * @param response - The failed HTTP response or a general error.
   * @throws {AuthError} For 401 status codes.
   * @throws {RateLimitError} For 429 status codes.
   * @throws {BadRequestError} For 400 status codes.
   * @throws {ModelServiceError} For 5xx status codes or network errors.
   * @private
   */
  private async handleError(response: Response): Promise<never> {
    const status = response.status;

    // Try to extract error message from response body
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    // Map HTTP status codes to custom error types
    switch (status) {
      case 401:
        throw new AuthError(errorMessage || "Invalid OpenRouter API Key.");
      case 429:
        throw new RateLimitError(errorMessage || "Too many requests. Please try again later.");
      case 400:
        throw new BadRequestError(errorMessage || "The request payload is invalid.");
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ModelServiceError(errorMessage || "The LLM provider service is currently unavailable.");
      default:
        throw new ModelServiceError(`Unexpected error: ${errorMessage} (Status: ${status})`);
    }
  }
}
