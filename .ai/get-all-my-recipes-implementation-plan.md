# API Endpoint Implementation Plan: Get All My Recipes

## 1. Endpoint Overview

This endpoint provides a paginated list of all recipes belonging to the authenticated user. It supports sorting and is optimized to return a lightweight list, excluding heavy fields like ingredients and instructions, making it suitable for overview pages.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/recipes`
- **Parameters**:
  - **Optional Query Parameters**:
    - `page` (integer, default: 1): The page number for pagination.
    - `pageSize` (integer, default: 10): The number of items per page.
    - `sortBy` (string, default: 'created_at'): Field to sort by. Allowed values: 'created_at', 'updated_at', 'title'.
    - `order` (string, default: 'desc'): Sort order. Allowed values: 'asc', 'desc'.
- **Request Body**: None

## 3. Used Types

- **Response DTO**: `RecipeListItemDto` for items in the data array.
- **Pagination Structure**: A wrapper object containing `data` and `pagination` fields.

## 4. Response Details

- **Success (200 OK)**: Returns a paginated response object.
  ```json
  {
    "data": [
      {
        "id": "uuid-recipe-1",
        "user_id": "uuid-user-1",
        "title": "My Favorite Pasta",
        "original_recipe_id": null,
        "created_at": "2023-10-23T10:00:00Z",
        "updated_at": "2023-10-23T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1
    }
  }
  ```
- **Error**:
  - `400 Bad Request`: If query parameters are invalid (e.g., `page` is not a number, `sortBy` is an unsupported field).
  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: For unexpected database or server errors.

## 5. Data Flow

1. A `GET` request is made to `/api/recipes` with optional query parameters.
2. Middleware validates the JWT and rejects with `401` if invalid.
3. The API route handler validates the query parameters (`page`, `pageSize`, etc.) using a Zod schema. If validation fails, it returns `400`. Default values are applied if parameters are not provided.
4. The user's ID is retrieved from `context.locals.user`.
5. The handler calls a `RecipeService.getUserRecipes(userId, options)` method, passing the validated pagination and sorting options.
6. **Inside the service**:
   - It calculates the `from` and `to` range for Supabase pagination from `page` and `pageSize`.
   - It executes two queries in parallel (e.g., using `Promise.all`):
     - **Query 1 (Count)**: `supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', userId)`. This efficiently gets the total count without fetching data.
     - **Query 2 (Data)**: `supabase.from('recipes').select('id, user_id, title, original_recipe_id, created_at, updated_at').eq('user_id', userId).order(sortBy, { ascending: order === 'asc' }).range(from, to)`. Note the explicit selection of fields matching `RecipeListItemDto`.
   - The service waits for both queries to complete.
   - It constructs the response object with `data` from Query 2 and `pagination` metadata from Query 1's count.
7. The service returns the structured response.
8. The handler sends the response with a `200 OK` status.

## 6. Security Considerations

- **Authentication**: Endpoint must be protected by JWT middleware.
- **Authorization**: All database queries must be filtered by the `user_id` from the authenticated JWT session to ensure users only see their own recipes.

## 7. Performance Considerations

- **Pagination**: The use of `range()` is crucial for performance, preventing the database from sending large datasets.
- **Indexing**: `recipes.user_id` must be indexed to ensure fast lookups. The `sortBy` fields (`created_at`, `updated_at`, `title`) are also good candidates for indexing.
- **Efficient Count**: Executing a separate `head` query for the count is more efficient than fetching all IDs.
- **Lightweight DTO**: Selecting only the necessary columns (`RecipeListItemDto`) reduces data transfer size.

## 8. Implementation Steps

1. **Create Zod Schema**: In `src/lib/schemas/recipe.schema.ts`, define `GetRecipesQuerySchema` to validate the optional query parameters. Use `.default()` to specify default values and `.refine()` or `z.enum()` to constrain `sortBy` and `order` values.
2. **Create Service**: If it doesn't exist, create `src/lib/services/recipe.service.ts`.
3. **Implement `getUserRecipes` method**:
   - It will accept `userId: string`, options (`page`, `pageSize`, etc.), and `supabase: SupabaseClient`.
   - Implement the logic to calculate the pagination range.
   - Execute the data and count queries concurrently.
   - Assemble and return the final paginated response structure.
4. **Create API Endpoint**: Create an Astro API route at `src/pages/api/recipes.ts`.
5. **Implement Endpoint Handler (`GET`)**:
   - Set `export const prerender = false;`.
   - Check for user session; return `401` if not found.
   - Parse and validate `Astro.url.searchParams` using the Zod schema. Return `400` on failure.
   - Call `RecipeService.getUserRecipes` with the user's ID and validated options.
   - Respond with `200 OK` and the data from the service.
   - Use a `try...catch` block for error handling.
