# API Endpoint Implementation Plan: Create a New Recipe

## 1. Endpoint Overview

This endpoint allows an authenticated user to create a new recipe. This can be either a brand-new, original recipe or an AI-modified version of an existing recipe. The endpoint is responsible for validating the incoming data and persisting it to the database.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/recipes`
- **Parameters**: None
- **Request Body**: A JSON object with the new recipe's details.
  ```json
  {
    "title": "Vegan Chili",
    "ingredients": "1. ...\n2. ...",
    "instructions": "1. ...\n2. ...",
    "original_recipe_id": "uuid-optional" // Null or omitted for new recipes
  }
  ```

## 3. Used Types

- **Command Model**: `CreateRecipeCommand` from `src/types.ts` for the request body.
- **Response DTO**: `RecipeDetailDto` from `src/types.ts` for the response body.

## 4. Response Details

- **Success (201 Created)**: Returns the newly created recipe object, including server-generated values like `id`, `user_id`, `created_at`, etc.
- **Error**:
  - `400 Bad Request`: If the request body is invalid (e.g., missing `title`, `original_recipe_id` is invalid or not owned by user).
  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: For unexpected database or server errors.

## 5. Data Flow

1. A `POST` request is made to `/api/recipes`.
2. Middleware validates the JWT and rejects with `401` if invalid.
3. The API route handler validates the request body using a Zod schema based on `CreateRecipeCommand`. If invalid, it returns `400`.
4. The user's ID is retrieved from `context.locals.user`.
5. The handler calls `RecipeService.createRecipe(userId, validatedData)`.
6. **Inside the service**:
   - It receives the validated recipe data.
   - **Data Integrity Check**: If `original_recipe_id` is provided, the service must first query the `recipes` table to verify that a recipe with that ID exists **and** is owned by the current `userId`. If this check fails, the service should throw a specific error (e.g., `InvalidReferenceError`) to be handled as a `400 Bad Request`.
   - It prepares the data for insertion, adding the `user_id` from the authenticated session.
   - It executes a Supabase query: `supabase.from('recipes').insert({ ...data, user_id: userId }).select().single()`.
   - The `.select().single()` is crucial to get the newly created record back in a single atomic operation.
7. The service returns the new recipe object.
8. The handler receives the new recipe and sends it as the `21 Created` JSON response.
9. Database errors (e.g., constraint violations) are caught and result in a `500 Internal Server Error`.

## 6. Security Considerations

- **Authentication**: Endpoint must be protected by JWT middleware.
- **Authorization/Data Integrity**: The check for `original_recipe_id` ownership is a critical security and data integrity measure. It prevents a user from creating a modified recipe and linking it to an original recipe they do not own.
- **Input Validation**: `title`, `ingredients`, and `instructions` are required and must not be empty. This is enforced by the Zod schema and database constraints (`CHECK (length(title) > 0)`).

## 7. Performance Considerations

- The operation involves an `INSERT` and potentially one preceding `SELECT` (if `original_recipe_id` is present). Both queries will be on indexed columns (`id`, `user_id`), so performance should be good.
- The transaction is simple and should not cause bottlenecks.

## 8. Implementation Steps

1. **Create Zod Schema**: In `src/lib/schemas/recipe.schema.ts`, define `CreateRecipeSchema`.
   - `title`, `ingredients`, `instructions` should be `z.string().min(1)`.
   - `original_recipe_id` should be `z.string().uuid().optional().nullable()`.
2. **Create/Update Service**: Open `src/lib/services/recipe.service.ts`.
3. **Implement `createRecipe` method**:
   - It will accept `userId: string`, `data: CreateRecipeCommand`, and `supabase: SupabaseClient`.
   - Implement the `original_recipe_id` validation logic:
     - If `data.original_recipe_id` exists, perform a `select` to check for its existence and ownership. Throw a custom error if the check fails.
   - Execute the Supabase `insert` query.
   - Return the newly created recipe from the query result.
4. **Create API Endpoint**: Create or use the existing Astro API route at `src/pages/api/recipes.ts`.
5. **Implement Endpoint Handler (`POST`)**:
   - Set `export const prerender = false;`.
   - Check for user session; return `401` if absent.
   - Parse and validate the request body with `CreateRecipeSchema`. Return `400` on failure.
   - Call `RecipeService.createRecipe` with the user ID and validated data.
   - If the service throws the custom `InvalidReferenceError`, return `400` with a specific message.
   - On success, respond with `201 Created` and the new recipe data.
   - Use a `try...catch` block for general error handling, returning `500`.
