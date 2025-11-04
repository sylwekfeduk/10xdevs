# UI Architecture for HealthyMeal MVP

## 1. UI Structure Overview

HealthyMeal is built around a set of core user journeys: onboarding and preference setting; manual recipe entry; browsing, saving, and managing recipes (both original and AI-modified); and secure authentication. The UI leverages Astro for performance, React for interactive flows, and employs TypeScript, Tailwind, and ShadcnUI for styling and accessibility. Authentication and data management are provided through Supabase, with AI-powered recipe modification via Openrouter.ai. Accessibility and security are first-class considerations, with clear disclaimers and error handling throughout.

## 2. View List

### Onboarding View

- **Path:** `/onboarding`
- **Purpose:** Guide new users to provide at least one dietary preference before accessing other features.
- **Key Info:** Progress indicator, allergens (select), diets (select), disliked ingredients (text), completion requirement.
- **Components:** Multi-step form, selectable chips/buttons, validation, feedback/alerts.
- **UX/Accessibility/Security:** Enforces input of at least one preference; ARIA for form fields; progress visible; cannot skip; input validated for type/length.

### Authentication View

- **Path:** `/auth`
- **Purpose:** Allow sign in/up via email+password or Google OAuth.
- **Key Info:** Email, password, OAuth option, session status.
- **Components:** Login/register forms, Google OAuth button, password reset link, error messages.
- **UX/Accessibility/Security:** All forms keyboard accessible; secure password input; error feedback; JWT management; prevents unauth access; rate limit/error display.

### User Profile View

- **Path:** `/profile`
- **Purpose:** View and edit dietary preferences.
- **Key Info:** Allergens (select), diets (select), disliked ingredients (text), avatar (optional), onboarding completion.
- **Components:** Editable chips/selects, text input, save button, success/error feedback.
- **UX/Accessibility/Security:** Clear field labels; edit controls constrained to allowed values; feedback on success/failure.

### Recipe Entry View

- **Path:** `/recipes/new`
- **Purpose:** Submit recipes via manual form.
- **Key Info:** Recipe title, ingredients, instructions (all required).
- **Components:** Form fields, required field indicators, submit/reset, validation feedback.
- **UX/Accessibility/Security:** Robust validation; all controls keyboard and screen-reader accessible; feedback for missing/invalid data.

### Recipe Library View

- **Path:** `/recipes`
- **Purpose:** Browse all user recipes, originals and AI-modified.
- **Key Info:** Recipe cards (title, status, date), filter/sort, AI-modified flag.
- **Components:** List/grid of cards, filter bar, search, pagination controls.
- **UX/Accessibility/Security:** Distinct visual states for originals/AI; filterable; all cards labeled for context; supports keyboard navigation.

### Recipe Details View

- **Path:** `/recipes/{id}`
- **Purpose:** Inspect recipe (original or AI-modified), trigger AI modification if eligible.
- **Key Info:** Full recipe, source (original/AI), changessummary, disclaimer, allergens/diets.
- **Components:** Info display blocks, AI modification button, change highlights, disclaimer modal/alert, save/delete actions.
- **UX/Accessibility/Security:** Change summary and disclaimer highlighted; explicit action required to trigger/save AI mods; robust error handling and feedback.

### AI Modification Flow View

- **Path:** `/recipes/{id}/modify`
- **Purpose:** Show suggested AI changes, allow review and saving.
- **Key Info:** Proposed changes, changessummary, original vs. modified preview, disclaimer.
- **Components:** Change summary list, diff/highlight view, disclaimer, save/discard buttons.
- **UX/Accessibility/Security:** Strong separation between original and modified; disclaimer visually prominent; cannot overwrite original; all actions confirmed.

### Error/Status Views

- **Paths:** `/error`, `/status`
- **Purpose:** Show system errors (404, 401, validation errors, AI unavailable).
- **Key Info:** Error type, action, helpful message.
- **Components:** Message display, link or button to Home or retry.
- **UX/Accessibility/Security:** Friendly, clear messaging; no dead ends; always provide actionable next steps.

### Settings/Account Management View

- **Path:** `/settings`
- **Purpose:** Manage account details, sign out, OAuth links.
- **Key Info:** Auth controls, user info, logout.
- **Components:** Profile matters, sign out button.
- **UX/Accessibility/Security:** Secure session control, feedback on auth status, supports logout everywhere.

## 3. User Journey Map

**Main journey:**

1. User visits app → Auth view (register/login with email/password or Google)
2. On successful login, navigates to Onboarding (if first time) → sets at least one dietary preference (allergens/diets/disliked)
3. Arrives at Recipe Library → sees empty or existing recipes
4. Goes to Recipe Entry → submits recipe (manual form)
5. Returns to Recipe Library → picks a recipe → views Recipe Details
6. Triggers AI modification via button → enters AI Modification Flow
7. Reviews proposed changes and disclaimer → optionally saves modified copy (now visible in Recipe Library)
8. Can always revisit/edit profile, manage preferences or recipes, or logout.

**Alternative journeys:**

- Save/delete any recipe from library/details
- Edit profile/dietary preferences at any time
- Encounter error/status page if something goes wrong
- Logout via Settings

## 4. Layout and Navigation Structure

- **Main navigation:** Header or sidebar with links to Home (Recipe Library), Add Recipe, Profile, Settings, Logout
- **Context bars/menus:** In Library, filter/sort; in Details, trigger AI mod/save/delete; in Onboarding/Profile, progress and save.
- **Mobile responsive:** Collapsible menus, stacked content, accessible controls for all main actions.
- **Breadcrumbs:** Show current view context in path-based screens (e.g., Library > Recipe Details > AI Modification).

## 5. Key Components

- **Auth Widgets:** Email/password form, Google OAuth, error handling
- **Preference Selector:** Allergen/diet chips, disliked-ingredient text, validation logic
- **Recipe Form:** Title, ingredients, instructions, input validation and feedback
- **Recipe Card:** Displays summary, AI/Original flag, quick delete, click to details
- **Recipe Detail Block:** Full recipe info, change summary (if AI), disclaimer callout, modify/save/delete controls
- **AI Modification Summary:** List of changes, diff/highlight, accept or reject
- **Disclaimer Modal:** Visually prominent, reaffirm allergy responsibility
- **Error Message Block:** Info, context, actionable next step
