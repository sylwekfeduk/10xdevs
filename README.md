# HealthyMeal

An intelligent recipe management application that helps users customize recipes according to their dietary preferences, allergies, and food restrictions using AI-powered modifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Project Scope (MVP)](#project-scope-mvp)
- [Success Metrics](#success-metrics)
- [Project Status](#project-status)
- [License](#license)

## Overview

HealthyMeal is an MVP application designed to solve the challenge of adapting existing recipes to individual dietary needs. Users can manually input recipes and use AI to automatically modify them based on their specified preferences such as:

- 🥜 **Allergens** - Avoid specific ingredients that cause allergic reactions
- 🥗 **Dietary Preferences** - Follow specific diets (vegetarian, vegan, gluten-free, etc.)
- 🚫 **Disliked Ingredients** - Exclude ingredients you simply don't like

The AI modification feature generates a new version of the recipe while preserving the original, giving users full control over their recipe collection.

## Features

### Core Functionality

- **User Authentication**
  - Email/password registration and login
  - Social login (Google OAuth)
  - Guided onboarding process

- **User Profile & Preferences**
  - Allergen selection (dropdown)
  - Diet type selection (dropdown)
  - Disliked ingredients (free text input)

- **Recipe Management (CRUD)**
  - Add recipes manually (title, ingredients, instructions)
  - View saved recipes
  - Delete recipes (both original and AI-modified versions)
  - Save multiple versions of the same recipe

- **AI-Powered Recipe Modification**
  - "Customize to my preferences" button on each recipe
  - AI analyzes recipe against user preferences
  - Generates new recipe version with appropriate substitutions
  - Clear disclaimer for AI-generated content (especially for allergies)
  - Option to save modified recipe

## Tech Stack

### Frontend

- **[Astro 5](https://astro.build/)** - Fast, modern web framework with minimal JavaScript
- **[React 19](https://react.dev/)** - Interactive UI components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible component library

### Backend

- **[Supabase](https://supabase.com/)** - Backend-as-a-Service platform
  - PostgreSQL database
  - Built-in authentication
  - Real-time capabilities
  - Open-source and self-hostable

### AI

- **[OpenRouter.ai](https://openrouter.ai/)** - AI model aggregator
  - Access to multiple providers (OpenAI, Anthropic, Google, etc.)
  - Cost optimization through model selection
  - Built-in API cost controls

### Testing

- **[Vitest](https://vitest.dev/)** - Fast unit and integration testing framework
  - Native ESM support
  - Compatible with Vite ecosystem
  - Built-in TypeScript support
- **[React Testing Library](https://testing-library.com/react)** - Component testing library
  - User-centric testing approach
  - Testing React components and custom hooks
- **[Cypress](https://www.cypress.io/)** / **[Playwright](https://playwright.dev/)** - End-to-end testing
  - Browser automation for E2E scenarios
  - Reliable and fast test execution
- **[Supertest](https://github.com/ladjs/supertest)** - HTTP API testing
  - Integration with Vitest
  - API endpoint validation

### CI/CD & Hosting

- **GitHub Actions** - Automated CI/CD pipelines
- **DigitalOcean** - Application hosting via Docker

## Getting Started

### Prerequisites

- **Node.js** `22.14.0` (see `.nvmrc`)
- **npm** (included with Node.js)
- **Supabase Account** (for backend services)
- **OpenRouter API Key** (for AI functionality)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/10xdevs.git
   cd 10xdevs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env .env
   ```

   Then edit `.env` with your credentials (see [Environment Variables](#environment-variables) section).

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

**Where to get these:**

- **Supabase credentials**: Create a project at [supabase.com](https://supabase.com) and find your URL and anon key in Project Settings > API
- **OpenRouter API key**: Sign up at [openrouter.ai](https://openrouter.ai) and generate an API key in your account settings

### Running the Application

**Development mode** (runs on http://localhost:3000):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm run preview
```

## Available Scripts

| Script                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start development server on port 3000      |
| `npm run build`         | Build the application for production       |
| `npm run preview`       | Preview production build locally           |
| `npm test`              | Run unit and integration tests with Vitest |
| `npm run test:watch`    | Run tests in watch mode                    |
| `npm run test:coverage` | Run tests with coverage report             |
| `npm run test:e2e`      | Run end-to-end tests                       |
| `npm run lint`          | Check code for linting errors              |
| `npm run lint:fix`      | Automatically fix linting errors           |
| `npm run format`        | Format code with Prettier                  |

## Project Structure

```
./
├── .ai/                      # Project documentation (PRD, tech stack)
├── .cursor/                  # Cursor AI rules
├── .github/                  # GitHub configuration
├── src/
│   ├── components/          # UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── hooks/          # Custom React hooks
│   ├── layouts/            # Astro layout components
│   ├── pages/              # File-based routing
│   │   ├── index.astro    # Homepage
│   │   └── api/           # API endpoints
│   ├── middleware/         # Request/response middleware
│   │   └── index.ts
│   ├── db/                 # Supabase clients and types
│   ├── lib/
│   │   └── services/      # Business logic layer
│   ├── types.ts           # Shared TypeScript types
│   ├── assets/            # Internal static assets
│   └── styles/            # Global styles
├── public/                 # Public static assets
└── CLAUDE.md              # AI assistant guidance
```

## Project Scope (MVP)

### In Scope ✅

1. **Authentication System**
   - Email/password login
   - At least one social provider (Google)
   - Onboarding flow with mandatory preference setup

2. **User Preferences**
   - Allergen management (selection list)
   - Diet type selection (selection list)
   - Disliked ingredients (free text)

3. **Recipe Management**
   - Manual recipe input via form (title, ingredients, instructions)
   - View saved recipes
   - Delete recipes (original and AI versions independently)

4. **AI Recipe Modification**
   - Modify existing recipes only (no generation from scratch)
   - Create new copy instead of overwriting original
   - Display clear disclaimer on AI-generated content
   - Save modified versions to user library

### Out of Scope (MVP) ❌

- Recipe import from URLs
- AI recipe generation from scratch
- Recipe sharing between users
- Meal planning features
- Shopping list generation
- Nutritional information calculation

## Success Metrics

The MVP focuses on measuring two key metrics:

1. **User Activation**: **90%** of newly registered users define at least one preference (allergy, diet, or disliked ingredient) during onboarding

2. **Core Value Engagement**: **75%** of Weekly Active Users (WAU) use the AI modification feature at least once per week

3. **Retention** (Indirect): Monitor WAU/MAU ratio as a general product stickiness indicator

4. **Business/Risk Indicator**: Track average AI API cost per active user per week

## Project Status

🚧 **MVP Development In Progress**

### Completed

- [x] Project setup and tech stack configuration
- [x] Development environment configuration
- [x] Project documentation (PRD, tech stack, CLAUDE.md)

### In Progress

- [ ] User authentication system (email + Google OAuth)
- [ ] User profile and preferences management
- [ ] Recipe CRUD functionality
- [ ] AI integration with OpenRouter
- [ ] Recipe modification feature

### Planned

- [ ] Onboarding flow
- [ ] UI/UX for AI modification display
- [ ] Testing and bug fixes
- [ ] Deployment pipeline
- [ ] Production deployment on DigitalOcean

### Open Questions

- AI provider selection and cost estimation
- Detailed UI/UX for presenting AI modifications (highlighting changes, change list, etc.)

## License

This project is currently unlicensed. All rights reserved.

---

**Note**: This is an MVP (Minimum Viable Product) project focused on validating the core value proposition of AI-powered recipe customization based on dietary preferences.
