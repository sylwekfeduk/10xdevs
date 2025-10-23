-- ============================================================================
-- Migration: Create Triggers for Automatic Timestamp Management
-- ============================================================================
-- Description: Creates a reusable trigger function and applies it to tables
--              that need automatic updated_at timestamp management.
--
-- Affected Tables:
--   - profiles
--   - recipes
--
-- Note: ai_modifications_log does NOT need this trigger because logs are
--       immutable and should not be updated after creation.
--
-- Behavior: On every UPDATE operation, the trigger automatically sets
--           updated_at = now() before the row is committed.
-- ============================================================================

-- ============================================================================
-- Function: update_updated_at_column
-- ============================================================================
-- Purpose: Generic trigger function that updates the updated_at column
--          to the current timestamp on any UPDATE operation.
--
-- Returns: NEW (the modified row with updated_at set to now())
--
-- Usage: Attach this function to any table with an updated_at column using:
--        CREATE TRIGGER trigger_name BEFORE UPDATE ON table_name
--        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  -- Set the updated_at column to current timestamp
  -- This happens before the UPDATE is committed to the database
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at_column is 
  'Trigger function that automatically updates updated_at column to current timestamp on UPDATE operations';

-- ============================================================================
-- Trigger: profiles.updated_at
-- ============================================================================
-- Purpose: Automatically update updated_at timestamp when profile is modified
-- Fires: BEFORE UPDATE on profiles table
-- Used when: User updates preferences, full_name, avatar_url, or onboarding status

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

comment on trigger update_profiles_updated_at on public.profiles is 
  'Automatically updates updated_at timestamp when profile is modified';

-- ============================================================================
-- Trigger: recipes.updated_at
-- ============================================================================
-- Purpose: Automatically update updated_at timestamp when recipe is modified
-- Fires: BEFORE UPDATE on recipes table
-- Used when: User edits recipe title, ingredients, instructions, or metadata

create trigger update_recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.update_updated_at_column();

comment on trigger update_recipes_updated_at on public.recipes is 
  'Automatically updates updated_at timestamp when recipe is modified';

-- ============================================================================
-- Note: ai_modifications_log does NOT have this trigger
-- ============================================================================
-- The ai_modifications_log table is designed to be immutable (append-only)
-- and should not be updated after creation. Therefore, no updated_at column
-- or trigger is needed. All modifications create new log entries instead.
