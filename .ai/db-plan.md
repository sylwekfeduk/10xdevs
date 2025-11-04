# HealthyMeal Database Schema

## Overview

This document describes the PostgreSQL database schema for the HealthyMeal MVP application. The schema is designed to support user authentication (via Supabase), recipe management, AI-powered recipe modifications, and comprehensive tracking for key product metrics.

## Key Design Principles

- **Security First**: Row-Level Security (RLS) enabled on all tables containing user data
- **Data Integrity**: UUID primary keys, foreign key constraints, and NOT NULL constraints where appropriate
- **Metric Tracking**: Dedicated logging for measuring 90% activation and 75% WAU AI engagement
- **Scalability**: Prepared for future growth with indexed foreign keys and JSONB for flexible data
- **Clean Deletion**: CASCADE rules ensure complete data cleanup on account deletion

---

## 1. Tables

### 1.1 `profiles`

Stores application-specific user data with a one-to-one relationship to Supabase's `auth.users` table.

**Columns:**

| Column Name                | Data Type     | Constraints                                                         | Description                                                         |
| -------------------------- | ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `id`                       | `UUID`        | `PRIMARY KEY`                                                       | Primary key, matches `auth.users.id`                                |
| `user_id`                  | `UUID`        | `NOT NULL`, `UNIQUE`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to auth.users (one-to-one)                              |
| `full_name`                | `TEXT`        | `NULL`                                                              | User's full name (optional)                                         |
| `avatar_url`               | `TEXT`        | `NULL`                                                              | URL to user's avatar image (optional)                               |
| `allergies`                | `TEXT[]`      | `NOT NULL DEFAULT '{}'`                                             | Array of allergen strings (e.g., 'peanuts', 'gluten')               |
| `diets`                    | `TEXT[]`      | `NOT NULL DEFAULT '{}'`                                             | Array of diet strings (e.g., 'vegetarian', 'vegan')                 |
| `disliked_ingredients`     | `TEXT[]`      | `NOT NULL DEFAULT '{}'`                                             | Array of disliked ingredient strings                                |
| `has_completed_onboarding` | `BOOLEAN`     | `NOT NULL DEFAULT false`                                            | Tracks if user has completed onboarding (for 90% activation metric) |
| `created_at`               | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()`                                            | Timestamp of profile creation                                       |
| `updated_at`               | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()`                                            | Timestamp of last update (auto-managed by trigger)                  |

**Notes:**

- The `user_id` field is separate from `id` to maintain flexibility in case the relationship needs to change
- For MVP, preferences are stored as `TEXT[]` arrays for simplicity
- Post-MVP consideration: Normalize preferences into separate tables (`allergens`, `diets`, etc.) with junction tables

---

### 1.2 `recipes`

Stores all recipe data, including both user-created originals and AI-modified copies.

**Columns:**

| Column Name          | Data Type     | Constraints                                               | Description                                                                                                |
| -------------------- | ------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`                 | `UUID`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                   | Primary key                                                                                                |
| `user_id`            | `UUID`        | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Owner of the recipe                                                                                        |
| `title`              | `TEXT`        | `NOT NULL`, `CHECK (length(title) > 0)`                   | Recipe title (cannot be empty)                                                                             |
| `ingredients`        | `TEXT`        | `NOT NULL`                                                | Recipe ingredients as text                                                                                 |
| `instructions`       | `TEXT`        | `NOT NULL`                                                | Recipe instructions as text                                                                                |
| `original_recipe_id` | `UUID`        | `NULL`, `REFERENCES recipes(id) ON DELETE SET NULL`       | Self-referencing FK to link AI-modified copies to original                                                 |
| `changes_summary`    | `JSONB`       | `NULL`                                                    | List of AI modifications in JSON format (e.g., `[{"type": "substitution", "from": "beef", "to": "tofu"}]`) |
| `created_at`         | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()`                                  | Timestamp of recipe creation                                                                               |
| `updated_at`         | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()`                                  | Timestamp of last update (auto-managed by trigger)                                                         |

**Notes:**

- `original_recipe_id` is `NULL` for user-created originals and contains a UUID for AI-modified copies
- `changes_summary` uses `JSONB` for flexibility in storing structured AI modification data
- `ON DELETE SET NULL` for `original_recipe_id` preserves AI-modified copies if original is deleted
- `CHECK` constraint ensures title is not an empty string

---

### 1.3 `ai_modifications_log`

Tracks every AI modification request for metric analysis and debugging.

**Columns:**

| Column Name                 | Data Type        | Constraints                                               | Description                                                         |
| --------------------------- | ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `id`                        | `UUID`           | `PRIMARY KEY DEFAULT gen_random_uuid()`                   | Primary key                                                         |
| `user_id`                   | `UUID`           | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | User who requested the modification                                 |
| `original_recipe_id`        | `UUID`           | `NOT NULL`, `REFERENCES recipes(id) ON DELETE CASCADE`    | The recipe that was modified                                        |
| `modified_recipe_id`        | `UUID`           | `NULL`, `REFERENCES recipes(id) ON DELETE SET NULL`       | The resulting AI-modified recipe (NULL if not saved)                |
| `user_preferences_snapshot` | `JSONB`          | `NOT NULL`                                                | Snapshot of user preferences at time of modification (for analysis) |
| `ai_model_used`             | `TEXT`           | `NULL`                                                    | Name/version of AI model used (e.g., 'gpt-4-turbo')                 |
| `ai_cost_estimate`          | `DECIMAL(10, 6)` | `NULL`                                                    | Estimated API cost for this modification                            |
| `processing_time_ms`        | `INTEGER`        | `NULL`                                                    | Time taken to process the modification in milliseconds              |
| `was_successful`            | `BOOLEAN`        | `NOT NULL DEFAULT true`                                   | Whether the AI modification completed successfully                  |
| `error_message`             | `TEXT`           | `NULL`                                                    | Error message if modification failed                                |
| `created_at`                | `TIMESTAMPTZ`    | `NOT NULL DEFAULT now()`                                  | Timestamp of modification request                                   |

**Notes:**

- Critical for measuring the 75% WAU AI engagement metric
- `user_preferences_snapshot` stores preferences at time of modification for later analysis
- Cost and performance tracking fields support business analytics
- `ON DELETE SET NULL` for `modified_recipe_id` preserves logs even if result is deleted

---

## 2. Relationships

### 2.1 One-to-One Relationships

- **`auth.users` → `profiles`**: Each authenticated user has exactly one profile
  - Implemented via `profiles.user_id` UNIQUE constraint

### 2.2 One-to-Many Relationships

- **`auth.users` → `recipes`**: A user can have many recipes
  - Foreign key: `recipes.user_id` → `auth.users.id`

- **`auth.users` → `ai_modifications_log`**: A user can have many AI modification events
  - Foreign key: `ai_modifications_log.user_id` → `auth.users.id`

- **`recipes` → `ai_modifications_log`**: A recipe can be modified multiple times
  - Foreign key: `ai_modifications_log.original_recipe_id` → `recipes.id`

### 2.3 Self-Referencing Relationships

- **`recipes` → `recipes`**: An AI-modified recipe references its original
  - Foreign key: `recipes.original_recipe_id` → `recipes.id`
  - This allows querying all AI variations of a given recipe

---

## 3. Indexes

Indexes improve query performance for frequently accessed data and foreign key lookups.
