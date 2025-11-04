This request requires an extensive implementation plan based on the provided tech stack and development rules. I will first process the information, break down the implementation details, and then generate the final implementation guide.
The following is a comprehensive implementation plan for the OpenRouter service, designed for the specified **Astro, React, and TypeScript** environment, following best practices for a software architect.

The service will be implemented as a TypeScript class located at `./src/lib/OpenRouterService.ts`. All associated DTOs and custom error classes will be defined in this file or imported from a central types file (`./src/types.ts`).

## OpenRouter Chat Completion Service Implementation Guide

### 1\. Service Description

The **`OpenRouterService`** class is responsible for communicating with the OpenRouter Chat Completions API (`https://openrouter.ai/api/v1/chat/completions`). It acts as an abstraction layer for the application, handling API key authentication, request payload construction (including system/user messages, model parameters, and structured JSON output), response parsing, and robust error translation.

The service must **only** be called from a **server-side context** (e.g., Astro API endpoint in `./src/pages/api` or an Astro Action) to ensure the API key remains secure in the **Supabase Backend-as-a-Service** or environment variables.

### 2\. Constructor Description

The constructor initializes the service with the necessary configuration, primarily the OpenRouter API Key.

| Element | Type | Purpose |
| :--- | :--- | :--- |
| `apiKey` | `string` | The API key for OpenRouter, securely loaded from `process.env`. |
| `baseUrl` | `string` | The base URL for the OpenRouter API (`https://openrouter.ai/api/v1`). |

**Example (TypeScript):**

```typescript
class OpenRouterService {
    private apiKey: string;
    private baseUrl: string = 'https://openrouter.ai/api/v1';

    /**
     * @param apiKey The OpenRouter API key. Must be passed from a secure server context.
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('OpenRouter API Key is required for service initialization.');
        }
        this.apiKey = apiKey;
    }
    // ...
}
```

-----

### 3\. Public Methods and Fields

| Name | Description |
| :--- | :--- |
| `completeChat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>` | The core method for generating LLM responses. Takes a structured request object and returns the model's response. |

#### `ChatCompletionRequest` DTO Structure

The request DTO should use TypeScript interfaces and be validated with a library like Zod for maximum type safety.

```typescript
// Define the Message structure
export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
    // Add support for multimodal content if required: content: string | (TextPart | ImagePart)[];
};

// Define the structured response format
export type ResponseFormat = {
    type: 'json_schema';
    json_schema: {
        name: string;
        strict: boolean;
        schema: Record<string, any>; // JSON Schema object
    };
};

// Define the main request object
export interface ChatCompletionRequest {
    model: string; // The model name (e.g., 'openai/gpt-4o') [Example 4]
    messages: ChatMessage[];
    temperature?: number; // Optional model parameters [Example 5]
    max_tokens?: number;
    top_p?: number;
    response_format?: ResponseFormat; // Optional for structured output [Example 3]
}

// Example Request Construction (Message Handling):
// A request array will be built like this:
// [
//   { "role": "system", "content": "..." }, // [Example 1]
//   { "role": "user", "content": "..." }    // [Example 2]
// ]
```

-----

### 4\. Private Methods and Fields

| Name | Description |
| :--- | :--- |
| `private apiKey: string` | Stores the confidential OpenRouter API key. |
| `private baseUrl: string` | Stores the constant API endpoint base URL. |
| `private handleError(error: Response \| Error): never` | A utility to catch network/HTTP errors, extract details, log the error, and throw a standardized custom service error. |
| `private buildHeaders(): Headers` | Constructs the necessary HTTP headers, including `Authorization: Bearer <API_KEY>` and `Content-Type: application/json`. |

-----

### 5\. Error Handling

Error handling must follow the `if-return` and **Guard Clause** pattern. A custom error hierarchy is crucial for the calling application to handle specific error types gracefully.

#### Custom Error Classes

1.  **`OpenRouterError`** (Base class for all service errors).
2.  **`AuthError`** (For 401: Invalid API Key).
3.  **`RateLimitError`** (For 429).
4.  **`BadRequestError`** (For 400: Invalid payload/parameters).
5.  **`ModelServiceError`** (For 5xx or provider-specific errors).
6.  **`ParsingError`** (For internal failures, like malformed JSON response from the model).

#### Potential Error Scenarios & Handling (numbered)

1.  **Authentication/Authorization Error (401):**
    * **Handling:** The `handleError` method catches the 401 status code and throws a `new AuthError('Invalid OpenRouter API Key.')`. The user should be informed that the service is unavailable (log: check environment variable `OPENROUTER_API_KEY`).
2.  **Rate Limit Exceeded Error (429):**
    * **Handling:** `handleError` catches 429 and throws a `new RateLimitError('Too many requests. Please try again later.')`. The frontend UI (built with React/Shadcn/ui) can display a temporary block message.
3.  **Bad Request/Validation Error (400):**
    * **Handling:** `handleError` catches 400 and throws a `new BadRequestError('The request payload is invalid.')`. This typically points to an issue with the service's `ChatCompletionRequest` construction (e.g., invalid model name or incorrect message format).
4.  **Model/Provider Error (500/503):**
    * **Handling:** `handleError` catches 5xx codes and throws a `new ModelServiceError('The LLM provider service is currently unavailable.')`. Implement logging to track the frequency of these external failures.
5.  **Network/Timeout Error:**
    * **Handling:** The `fetch` promise rejection (not an HTTP status) is caught. The service should use an `AbortController` and a fixed timeout for the request. If the request times out or a general network error occurs, throw a `ModelServiceError` with a specific message.
6.  **Structured Response Parsing Error:**
    * **Handling:** After a successful 200 response where `response_format` was used, the service must attempt to `JSON.parse(content)`. If this fails, throw a `new ParsingError('Model response is malformed and cannot be parsed as JSON.')`.

-----

### 6\. Security Considerations

1.  **API Key Confidentiality:** The `OpenRouterService` must **only** be instantiated and called within a server-side context (Astro API route or Action). The key must be stored in an **Environment Variable** (`OPENROUTER_API_KEY`) on the hosting platform (DigitalOcean/Docker image) and accessed via `process.env`.
2.  **Input Sanitization:** While LLM APIs handle most message content safely, all user inputs (`User message` content) should be treated with caution, especially if they are later displayed to other users or stored in the PostgreSQL database (via Supabase). Use **TypeScript interfaces/Zod schemas** to strictly control the shape of the data.
3.  **Data Transmission Security:** All communication with OpenRouter occurs over **HTTPS**, which is mandatory for the base URL.
4.  **Cost Control:** Integrate a mechanism to monitor OpenRouter's usage data (from the response `usage` object) and consider setting financial limits on the API key via the OpenRouter dashboard.

-----

### 7\. Step-by-Step Implementation Plan

#### Step 1: Define Data Structures (DTOs)

Create the necessary TypeScript types in `./src/types.ts` (or within the service file) for static code analysis and validation.

**Action:** Define `ChatMessage`, `ResponseFormat`, `ChatCompletionRequest`, and `ChatCompletionResponse` interfaces/types.

#### Step 2: Implement Custom Error Classes

Create the hierarchy of custom error classes (`AuthError`, `RateLimitError`, etc.) to provide meaningful error context to the calling code.

**Action:** Implement `OpenRouterError` and extend it for specific HTTP status codes.

#### Step 3: Implement `OpenRouterService` Skeleton

Create the class in `./src/lib/OpenRouterService.ts` with the constructor and private fields.

**Action:**

1.  Implement the `constructor(apiKey: string)`.
2.  Implement the private utility `buildHeaders()` to include the `Authorization` header.

#### Step 4: Implement Core `completeChat` Logic

Implement the `completeChat` method using the native `fetch` API.

**Action:**

1.  Create the full API URL (`${this.baseUrl}/chat/completions`).
2.  Use `JSON.stringify(request)` to create the request body.
3.  Execute `fetch` with `method: 'POST'`, headers from `buildHeaders()`, and the JSON body.
4.  Implement a standard timeout using `AbortController` to handle potential long-running requests gracefully.

#### Step 5: Integrate Error Handling (`handleError`)

Implement the `handleError` private method to intercept responses, check the HTTP status code, and translate it into a custom error.

**Action:**

1.  In `completeChat`, check `response.ok`. If false, call `this.handleError(response)`.
2.  In `handleError`, use a `switch` statement on `response.status` (e.g., `401`, `400`, `429`, `500`) to throw the correct custom error class.

#### Step 6: Handle Structured Output Parsing

In `completeChat`, after a successful response, add logic to parse the text content if a `response_format` was present in the original request.

**Action:**

1.  Retrieve the `message.content` from the response.
2.  If `response_format` was requested, wrap `JSON.parse(content)` in a `try...catch` block.
3.  If `JSON.parse` fails, catch the error and throw a `ParsingError`.

#### Step 7: Secure the Service Call (Astro Action/API Endpoint)

The final step is to ensure the service is used securely in the application.

**Action:** Create an Astro Action in `src/actions` or an API endpoint in `src/pages/api` (e.g., `llm-chat.ts`). In this server-side function:

1.  Retrieve the `OPENROUTER_API_KEY` from `process.env`.
2.  Instantiate `const service = new OpenRouterService(apiKey);`.
3.  Call `service.completeChat(payload)` and return the result to the client.
