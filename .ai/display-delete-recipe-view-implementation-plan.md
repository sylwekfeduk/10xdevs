````markdown
# View Implementation Plan Recipe Details View

## 1. Overview
The **Recipe Details View** provides a comprehensive look at a single recipe, identified by its UUID. It displays the recipe's title, full ingredients, and instructions. Crucially, it highlights whether the recipe is an original creation or an AI-modified version by displaying a summary of changes and a required safety disclaimer for AI-generated content. The view also provides immediate action buttons for triggering further AI modification or **deleting the recipe**.

## 2. View Routing
The view should be accessible via a dynamic path segment for the recipe ID:
* **Path:** `/recipes/{id}`
* **Astro Component:** Mapped to handle requests for this dynamic route, extracting the `id` parameter.

---

## 3. Component Structure
The page is built around a container component that manages the single recipe's state and delegates presentation and actions to child components.

```mermaid
graph TD
    A[RecipeDetailsPage /recipes/{id} (Astro/React Container)] --> B(RecipeActionsBar)
    A --> C(AIHighlights)
    A --> D(RecipeContentDisplay)
    A --> E(DeleteRecipeModal)
````

-----

## 4\. Component Details

### RecipeDetailsPage (Astro/React Container)

- **Component description:** The primary view component responsible for fetching data via the `useRecipeDetails` custom hook, managing loading/error states, and coordinating the recipe's presentation and available actions.
- **Main elements:** Layout structure, conditional rendering of loading/error states, and conditional rendering of child components.
- **Handled interactions:** Receives callback functions for `onDelete` (confirming deletion) and `onTriggerAIModification`. Manages loading states (`isLoading`, `isDeleting`, `isAIModifying`).
- **Handled validation:** **URL Parameter Validation:** Extracts `id` from the path and validates it as a UUID format (`RecipeIdSchema`) before calling the API.
- **Types:** `RecipeDetailDto`, `RecipeDetailsViewModel`.
- **Props:** None (It extracts the `recipeId` from the URL).

-----

### RecipeActionsBar (React Component, using Shadcn/ui)

- **Component description:** A component grouping the primary actions available: **AI Modification** and **Delete Recipe**.
- **Main elements:** Shadcn/ui `Button` components: "Modify with AI" and "Delete Recipe".
- **Handled interactions:** `onClick` events for action buttons.
- **Handled validation:** The buttons are disabled if the component state shows any operation in progress (`isDeleting` or `isAIModifying` is true).
- **Types:** `RecipeDetailsViewModel`.
- **Props:**
  ```typescript
  interface RecipeActionsBarProps {
    recipe: RecipeDetailsViewModel;
    onDeleteClick: () => void; // To open the confirmation modal
    onAIModClick: (recipeId: string) => void;
    isDeleting: boolean;
    isAIModifying: boolean;
  }
  ```

-----

### RecipeContentDisplay (React Component)

- **Component description:** Displays the recipe's core content: title, ingredients, instructions, and metadata.
- **Main elements:** Headings, text blocks for ingredients/instructions, and a status badge/tag.
- **Handled interactions:** None.
- **Handled validation:** Displays the status badge ('Original' or 'AI-Modified') based on `recipe.statusLabel`.
- **Types:** `RecipeDetailsViewModel`.
- **Props:**
  ```typescript
  interface RecipeContentDisplayProps {
    recipe: RecipeDetailsViewModel;
  }
  ```

-----

### AIHighlights (React Component, using Shadcn/ui Alert)

- **Component description:** Conditionally renders AI-specific information: the `changes_summary` and the mandatory safety disclaimer.
- **Main elements:** Shadcn/ui `Alert` component(s) to visually emphasize the content.
- **Handled interactions:** None.
- **Handled validation:** **Only renders** if `recipe.isAIModified` is true. The disclaimer must be rendered prominently.
- **Types:** `RecipeDetailsViewModel`.
- **Props:**
  ```typescript
  interface AIHighlightsProps {
    recipe: RecipeDetailsViewModel;
  }
  ```

-----

### DeleteRecipeModal (React Component, using Shadcn/ui Dialog)

- **Component description:** A confirmation dialog to execute the destructive **Delete Recipe** action.
- **Main elements:** Shadcn/ui `Dialog` component with confirmation text, a 'Cancel' button, and a visually distinct 'Confirm Delete' button.
- **Handled interactions:** `onOpenChange` (to control dialog visibility), `onConfirmDelete`.
- **Handled validation:** The 'Confirm Delete' button must be disabled while the `isDeleting` prop is true.
- **Types:** None.
- **Props:**
  ```typescript
  interface DeleteRecipeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete: () => void; // Calls deleteRecipe hook function
    isDeleting: boolean;
  }
  ```

-----

## 5\. Types

### Data Transfer Object (DTO)

* **`RecipeDetailDto`** (From `types.ts`):
  ```typescript
  type RecipeDetailDto = {
    id: string; // The recipe's unique ID
    title: string;
    ingredients: string;
    instructions: string;
    original_recipe_id: string | null; // Determines AI status
    changes_summary: string | null; // Summary of changes, only for AI-modified
    // ... other fields (user_id, created_at, updated_at)
  }
  ```

### Custom ViewModel

* **`RecipeDetailsViewModel`**: A derived type used for display logic.

| Field | Type | Derivation/Purpose |
| :--- | :--- | :--- |
| `id`, `title`, `ingredients`, `instructions` | `string` | Passthrough from DTO. |
| `isAIModified` | `boolean` | `!!original_recipe_id`. Used for conditional rendering. |
| `statusLabel` | `'Original' \| 'AI-Modified'` | Computed display status. |
| `changesSummary` | `string \| null` | Passthrough of `changes_summary`. |
| `isDisclaimerNeeded` | `boolean` | Computed as `isAIModified`. Used to conditionally render the safety alert. |

-----

## 6\. State Management

State management is centralized using a custom React Hook.

* **Custom Hook: `useRecipeDetails(recipeId: string)`**
    * **Purpose:** Encapsulates data fetching, state management, DTO transformation, and API side-effects (Delete, AI Mod trigger).
    * **Internal State:** `recipe`, `isLoading`, `error`, `isDeleting`, `isAIModifying`.
    * **Mechanism:**
        1.  Initial data fetch via `GET /api/recipes/{id}` on mount and on `recipeId` change.
        2.  Transforms `RecipeDetailDto` to `RecipeDetailsViewModel`.
        3.  Exposes asynchronous functions:
            * **`deleteRecipe()`:** Executes `DELETE /api/recipes/{id}`. On **204 success**, performs a client-side redirect to the recipe list (`/recipes`).
            * **`triggerAIModification()`:** Handles the logic to start the modification process (e.g., POST to a separate AI endpoint).
    * **Returned Value:** `{ recipe, isLoading, error, deleteRecipe, triggerAIModification, isDeleting, isAIModifying }`.

-----

## 7\. API Integration

The view requires integration with two core endpoints:

### 1\. Get a Single Recipe

* **Method/Path:** `GET /api/recipes/{recipeId}`
* **Request Type:** Path parameter `recipeId` (UUID).
* **Response Type:** `RecipeDetailDto`.

### 2\. Delete a Recipe

* **Method/Path:** `DELETE /api/recipes/{recipeId}`
* **Request Type:** Path parameter `recipeId` (UUID).
* **Response Type:** **204 No Content** on success.
* **Frontend Action:** On successful deletion (HTTP 204), the client must immediately perform a hard redirect to the Recipe Library View (`/recipes`).

-----

## 8\. User Interactions

| Interaction | Location | Handler | Outcome |
| :--- | :--- | :--- | :--- |
| **Delete Button Click** | `RecipeActionsBar` | `onDeleteClick` prop | Opens the `DeleteRecipeModal`. |
| **Confirm Deletion** | `DeleteRecipeModal` | `onConfirmDelete` prop (calls `deleteRecipe` in hook) | API call `DELETE /api/recipes/{id}` executes. On 204 success, **redirects to `/recipes`**. |
| **AI Modification Click** | `RecipeActionsBar` | `onAIModClick` prop (calls `triggerAIModification` in hook) | Initiates the AI process and redirects the user to the next step/view (e.g., a "save modified recipe" page). |

-----

## 9\. Conditions and Validation

* **Access Validation (API):** The view relies on the backend to validate user ownership/authorization (401, 404 errors).
* **URL Parameter Validation (Frontend/Backend):** The `recipeId` must be a valid UUID. If invalid, the page displays a generic `400 Bad Request` error.
* **Deletion Success Condition:** Upon receiving **HTTP 204 No Content** from the DELETE endpoint, the frontend must execute the mandatory navigation away from the deleted resource to `/recipes`.
* **AI Content Visibility:** `AIHighlights` component (including the safety disclaimer) is **only visible** when `recipe.isAIModified` is `true`.

-----

## 10\. Error Handling

* **404 Not Found (GET):** Display a full-page "Recipe Not Found" error with navigation back to the library.
* **401 Unauthorized (GET/DELETE):** Perform a hard client-side redirect to the login/authentication page.
* **500 Internal Server Error (GET/DELETE):** Display a persistent error alert ("An unexpected error occurred. Please try again.") and disable all action buttons.
* **404 Not Found (DELETE):** If the user attempts to delete a resource that is already gone, catch the 404, display an informative toast notification (e.g., "This recipe was already deleted."), and immediately redirect the user to `/recipes`.
* **Action Failure (DELETE/AI Mod):** If the action API fails (not a 401/404/500), display a temporary error toast and revert the specific loading state (`isDeleting`/`isAIModifying`).

-----

## 11\. Implementation Steps

1.  **Define Types:** Create `RecipeDetailsViewModel` and ensure all DTOs are correctly imported.
2.  **Implement `useRecipeDetails` Hook:**
    * Set up state variables and URL parameter extraction/validation.
    * Implement `fetchRecipe` (`GET` call) with full error/loading state handling and DTO-to-ViewModel transformation.
    * Implement **`deleteRecipe`** (`DELETE` call): Ensure the API call handles the `isDeleting` state and, on receiving **204**, uses the routing mechanism to redirect to `/recipes`.
    * Implement `triggerAIModification` (handles POST call to start AI process).
3.  **Implement Leaf Components:**
    * **`DeleteRecipeModal`:** Implement the modal visibility and confirmation logic, connecting `onConfirmDelete` to the `deleteRecipe` hook function.
    * **`RecipeCardDisplay` and `AIHighlights`:** Implement rendering, utilizing the `isAIModified` flag for conditional and distinct visual styling.
4.  **Implement Container Components:**
    * **`RecipeActionsBar`:** Pass down state and actions (`isDeleting`, `onDeleteClick`, etc.) to control button state and triggers.
    * **`RecipeDetailsPage`:** Use the `useRecipeDetails` hook and render the components, managing the overall layout and full-page error/loading messages.
5.  **Routing:** Configure the Astro dynamic route handler to use `RecipeDetailsPage` at `/recipes/[id]`.
