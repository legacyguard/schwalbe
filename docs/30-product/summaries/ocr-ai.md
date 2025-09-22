# OCR and AI (Summary for Schwalbe)

Purpose
- Provide intelligent, privacy-conscious document understanding with a transparent user experience and graceful fallbacks.

What’s implemented (reference)
- Components: DocumentScanner, EnhancedDocumentUploader; Google Vision integration; classification (30+ types); entity extraction; progress feedback. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/OCR_SETUP_GUIDE.md:9-17,33-40
- Data: documents table with OCR fields (ocr_text, extracted_entities, classification_confidence); GIN indexes; JSONB storage; search functions. Evidence: OCR_SETUP_GUIDE.md:20-24
- UX: results display, auto-populated forms, confidence scores, dual modes (AI + manual). Evidence: OCR_SETUP_GUIDE.md:25-32,101-113
- Dev tooling: enable-apis script, test-ocr script, serverless endpoint; testing steps. Evidence: OCR_SETUP_GUIDE.md:42-48,49-79

Production readiness
- Enable billing and Vision API; recommended for production; free tier exists; roles/permissions checklist. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/GOOGLE_VISION_SETUP.md:12-42
- Fallbacks: Tesseract.js local OCR and multi-provider strategy for resilience. Evidence: GOOGLE_VISION_SETUP.md:43-91
- Cost awareness: Vision pricing and free tier; estimates. Evidence: OCR_SETUP_GUIDE.md:125-130; GOOGLE_VISION_SETUP.md:135-141

Security
- Server-side processing of Vision credentials; environment-based configuration; input validation; maintain client-side encryption. Evidence: OCR_SETUP_GUIDE.md:33-40,184-190
- Secret and quota hygiene for Google Cloud; rotate keys regularly. Evidence: GOOGLE_VISION_SETUP.md:142-148

User experience
- Real-time feedback, transparent confidence, dual-mode choice, exact text search, entity chips; explainability and control reduce anxiety. Evidence: OCR_SETUP_GUIDE.md:101-113,166-177,191-197

Schwalbe adaptations
- Prefer Google Vision in production (with billing + budgets + quotas), Tesseract fallback locally or as a no-cloud mode for privacy.
- Log OCR pipeline errors to Supabase logs + DB and alert via Resend for critical failures (replaces Sentry) per project rules.

