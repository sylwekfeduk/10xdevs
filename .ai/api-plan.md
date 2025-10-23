# REST API Plan

This document outlines the REST API for the HealthyMeal MVP. The API is designed to be RESTful, secure, and aligned with the business logic and metrics outlined in the PRD.

## 1. Resources

-   **Profiles**: Represents the user's application-specific data, including dietary preferences. Corresponds to the `profiles` table.
-   **Recipes**: Represents user-submitted or AI-modified recipes. Corresponds to the `recipes` table.

---

## 2. Endpoints

### Profile Resource

#### Get My Profile
-   **HTTP Method**: `GET`
-   **URL Path**: `/api/me/profile`
-   **Description**: Retrieves the profile for the currently authenticated user.
-   **Query Parameters**: None
-   **JSON Response Payload**:
    ```json
    {
      "id": "uuid",
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
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found` (if profile doesn't exist for the user), `500 Internal Server Error`

#### Update My Profile
-   **HTTP Method**: `PATCH`
-   **URL Path**: `/api/me/profile`
-   **Description**: Updates the profile for the currently authenticated user. Used during onboarding and for subsequent preference changes. The backend will set `has_completed_onboarding` to `true` if at least one preference is provided.
-   **JSON Request Payload**:
    ```json
    {
      "full_name": "Johnathan Doe",
      "avatar_url": "https://example.com/new_avatar.png",
      "allergies": ["peanuts", "gluten", "dairy"],
      "diets": ["vegetarian"],
      "disliked_ingredients": ["olives", "anchovies"]
    }
    ```
-   **JSON Response Payload**: The updated profile object (same as `GET /api/me/profile`).
-   **Success Codes**: `200 OK`
-   **Error Codes**: `400 Bad Request` (for invalid data), `401 Unauthorized`, `500 Internal Server Error`

---

### Recipe Resource

#### Get All My Recipes
-   **HTTP Method**: `GET`
-   **URL Path**: `/api/recipes`
-   **Description**: Retrieves a paginated list of all recipes (originals and AI-modified) for the authenticated user.
-   **Query Parameters**:
    -   `page` (integer, default: 1): The page number for pagination.
    -   `pageSize` (integer, default: 10): The number of recipes per page.
    -   `sortBy` (string, default: 'created_at'): Field to sort by (e.g., 'created_at', 'updated_at', 'title').
    -   `order` (string, default: 'desc'): Sort order ('asc' or 'desc').
-   **JSON Response Payload**:
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
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `500 Internal Server Error`

#### Create a New Recipe
-   **HTTP Method**: `POST`
-   **URL Path**: `/api/recipes`
-   **Description**: Creates a new recipe. Used for both user-submitted originals and for saving AI-modified copies.
-   **JSON Request Payload**:
    ```json
    {
      "title": "Vegan Chili",
      "ingredients": "1. ...\n2. ...",
      "instructions": "1. ...\n2. ...",
      "original_recipe_id": "uuid-optional"
    }
    ```
-   **JSON Response Payload**: The newly created recipe object.
    ```json
    {
      "id": "uuid-new-recipe",
      "user_id": "uuid-user-1",
      "title": "Vegan Chili",
      "ingredients": "1. ...\n2. ...",
      "instructions": "1. ...\n2. ...",
      "original_recipe_id": "uuid-optional",
      "changes_summary": null,
      "created_at": "2023-10-23T10:00:00Z",
      "updated_at": "2023-10-23T10:00:00Z"
    }
    ```
-   **Success Codes**: `201 Created`
-   **Error Codes**: `400 Bad Request` (e.g., missing title), `401 Unauthorized`, `500 Internal Server Error`

#### Get a Single Recipe
-   **HTTP Method**: `GET`
-   **URL Path**: `/api/recipes/{recipeId}`
-   **Description**: Retrieves a single recipe by its ID.
-   **JSON Response Payload**: The full recipe object, including ingredients and instructions.
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
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

#### Delete a Recipe
-   **HTTP Method**: `DELETE`
-   **URL Path**: `/api/recipes/{recipeId}`
-   **Description**: Deletes a recipe (original or AI-modified) by its ID.
-   **JSON Response Payload**: None
-   **Success Codes**: `204 No Content`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

#### Modify a Recipe with AI
-   **HTTP Method**: `POST`
-   **URL Path**: `/api/recipes/{recipeId}/modify`
-   **Description**: Triggers an AI modification for a given recipe based on the user's current profile preferences. This action is logged in `ai_modifications_log` to track engagement. It **does not** save the recipe automatically.
-   **JSON Request Payload**: None (AI uses the user's saved profile preferences).
-   **JSON Response Payload**: A new, unsaved recipe object with AI-generated changes. The client can then choose to save this by sending it to `POST /api/recipes`.
    ```json
    {
      "id": null,
      "user_id": "uuid-user-1",
      "title": "My Favorite Pasta (Vegetarian Adaptation)",
      "ingredients": "Spaghetti, Sauce, Plant-based Meatballs",
      "instructions": "Boil spaghetti. Heat sauce. Combine.",
      "original_recipe_id": "uuid-recipe-1",
      "changes_summary": [
        {"type": "substitution", "from": "Meatballs", "to": "Plant-based Meatballs"}
      ],
      "created_at": null,
      "updated_at": null
    }
    ```
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found` (if original recipe doesn't exist), `500 Internal Server Error`, `503 Service Unavailable` (if AI service is down).

---

## 3. Authentication and Authorization

-   **Mechanism**: Authentication will be handled via JSON Web Tokens (JWT) provided by Supabase.
-   **Implementation**:
    1.  The client (frontend) will authenticate with Supabase Auth (e.g., email/password or Google OAuth).
    2.  Supabase will return a JWT.
    3.  For all protected API endpoints, the client must include the JWT in the `Authorization` header as a Bearer token: `Authorization: Bearer <your-supabase-jwt>`.
    4.  The backend will validate the JWT and use the `user_id` from the token payload to enforce Row-Level Security (RLS) policies in the PostgreSQL database. This ensures users can only access or modify their own data.

---

## 4. Validation and Business Logic

### Validation
-   **Profiles**:
    -   `allergies`, `diets`, `disliked_ingredients` must be arrays of strings.
-   **Recipes**:
    -   `title` is required and cannot be an empty string.
    -   `ingredients` and `instructions` are required and must be non-empty text.
    -   `original_recipe_id`, if provided, must be a valid UUID of an existing recipe owned by the user.

### Business Logic Implementation
-   **90% User Activation**:
    -   The `PATCH /api/me/profile` endpoint's backend logic will inspect the request payload.
    -   If `allergies`, `diets`, or `disliked_ingredients` contains at least one item, the logic will update the `has_completed_onboarding` flag in the `profiles` table to `true`.
-   **75% WAU AI Engagement**:
    -   Every successful call to `POST /api/recipes/{recipeId}/modify` will create a new entry in the `ai_modifications_log` table.
    -   The entry will log `user_id`, `original_recipe_id`, a snapshot of the user's preferences (`user_preferences_snapshot`), and performance metrics (`processing_time_ms`, etc.).
    -   These logs will be used for asynchronous analysis to calculate the WAU engagement metric.
-   **AI Creates Copies**:
    -   The `POST /api/recipes/{recipeId}/modify` endpoint is non-destructive. It reads the original recipe and returns a new JSON object representing the modification without saving it to the database.
    -   To save the AI-generated recipe, the frontend must make a subsequent `POST /api/recipes` call, including the `original_recipe_id` in the payload to maintain the link.
