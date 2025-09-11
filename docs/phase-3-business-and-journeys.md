# Phase 3 – Business Philosophy & Customer Journey Maps

This document defines a concise business foundation and journey framework to guide product decisions and later funnel instrumentation. All content is in English.

## Philosophy & Brand
- Mission: Help families and professionals protect legacies through clear, compliant, and compassionate tools.
- Positioning: A practical, modern alternative to scattered legal and estate tools—unifying documents, reviews, and planning in one place.
- Value ladder:
  1) Organize: capture documents, assets, essentials (free tier)
  2) Understand: quick insights, time capsule snapshots, guided next steps
  3) Improve: professional reviews, consultations, personalized plans
  4) Grow: partnerships, collaboration, and compliance at scale
- Brand promises:
  - Clarity over complexity (plain language, explain the “why”)
  - Privacy by default (minimal data, least privilege)
  - Progress you can feel (visible milestones and before/after)
- Principles:
  - Build components first, connect later
  - Accessibility and performance are features
  - Legal compliance by design

## Personas & JTBD
- Consumer (Family Steward)
  - Jobs: “Make sure my family can access what matters”, “Reduce chaos and risk”
  - Pains: disorganization, uncertainty, fear of legal loopholes
  - Gains: confidence, clarity, readiness
- Professional (Attorney/Reviewer)
  - Jobs: “Review documents efficiently”, “Win trust and repeat business”
  - Pains: verification overhead, unclear scope, scheduling friction
  - Gains: steady pipeline, transparent turnaround, fair compensation
- Partner (B2B2C Affiliate)
  - Jobs: “Offer value-add to clients”, “Share in monetization”
  - Pains: integration effort, brand control, compliance risks
  - Gains: new revenue stream, brand lift, minimal maintenance

## Journey Maps & Aha Moments
- Consumer journey: Awareness → Consideration → Onboarding → Activation → Habit → Advocacy
  - Aha triggers: clear inventory of assets, quick professional feedback, secure sharing
  - Friction points: data entry, legal jargon, next-step ambiguity
- Professional journey: Invitation → Verification → First Assignment → Routine → Growth
  - Aha triggers: fast matching, transparent pricing, reviews completion metrics
  - Friction points: credentialing back-and-forth, unclear SLAs
- Partner journey: Discovery → Agreement → Enablement → Campaign → Renewal
  - Aha triggers: simple creative package, clear payout reporting
  - Friction points: compliance review, branding alignment

## Success Metrics & Instrumentation (Later)
- North stars: time-to-value (consumer), review completion time (professional)
- Funnel metrics: conversion by step, activation rate, D7 retention, NPS, LTV/CAC
- Post-MVP instrumentation: implement via Supabase Edge Functions (no Sentry). Structured events with user/session context.

## Immediate Constraints
- No “glue” between features during component build phases
- No env-based configuration until integration phases
- Documentation/specs can iterate independently of wiring

