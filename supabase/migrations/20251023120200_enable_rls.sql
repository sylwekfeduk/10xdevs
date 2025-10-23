-- ============================================================================
-- Migration: Enable Row-Level Security (RLS) and Create Policies
-- ============================================================================
-- Description: Enables RLS on all tables and creates granular policies to
--              ensure users can only access their own data.
--
-- Security Model:
--   - All tables have RLS enabled (required even for authenticated-only access)
--   - Policies use auth.uid() to identify current user
--   - Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
--   - Separate policies for each role (anon, authenticated) where applicable
--
-- Affected Tables:
--   - profiles
--   - recipes
--   - ai_modifications_log
--
-- IMPORTANT: RLS policies must be created AFTER tables exist and BEFORE
--            any application code attempts to access the tables.
-- ============================================================================

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
-- RLS must be enabled on all tables containing user data
-- Even if a table is only accessible to authenticated users, RLS provides
-- defense in depth against SQL injection and other attacks

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.ai_modifications_log enable row level security;

-- ============================================================================
-- Policies: profiles table
-- ============================================================================
-- Security Model: Users can only access their own profile
-- Operations: Full CRUD access to own profile only

-- SELECT Policy: Users can view their own profile
-- Used when: Fetching profile data for display or editing
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Users can view own profile" on public.profiles is 
  'Allows authenticated users to view only their own profile data';

-- INSERT Policy: Users can create their own profile during registration
-- Used when: Creating profile after Supabase auth signup
-- Note: user_id must match authenticated user
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on policy "Users can insert own profile" on public.profiles is 
  'Allows authenticated users to create their profile during registration (user_id must match auth.uid())';

-- UPDATE Policy: Users can update their own profile
-- Used when: Modifying profile data, preferences, or onboarding status
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on policy "Users can update own profile" on public.profiles is 
  'Allows authenticated users to update only their own profile data';

-- DELETE Policy: Users can delete their own profile
-- Used when: User requests account deletion (typically handled by auth.users CASCADE)
-- Note: This is primarily defensive; deletion usually happens via auth.users CASCADE
create policy "Users can delete own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Users can delete own profile" on public.profiles is 
  'Allows authenticated users to delete their own profile (typically triggered by auth.users CASCADE)';

-- ============================================================================
-- Policies: recipes table
-- ============================================================================
-- Security Model: Users can only access their own recipes
-- Operations: Full CRUD access to own recipes only

-- SELECT Policy: Users can view their own recipes
-- Used when: Displaying recipe library, viewing recipe details
create policy "Users can view own recipes"
  on public.recipes
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Users can view own recipes" on public.recipes is 
  'Allows authenticated users to view only their own recipes (originals and AI variations)';

-- INSERT Policy: Users can create recipes for themselves
-- Used when: Manually adding new recipe or AI creating modified copy
-- Note: user_id must match authenticated user
create policy "Users can insert own recipes"
  on public.recipes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on policy "Users can insert own recipes" on public.recipes is 
  'Allows authenticated users to create recipes owned by themselves (user_id must match auth.uid())';

-- UPDATE Policy: Users can update their own recipes
-- Used when: Editing recipe content or metadata
create policy "Users can update own recipes"
  on public.recipes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on policy "Users can update own recipes" on public.recipes is 
  'Allows authenticated users to update only their own recipes';

-- DELETE Policy: Users can delete their own recipes
-- Used when: Removing unwanted recipes (originals or AI variations)
-- Note: Deleting an original recipe will SET NULL on modified recipes' original_recipe_id
create policy "Users can delete own recipes"
  on public.recipes
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Users can delete own recipes" on public.recipes is 
  'Allows authenticated users to delete their own recipes (CASCADE/SET NULL handled by FK constraints)';

-- ============================================================================
-- Policies: ai_modifications_log table
-- ============================================================================
-- Security Model: Users can view and create their own logs, but NOT update/delete
-- Operations: SELECT and INSERT only (logs are immutable for data integrity)

-- SELECT Policy: Users can view their own AI modification logs
-- Used when: Displaying modification history, calculating metrics
create policy "Users can view own ai logs"
  on public.ai_modifications_log
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Users can view own ai logs" on public.ai_modifications_log is 
  'Allows authenticated users to view their own AI modification logs for history and analytics';

-- INSERT Policy: Users can create logs for their own modifications
-- Used when: Backend records AI modification attempt
-- Note: user_id must match authenticated user
create policy "Users can insert own ai logs"
  on public.ai_modifications_log
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on policy "Users can insert own ai logs" on public.ai_modifications_log is 
  'Allows authenticated users to create AI modification logs (user_id must match auth.uid())';

-- NO UPDATE POLICY: Logs are immutable for audit trail integrity
-- If updates are needed in the future, they should be done via service role

-- NO DELETE POLICY: Logs should not be deleted by users
-- Deletion will happen automatically via CASCADE when user account is deleted
-- If admin deletion is needed, it should be done via service role

comment on table public.ai_modifications_log is 
  'Immutable log table - no UPDATE or DELETE policies for users (CASCADE on user deletion only)';
