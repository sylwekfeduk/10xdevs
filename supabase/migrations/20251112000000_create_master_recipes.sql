-- ============================================================================
-- Migration: Create Master Recipes System
-- ============================================================================
-- Description: Creates master_recipes table for admin-curated recipes that
--              all users can view and copy to their personal collection.
--
-- Changes:
--   1. Add is_admin flag to profiles table
--   2. Create master_recipes table with admin-only write access
--   3. Add copied_from_master_id to recipes table
--   4. Create RLS policies for master recipes
--
-- Security Model:
--   - All authenticated users can view master recipes
--   - Only admin users can create/update/delete master recipes
--   - Users can copy master recipes to their personal collection
--   - Once copied, recipes are fully independent
-- ============================================================================

-- ============================================================================
-- Step 1: Add is_admin flag to profiles table
-- ============================================================================

alter table public.profiles
add column is_admin boolean not null default false;

comment on column public.profiles.is_admin is 'Identifies admin users who can manage master recipes';

-- ============================================================================
-- Step 2: Create master_recipes table
-- ============================================================================
-- Purpose: Stores curated recipes that all users can view and copy.
--          Only admins can create, update, or delete master recipes.
--
-- Key Features:
--   - Viewable by all authenticated users
--   - Editable only by admins
--   - Can be copied to users' personal recipe collection
--   - Tracks which admin created/modified the recipe
-- ============================================================================

create table public.master_recipes (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

  -- Recipe content fields
  title text not null check (length(title) > 0),
  ingredients text not null,
  instructions text not null,

  -- Optional description for catalog display
  description text,

  -- Track which admin created this recipe
  created_by uuid not null references auth.users(id) on delete restrict,

  -- Track which admin last modified this recipe
  updated_by uuid references auth.users(id) on delete set null,

  -- Timestamp tracking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comments for documentation
comment on table public.master_recipes is 'Curated master recipes viewable by all users, editable only by admins';
comment on column public.master_recipes.id is 'Primary key with auto-generated UUID';
comment on column public.master_recipes.title is 'Recipe title (must not be empty)';
comment on column public.master_recipes.description is 'Optional short description for catalog display';
comment on column public.master_recipes.created_by is 'Admin user who created this master recipe';
comment on column public.master_recipes.updated_by is 'Admin user who last updated this master recipe';

-- ============================================================================
-- Step 3: Add copied_from_master_id to recipes table
-- ============================================================================
-- Purpose: Track which master recipe a user recipe was copied from (for reference only).
--          This link is informational and doesn't restrict editing.
--          SET NULL on master recipe deletion preserves user's copy.

alter table public.recipes
add column copied_from_master_id uuid references public.master_recipes(id) on delete set null;

comment on column public.recipes.copied_from_master_id is 'Optional reference to the master recipe this was copied from (NULL for original user recipes)';

-- ============================================================================
-- Step 4: Enable RLS on master_recipes table
-- ============================================================================

alter table public.master_recipes enable row level security;

-- ============================================================================
-- Step 5: Create RLS policies for master_recipes
-- ============================================================================

-- SELECT Policy: All authenticated users can view master recipes
create policy "All users can view master recipes"
  on public.master_recipes
  for select
  to authenticated
  using (true);

comment on policy "All users can view master recipes" on public.master_recipes is
  'Allows all authenticated users to browse the master recipe catalog';

-- INSERT Policy: Only admins can create master recipes
create policy "Admins can create master recipes"
  on public.master_recipes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.is_admin = true
    )
  );

comment on policy "Admins can create master recipes" on public.master_recipes is
  'Allows only admin users to create new master recipes';

-- UPDATE Policy: Only admins can update master recipes
create policy "Admins can update master recipes"
  on public.master_recipes
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.is_admin = true
    )
  );

comment on policy "Admins can update master recipes" on public.master_recipes is
  'Allows only admin users to update existing master recipes';

-- DELETE Policy: Only admins can delete master recipes
create policy "Admins can delete master recipes"
  on public.master_recipes
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.is_admin = true
    )
  );

comment on policy "Admins can delete master recipes" on public.master_recipes is
  'Allows only admin users to delete master recipes';

-- ============================================================================
-- Step 6: Create trigger to update updated_at timestamp
-- ============================================================================

create or replace function update_master_recipes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_master_recipes_updated_at_trigger
  before update on public.master_recipes
  for each row
  execute function update_master_recipes_updated_at();

comment on function update_master_recipes_updated_at is
  'Automatically updates the updated_at timestamp when a master recipe is modified';