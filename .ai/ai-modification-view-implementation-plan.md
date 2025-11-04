````markdown
# View Implementation Plan AI Modification Flow View

## 1. Overview
The **AI Modification Flow View** (`/recipes/{id}/modify`) is a critical step in the AI-powered editing process. Its purpose is to present the user with the proposed AI-generated changes to an existing recipe (based on their profile preferences). The view features a side-by-side comparison (diff view), a structured summary of changes, and a mandatory safety disclaimer. It enables the user to confirm the changes by saving a new, AI-modified version of the recipe, or discard the proposed modification.

## 2. View Routing
The view should be accessible via a dynamic path segment for the original recipe's ID, followed by a fixed path segment:
* **Path:** `/recipes/{id}/modify`
* **Astro Component:** Mapped to handle requests for this dynamic route, extracting the `id` parameter.

---

## 3. Component Structure
The view uses a container component driven by a custom hook to manage the multi-step state (AI generation, review, saving).

```mermaid
graph TD
    A[AIModificationPage /recipes/{id}/modify (Astro/React Container)] --> B(useAIModificationFlow Hook)
    A --> F(Page Loading/Error/503 State)
    A -- Data: ViewModel --> C(AIReviewDiff)
    A -- Data: ViewModel --> D(ChangeSummaryList)
    A -- Data: ViewModel --> E(AIDisclaimerAlert)
    A -- Data: Actions --> G(ActionButtonsBar)
    A --> H(SaveConfirmationModal)
    G -- onSaveClick --> H
    H -- onConfirmSave --> B
````

-----

## 4\. Component Details

### AIModificationPage (Astro/React Container)

- **Component description:** The main container that handles data flow and application logic. It uses `useAIModificationFlow` to manage the process from initial AI generation (`POST /modify`) to final save (`POST /recipes`). It renders loading skeletons or error messages based on the hook's state.
- **Main elements:** Layout wrapper, conditional rendering for `isLoading`, `isError`, and the main content section.
- **Handled interactions:** Triggers the initial `fetchAndModify()` on mount. Receives and passes down callbacks for `triggerSave` and `discardChanges`.
- **Handled validation:** **URL Parameter Validation:** Ensures the `id` from the path is a valid UUID (`RecipeIdSchema`).
- **Types:** `RecipeDetailDto`, `ModifiedRecipeDto`, `AIModificationViewModel`.
- **Props:** None.

-----

### AIReviewDiff (React Component)

- **Component description:** Presents the **Original Recipe** and the **Modified Recipe** side-by-side. It must visually highlight the differences in `title`, `ingredients`, and `instructions` fields to meet the UX/Accessibility requirement for strong separation.
- **Main elements:** A two-column layout (`Original` vs. `Modified`). Utilizes a third-party diffing utility (e.g., a custom wrapper around `jsdiff`) to render inline changes with color-coded highlighting (e.g., green for additions, red for removals).
- **Handled events:** None (Display only).
- **Handled validation:** None (Renders the data provided by the ViewModel).
- **Types:** `AIModificationViewModel`.
- **Props:**
  ```typescript
  interface AIReviewDiffProps {
    viewModel: AIModificationViewModel;
  }
  ```

-----

### ChangeSummaryList (React Component)

- **Component description:** Renders the structured list of changes provided by the AI (e.g., "Substitution: Meatballs -\> Plant-based Meatballs") in an accessible, digestible list format.
- **Main elements:** Shadcn/ui `List` or `Accordion` component to display the `changes_summary` array.
- **Handled events:** None.
- **Handled validation:** Renders only if `viewModel.changesSummary` is a non-empty array.
- **Types:** `AIModificationViewModel`, `AIChangeSummary`.
- **Props:**
  ```typescript
  interface ChangeSummaryListProps {
    changes: AIChangeSummary[];
  }
  ```

-----

### AIDisclaimerAlert (React Component, using Shadcn/ui)

- **Component description:** Displays the mandatory, visually prominent disclaimer regarding AI-generated content (especially concerning allergies and verification).
- **Main elements:** Shadcn/ui `Alert` component with a distinct danger or warning visual style (e.g., colored border/background, bold text).
- **Handled events:** None.
- **Handled validation:** Always visible within this view per security/PRD requirement.
- **Types:** None.
- **Props:** None.

-----

### ActionButtonsBar (React Component, using Shadcn/ui)

- **Component description:** Groups the primary actions: **Save Modified** and **Discard Changes**.
- **Main elements:** Shadcn/ui `Button` components. The Save button should be primary/prominent.
- **Handled interactions:** `onClick` events for action buttons.
    * **Save Modified:** Calls `onSaveClick` to open the modal.
    * **Discard Changes:** Calls `onDiscardClick` to navigate away.
- **Handled validation:** Both buttons must be disabled if `isSaving` or the initial AI generation (`isLoading`) is still true.
- **Types:** None.
- **Props:**
  ```typescript
  interface ActionButtonsBarProps {
    isSaving: boolean;
    isLoading: boolean;
    onSaveClick: () => void; // Open Modal
    onDiscardClick: () => void; // Discard action
  }
  ```

-----

## 5\. Types

### Data Transfer Objects (DTOs)

The view relies on existing DTOs, specifically for the AI response and the subsequent save command.

| DTO/Command | Source | Purpose |
| :--- | :--- | :--- |
| **`RecipeDetailDto`** | `types.ts` | The structure of the original recipe (if needed to be fetched). |
| **`ModifiedRecipeDto`** | `types.ts` | Response from `POST /modify`. Unsaved recipe, with `id: null` and array of `changes_summary`. |
| **`CreateRecipeCommand`** | `types.ts` | Payload for the final save: `title`, `ingredients`, `instructions`, `original_recipe_id` (mandatory UUID). |

### Custom Types

The following custom types are needed for display logic:

1.  **`AIChangeSummary`**: Represents a single, structured change generated by the AI.

    ```typescript
    export interface AIChangeSummary {
      type: string; // e.g., 'substitution', 'addition'
      from: string; // The original text/ingredient
      to: string;   // The modified text/ingredient
    }
    ```

2.  **`AIModificationViewModel`**: Combines all required data for the review components.

    ```typescript
    export interface AIModificationViewModel {
      originalRecipe: RecipeDetailDto;
      modifiedRecipe: ModifiedRecipeDto;
      originalRecipeId: string;
      changesSummary: AIChangeSummary[]; // Parsed from modifiedRecipe
      isReadyToSave: boolean; // Computed: true if modifiedRecipe is loaded and valid
      savePayload: CreateRecipeCommand; // Ready-to-send payload for POST /api/recipes
    }
    ```

-----

## 6\. State Management

The complex, multi-step process requires a centralized custom hook for robust state management.

* **Custom Hook: `useAIModificationFlow(recipeId: string)`**
    * **Purpose:** Manages the entire sequence: initial AI call, state persistence, view model generation, and save logic.
    * **Internal State:** `isLoading` (initial AI generation), `error`, `originalRecipe`, `modifiedRecipe`, `isSaving` (final save attempt), `showSaveConfirmation`.
    * **Key Functions:**
        1.  **`fetchAndModify()`:**
            * Sets `isLoading = true`.
            * Performs `POST /api/recipes/{recipeId}/modify`.
            * On success (HTTP 200), stores the response as `modifiedRecipe` and sets `isLoading = false`.
        2.  **`saveModifiedRecipe()`:**
            * Sets `isSaving = true`.
            * Constructs the `CreateRecipeCommand` from `modifiedRecipe` (ensuring `original_recipe_id` is correctly mapped).
            * Performs `POST /api/recipes`.
            * On success (HTTP 201, receiving `RecipeDetailDto`), redirects to the new recipe's detail view: `/recipes/{newId}`.
        3.  **`discardChanges()`:** Navigates the user back to `/recipes/{recipeId}`.

-----

## 7\. API Integration

The flow requires integration with two distinct API endpoints.

### 1\. Modify a Recipe with AI (AI Generation)

* **Method/Path:** `POST /api/recipes/{recipeId}/modify`
* **Request Type:** None (Path parameter `recipeId` used).
* **Response Type:** `ModifiedRecipeDto` (unsaved).

### 2\. Create a Recipe (Final Save)

* **Method/Path:** `POST /api/recipes`
* **Request Type:** `CreateRecipeCommand` (Derived from `ModifiedRecipeDto`).
* **Response Type:** `RecipeDetailDto` (saved, includes the new UUID).

-----

## 8\. User Interactions

| Interaction | Trigger | Handler in Hook | Success Outcome |
| :--- | :--- | :--- | :--- |
| **Initial Page Load** | Astro component mount | `fetchAndModify()` | Display `AIReviewDiff` with modified content. |
| **Click 'Save Modified'** | `ActionButtonsBar` | `triggerSave()` | Open `SaveConfirmationModal`. |
| **Click 'Confirm Save'** | `SaveConfirmationModal` | `saveModifiedRecipe()` | Save new recipe, redirect to the new recipe's detail view. |
| **Click 'Discard Changes'** | `ActionButtonsBar` | `discardChanges()` | Redirect to the original recipe's detail view. |

-----

## 9\. Conditions and Validation

The interface must enforce the following conditions and validations:

| Condition | Component/Hook | Frontend Effect |
| :--- | :--- | :--- |
| **Valid `recipeId`** | `AIModificationPage` (URL validation) | Fail fast with a 400 error page if UUID format is invalid. |
| **AI Data Loaded** | `AIModificationPage` / `useAIModificationFlow` | Must display a full-page loading skeleton until `modifiedRecipe` is populated. |
| **Action Disabled** | `ActionButtonsBar` | **Save** and **Discard** buttons must be disabled while `isLoading` (initial generation) or `isSaving` (final save) is true. |
| **Disclaimer Prominence** | `AIDisclaimerAlert` | The alert component must use prominent, high-contrast styling (e.g., using Tailwind/Shadcn danger/warning classes) to meet the PRD's safety requirement. |

-----

## 10\. Error Handling

Comprehensive error handling is required, especially for the multi-step, AI-dependent process.

* **AI Service Unavailable (503):** If the `POST /modify` call returns 503, the view must display a prominent, actionable error message: "AI Service is temporarily unavailable." Action buttons should be disabled, and a visible "Retry" button linked to `fetchAndModify()` should be provided.
* **Original Recipe Not Found (404):** If the initial fetch (or the AI call) returns 404, the view must redirect the user to a dedicated 404 page, indicating the resource does not exist or access is denied.
* **Unauthorized (401):** Handle via a global API interceptor or directly in the hook, forcing a redirect to the application login page.
* **Save Failure (500):** If `POST /api/recipes` fails, display a non-blocking error notification (e.g., a toast) stating "Failed to save the modified recipe. Please retry." and reset the `isSaving` state to allow the user to try again.
* **Long Latency:** Display a full-screen loading overlay with an appropriate message during the `isLoading` phase, as AI generation can take several seconds.

-----

## 11\. Implementation Steps

1.  **Define Types:** Create `AIChangeSummary` and `AIModificationViewModel` based on the DTOs.
2.  **Implement `useAIModificationFlow` Hook:**
    * Set up initial state and URL param handling.
    * Implement `fetchAndModify()` to handle the `POST /modify` call, DTO transformation, and the specific 404/503 error handling.
    * Implement `saveModifiedRecipe()` to construct the `CreateRecipeCommand` payload and execute the final `POST /api/recipes`, managing `isSaving` state and redirection on success.
    * Implement `discardChanges()` to handle navigation.
3.  **Implement Display Components:**
    * **`AIDisclaimerAlert`:** Use Shadcn/ui `Alert` for visual prominence.
    * **`ChangeSummaryList`:** Map the `AIChangeSummary[]` to a clean list.
4.  **Implement `AIReviewDiff` Component:**
    * Set up the side-by-side layout.
    * Integrate a text diffing library or custom logic to visually highlight the changes in recipe fields (ingredients and instructions).
5.  **Implement Action Components:**
    * **`ActionButtonsBar`:** Link buttons to the hook's actions, respecting `isLoading` and `isSaving` states for disabling.
    * **`SaveConfirmationModal`:** Implement the modal and link the confirmation button to `saveModifiedRecipe()`.
6.  **Create `AIModificationPage`:** Use the `useAIModificationFlow` hook and conditionally render the components based on the state (`isLoading`, `error`, `viewModel`).

<!-- end list -->

```
```
