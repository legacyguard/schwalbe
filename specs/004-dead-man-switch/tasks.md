# Tasks: Dead Man Switch (Steps 1–10)

## Ordering & Rules

- Complete 001–003 prerequisites.
- Each phase validated before proceeding.
- Production readiness requires green tests + security checks.

## T400 Prerequisites & Setup

- [ ] T400 Create feature branch `feature/dms-004`
- [ ] T401 Configure Supabase env (.env, project ref, anon/service keys)
- [ ] T402 Enable Vercel Cron and secrets for functions

## Step 1: Authentication & Profiles

- [ ] T410 Integrate Supabase Auth provider and session hooks
- [ ] T411 Create `user_profiles` table and seed on sign-up
- [ ] T412 Add protected route guards and logout flow

## Step 2: Database & Security

- [ ] T420 Apply DMS migrations; verify RLS policies
- [ ] T421 Create SQL functions for defaults and cleanup
- [ ] T422 Add DB indexes and EXPLAIN plans for heavy queries

## Step 3: Guardian Management

- [ ] T430 Guardian invite flow (email link)
- [ ] T431 Guardian verify/accept UI and API
- [ ] T432 Manage roles, permissions, and removal

## Step 4: Email/SMS Notifications

- [ ] T440 Wire Resend/SendGrid provider and templates
- [ ] T441 Implement notification queue + retries
- [ ] T442 Track delivery status and bounce handling

## Step 5: Activity Tracking

- [ ] T450 Implement activity recording service
- [ ] T451 Hook into login/page/document events
- [ ] T452 Build user activity timeline UI

## Step 6: Cron + Edge Functions

- [ ] T460 Schedule inactivity checker (Vercel Cron)
- [ ] T461 Implement health check escalations
- [ ] T462 Add rate limiting and backoff

## Step 7: Emergency Access Control

- [ ] T470 Scoped access token issuance (time-limited)
- [ ] T471 Access approval workflow (guardian moderation)
- [ ] T472 Full audit logging on access

## Step 8: Security & Encryption

- [ ] T480 Secret management and KMS plan
- [ ] T481 Client-side encryption patterns for sensitive data
- [ ] T482 Threat model and penetration checklist

## Step 9: Observability & Errors

- [ ] T490 Structured logs, alerts, dashboards
- [ ] T491 User-facing error states and retries
- [ ] T492 Incident runbook and SLOs

## Step 10: Testing & QA

- [ ] T4A0 Unit tests (services, functions, SQL)
- [ ] T4A1 Integration tests (Edge Functions + DB)
- [ ] T4A2 E2E happy path + false-positive scenarios
- [ ] T4A3 Load tests for notification spikes
