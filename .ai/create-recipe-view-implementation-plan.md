# View Implementation Plan: Recipe Entry View

## 1. Overview

This plan details the implementation of the **Recipe Entry View**, which will be accessible at `/recipes/new`. This view provides authenticated users with a form to manually submit new recipes. The form consists of three required fields: **Title**, **Ingredients**, and **Instructions**. The implementation will use `react-hook-form` with `zod` for client-side validation and will integrate with the `POST /api/recipes` endpoint to create the new recipe.

## 2. View Routing

- **Path:** `/recipes/new`
- **Access:** This route must be protected. The Astro page component (`src/pages/recipes/new.astro`) must check for an authenticated user session (e.g., `Astro.locals.user`). If the user is not authenticated, they must be redirected to the login page.

## 3. Component Structure

The view will be an Astro page (`.astro`) that mounts a single, client-side rendered React component. This component will be built using `Shadcn/ui` components.

## 4. Component Details

### `src/pages/recipes/new.astro`

- **Component description:** The main Astro page that defines the route and handles authentication.
- **Main elements:** Renders the standard page `Layout`, a title (`<h1>`), and mounts the `<NewRecipeForm />` React component with a `client:load` directive.
- **Handled interactions:** Performs a server-side authentication check. If `!Astro.locals.user`, it redirects to the login page.
- **Types:** None.
- **Props:** None.

### `src/components/forms/NewRecipeForm.tsx`

- **Component description:** A client-side React component that manages all form state, validation, and API submission using `react-hook-form` and `zod`.
- **Main elements:**
  - `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` (from `Shadcn/ui`).
  - `Input` (from `Shadcn/ui`) for the `title`.
  - `Textarea` (from `Shadcn/ui`) for `ingredients` and `instructions`.
  - `Button` (from `Shadcn/ui`) for "Reset" and "Submit" actions.
  - `Alert` (from `Shadcn/ui`) to display global API errors.
- **Handled interactions:**
  - `onSubmit`: Validates form data via `zod`. On success, constructs a `CreateRecipeCommand` payload and `POST`s it to `/api/recipes`. Handles success (redirect) and error (displays errors) responses.
  - `onReset`: Clears all form fields and error messages using `form.reset()` and `setGlobalError(null)`.
- **Handled validation:** Client-side validation is defined by `CreateRecipeFormSchema` and executed by `react-hook-form`.
- **Types:** `CreateRecipeFormViewModel`, `CreateRecipeFormSchema`, `CreateRecipeCommand`, `RecipeDetailDto`.
- **Props:** None.

## 5. Types

### DTOs (Data Transfer Objects)

- **`CreateRecipeCommand`** (from `types.ts`): The request payload for the API.
  ```typescript
  // Used as the body of the POST /api/recipes request
  type CreateRecipeCommand = {
    title: string;
    ingredients: string;
    instructions: string;
    original_recipe_id?: string | null; // Will be set to null
  };
  ```
- **`RecipeDetailDto`** (from `types.ts`): The success response from the API.
  ```typescript
  // The response type on 201 Created
  type RecipeDetailDto = {
    id: string;
    // ... other recipe fields
  };
  ```

### ViewModels & Schemas

- **`CreateRecipeFormViewModel`**: The type representing the form's state.
  ```typescript
  // Inferred from the Zod schema
  type CreateRecipeFormViewModel = {
    title: string;
    ingredients: string;
    instructions: string;
  };
  ```
- **`CreateRecipeFormSchema`**: The `zod` schema for client-side validation.

  ```typescript
  import { z } from "zod";

  export const CreateRecipeFormSchema = z.object({
    title: z.string().min(1, "Title is required."),
    ingredients: z.string().min(1, "Ingredients are required."),
    instructions: z.string().min(1, "Instructions are required."),
  });
  ```

## 6. State Management

State will be managed entirely within the `<NewRecipeForm.tsx>` component.

- **Form State:** Managed by `react-hook-form` using the `useForm` hook, initialized with a `zodResolver` for validation.

  ```typescript
  const form = useForm<z.infer<typeof CreateRecipeFormSchema>>({
    resolver: zodResolver(CreateRecipeFormSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
    },
  });
  ```

  This provides `form.control`, `form.handleSubmit`, `form.formState.errors`, `form.formState.isSubmitting`, `form.setError`, and `form.reset`.

- **Global Error State:** A simple `useState` hook will manage non-field-specific errors (like 500s).
  ```typescript
  const [globalError, setGlobalError] = useState<string | null>(null);
  ```

## 7. API Integration

- **Endpoint:** `POST /api/recipes`
- **Action:** The `onSubmit` function provided to `form.handleSubmit` will execute the API call.
- **Request:**

  ```typescript
  async function onSubmit(data: CreateRecipeFormViewModel) {
    setGlobalError(null);

    const payload: CreateRecipeCommand = {
      ...data,
      original_recipe_id: null,
    };

    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // ... handle response (see Error Handling)
  }
  ```

- **Success Response (`201`):** On success, the component will receive a `RecipeDetailDto`. It will then redirect the user to the newly created recipe's detail page.
  ```typescript
  if (response.ok) {
    const newRecipe: RecipeDetailDto = await response.json();
    // Use Astro's client-side router or fallback to window.location
    window.location.href = `/recipes/${newRecipe.id}`;
  }
  ```
- **Error Responses:** See Section 10 (Error Handling).

## 8. User Interactions

- **User loads `/recipes/new`:**
  - _Authenticated:_ The page renders the empty form.
  - _Unauthenticated:_ The user is redirected to the login page.
- **User types in fields:** `react-hook-form` manages the state.
- **User clicks "Reset":** The form fields and any error messages are cleared.
- **User clicks "Submit" (with invalid data):**
  - Client-side validation fails.
  - Error messages appear below the invalid fields via the `FormMessage` component.
  - No API call is made.
- **User clicks "Submit" (with valid data):**
  - The "Submit" button becomes disabled and shows a loading state.
  - An API call is made to `POST /api/recipes`.
  - _On Success (201):_ The user is redirected to `/recipes/[new_id]`.
  - _On Error (400/500):_ The loading state stops, and an error message is displayed (either next to the field or in the global `Alert`).

## 9. Conditions and Validation

- **`title`:**
  - **Condition:** Must be a string with at least 1 character.
  - **Validation:** `z.string().min(1, "Title is required.")`
  - **Component:** `FormField` with `name="title"`.
- **`ingredients`:**
  - **Condition:** Must be a string with at least 1 character.
  - **Validation:** `z.string().min(1, "Ingredients are required.")`
  - **Component:** `FormField` with `name="ingredients"`.
- **`instructions`:**
  - **Condition:** Must be a string with at least 1 character.
  - **Validation:** `z.string().min(1, "Instructions are required.")`
  - **Component:** `FormField` with `name="instructions"`.

## 10. Error Handling

Error handling will be managed within the `onSubmit` function.

- **Network Error:** The `fetch` call will be wrapped in a `try...catch` block. The `catch` block will set the global error.
  ```typescript
  try {
    // ... fetch ...
  } catch (error) {
    setGlobalError("A network error occurred. Please check your connection.");
  }
  ```
- **Server Validation Error (`400 Bad Request`):**
  ```typescript
  if (response.status === 400) {
    const errorData = await response.json();
    if (errorData.details) {
      // Handle field-specific errors from the API
      for (const fieldName in errorData.details) {
        form.setError(fieldName as keyof CreateRecipeFormViewModel, {
          type: "server",
          message: errorData.details[fieldName][0], // Use first error message
        });
      }
    } else {
      setGlobalError(errorData.message || "An error occurred.");
    }
  }
  ```
- **Unauthorized Error (`401 Unauthorized`):**
  ```typescript
  if (response.status === 401) {
    // Redirect to login, as the session must have expired
    window.location.href = "/login";
  }
  ```
- **Internal Server Error (`500+`):**
  ```typescript
  if (response.status >= 500) {
    setGlobalError("An internal server error occurred. Please try again later.");
  }
  ```

## 11. Implementation Steps

1.  **Create Astro Page:** Create `src/pages/recipes/new.astro`. Add the authentication check at the top to redirect unauthenticated users.
2.  **Add Layout:** In `new.astro`, add the standard page `Layout`, an `<h1>Create New Recipe</h1>`, and mount `<NewRecipeForm client:load />`.
3.  **Create React Component:** Create `src/components/forms/NewRecipeForm.tsx`.it's ok
4.  **Define Schema:** Inside the component file, define the `CreateRecipeFormSchema` using `zod`.
5.  **Initialize Form:** Use the `useForm` hook from `react-hook-form` with the `zodResolver` and the schema.
6.  **Build UI:**
    - Scaffold the form using `Shadcn/ui`'s `Form` component, passing in the `form` instance.
    - Create three `FormField` components for `title`, `ingredients`, and `instructions`.
    - Use `Shadcn/ui` `Input` for `title` and `Textarea` for the other two.
    - Add `FormLabel` and `FormMessage` to each.
7.  **Add State and Buttons:**
    - Add the `useState` for `globalError` and render a `Shadcn/ui` `Alert` component when it's set.
    - Add the "Reset" and "Submit" `Button` components. Wire the submit button's `disabled` and content to `form.formState.isSubmitting`.
8.  **Implement Submit Logic:**
    - Create the `onSubmit(data: CreateRecipeFormViewModel)` function.
    - Inside `onSubmit`, implement the `fetch` call to `POST /api/recipes`.
    - Add the complete error handling logic for 400, 401, 500+, and network errors.
    - Add the success logic to redirect to `/recipes/${newRecipe.id}` on a 201 response.
9.  **Implement Reset Logic:** Add an `onClick` handler to the "Reset" button that calls `form.reset()` and `setGlobalError(null)`.
10. **Accessibility & Testing:** Manually verify all ARIA attributes are correct (most will be handled by `Shadcn/ui`), test keyboard navigation, and test all validation and error-handling paths.
