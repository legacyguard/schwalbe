-- Create legacy_items table
CREATE TABLE IF NOT EXISTS public.legacy_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('document', 'wish', 'memory', 'instruction', 'asset')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    file_urls TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.legacy_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own legacy items" ON public.legacy_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legacy items" ON public.legacy_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated policy with WITH CHECK to prevent ownership transfer
DROP POLICY IF EXISTS "Users can update own legacy items" ON public.legacy_items;
CREATE POLICY "Users can update own legacy items" ON public.legacy_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own legacy items" ON public.legacy_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to prevent user_id changes
CREATE OR REPLACE FUNCTION public.prevent_user_id_change()
RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE
    jwt  jsonb;
    role text;
BEGIN
    -- Allow trusted automation (service_role) to bypass immutability.
    -- Works when a Supabase JWT is present; otherwise role will be empty.
    jwt  := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
    role := COALESCE(jwt ->> 'role', '');

    IF role <> 'service_role'
       AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'user_id is immutable and cannot be changed';
    END IF;
    RETURN NEW;
END $fn$;
-- Create trigger to enforce user_id immutability
DROP TRIGGER IF EXISTS trg_legacy_items_user_id_immutable ON public.legacy_items;
CREATE TRIGGER trg_legacy_items_user_id_immutable
    BEFORE UPDATE OF user_id ON public.legacy_items
    FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();

-- Create indexes for better performance
CREATE INDEX idx_legacy_items_user_id ON public.legacy_items(user_id);
CREATE INDEX idx_legacy_items_category ON public.legacy_items(category);
CREATE INDEX idx_legacy_items_status ON public.legacy_items(status);
CREATE INDEX idx_legacy_items_priority ON public.legacy_items(priority);
CREATE INDEX idx_legacy_items_due_date ON public.legacy_items(due_date);
CREATE INDEX idx_legacy_items_created_at ON public.legacy_items(created_at);

-- Create updated_at trigger
CREATE TRIGGER handle_legacy_items_updated_at
    BEFORE UPDATE ON public.legacy_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
