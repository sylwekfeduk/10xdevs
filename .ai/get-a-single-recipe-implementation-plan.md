# API Endpoint Implementation Plan: Get a Single Recipe

## 1. Endpoint Overview

This endpoint retrieves the full details of a single recipe, identified by its unique ID. It is used when a user wants to view a specific recipe's ingredients, instructions, and other metadata. The endpoint ensures that users can only access recipes they own.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/recipes/{recipeId}`
- **Parameters**:
  - **Required URL Parameter**: `recipeId` (UUID) - The unique identifier for the recipe.
- **Request Body**: None

## 3. Used Types

- **Response DTO**: `RecipeDetailDto` from `src/types.ts`.

## 4. Response Details

- **Success (200 OK)**: Returns the full recipe object.
  ```json
  {
    "id": "uuid-recipe-1",
    "user_id": "uuid-user-1",
    "title": "My Favorite Pasta",
    "ingredients": "Spaghetti, Sauce, Meatballs",
    "instructions": "Boil spaghetti. Heat sauce. Combine.",
    "original_recipe_id": null,
    "changes_summary": null,
    "created_at": "2023-10-23T10:00:00Z",
    "updated_at": "2023-10-23T10:00:00Z"
  }
  ```
- **Error**:
  - `400 Bad Request`: If `{recipeId}` is not a valid UUID.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If no recipe exists with the given ID, or if it exists but belongs to another user.
  - `500 Internal Server Error`: For unexpected database or server errors.

## 5. Data Flow

1. A `GET` request is made to `/api/recipes/{recipeId}`.
2. Middleware validates the JWT and rejects with `401` if invalid.
3. The API route handler extracts `recipeId` from the URL parameters (`context.params`).
4. The handler validates that `recipeId` is a valid UUID. A Zod schema is suitable for this. If invalid, it returns `400 Bad Request`.
5. The user's ID is retrieved from `context.locals.user`.
6. The handler calls `RecipeService.getRecipeById(userId, recipeId)`.
7. **Inside the service**:
   - It executes a Supabase query: `supabase.from('recipes').select('*').eq('id', recipeId).eq('user_id', userId).single()`.
   - The combined `.eq()` clauses are critical for ensuring data ownership.
   - The `.single()` method will return a single object or an error if zero or multiple rows are found.
8. If the service returns a recipe object, the handler sends it as a `200 OK` response.
9. If the service's query returns no data (because the ID doesn't exist or `user_id` doesn't match), Supabase's `.single()` will throw an error. The service should catch this and return `null`. The handler then responds with `404 Not Found`.
10. Other database errors are caught and result in a `500 Internal Server Error`.

## 6. Security Considerations

- **Authentication**: The endpoint must be protected by JWT middleware.
- **Authorization**: This is the most critical aspect. The database query **must** include `WHERE id = ? AND user_id = ?`. This prevents Insecure Direct Object Reference (IDOR) vulnerabilities, where a user could otherwise cycle through UUIDs to access recipes owned by other users.

## 7. Performance Considerations

- The query uses the primary key (`id`) and an indexed foreign key (`user_id`), so it will be very fast.
- The payload for a single recipe is expected to be reasonably small. No significant performance issues are anticipated.

## 8. Implementation Steps

1. **Create Zod Schema**: In `src/lib/schemas/recipe.schema.ts`, add a schema or utility to validate a UUID string, e.g., `z.string().uuid()`.
2. **Create/Update Service**: Open `src/lib/services/recipe.service.ts`.
3. **Implement `getRecipeById` method**:
   - It will accept `userId: string`, `recipeId: string`, and `supabase: SupabaseClient`.
   - It will execute the query: `supabase.from('recipes').select('*').eq('id', recipeId).eq('user_id', userId).single()`.
   - It will wrap the query in a `try...catch` block. If the query error indicates no rows were found (`PGRST116` in PostgREST), it should return `null`. Otherwise, re-throw the error.
   - On success, it returns the recipe data.
4. **Create API Endpoint**: Create a dynamic Astro API route at `src/pages/api/recipes/[recipeId].ts`.
5. **Implement Endpoint Handler (`GET`)**:
   - Set `export const prerender = false;`.
   - Check for user session; return `401` if not found.
   - Extract `recipeId` from `context.params` and validate it as a UUID. Return `400` if invalid.
   - Call `RecipeService.getRecipeById` with the user's ID and `recipeId`.
   - If the service returns a recipe, respond with `200 OK` and the recipe data.
   - If the service returns `null`, respond with `404 Not Found`.
   - Use a `try...catch` block to handle any other errors from the service and return `500`.
