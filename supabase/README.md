# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the project settings

## Environment Variables

Add these to your `.env.local` file:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Setup

### 1. Create Documents Table

Run the SQL migration in `/supabase/migrations/001_create_documents_table.sql` in your Supabase SQL Editor:

This creates:

- `documents` table for storing document metadata
- `user_id` field automatically populated via `auth.uid()`
- Foreign key relationship to `auth.users` table
- Row Level Security (RLS) policies for user data isolation
- Indexes for performance
- Auto-update trigger for `updated_at` field

**Important**: The `user_id` is automatically set from the authenticated user's session. No need to pass it from the frontend.

### 2. Create Storage Bucket

In Supabase Dashboard:

1. Go to Storage section
2. Create a new bucket called `user_documents`
3. Set it as a **private** bucket (not public)
4. Add RLS policies for the bucket:

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Features Implemented

### Document Upload

- Files are encrypted client-side before upload
- Encrypted files stored in Supabase Storage
- Metadata saved to `documents` table
- Automatic refresh of document list after upload

### Document List

- Fetches documents from database
- Falls back to localStorage if database unavailable
- Real-time updates when new documents are uploaded
- Shows loading and error states

## Security Features

1. **Row Level Security (RLS)**: Users can only see/modify their own documents
2. **Client-side encryption**: Files are encrypted before leaving the browser
3. **User isolation**: Each user's files are stored in their own folder
4. **Secure metadata**: Document metadata is stored separately from file content

## Testing

1. Upload a document using the DocumentUploader component
2. Check that the document appears in the DocumentList
3. Verify in Supabase Dashboard:
   - Document metadata in `documents` table
   - Encrypted file in Storage bucket

## Troubleshooting

### "Storage bucket not configured"

- Make sure you've created the `user_documents` bucket in Supabase Storage

### "Failed to save document metadata"

- Check that the `documents` table exists
- Verify RLS policies are enabled
- Ensure user is authenticated

### Documents not showing

- Check browser console for errors
- Verify Supabase environment variables are set
- Check network tab for API responses
