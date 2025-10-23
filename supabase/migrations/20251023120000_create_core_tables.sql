-- ============================================================================
-- Migration: Create Core Tables for HealthyMeal MVP
-- ============================================================================
-- Description: Creates the foundational tables for the HealthyMeal application
--              including profiles, recipes, and ai_modifications_log.
-- 
-- Affected Tables:
--   - profiles: User profile data with dietary preferences
--   - recipes: Recipe storage with AI modification tracking
--   - ai_modifications_log: AI usage tracking for metrics
--
-- Dependencies:
--   - Requires Supabase auth.users table (provided by Supabase)
--
-- Special Considerations:
--   - All tables use UUID primary keys for consistency with Supabase auth
--   - ON DELETE CASCADE ensures clean data removal on user account deletion
--   - Row-Level Security will be enabled (policies in separate migration)
-- ============================================================================

-- ============================================================================
-- Table: profiles
-- ============================================================================
-- Purpose: Stores application-specific user data with one-to-one relationship
--          to auth.users. Contains dietary preferences and onboarding status.
--
-- Key Features:
--   - Tracks user preferences (allergies, diets, disliked_ingredients)
--   - Monitors onboarding completion for 90% activation metric
--   - Uses TEXT[] arrays for MVP simplicity (normalize post-MVP)
-- ============================================================================

create table public.profiles (
  -- Primary key matches auth.users.id for consistency
  id uuid primary key,

  -- Foreign key to auth.users with cascade delete for GDPR compliance
  -- UNIQUE constraint ensures one-to-one relationship
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Optional user metadata
  full_name text,
  avatar_url text,

  -- Dietary preferences stored as text arrays for MVP
  -- Default to empty arrays to simplify null checks
  -- Post-MVP: Consider normalizing into separate tables with junction tables
  allergies text[] not null default '{}',
  diets text[] not null default '{}',
  disliked_ingredients text[] not null default '{}',

  -- Onboarding tracking for 90% user activation metric
  -- Users must complete onboarding (set at least one preference)
  has_completed_onboarding boolean not null default false,

  -- Timestamp tracking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comment for documentation
comment on table public.profiles is 'User profiles with dietary preferences and onboarding status. One-to-one relationship with auth.users.';
comment on column public.profiles.id is 'Primary key, matches auth.users.id';
comment on column public.profiles.user_id is 'Foreign key to auth.users, enforces one-to-one relationship';
comment on column public.profiles.allergies is 'Array of allergen strings (e.g., peanuts, gluten)';
comment on column public.profiles.diets is 'Array of diet strings (e.g., vegetarian, vegan)';
comment on column public.profiles.disliked_ingredients is 'Array of disliked ingredient strings';
comment on column public.profiles.has_completed_onboarding is 'Tracks onboarding completion for activation metric';

-- ============================================================================
-- Table: recipes
-- ============================================================================
-- Purpose: Stores all recipe data including user-created originals and 
--          AI-modified copies. Supports self-referencing to track AI variations.
--
-- Key Features:
--   - Self-referencing FK (original_recipe_id) links AI copies to originals
--   - JSONB changes_summary stores structured AI modification data
--   - CHECK constraint ensures non-empty titles
-- ============================================================================

create table public.recipes (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

  -- Owner of the recipe (cascade delete on user account removal)
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Recipe content fields
  -- Title must not be empty (enforced by CHECK constraint)
  title text not null check (length(title) > 0),
  ingredients text not null,
  instructions text not null,

  -- Self-referencing foreign key to link AI-modified copies to originals
  -- NULL for user-created originals
  -- ON DELETE SET NULL preserves AI copies if original is deleted
  original_recipe_id uuid references public.recipes(id) on delete set null,

  -- JSONB field for flexible storage of AI modifications
  -- Example: [{"type": "substitution", "from": "beef", "to": "tofu"}]
  -- Can be indexed with GIN if needed for querying changes
  changes_summary jsonb,

  -- Timestamp tracking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comments for documentation
comment on table public.recipes is 'Recipe storage including user-created originals and AI-modified copies';
comment on column public.recipes.id is 'Primary key with auto-generated UUID';
comment on column public.recipes.user_id is 'Owner of the recipe';
comment on column public.recipes.title is 'Recipe title (must not be empty)';
comment on column public.recipes.original_recipe_id is 'Self-referencing FK linking AI-modified copies to originals (NULL for originals)';
comment on column public.recipes.changes_summary is 'JSONB array of AI modifications with structured data';

-- ============================================================================
-- Table: ai_modifications_log
-- ============================================================================
-- Purpose: Comprehensive logging of all AI modification requests for metric
--          analysis, debugging, and business intelligence.
--
-- Key Features:
--   - Critical for measuring 75% WAU AI engagement metric
--   - Stores preference snapshots for historical analysis
--   - Tracks cost and performance metrics
--   - Immutable log (no updates allowed via RLS)
-- ============================================================================

create table public.ai_modifications_log (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

  -- User who requested the modification (cascade delete for GDPR)
  user_id uuid not null references auth.users(id) on delete cascade,

  -- The original recipe that was modified (cascade delete if recipe removed)
  original_recipe_id uuid not null references public.recipes(id) on delete cascade,

  -- The resulting AI-modified recipe (NULL if user didn't save it)
  -- ON DELETE SET NULL preserves logs even if modified recipe is deleted
  modified_recipe_id uuid references public.recipes(id) on delete set null,

  -- Snapshot of user preferences at time of modification
  -- Stored as JSONB for flexible querying and historical analysis
  -- Example: {"allergies": ["peanuts"], "diets": ["vegan"], "disliked": ["mushrooms"]}
  user_preferences_snapshot jsonb not null,

  -- AI model metadata for tracking and optimization
  ai_model_used text,

  -- Cost tracking for business analytics
  -- DECIMAL(10, 6) allows values up to 9999.999999 (sufficient for per-request costs)
  ai_cost_estimate decimal(10, 6),

  -- Performance tracking in milliseconds
  processing_time_ms integer,

  -- Success/failure tracking
  was_successful boolean not null default true,
  error_message text,

  -- Timestamp (no updated_at since logs are immutable)
  created_at timestamptz not null default now()
);

-- Add comments for documentation
comment on table public.ai_modifications_log is 'Immutable log of AI modification requests for metrics, debugging, and analytics';
comment on column public.ai_modifications_log.user_id is 'User who requested the modification';
comment on column public.ai_modifications_log.original_recipe_id is 'Recipe that was modified';
comment on column public.ai_modifications_log.modified_recipe_id is 'Resulting AI-modified recipe (NULL if not saved)';
comment on column public.ai_modifications_log.user_preferences_snapshot is 'JSONB snapshot of user preferences at modification time';
comment on column public.ai_modifications_log.ai_model_used is 'Name/version of AI model (e.g., gpt-4-turbo)';
comment on column public.ai_modifications_log.ai_cost_estimate is 'Estimated API cost in dollars';
comment on column public.ai_modifications_log.processing_time_ms is 'Processing time in milliseconds';
comment on column public.ai_modifications_log.was_successful is 'Whether modification completed successfully';
