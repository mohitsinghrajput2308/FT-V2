-- Migration 006: Add spent_amount column to budgets table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0);
