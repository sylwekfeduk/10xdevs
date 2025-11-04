# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Astro 5** - Server-side rendering (SSR mode with Node adapter)
- **TypeScript 5**
- **React 19** - For interactive components only
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - UI component library
- **Supabase** - Backend services and database

## Development Commands

```bash
# Development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint          # Check for lint errors
npm run lint:fix      # Fix lint errors automatically

# Formatting
npm run format        # Format all files with Prettier
```

## Project Architecture

### Directory Structure

```
./src
├── layouts/              # Astro layout components
├── pages/                # File-based routing
│   ├── index.astro      # Homepage
│   └── api/             # API endpoints
├── middleware/
│   └── index.ts         # Astro middleware for request/response modification
├── db/                  # Supabase clients and types
├── types.ts             # Shared types (Entities, DTOs)
├── components/
│   ├── *.astro          # Static Astro components
│   ├── *.tsx            # Interactive React components
│   ├── ui/              # Shadcn/ui components
│   └── hooks/           # Custom React hooks
├── lib/
│   ├── services/        # Business logic and API service layer
│   └── utils.ts         # Utility functions
├── assets/              # Internal static assets
└── styles/              # Global styles

./public                 # Public static assets
```

### Component Strategy

- **Astro components (.astro)**: Use for static content and layouts
- **React components (.tsx)**: Use ONLY when interactivity is needed
- **Never use** "use client" or other Next.js directives (this is Astro + React, not Next.js)

### API Routes

API routes follow Astro's server endpoint pattern:

```typescript
// Use uppercase HTTP method names
export const GET = async (context) => { ... }
export const POST = async (context) => { ... }

// Always disable prerendering for API routes
export const prerender = false
```

Key patterns:

- Use **Zod schemas** for input validation
- Extract business logic into services in `src/lib/services`
- Access Supabase via `context.locals.supabase`, NOT by importing the client directly
- Use `SupabaseClient` type from `src/db/supabase.client.ts`, not from `@supabase/supabase-js`

### Middleware

Middleware is defined in `src/middleware/index.ts` and runs on every request. Use for:

- Request/response modification
- Authentication checks
- Setting up context.locals (e.g., Supabase client)

## Code Style and Patterns

### Error Handling

Use the guard clause pattern with early returns:

```typescript
// ✅ Good
function processData(data: Data) {
  if (!data) {
    return { error: "Data is required" };
  }
  if (!data.isValid) {
    return { error: "Invalid data" };
  }

  // Happy path at the end
  return processValidData(data);
}

// ❌ Avoid
function processData(data: Data) {
  if (data) {
    if (data.isValid) {
      return processValidData(data);
    } else {
      return { error: "Invalid data" };
    }
  } else {
    return { error: "Data is required" };
  }
}
```

### React Patterns

- Use functional components with hooks
- Extract logic into custom hooks in `src/components/hooks`
- Use `React.memo()` for expensive components that re-render frequently with same props
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations
- Use `useId()` for generating unique IDs for accessibility
- Use `useTransition` for non-urgent state updates

### Astro-Specific Patterns

- Use View Transitions API with ClientRouter for smooth page transitions
- Use content collections with type safety for structured content
- Use `Astro.cookies` for server-side cookie management
- Access environment variables via `import.meta.env`
- Enable hybrid rendering where needed (SSR + SSG mix)

### Styling with Tailwind

- Use `@layer` directive to organize styles (components, utilities, base)
- Use arbitrary values with square brackets: `w-[123px]`
- Use responsive variants: `sm:`, `md:`, `lg:`, `xl:`
- Use state variants: `hover:`, `focus-visible:`, `active:`
- Implement dark mode with `dark:` variant

### Accessibility

- Use semantic HTML first, ARIA only when necessary
- Use ARIA landmarks (main, navigation, search)
- Implement `aria-expanded` and `aria-controls` for expandable content
- Use `aria-live` regions for dynamic updates
- Use `aria-label` or `aria-labelledby` for elements without visible labels
- Use `aria-describedby` for descriptive text associations

## Environment Variables

Required environment variables (see `.env.example`):

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `OPENROUTER_API_KEY` - OpenRouter API key (if using AI features)

## Pre-commit Hooks

The project uses Husky + lint-staged for pre-commit checks:

- TypeScript/TSX/Astro files: Auto-fix with ESLint
- JSON/CSS/MD files: Auto-format with Prettier

If commits fail, check the linter output and fix errors before committing.

## Important Notes

- This is an **SSR Astro project** using the Node adapter in standalone mode
- Development server runs on **port 3000**
- Always run linter feedback when making changes
- When modifying directory structure, update this file
