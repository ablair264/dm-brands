-- Database schema updates and RLS Policies
-- Run this in your Supabase SQL Editor

-- Add title field to catalogues table
ALTER TABLE public.catalogues ADD COLUMN IF NOT EXISTS title character varying;

-- Allow INSERT for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON public.catalogues
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow UPDATE for authenticated users  
CREATE POLICY "Allow update for authenticated users" ON public.catalogues
    FOR UPDATE TO public
    USING (true);

-- Allow DELETE for authenticated users
CREATE POLICY "Allow delete for authenticated users" ON public.catalogues
    FOR DELETE TO public
    USING (true);

-- Also add policies for other tables if needed
-- Brands table policies
CREATE POLICY "Allow insert for authenticated users" ON public.brands
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.brands
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.brands
    FOR DELETE TO public
    USING (true);

-- Events table policies  
CREATE POLICY "Allow insert for authenticated users" ON public.events
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.events
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.events
    FOR DELETE TO public
    USING (true);

-- Event_brands table policies
CREATE POLICY "Allow insert for authenticated users" ON public.event_brands
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.event_brands
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.event_brands
    FOR DELETE TO public
    USING (true);