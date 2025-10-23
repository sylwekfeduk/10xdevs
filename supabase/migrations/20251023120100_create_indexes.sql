-- ============================================================================
-- Migration: Create Indexes for Performance Optimization
-- ============================================================================
-- Description: Creates indexes on foreign keys and frequently queried columns
--              to optimize query performance as data grows.
--
-- Affected Tables:
--   - profiles
--   - recipes
--   - ai_modifications_log
--
-- Performance Impact:
--   - Speeds up JOIN operations on foreign keys
--   - Optimizes metric calculation queries
--   - Improves recipe variation lookups
-- ============================================================================

-- ============================================================================
-- Indexes: profiles table
-- ============================================================================
-- Purpose: Optimize foreign key lookups for user profile queries

-- Index on user_id for fast lookups when joining with auth.users
-- Also used by the UNIQUE constraint for one-to-one relationship enforcement
create index idx_profiles_user_id on public.profiles(user_id);

comment on index public.idx_profiles_user_id is 'Optimizes profile lookups by user_id and enforces one-to-one relationship';

-- ============================================================================
-- Indexes: recipes table
-- ============================================================================
-- Purpose: Optimize recipe queries, especially for user's recipe lists and
--          AI modification tracking

-- Index on user_id for fast filtering of user's recipes
create index idx_recipes_user_id on public.recipes(user_id);

comment on index public.idx_recipes_user_id is 'Optimizes filtering recipes by owner';

-- Index on original_recipe_id for finding all AI variations of a recipe
create index idx_recipes_original_recipe_id on public.recipes(original_recipe_id);

comment on index public.idx_recipes_original_recipe_id is 'Optimizes queries for AI variations of recipes';

-- Partial index for AI-modified recipes only (where original_recipe_id IS NOT NULL)
-- This is more efficient than the full index when querying only modified recipes
create index idx_recipes_original_recipe_id_not_null 
  on public.recipes(original_recipe_id) 
  where original_recipe_id is not null;

comment on index public.idx_recipes_original_recipe_id_not_null is 'Partial index for AI-modified recipes only (more efficient for variation queries)';

-- Composite index for common query pattern: user's recipes ordered by date
-- This single index can satisfy both WHERE user_id = X and ORDER BY created_at DESC
create index idx_recipes_user_id_created_at on public.recipes(user_id, created_at desc);

comment on index public.idx_recipes_user_id_created_at is 'Optimizes queries for user recipe lists ordered by creation date';

-- ============================================================================
-- Indexes: ai_modifications_log table
-- ============================================================================
-- Purpose: Optimize AI usage queries for metrics, analytics, and debugging

-- Index on user_id for filtering logs by user
create index idx_ai_modifications_log_user_id on public.ai_modifications_log(user_id);

comment on index public.idx_ai_modifications_log_user_id is 'Optimizes filtering AI logs by user';

-- Index on original_recipe_id for finding all modifications of a recipe
create index idx_ai_modifications_log_original_recipe_id on public.ai_modifications_log(original_recipe_id);

comment on index public.idx_ai_modifications_log_original_recipe_id is 'Optimizes queries for all modifications of a specific recipe';

-- Index on modified_recipe_id for reverse lookup (which log created this recipe)
create index idx_ai_modifications_log_modified_recipe_id on public.ai_modifications_log(modified_recipe_id);

comment on index public.idx_ai_modifications_log_modified_recipe_id is 'Optimizes reverse lookup from modified recipe to its creation log';

-- Index on created_at for time-based queries (critical for WAU metric calculation)
-- Used for queries like "users who used AI in the last 7 days"
create index idx_ai_modifications_log_created_at on public.ai_modifications_log(created_at desc);

comment on index public.idx_ai_modifications_log_created_at is 'Optimizes time-based queries for metric calculation (e.g., WAU engagement)';

-- Composite index for common metric query: successful modifications by user in time range
-- Supports queries filtering by user_id, was_successful, and created_at
create index idx_ai_modifications_log_user_success_created 
  on public.ai_modifications_log(user_id, was_successful, created_at desc);

comment on index public.idx_ai_modifications_log_user_success_created is 'Optimizes metric queries filtering by user, success status, and time';
