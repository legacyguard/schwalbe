-- Seed data for LegacyGuard project
-- This file contains sample data for development and testing
-- NOTE: These inserts require auth.users to exist first, so they're commented out for now

-- Insert sample profiles (these would normally be created by auth.users trigger)
-- Uncomment after creating test users via Supabase CLI or Studio
/*
INSERT INTO public.profiles (id, email, full_name, phone, date_of_birth, emergency_contacts, preferences) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'john.doe@example.com',
    'John Doe',
    '+1234567890',
    '1980-01-15',
    '[{"name": "Jane Doe", "relationship": "Spouse", "phone": "+1234567891"}, {"name": "Mike Smith", "relationship": "Friend", "phone": "+1234567892"}]',
    '{"theme": "light", "notifications": true, "language": "en"}'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'jane.smith@example.com',
    'Jane Smith',
    '+1234567893',
    '1985-03-20',
    '[{"name": "John Smith", "relationship": "Spouse", "phone": "+1234567894"}]',
    '{"theme": "dark", "notifications": false, "language": "en"}'
);

-- Insert sample legacy items
INSERT INTO public.legacy_items (user_id, title, description, category, status, priority, due_date, tags, metadata) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Family Photo Album',
    'Digital collection of family photos from the last 20 years',
    'memory',
    'completed',
    'high',
    '2024-12-31',
    ARRAY['family', 'photos', 'memories'],
    '{"location": "cloud", "backup_status": "verified", "estimated_size": "2.5GB"}'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Last Will and Testament',
    'Legal document outlining asset distribution and final wishes',
    'document',
    'in_progress',
    'urgent',
    '2024-06-30',
    ARRAY['legal', 'estate', 'important'],
    '{"lawyer_contact": "Smith & Associates", "review_frequency": "annual", "next_review": "2024-12-01"}'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Family Vacation Home',
    'Instructions for maintaining and managing the family vacation property',
    'asset',
    'draft',
    'medium',
    '2025-01-15',
    ARRAY['property', 'family', 'maintenance'],
    '{"property_address": "123 Beach Road", "insurance_info": "ABC Insurance", "maintenance_schedule": "quarterly"}'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Personal Wishes for End of Life',
    'Detailed preferences for medical care and end-of-life decisions',
    'wish',
    'completed',
    'high',
    '2024-12-31',
    ARRAY['medical', 'end-of-life', 'preferences'],
    '{"healthcare_proxy": "John Smith", "dni_status": true, "organ_donation": true}'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Family Recipes Collection',
    'Traditional family recipes passed down through generations',
    'memory',
    'in_progress',
    'medium',
    '2025-03-01',
    ARRAY['family', 'recipes', 'tradition'],
    '{"total_recipes": 45, "completed_recipes": 23, "format": "digital"}'
);
*/

-- Create some sample storage buckets (these would be created by Supabase automatically)
-- Note: In a real setup, these would be created via the Supabase dashboard or CLI
