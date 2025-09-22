# Asset Tracking Core

This document describes the data model, migrations, and UI for the Asset Tracking core feature.

Scope
- Data model + migrations for assets
- CRUD UI with filters and charts under apps/web/src/features/assets/
- Templates by category; conflict detection/report

Non-goals
- External financial APIs

Data model
- Table: public.assets
  - id uuid pk
  - user_id uuid -> auth.users(id)
  - category enum asset_category: property | vehicle | financial | business | personal
  - name text
  - estimated_value numeric(18,2)
  - currency text default 'USD'
  - acquired_at date
  - notes text
  - metadata jsonb
  - created_at timestamptz
  - updated_at timestamptz
- RLS: users can only access their own rows (auth.uid())
- Indexes: user_id, category, updated_at desc
- Trigger: handle_updated_at updates updated_at on change

Migrations
- supabase/migrations/20250915200500_create_assets_tables.sql
- optional seed: 20250915200510_seed_assets_notes.sql

Frontend
- Routes: /assets (dashboard), /assets/list, /assets/new, /assets/:id/edit
- Components:
  - AssetsDashboard: KPI cards + CategoryChart + ConflictReport
  - AssetsList: search, filter, list with edit/delete actions
  - AssetForm: create/edit with templates by category
  - charts/CategoryChart: accessible bar chart
- State hooks (Supabase): useAssets, useAssetById, useCreateAsset, useUpdateAsset, useDeleteAsset, useAssetsSummary
- Conflict detection moved to packages/logic/src/assets/conflicts.ts

i18n/a11y
- UI in English; labels and aria-* attributes added for inputs and interactive controls
- Ready to integrate into i18n resources; English copy kept minimal

Tests
- Playwright e2e smoke: apps/web/tests/e2e/assets-crud.spec.ts (navigates and runs form flow)
- Suggest adding unit tests for detectAssetConflicts and hooks in a follow-up

Usage
- Navigate to /assets
- Create assets via /assets/new
- View summaries and conflicts on dashboard

Notes
- Requires user authentication for write operations via Supabase RLS
- Types can be expanded in @schwalbe/shared as needed later