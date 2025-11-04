HealthyMeal - Auth Module Specification
This document outlines the technical architecture for the user authentication module (registration, login, password recovery) for the HealthyMeal MVP. The architecture is based on the provided technology stack (tech-stack.md) and product requirements (prd.md).

The primary stack for this module will be Supabase Auth for the backend logic and Astro (SSR) with interactive React (Shadcn/ui) components for the user interface.

1. User Interface Architecture (Frontend)
   The frontend will consist of public Astro pages for auth actions and protected Astro pages for the core application. Interactive forms will be client-side React components.

🗺️ Pages and Layouts (Astro)
We will introduce two layouts and several new pages.

src/layouts/AuthLayout.astro

A minimal layout for public authentication pages.

It will feature a simple centered card structure to host the auth forms (e.g., Login, Register).

src/layouts/AppLayout.astro

The main layout for logged-in users (protected routes).

It will receive the session object from Astro.locals (injected by the middleware).

It will contain the main navigation, user profile button (UserNav.tsx), and the <slot /> for page content.

src/pages/login.astro (Public)

Uses AuthLayout.astro.

Renders the client-side <LoginForm client:load /> React component.

src/pages/register.astro (Public)

Uses AuthLayout.astro.

Renders the client-side <RegisterForm client:load /> React component.

src/pages/password-recovery.astro (Public)

Uses AuthLayout.astro.

Renders the client-side <PasswordRecoveryForm client:load /> React component.

src/pages/update-password.astro (Public)

Uses AuthLayout.astro.

Renders the client-side <PasswordUpdateForm client:load /> component. This page is the redirect target from the password reset email.

src/pages/onboarding.astro (Protected)

Uses AppLayout.astro.

New users will be redirected here immediately after registration.

Renders the client-side <OnboardingForm client:load /> component.

Contains the form for setting initial preferences (Allergens, Diets, Nielubiane składniki) as required by prd.md.

src/pages/dashboard.astro (Protected)

(Assumption) This is the main page for logged-in users (e.g., "Moje przepisy").

Uses AppLayout.astro. Users are redirected here after login (if onboarding is complete).

src/pages/profile.astro (Protected)

Uses AppLayout.astro.

Displays current user preferences (allergens, diets, disliked_ingredients) fetched from the profiles table.

Contains a form (similar to OnboardingForm) allowing users to update their preferences.

On form submit, calls PATCH /api/profile/update.

⚛️ Components (React & Shadcn/ui)
These components manage interactive state, validation, and communication with the Supabase client SDK.

src/components/auth/LoginForm.tsx

UI: Built with Shadcn/ui Input, Button, Label.

Fields: Email, Password.

Actions:

"Zaloguj" button: Calls supabase.auth.signInWithPassword().

"Zaloguj przez Google" button: Calls supabase.auth.signInWithOAuth({ provider: 'google' }).

State: Manages isLoading and error states.

On Success: Redirects to /dashboard (window.location.href = '/dashboard').

src/components/auth/RegisterForm.tsx

UI: Built with Shadcn/ui.

Fields: Email, Password, Confirm Password.

Actions: Calls supabase.auth.signUp().

On Success: Redirects to /onboarding (window.location.href = '/onboarding'). This aligns with the prd.md requirement for an immediate onboarding step.

src/components/auth/PasswordRecoveryForm.tsx

UI: Built with Shadcn/ui.

Fields: Email.

Actions: Calls supabase.auth.resetPasswordForEmail().

State: Shows a success message ("Sprawdź e-mail...") on completion.

src/components/auth/PasswordUpdateForm.tsx

UI: Built with Shadcn/ui.

Fields: New Password, Confirm New Password.

Logic: On component mount, it will read the access_token from the URL fragment (#).

Actions: Calls supabase.auth.updateUser() with the new password.

On Success: Redirects to /login.

src/components/auth/OnboardingForm.tsx

UI: Built with Shadcn/ui (Multi-select components for arrays, Textarea for text).

Fields:

- Allergens: Multi-select checkboxes (e.g., "Orzechy", "Gluten", "Mleko", "Jaja", "Ryby", "Skorupiaki", "Soja", "Seler").
- Diets: Multi-select checkboxes (e.g., "Wegetariańska", "Wegańska", "Bezglutenowa", "Ketogeniczna", "Śródziemnomorska").
- Disliked Ingredients: Textarea field for free-form text input.

Validation: User must select at least one preference (allergen, diet, or enter disliked ingredient) to proceed (prd.md requirement: 90% activation metric).

Actions: On form submit, calls POST /api/onboarding/complete with the preferences data.

On Success: Redirects to /dashboard (window.location.href = '/dashboard').

src/components/layout/UserNav.tsx

UI: A Shadcn/ui DropdownMenu component placed in AppLayout.astro.

Display: Shows user avatar or initials.

Actions:

"Profil" (links to /profile).

"Wyloguj": Calls supabase.auth.signOut() and redirects to / (window.location.href = '/').

🚦 Validation and Scenarios
Validation: All forms will use zod for schema definition and react-hook-form for state management and validation (client-side).

Email: Required, valid format.

Password: Required, min. 8 characters.

Confirm Password: Must match Password.

Error Handling: Form components will display user-friendly error messages from Supabase (e.g., "Invalid credentials," "User already exists") or validation.

Key Scenarios:

New User (Email): /register -> RegisterForm.tsx -> signUp() -> Redirect /onboarding.

New User (Google): /login -> LoginForm.tsx -> signInWithOAuth() -> Google Popup -> Redirect to api/auth/callback -> Redirect /onboarding.

Existing User (Email): /login -> LoginForm.tsx -> signInWithPassword() -> Redirect /dashboard.

Existing User (Google): /login -> LoginForm.tsx -> signInWithOAuth() -> Google Popup -> Redirect to api/auth/callback -> Redirect /dashboard.

Complete Onboarding (Email): /register -> signUp() -> Redirect /onboarding -> OnboardingForm.tsx -> Fill preferences -> POST /api/onboarding/complete -> Redirect /dashboard.

Complete Onboarding (Google): /login -> signInWithOAuth() -> Google Popup -> Redirect /api/auth/callback -> Redirect /onboarding -> OnboardingForm.tsx -> Fill preferences -> POST /api/onboarding/complete -> Redirect /dashboard.

Access Protected Page (Logged Out): User types /dashboard -> Middleware intercepts -> Redirect /login.

Access Auth Page (Logged In): User types /login -> Middleware intercepts -> Redirect /dashboard.

2. Backend Logic (Astro SSR & Supabase)
   The backend logic is split between Astro SSR middleware, API endpoints for callbacks, and the Supabase database configuration.

⚙️ Astro Configuration (astro.config.mjs)
Mode: Must be set to Server-Side Rendering: output: 'server'.

Adapter: Must use an adapter compatible with DigitalOcean (Docker), such as @astrojs/node.

🔏 Astro Middleware (src/middleware.ts)
This file is critical for session management and route protection on the server.

Technology: Uses @supabase/auth-helpers-astro.

Logic: On every request:

Create a server-side Supabase client using createSupabaseServerClient and the request's cookies.

Fetch the current session: const { data: { session } } = await supabase.auth.getSession().

Store the session in context.locals.session = session so Astro pages can access it.

Routing Logic:

Define protectedRoutes (e.g., /dashboard, /profile, /onboarding).

Define authRoutes (e.g., /login, /register).

If pathname is in protectedRoutes and !session: return context.redirect('/login').

If pathname is in authRoutes and session: return context.redirect('/dashboard').

Else: return next().

📞 API Endpoints (Astro)
src/pages/api/auth/callback.ts (GET)

This is the OAuth Redirect URI for Google.

Logic:

Reads the code from the URL query parameters.

Creates a server-side Supabase client.

Exchanges the code for a session: await supabase.auth.exchangeCodeForSession(code). This action securely sets the auth cookies.

New vs. Existing User Check: After exchanging the code, query the profiles table for onboarding_completed.

If onboarding_completed === false (new user): return context.redirect('/onboarding').

If onboarding_completed === true (existing user): return context.redirect('/dashboard').

src/pages/api/onboarding/complete.ts (POST)

This endpoint is called when a user completes the onboarding form.

Request Body (JSON):

- allergens: string[] (array of selected allergens)
- diets: string[] (array of selected diets)
- disliked_ingredients: string (free-form text)

Validation:

- Use Zod schema to validate the request body.
- Ensure at least one field has data (allergens.length > 0 OR diets.length > 0 OR disliked_ingredients.trim() !== '') to meet the PRD 90% activation requirement.

Logic:

- Get the authenticated user from context.locals.supabase.auth.getUser().
- If no user, return 401 Unauthorized.
- Update the profiles table: UPDATE profiles SET allergens = $1, diets = $2, disliked_ingredients = $3, onboarding_completed = true WHERE id = $user_id.
- Use RLS-aware queries (the Supabase client will automatically enforce RLS policies).

Response:

- On Success: Return 200 OK with { success: true }.
- On Error: Return 400 Bad Request with validation errors or 500 Internal Server Error.

src/pages/api/profile/update.ts (PATCH)

This endpoint allows authenticated users to update their profile preferences after onboarding (e.g., from /profile page).

Request Body (JSON):

- allergens: string[] (optional)
- diets: string[] (optional)
- disliked_ingredients: string (optional)

Validation:

- Use Zod schema to validate the request body.
- All fields are optional (user can update any subset of preferences).

Logic:

- Get the authenticated user from context.locals.supabase.auth.getUser().
- If no user, return 401 Unauthorized.
- Update only the provided fields in the profiles table using a partial update.
- Use RLS-aware queries.

Response:

- On Success: Return 200 OK with updated profile data.
- On Error: Return 400 Bad Request or 500 Internal Server Error.

📋 Data Models (Supabase)
auth.users (Managed by Supabase Auth).

public.profiles (New Table)

This table will store user preferences as defined in prd.md.

Columns:

id (UUID, Primary Key, Foreign Key to auth.users.id).

allergens (TEXT[], default array[]::text[]).

diets (TEXT[], default array[]::text[]).

disliked_ingredients (TEXT, default '') (Matches PRD "pole tekstowe").

onboarding_completed (BOOLEAN, default false).

Row Level Security (RLS): RLS must be enabled.

SELECT Policy: Users can only select their own profile: auth.uid() = id.

UPDATE Policy: Users can only update their own profile: auth.uid() = id.

Database Trigger:

A trigger function must be created to populate the profiles table on new user registration.

Function: create_profile_for_new_user()

Trigger: AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.create_profile_for_new_user()

Function Body: INSERT INTO public.profiles (id) VALUES (new.id);

3. Authentication System (Supabase)
   This section details the configuration required in the Supabase Dashboard.

Client Integration:

Use @supabase/auth-helpers-astro for SSR/middleware integration.

Use @supabase/supabase-js for client-side React components (forms).

A shared client instance will be defined in src/lib/supabase.ts for browser use.

Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) must be configured locally and in the DigitalOcean production environment.

Provider Configuration:

Email/Password: Enabled.

Google: Enabled. Client ID and Secret must be generated from Google Cloud Console and added to Supabase.

Redirect URLs:

The Supabase "Redirect URLs" list must include:

http://localhost:3000/api/auth/callback (for local dev)

https://[YOUR_PROD_DOMAIN]/api/auth/callback (for production)

Email Confirmation (Key Decision):

To comply with the prd.md user story ("...szybko założyć konto... i od razu ustawić..."), the "Confirm email" feature in Supabase Auth settings must be DISABLED.

This removes the email verification step and allows users to proceed directly to onboarding after sign-up, fulfilling the "immediate" requirement.

Email Templates:

The "Reset Password" email template should be customized with Polish text.

The redirect URL for password reset emails should be set to: http://localhost:3000/update-password (for local dev) and https://[YOUR_PROD_DOMAIN]/update-password (for production).
