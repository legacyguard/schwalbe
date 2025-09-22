# Phase 17 – Documents & OCR (Upload, Categorization, Expiry)

Purpose
Implement document management with OCR and expiry detection, integrated with reminders.

Inputs
- SPEC LINKS: documents/ocr spec
- STORAGE: S3 or equivalent

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Documents and OCR
CONTEXT: Drag-and-drop upload, OCR text extraction, categorization suggestions, expiry detection, and reminder hooks.
SCOPE:
- Upload UI + storage wiring
- OCR pipeline (Vision/Tesseract) and text extraction
- Categorization suggestions + expiry detection
- Reminder hooks on expiring docs
NON_GOALS:
- Full DMS imports
ACCEPTANCE CRITERIA:
- Upload works; OCR text available; expiry reminders created
DELIVERABLES:
- storage/OCR code, UI, docs
CONSTRAINTS:
- Secrets via env; privacy rules; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- OCR accuracy smoke test; storage/security review
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Documents & OCR
CONTEXT:
- Specs: specs/006-document-vault/plan.md, data-model.md, quickstart.md
- Existing function: supabase/functions/intelligent-document-analyzer/index.ts
SCOPE:
- Upload UI + storage wiring under apps/web/src/features/documents/
- OCR pipeline using existing function; store extracted text
- Categorization suggestions + expiry detection
- Reminder hooks on expiring docs
NON_GOALS:
- Full DMS imports
ACCEPTANCE CRITERIA:
- Upload works; OCR text available; expiry reminders created
DELIVERABLES:
- storage/OCR code, UI, docs
CONSTRAINTS:
- Secrets via env; privacy rules; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- OCR smoke test; storage/security review
```
