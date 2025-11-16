-- Migration: Fix existing recipes that might have incorrect copied_from_master_id values
-- Date: 2025-11-14
-- Purpose: Ensure that only recipes actually copied from master_recipes have copied_from_master_id set

-- Update any recipes that have copied_from_master_id set but don't actually reference a valid master recipe
UPDATE public.recipes
SET copied_from_master_id = NULL
WHERE copied_from_master_id IS NOT NULL
  AND copied_from_master_id NOT IN (SELECT id FROM public.master_recipes);

-- This ensures data integrity: only recipes that were actually copied from the catalog will show "From Catalog"
-- All other recipes will show either "Original" (no original_recipe_id) or "AI-Modified" (has original_recipe_id)