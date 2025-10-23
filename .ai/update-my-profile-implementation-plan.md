# API Endpoint Implementation Plan: Update My Profile

## 1. Endpoint Overview
This endpoint allows an authenticated user to update their profile information. It is a critical part of the onboarding flow and for managing user preferences later. The endpoint also contains business logic to automatically mark the user's onboarding as complete.

## 2. Request Details
- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/me/profile`
- **Parameters**: None
- **Request Body**: A JSON object containing the fields to be updated. All fields are optional.
  ```json
  {
    "full_name": "Johnathan Doe",
    "avatar_url": "https://example.com/new_avatar.png",
    "allergies": ["peanuts", "gluten", "dairy"],
    "diets": ["vegetarian"],
    "disliked_ingredients": ["olives", "anchovies"]
  }
  ```

## 3. Used Types
- **Command Model**: `UpdateProfileCommand` from `src/types.ts` for the request body.
- **Response DTO**: `ProfileDto` from `src/types.ts` for the response body.

## 4. Response Details
- **Success (200 OK)**: Returns the entire updated profile object.
- **Error**:
  - `400 Bad Request`: If the request body contains invalid data (e.g., wrong types).
  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: For unexpected database or server errors.

## 5. Data Flow
1. A `PATCH` request is made to `/api/me/profile`.
2. Middleware validates the JWT. If invalid, it rejects with `401`.
3. The API route handler validates the request body using a Zod schema based on `UpdateProfileCommand`. If invalid, it returns a `400 Bad Request` with validation errors.
4. The user's ID is extracted from `context.locals.user`.
5. The handler calls the `ProfileService.updateProfile(userId, validatedData)` method.
6. **Inside the service**:
   - It prepares the `updateData` object.
   - **Business Logic**: It checks if `allergies`, `diets`, or `disliked_ingredients` are present in the payload and have a length greater than zero. If so, it adds `has_completed_onboarding: true` to `updateData`.
   - It executes a Supabase query: `supabase.from('profiles').update(updateData).eq('user_id', userId).select().single()`.
   - The `.select().single()` chained at the end ensures the updated record is returned atomically.
7. The service returns the updated profile.
8. The handler receives the updated profile and sends it as the `200 OK` JSON response.
9. If any database error occurs, the service throws an exception, leading to a `500 Internal Server Error` response.

## 6. Security Considerations
- **Authentication**: Endpoint must be protected by JWT middleware.
- **Authorization**: The `update` operation in the service must be strictly scoped to the `user_id` from the authenticated session. This prevents a user from modifying another user's profile.
- **Input Sanitization**: While Zod provides type validation, ensure that any free-text fields like `full_name` and `avatar_url` are properly handled to prevent XSS if they are ever rendered without escaping. Supabase libraries typically handle SQL injection prevention.

## 7. Performance Considerations
- The `update` operation targets a single row by an indexed `user_id` and should be very fast.
- The payload size is small. No significant performance issues are anticipated.

## 8. Implementation Steps
1. **Create Zod Schema**: In `src/lib/schemas/profile.schema.ts`, define a Zod schema `UpdateProfileSchema` that validates the structure of `UpdateProfileCommand`. All fields should be optional (`.optional()`). `allergies`, `diets`, and `disliked_ingredients` should be validated as arrays of strings (`z.array(z.string())`).
2. **Create/Update Service**: Open `src/lib/services/profile.service.ts`.
3. **Implement `updateProfile` method**:
   - The method will accept `userId: string`, `data: UpdateProfileCommand`, and `supabase: SupabaseClient`.
   - It will construct an update payload.
   - It will implement the business logic for setting `has_completed_onboarding`.
   - It will execute the Supabase `update` query and return the result.
4. **Create API Endpoint**: Create or use the existing Astro API route at `src/pages/api/me/profile.ts`.
5. **Implement Endpoint Handler (`PATCH`)**:
   - Ensure `export const prerender = false;` is set.
   - Check for a valid user session from `context.locals`. Return `401` if absent.
   - Parse and validate the request body using `UpdateProfileSchema.safeParse()`. If validation fails, return a `400` response with error details.
   - Call `ProfileService.updateProfile` with the user's ID and the validated data.
   - Respond with `200 OK` and the updated profile returned by the service.
   - Wrap the logic in a `try...catch` block to handle errors and return `500`.
