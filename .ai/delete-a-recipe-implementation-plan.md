# API Endpoint Implementation Plan: Delete a Recipe

## 1. Endpoint Overview

This endpoint allows an authenticated user to permanently delete one of their recipes, identified by its unique ID. The operation must be secure, ensuring users can only delete recipes they own.

## 2. Request Details

- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/recipes/{recipeId}`
- **Parameters**:
  - **Required URL Parameter**: `recipeId` (UUID) - The unique identifier for the recipe to be deleted.
- **Request Body**: None

## 3. Used Types

- None.

## 4. Response Details

- **Success (204 No Content)**: An empty response indicating the resource was successfully deleted.
- **Error**:
  - `400 Bad Request`: If `{recipeId}` is not a valid UUID.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If no recipe exists with the given ID that is also owned by the user.
  - `500 Internal Server Error`: For unexpected database errors.

## 5. Data Flow

1. A `DELETE` request is made to `/api/recipes/{recipeId}`.
2. Middleware validates the JWT and rejects with `401` if invalid.
3. The API route handler extracts `recipeId` from `context.params` and validates it as a UUID. If invalid, it returns `400`.
4. The user's ID is retrieved from `context.locals.user`.
5. The handler calls a `RecipeService.deleteRecipe(userId, recipeId)` method.
6. **Inside the service**:
   - It executes a Supabase query: `supabase.from('recipes').delete().eq('id', recipeId).eq('user_id', userId)`.
   - The `.eq('user_id', userId)` is the critical authorization check.
   - The service inspects the result of the delete operation. The Supabase client can indicate how many rows were affected.
   - If the count of deleted rows is 0, it means no recipe matched both the `id` and the `user_id`. The service should signal this back to the handler (e.g., by returning `false` or throwing a "Not Found" error).
   - If the count is 1, the deletion was successful.
7. If the service indicates success, the handler responds with `204 No Content`.
8. If the service indicates that no record was found to delete, the handler responds with `404 Not Found`.
9. Any other database errors are caught and result in a `500 Internal Server Error`.

## 6. Security Considerations

- **Authentication**: Endpoint must be protected by JWT middleware.
- **Authorization**: The `DELETE` operation must be conditional on both the recipe `id` and the `user_id` from the token. This is the primary defense against a user being able to delete another user's data.

## 7. Performance Considerations

- The `DELETE` operation targets a single row by its primary key (`id`) and is very efficient.
- No performance issues are anticipated.
- **Cascading Deletes**: The database schema specifies `ON DELETE SET NULL` for `original_recipe_id` in other recipes and `ON DELETE CASCADE` for logs. This means deleting an original recipe will not delete its AI-modified copies (they will just lose the link), but it will delete related logs. This is the intended behavior.

## 8. Implementation Steps

1. **Create Zod Schema**: Ensure a UUID validation schema is available in `src/lib/schemas/recipe.schema.ts`.
2. **Create/Update Service**: Open `src/lib/services/recipe.service.ts`.
3. **Implement `deleteRecipe` method**:
   - It will accept `userId: string`, `recipeId: string`, and `supabase: SupabaseClient`.
   - It will execute the query: `supabase.from('recipes').delete().eq('id', recipeId).eq('user_id', userId)`.
   - It will check the `count` from the response. If `count` is 0, it should throw a custom `NotFoundError`. If `count` is greater than 0, it completes successfully.
4. **Create API Endpoint**: Use the existing dynamic route at `src/pages/api/recipes/[recipeId].ts`.
5. **Implement Endpoint Handler (`DELETE`)**:
   - Set `export const prerender = false;`.
   - Check for user session; return `401` if absent.
   - Extract `recipeId` and validate it. Return `400` if invalid.
   - Wrap the service call in a `try...catch` block.
   - Call `RecipeService.deleteRecipe(userId, recipeId)`.
   - If the call is successful, return a `204 No Content` response.
   - If the `catch` block catches the custom `NotFoundError`, return a `404 Not Found` response.
   - For any other errors, return `500 Internal Server Error`.
