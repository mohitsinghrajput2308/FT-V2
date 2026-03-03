-- Migration 007: Add priority and description columns to goals table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.goals
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('High', 'Medium', 'Low')),
    ADD COLUMN IF NOT EXISTS description TEXT;
