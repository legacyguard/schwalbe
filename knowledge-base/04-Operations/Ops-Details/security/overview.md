# Security Overview (Schwalbe)

Principles
- Zero Trust, Defense-in-Depth, Least Privilege, Secure-by-Default.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY.md:37-43

Layers
- Security middleware: headers, rate limiting, session validation, threat detection, input sanitization, logging.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY.md:125-135
- Encryption: Unified TweetNaCl XSalsa20-Poly1305 secretbox; PBKDF2 (100k iterations); random 24-byte nonce; consistent across Web/Mobile/Node.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY.md:46-71
- Security Headers: CSP, X-Frame-Options, nosniff, COOP/COEP/CORP.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY.md:114-121

Schwalbe-specific
- Logging & incident tracking via Supabase logs and DB (no Sentry).
- Maintain consistent middleware across web and mobile web surfaces (where applicable), and document Edge Function security policies.

