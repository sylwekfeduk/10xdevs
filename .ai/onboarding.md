# Project Onboarding: Astro Recipe Manager

## Welcome

Welcome to the Astro Recipe Manager project! This is a full-stack recipe management app built with Astro, React, and Tailwind.

## Project Overview & Structure

The core functionality revolves around providing users with the ability to manage and store recipes. The project is structured as a single application, using **Astro** for static pages and layouts (like `src/pages`, `src/layouts`) and **React** for interactive UI components (like those in `src/components`).

## Core Modules

### `e2e` (End-to-End Testing)

- **Role:** This directory contains all Playwright end-to-end tests, which are a major focus of recent development.
- **Key Files/Areas:**
    - **Fixtures:** `e2e/fixtures/base.ts` (This is the most-changed file in the project, indicating it's a critical base for the test suite).
    - **Page Objects:** `e2e/pages` (This directory is also highly active, defining helpers for interacting with app pages).
    - **Tests:** `e2e/recipe-crud.spec.ts` (A key test file for the core "recipe" functionality).
- **Top Contributed Files:** `e2e/fixtures/base.ts`, `e2e/recipe-crud.spec.ts`
- **Recent Focus:** There is a significant, ongoing effort to build and stabilize the E2E test suite, particularly around core recipe CRUD operations and test setup.

### `src/components/auth` (Authentication)

- **Role:** This module contains all React components related to user authentication.
- **Key Files/Areas:**
    - **Forms:** `src/components/auth/LoginForm.tsx`, `src/components/auth/PasswordRecoveryForm.tsx`, `src/components/auth/PasswordUpdateForm.tsx`.
- **Top Contributed Files:** All the files listed above are among the most frequently changed, indicating this module is a key area of development.
- **Recent Focus:** Actively building and refining the user authentication flow, including login, password recovery, and password updates.

### `src/components/ui` (UI Components)

- **Role:** Holds shared, reusable React UI components (e.g., buttons, inputs, modals) used across the application.
- **Key Files/Areas:** (No specific files in top list, but the directory is highly active).
- **Recent Focus:** General development and refinement of the core design system and shared components.

### `src/pages` & `src/layouts`

- **Role:** These directories contain the top-level Astro pages and the layouts that wrap them.
- **Key Files/Areas:**
    - **Pages:** `src/pages/dashboard.astro`
    - **Layouts:** `src/layouts/AppLayout.astro`
- **Top Contributed Files:** `src/pages/dashboard.astro`, `src/layouts/AppLayout.astro`
- **Recent Focus:** Development of the main user dashboard and the primary application layout/shell.

---

## Key Contributors

- **sfeduk:** As the top contributor, their work spans all recently active areas, including the E2E test suite, authentication components, and core page development. They are the best point of contact for these features.

---

## Overall Takeaways & Recent Focus

1.  **E2E Testing is a Major Priority:** The `e2e` directory and its `base.ts` fixture are the most active areas in the repository. This suggests a strong push for test coverage and stability.
2.  **Authentication is in Active Development:** The `src/components/auth` module and its specific forms are all top-edited files. This entire flow is a key area of recent work.
3.  **Core "Recipe" Feature Focus:** The activity in `e2e/recipe-crud.spec.ts` strongly implies that the core business logic (creating, reading, updating, deleting recipes) is a central part of this development cycle.
4.  **AI-Assisted Development:** The high change counts in `.ai` and `.cursor/rules` suggest the team (or at least the top contributor) is actively using AI-powered development tools like Cursor to write code.
5.  **Dashboard & UI Refinement:** Work on `src/pages/dashboard.astro` and `src/components/ui` indicates the main user-facing dashboard is also getting new features or refinements.

---

## Potential Complexity/Areas to Note

- **`e2e/fixtures/base.ts`:** As the most-changed file, this test fixture is critical. It likely contains complex setup logic, authentication handling for tests, or shared utilities. Changes here are high-impact and should be made with care.
- **Authentication (`src/components/auth`):** Auth logic is inherently sensitive. Given the high activity, be sure to understand the security, state management, and API contracts for this module.
- **Astro/React Interop:** The project uses both Astro (`.astro`) for pages and React (`.tsx`) for interactive components. Understanding how they pass props and manage state (i.e., "Astro Islands") will be key.

---

## Questions for the Team

1.  What is the overall architecture for the auth flow? How is state managed between the React components and the rest of the Astro application?
2.  The `e2e/fixtures/base.ts` file is very active. What is its primary role, and what is the process for modifying it without breaking the test suite?
3.  What is the data flow for the "recipe" entity? What backend services or APIs are we interacting with for the CRUD operations?
4.  What is the code review process? Are there specific CI checks (linting, tests) that must pass before merging?
5.  What are the style guidelines for the `src/components/ui` library? Is there a design system or storybook to reference?
6.  Are the `.ai` and `.cursor` configurations mandatory for development, or just personal tools?

---

## Next Steps

1.  **Set up the development environment:** Follow the instructions in the `README.md` (clone, `pnpm install`).
2.  **Run the application:** Use `pnpm dev` to start the local development server and explore the app.
3.  **Run the test suite:** Run `pnpm test` to execute the E2E test suite and see it in action.
4.  **Explore the auth flow:** Trace the code for one of the auth forms (e.g., `src/components/auth/LoginForm.tsx`) to understand how it works.
5.  **Review `e2e/recipe-crud.spec.ts`:** Read through this test file to get a clear, step-by-step understanding of the application's core "recipe" feature.

---

## Development Environment Setup

1.  **Prerequisites:** Node.js (v18.x or later), pnpm
2.  **Dependency Installation:** `pnpm install`
3.  **Building the Project (if applicable):** `pnpm build`
4.  **Running the Application/Service:** `pnpm dev`
5.  **Running Tests:** `pnpm test`
6.  **Common Issues:** Common issues section not found in checked files.

---

## Helpful Resources

- **Documentation:** `https://github.com/sfeduk/astro-recipe-manager.git` (Project repository)
- **Issue Tracker:** `https://github.com/sfeduk/astro-recipe-manager/issues`
- **Contribution Guide:** `CONTRIBUTING.md`
- **Communication Channels:** `https://discord.gg/example123`
- **Learning Resources:** Specific learning resources section not found.
