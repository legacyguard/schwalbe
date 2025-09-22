# API Overview (Schwalbe)

Scope
- The Hollywood OpenAPI spec defines endpoints for Auth, Documents, Family, Will, Emergency, Vault, AI, and OCR.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/api/openapi.yaml:1-16,28-45

Representative Endpoints (for parity targets)
- Documents: list, upload, get/update/delete, share.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/api/openapi.yaml:103-160,161-213,214-296,297-351
- Will: get/create/update.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/api/openapi.yaml:426-482
- Emergency: access request and test notifications.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/api/openapi.yaml:483-521,522-549

Notes
- Authentication: Clerk/JWT per spec; Schwalbe can retain Clerk unless requirements change.
- Use this spec as guidance for interfaces even if initial Schwalbe MVP uses client-only features with Supabase.

