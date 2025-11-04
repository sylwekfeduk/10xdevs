# API Endpoint Implementation Plan: Modify a Recipe with AI

## 1. Endpoint Overview

This endpoint orchestrates the AI-powered modification of a user's recipe. It fetches an existing recipe, combines it with the user's dietary preferences, sends this data to an external AI service, logs the transaction, and returns the _new, unsaved_ recipe to the client. This is a key feature for driving the "WAU AI Engagement" metric.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/recipes/{recipeId}/modify`
- **Parameters**:
  - **Required URL Parameter**: `recipeId` (UUID) - The ID of the recipe to modify.
- **Request Body**: None. The AI uses the user's saved profile preferences.

## 3. Used Types

- **Response DTO**: `ModifiedRecipeDto` from `src/types.ts`.

## 4. Response Details

- **Success (200 OK)**: Returns a new, unsaved recipe object with AI-generated changes.
  ```json
  {
    "id": null,
    "user_id": "uuid-user-1",
    "title": "My Favorite Pasta (Vegetarian Adaptation)",
    "ingredients": "...",
    "instructions": "...",
    "original_recipe_id": "uuid-recipe-1",
    "changes_summary": [{ "type": "substitution", "from": "Meatballs", "to": "Plant-based Meatballs" }],
    "created_at": null,
    "updated_at": null
  }
  ```
- **Error**:
  - `400 Bad Request`: If `{recipeId}` is not a valid UUID.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the original recipe or user profile doesn't exist.
  - `500 Internal Server Error`: For unexpected internal errors (e.g., failed to log).
  - `503 Service Unavailable`: If the external AI service is down or fails.

## 5. Data Flow

1. A `POST` request is made to `/api/recipes/{recipeId}/modify`.
2. Middleware validates JWT (`401` on failure). `recipeId` is validated as a UUID (`400` on failure).
3. The handler initiates a call to a new, high-level service, e.g., `AIModificationService.modifyRecipe(userId, recipeId)`.
4. **Inside the `AIModificationService`**:
   a. **Start Timer**: Record the start time.
   b. **Fetch Data in Parallel**: Use `Promise.all` to fetch the original recipe (via `RecipeService.getRecipeById`) and the user's profile (via `ProfileService.getProfile`). If either is not found, throw a `NotFoundError` (`404`).
   c. **Construct AI Prompt**: Create a detailed prompt for the AI model, including the recipe's content and the user's preferences. Specify the desired JSON output format (`title`, `ingredients`, `instructions`, `changes_summary`).
   d. **Call AI Service**: Make an `fetch` call to the OpenRouter.ai API endpoint with the prompt and API key (from environment variables).
   e. **Parse Response**: Parse the JSON response from the AI. Validate its structure. If parsing or validation fails, throw an `AIServiceError`.
   f. **Stop Timer**: Calculate `processing_time_ms`.
   g. **Log Success**: Asynchronously (don't await) call a logging method to insert a record into `ai_modifications_log`. The log must include `user_id`, `original_recipe_id`, a snapshot of the preferences, `processing_time_ms`, `was_successful: true`, and the AI model used.
   h. **Construct DTO**: Assemble the `ModifiedRecipeDto` using the data from the AI response, setting `id`, `created_at`, and `updated_at` to `null`.
   i. **Return DTO**: Return the assembled DTO.
5. **Error Handling in Service**:
   - A `try...catch` block surrounds the entire process.
   - If the AI service call fails (e.g., network error, 5xx response), stop the timer, log the failure to `ai_modifications_log` with `was_successful: false` and the error message, then throw an `AIServiceUnavailableError` (`503`).
   - For other errors, log them and throw an appropriate error.
6. The API handler catches errors from the service and maps them to the correct HTTP status codes (`404`, `503`, `500`). On success, it returns `200 OK` with the `ModifiedRecipeDto`.

## 6. Security Considerations

- **Authentication**: JWT middleware is required.
- **Authorization**: The service must verify the user owns the `recipeId` before proceeding.
- **API Key Management**: The `OPENROUTER_API_KEY` must be stored securely as an environment variable (`import.meta.env.OPENROUTER_API_KEY`) and never exposed to the client.
- **Third-Party Service**: The connection to OpenRouter.ai must use HTTPS. Be aware of the data being sent (user preferences and recipe content).

## 7. Performance Considerations

- **Bottleneck**: The main performance bottleneck will be the latency of the external AI service call. This can take several seconds. The endpoint is therefore inherently slow and asynchronous on the client side.
- **Database Calls**: The initial data fetching (`recipe`, `profile`) can be done in parallel to save time.
- **Logging**: The write to `ai_modifications_log` should be performed asynchronously (`fire-and-forget`) so it doesn't add latency to the user's response.

## 8. Implementation Steps

1. **New Service**: Create `src/lib/services/ai-modification.service.ts`.
2. **Environment Variable**: Add `OPENROUTER_API_KEY` to the project's environment variables.
3. **Implement `modifyRecipe` method**:
   - This method will orchestrate the entire data flow described in section 5.
   - It will need `ProfileService` and `RecipeService` as dependencies (or at least access to their methods).
   - Implement robust error handling for the `fetch` call and AI response parsing.
   - Create a helper method for logging to `ai_modifications_log` that can be called from both success and failure paths.
4. **Create API Endpoint**: Create `src/pages/api/recipes/[recipeId]/modify.ts`.
5. **Implement Endpoint Handler (`POST`)**:
   - Set `export const prerender = false;`.
   - Perform session and `recipeId` validation.
   - Call `AIModificationService.modifyRecipe`.
   - Implement a `try...catch` block that maps specific error types thrown by the service (`NotFoundError`, `AIServiceUnavailableError`) to the correct HTTP responses (`404`, `503`).
   - Return `200 OK` with the DTO on success.
