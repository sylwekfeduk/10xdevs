-- Migration: Add kcal field to recipes table
-- Date: 2025-11-14
-- Purpose: Add calorie count field to store AI-calculated nutritional information

-- Add kcal column to recipes table (nullable, can be set by AI)
alter table public.recipes
add column kcal integer;

comment on column public.recipes.kcal is 'Estimated calories (kcal) for the recipe, calculated by AI';