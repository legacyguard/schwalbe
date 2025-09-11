# Phase 2G – Time Capsule & Legacy Features Migration Plan

Goals
- Introduce versioned snapshots (“Time Capsule”) and legacy views.
- Avoid DB migrations until UI/services stabilize.

Plan
1) Feature definition
   - Snapshot: stored JSON of key entities (docs, settings) with timestamp and label.
   - Views: UI to browse, diff, and restore (simulated restore only until DB ok).
2) Storage strategy (deferred)
   - For demo: localStorage or in-memory to simulate versioning; abstract behind a service.
   - For production: Supabase table (time_capsules) with RLS and retention policies (deferred).
3) Minimal UI
   - Snapshot button and history list in demo page.
   - Diff view stub (side-by-side structured JSON).
4) Adoption sequence
   - Start with professional application payload snapshots.
   - Extend to directory filters/prefs and later documents.
5) Risks
   - Data shape drift; use adapters and version stamps.
   - User confusion; require confirm dialogs; read-only for now.

