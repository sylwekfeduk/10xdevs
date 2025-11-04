-- ============================================================================
-- Migration: Create Trigger for Automatic Profile Creation
-- ============================================================================
-- Description: Creates a trigger that automatically inserts a row in the
--              public.profiles table when a new user signs up via Supabase Auth.
--
-- Purpose: Ensures every authenticated user has a corresponding profile row
--          without requiring manual profile creation in application code.
--
-- Affected Tables:
--   - auth.users (trigger source)
--   - public.profiles (trigger target)
--
-- Key Features:
--   - Automatically creates profile with default values on user signup
--   - Uses user's auth.users.id as both id and user_id for consistency
--   - Sets has_completed_onboarding to false by default
--   - Handles both email/password and OAuth signups transparently
-- ============================================================================

-- ============================================================================
-- Function: create_profile_for_new_user
-- ============================================================================
-- Purpose: Trigger function that creates a profile row in public.profiles
--          whenever a new user is created in auth.users
--
-- Returns: NEW (the new auth.users row, unchanged)
--
-- Behavior:
--   1. Extracts user ID from the new auth.users row
--   2. Inserts a new row in public.profiles with:
--      - id = new user's ID
--      - user_id = new user's ID
--      - All other fields use their default values
--   3. Returns the auth.users row (trigger doesn't modify it)
--
-- Security: Runs with SECURITY DEFINER to bypass RLS during profile creation
-- ============================================================================

create or replace function public.create_profile_for_new_user()
returns trigger
security definer
language plpgsql
as $$
begin
  -- Insert new profile row with user's ID
  -- All preference fields will default to empty arrays
  -- has_completed_onboarding defaults to false
  insert into public.profiles (id, user_id)
  values (new.id, new.id);

  return new;
end;
$$;

comment on function public.create_profile_for_new_user is
  'Trigger function that automatically creates a profile in public.profiles when a new user signs up';

-- ============================================================================
-- Trigger: on_auth_user_created
-- ============================================================================
-- Purpose: Automatically create profile row when user signs up
-- Fires: AFTER INSERT on auth.users table
-- Used when:
--   - User signs up with email/password
--   - User signs up with OAuth provider
--
-- Important: This trigger fires AFTER the user row is committed, ensuring
--            the foreign key constraint is satisfied.
-- ============================================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.create_profile_for_new_user();

-- Note: Cannot add comment to auth.users trigger in local development due to ownership restrictions
-- comment on trigger on_auth_user_created on auth.users is
--   'Automatically creates a profile in public.profiles when a new user signs up via Supabase Auth';