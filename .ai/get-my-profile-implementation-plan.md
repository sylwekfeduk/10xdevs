# API Endpoint Implementation Plan: Get My Profile

## 1. Endpoint Overview

This endpoint retrieves the complete profile data for the currently authenticated user. It's a fundamental read operation that allows the frontend to display user-specific information like their name, dietary preferences, and onboarding status.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/me/profile`
- **Parameters**: None
- **Request Body**: None

## 3. Used Types

- **Response DTO**: `ProfileDto` from `src/types.ts`.

## 4. Response Details

- **Success (200 OK)**: Returns the user's profile object.
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.png",
    "allergies": ["peanuts", "gluten"],
    "diets": ["vegetarian"],
    "disliked_ingredients": ["olives"],
    "has_completed_onboarding": true,
    "created_at": "2023-10-23T10:00:00Z",
    "updated_at": "2023-10-23T10:00:00Z"
  }
  ```
- **Error**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the user is authenticated but no profile exists for them in the `profiles` table.
  - `500 Internal Server Error`: For unexpected database or server errors.

## 5. Data Flow

1. A `GET` request is made to `/api/me/profile`.
2. Astro middleware validates the JWT from the `Authorization` header. If invalid, it rejects the request with a `401`.
3. The user's ID is extracted from the valid JWT and passed to the endpoint handler via `context.locals.user`.
4. The handler calls the `ProfileService.getProfile(userId)` method.
5. The service queries the `profiles` table for a record where `user_id` matches the authenticated user's ID.
6. If a profile is found, it is returned to the handler and sent as the `200 OK` JSON response.
7. If no profile is found, the service returns `null`, and the handler responds with `404 Not Found`.
8. If a database error occurs, the service throws an exception, which is caught by a global error handler and results in a `500 Internal Server Error` response.

## 6. Security Considerations

- **Authentication**: The endpoint is protected. All requests must include a valid JWT issued by Supabase. This will be handled by a shared middleware.
- **Authorization**: The service logic must ensure that the query to the `profiles` table is strictly filtered by the `user_id` obtained from the JWT. This prevents any possibility of a user accessing another user's profile.

## 7. Performance Considerations

- The query on `profiles.user_id` is expected to be highly performant, as `user_id` should be an indexed column (as it's a foreign key).
- The payload size is small, so network latency should be minimal.

## 8. Implementation Steps

1. **Create Service**: If it doesn't exist, create `src/lib/services/profile.service.ts`.
2. **Implement `getProfile` method**:
   - The method will accept `userId: string` and `supabase: SupabaseClient` as arguments.
   - It will perform `supabase.from('profiles').select('*').eq('user_id', userId).single()`.
   - It will return the profile data or `null`.
3. **Create API Endpoint**: Create an Astro API route at `src/pages/api/me/profile.ts`.
4. **Implement Endpoint Handler (`GET`)**:
   - Ensure `export const prerender = false;` is set.
   - Access the Supabase client and user session from `context.locals`.
   - If no user session exists, return a `401 Unauthorized` response.
   - Call `ProfileService.getProfile` with the user's ID.
   - If the service returns a profile, respond with `200 OK` and the profile data.
   - If the service returns `null`, respond with `404 Not Found`.
   - Add a `try...catch` block to handle potential service-level errors and return `500 Internal Server Error`.
