# View Implementation Plan: User Profile

## 1. Overview
This plan outlines the implementation of the **User Profile View**. This view allows authenticated users to view and update their profile information, primarily focusing on dietary preferences as defined in the PRD. It will fetch the user's current profile, display it in a form, and allow them to save changes.

This view is critical for the application's core logic, as these preferences are used by the AI to modify recipes. It also serves as the key step in the user onboarding flow.

## 2. View Routing
* **Path:** `/profile`
* **Implementation:** This will be an Astro page (`src/pages/profile.astro`).
* **Security:** This page must be accessible only to authenticated users. The Astro page should check for a valid session. If the user is not authenticated, they should be redirected to the login page.
* **Rendering:** The page will use a React component island (`<ProfileView client:load />`) to handle all dynamic functionality.

## 3. Component Structure
The view will be composed of a main React island and several reusable sub-components built with Shadcn/ui.

## 4. Component Details

### `ProfileView` (React Island)
* **Component description:** The main container component for the profile page. It is responsible for fetching data, managing the overall view state (loading, error, success), and passing data to the `ProfileForm`.
* **Main elements:** Renders a title. Conditionally renders a loading spinner, an error message, or the `ProfileForm` component. It will also display a global success/error notification (e.g., using `Toast`) upon save.
* **Handled interactions:** None directly. It orchestrates the API calls triggered by child components.
* **Handled validation:** None.
* **Types:** `ProfileDto`
* **Props:** None.

### `ProfileForm`
* **Component description:** A client-side component that renders all form fields using Shadcn/ui components. It manages the form's local state.
* **Main elements:** A `<form>` element containing `Label`, `Input`, `MultiSelectCombobox`, and `TagInput` components. A `Button` of `type="submit"` triggers the save operation.
* **Handled interactions:**
    * `onChange`: Updates the local `formData` state for each input.
    * `onSubmit`: Prevents default form submission and calls the `onSave` prop with the current `formData`.
* **Handled validation:**
    * `avatar_url`: Can perform light client-side validation to check for a basic URL structure (e.g., `https://...`).
    * `Save Button`: Should be disabled if the form is not "dirty" (i.e., no changes have been made) or if it's currently saving.
* **Types:** `ProfileFormViewModel`, `UpdateProfileCommand`
* **Props:**
    * `initialData: ProfileFormViewModel`: The user's current profile data to populate the form.
    * `onSave: (data: UpdateProfileCommand) => void`: Callback function to execute when the form is submitted.
    * `isSaving: boolean`: Prop to disable the form and show a loading state on the save button.

### `MultiSelectCombobox` (Reusable)
* **Component description:** A custom component built from Shadcn's `Popover`, `Command`, and `Checkbox` components to allow selecting multiple items from a list.
* **Main elements:** A `Button` to open the `Popover`. The `Popover` contains a `Command` component with a list of options, each with a `Checkbox`.
* **Handled interactions:**
    * `onClick`: Toggles the selection for an item.
    * `onSearch`: Filters the list of options.
* **Handled validation:** None.
* **Types:** `SelectOption`
* **Props:**
    * `options: SelectOption[]`: The list of available options (e.g., `ALLERGY_OPTIONS`).
    * `value: string[]`: The currently selected values.
    * `onChange: (newValue: string[]) => void`: Callback when the selection changes.
    * `placeholder: string`: Text to display when no items are selected.

### `TagInput` (Reusable)
* **Component description:** A custom component for inputting a list of strings, displayed as "tags" or "chips". Built with Shadcn's `Input` and `Badge`.
* **Main elements:** An `Input` field to type new tags. A container that maps the `value` array to `Badge` components, each with a "remove" (x) button.
* **Handled interactions:**
    * `onKeyDown` (in `Input`): On `Enter` or `Comma`, adds the current input value as a new tag (if not empty or duplicate) and clears the input.
    * `onClick` (on `Badge` 'x'): Removes the corresponding tag from the `value` array.
* **Handled validation:**
    * Prevents adding empty or duplicate tags.
* **Types:** `string[]`
* **Props:**
    * `value: string[]`: The current list of tags.
    * `onChange: (newValue: string[]) => void`: Callback when the list of tags changes.
    * `placeholder: string`: Placeholder for the input field.

## 5. Types
This view will use existing DTOs and require new ViewModels.

* **`ProfileDto`** (from `types.ts`):
    * **Use:** The response type from `GET /api/me/profile`.
    * **Shape:** `{ id, full_name, avatar_url, allergies, diets, disliked_ingredients, has_completed_onboarding, ... }`

* **`UpdateProfileCommand`** (from `types.ts`):
    * **Use:** The request payload for `PATCH /api/me/profile`.
    * **Shape:** `{ full_name?, avatar_url?, allergies?, diets?, disliked_ingredients? }`

* **`ProfileFormViewModel`** (New ViewModel):
    * **Use:** Represents the local state of the `ProfileForm`. It's initialized from `ProfileDto`.
    * **Shape:**
        ```typescript
        type ProfileFormViewModel = {
          full_name: string;
          avatar_url: string;
          allergies: string[];
          diets: string[];
          disliked_ingredients: string[];
        };
        ```

* **`SelectOption`** (New Utility Type):
    * **Use:** Defines the shape for options in `MultiSelectCombobox`.
    * **Shape:**
        ```typescript
        type SelectOption = {
          label: string;
          value: string;
        };
        ```

* **Constants** (New):
    * **Use:** Placeholder data for preference options until they are fetched from an API or finalized.
    * **Example:**
        ```typescript
        const ALLERGY_OPTIONS: SelectOption[] = [
          { label: "Peanuts", value: "peanuts" },
          { label: "Gluten", value: "gluten" },
          { label: "Dairy", value: "dairy" },
          // ... more options
        ];

        const DIET_OPTIONS: SelectOption[] = [
          { label: "Vegetarian", value: "vegetarian" },
          { label: "Vegan", value: "vegan" },
          { label: "Keto", value: "keto" },
          // ... more options
        ];
        ```

## 6. State Management
All state for this view will be encapsulated in a custom React hook: **`useProfile`**.

* **`useProfile()` Hook:**
    * **Purpose:** To fetch the profile, provide updating capabilities, and manage all related remote state (`loading`, `error`, `success`).
    * **Internal State:**
        * `profile: ProfileDto | null`: Stores the data from the `GET` request.
        * `isLoading: boolean`: True when `GET` (on load) or `PATCH` (on save) is in progress.
        * `error: string | null`: Stores any error messages from API calls.
        * `isSuccess: boolean`: Set to `true` briefly after a successful `PATCH` to trigger feedback (e.g., a toast).
    * **Exposed Values/Functions:**
        * `profile: ProfileDto | null`
        * `isLoading: boolean`
        * `error: string | null`
        * `isSuccess: boolean`
        * `updateProfile: (data: UpdateProfileCommand) => Promise<void>`: A function that wraps the `PATCH` API call, handles setting `isLoading` and `error`/`success` states, and updates the local `profile` state with the new data from the response.

The `ProfileView` component will call this hook. The `ProfileForm` will manage its own form data locally in `useState` (initialized from the `profile` prop) and only call `updateProfile` on submit.

## 7. API Integration
The `useProfile` hook will manage all API calls.

1.  **Fetch Profile (GET):**
    * **Endpoint:** `GET /api/me/profile`
    * **Trigger:** On `ProfileView` component mount (e.g., in a `useEffect` with an empty dependency array).
    * **Request:** No payload.
    * **Response (Success):** `200 OK` with `ProfileDto` payload.
    * **Response (Error):** `401` (handled by redirect), `404` (show error), `500` (show error).
    * **State:** `isLoading` is set to `true` during the fetch. `profile` is set on success; `error` is set on failure.

2.  **Update Profile (PATCH):**
    * **Endpoint:** `PATCH /api/me/profile`
    * **Trigger:** When the user submits the `ProfileForm`.
    * **Request:** Payload will be of type `UpdateProfileCommand`, containing only the fields managed by the form.
        ```json
        {
          "full_name": "Johnathan Doe",
          "avatar_url": "[https://example.com/new.png](https://example.com/new.png)",
          "allergies": ["peanuts", "dairy"],
          "diets": ["vegetarian"],
          "disliked_ingredients": ["olives"]
        }
        ```
    * **Response (Success):** `200 OK` with the updated `ProfileDto` payload.
    * **Response (Error):** `400` (show validation error), `401` (handled by redirect), `500` (show error).
    * **State:** `isLoading` is set to `true` during the save. On success, `isSuccess` is pulsed, and the local `profile` state is updated with the response. On failure, `error` is set.

## 8. User Interactions
* **User Lands on `/profile`:**
    * **Action:** `ProfileView` mounts.
    * **System Response:** `useProfile` hook is called. `GET /api/me/profile` is triggered. `isLoading` is true; a spinner is shown.
    * **On Success:** `isLoading` is false. `profile` state is set. `ProfileForm` is rendered, populated with `profile` data.
    * **On Failure:** `isLoading` is false. `error` state is set. An error message is shown.

* **User (New) Lands on `/profile`:**
    * **Action:** Same as above, but the fetched `profile.has_completed_onboarding` is `false`.
    * **System Response:** In addition to rendering the form, an `<Alert>` component is shown at the top: "Welcome! Please complete your profile to get started."

* **User Edits a Field:**
    * **Action:** User types in "Full Name", selects an "Allergy", or adds a "Disliked Ingredient".
    * **System Response:** The `ProfileForm` component's local `formData` state is updated. The "Save Changes" button becomes enabled (if it was disabled).

* **User Clicks "Save Changes":**
    * **Action:** `ProfileForm` `onSubmit` event fires.
    * **System Response:** `updateProfile(formData)` is called. `isLoading` becomes true. The "Save Changes" button shows a spinner and is disabled.
    * **On Success:** `isLoading` is false. `isSuccess` is pulsed `true`. A success toast ("Profile updated!") is shown. The form's "dirty" state is reset. The local `profile` state is updated with the new data.
    * **On Failure:** `isLoading` is false. `error` is set. An error toast/alert ("Failed to update profile.") is shown. The form remains as-is, allowing the user to retry.

## 9. Conditions and Validation
* **Authentication:** The `/profile.astro` page must verify the user is logged in. If not, redirect to `/login`.
* **Data Loading:** `ProfileForm` must only be rendered *after* the `GET /api/me/profile` call has successfully completed and `profile` is not null.
* **Onboarding:** If `profile.has_completed_onboarding` is `false`, an informational `Alert` will be displayed.
* **Form Dirty State:** The `ProfileForm` should track if its local `formData` is different from the `initialData` prop. The "Save Changes" button should be disabled if the form is not dirty.
* **Saving State:** The "Save Changes" button must be disabled while `isSaving` (i.e., `isLoading` from the hook) is true.
* **Tag Input Validation:** The `TagInput` component must prevent adding empty strings or duplicate strings to the array.
* **URL Validation:** The `avatar_url` `Input` can have a `type="url"` and a simple `pattern` attribute for basic client-side validation.

## 10. Error Handling
* **`GET /api/me/profile` Fails (404, 500):**
    * The `useProfile` hook will set the `error` state (e.g., "Could not load your profile.").
    * `ProfileView` will render a full-page error `Alert` component with the error message and a "Retry" button (which would re-trigger the fetch).
* **`PATCH /api/me/profile` Fails (400, 500):**
    * The `useProfile` hook will set the `error` state (e.g., "Failed to save changes.").
    * `ProfileView` will show this error in a `Toast` or an `Alert` component near the form.
    * The form will **not** be reset, allowing the user to see their changes and retry.
* **`PATCH /api/me/profile` Fails (400 with field errors):**
    * As per `profile.ts`, the API returns field-level errors.
    * **Simple Handling:** For this plan, we will just show a generic "Invalid data" error message.
    * **Advanced (Optional):** The `updateProfile` function could be written to parse the `details` object from the error response and pass it down to `ProfileForm` to show inline error messages per field.

## 11. Implementation Steps
1.  **Astro Page:** Create `src/pages/profile.astro`. Add auth-checking logic to redirect unauthenticated users.
2.  **`useProfile` Hook:** Create `src/hooks/useProfile.ts`. Implement the `GET` and `PATCH` logic, managing `profile`, `isLoading`, `error`, and `isSuccess` states.
3.  **Utility Components:**
    * Create `src/components/ui/MultiSelectCombobox.tsx`. Build it using Shadcn's `Popover`, `Command`, `Checkbox`, and `Button`.
    * Create `src/components/ui/TagInput.tsx`. Build it using Shadcn's `Input`, `Badge`, and `Button` (for the 'x').
4.  **Define Constants/Types:** Create `src/lib/constants.ts` to hold `ALLERGY_OPTIONS` and `DIET_OPTIONS`. Define the `ProfileFormViewModel` and `SelectOption` types in `src/types/viewModels.ts` (or similar).
5.  **`ProfileForm` Component:** Create `src/components/profile/ProfileForm.tsx`.
    * Build the form layout with Shadcn `Label`, `Input`, `Button`.
    * Integrate the `MultiSelectCombobox` and `TagInput` components.
    * Manage local `formData` state.
    * Implement "dirty" state checking.
    * Pass `isSaving` prop to the `Button`.
6.  **`ProfileView` Component:** Create `src/components/profile/ProfileView.tsx`.
    * Use the `useProfile` hook.
    * Implement the conditional rendering logic: `Spinner` (while `isLoading`), `Alert` (if `error`), or `ProfileForm` (on success).
    * Add the "Welcome" `Alert` based on `profile.has_completed_onboarding`.
    * Pass `profile` data to `ProfileForm` as `initialData`.
    * Pass `updateProfile` function to `ProfileForm` as `onSave`.
    * (Optional) Add a `Toast` provider to show success/error messages on save.
7.  **Integration:** Import and render `<ProfileView client:load />` within `src/pages/profile.astro`.
8.  **Testing:** Manually test all user interactions, loading states, error states, and form validation.
