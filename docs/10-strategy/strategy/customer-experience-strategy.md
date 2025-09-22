# Customer Experience Strategy (Schwalbe)

North Star
- Help people protect what matters through clarity, care, and calm. Technology serves the story; every touchpoint should reduce anxiety and create momentum.

Experience pillars
- Dignity: Respectful tone and pacing in sensitive contexts (estate, guardianship, legacy).
- Clarity: Explain next steps; show progress; avoid jargon; default to English with i18n variants.
- Control: Offer choices (AI vs manual), preview and undo, opt-in frequencies.
- Connection: Sofia assistant as a consistent guide, not a gimmick; family-centric language.

Narrative arcs (moments that matter)
1) First Safe Step (Onboarding)
   - Promise: “We’ll help you protect your life’s essentials.”
   - Actions: create account → add first document → see immediate value.
   - Signals: progress bar, reassurance microcopy, privacy highlights.
   - Evidence anchors: Web/Mobile features and guided flows. Source: /Users/luborfedak/Documents/Github/hollywood/docs/README.md:59-79

2) Discovery & Relief (First Document Save)
   - Promise: “We understand your document so you don’t have to.”
   - Actions: upload → OCR explains what it sees → suggests categories/tags → auto-fills fields.
   - Signals: transparent confidence scores; easy corrections; search now understands content.
   - Evidence anchors: OCR UX and transparency. Source: /Users/luborfedak/Documents/Github/hollywood/docs/OCR_SETUP_GUIDE.md:25-32,101-113

3) Family Protection Setup (Guardians & Sharing)
   - Promise: “Your loved ones will find exactly what they need.”
   - Actions: add family/guardians; define access; emergency readiness test.
   - Signals: plain-language checklists; role explanations; non-alarming guidance.
   - Evidence anchors: Family features, notifications. Source: /Users/luborfedak/Documents/Github/hollywood/docs/EMAIL_NOTIFICATIONS_SYSTEM.md:19-29

4) Ongoing Care (Gentle Reminders)
   - Promise: “We’ll tap you on the shoulder at the right time.”
   - Actions: date-aware reminders for expirations; preference controls; snooze.
   - Signals: empathetic emails, in-app notices, no hard sell.
   - Evidence anchors: Empathetic tone; trigger windows; metrics. Source: /Users/luborfedak/Documents/Github/hollywood/docs/NOTIFICATION_SYSTEM.md:55-65,171-191,221-235

5) Legacy Moments (Time Capsules & Milestones)
   - Promise: “Capture meaning—not just files.”
   - Actions: record a message; set unlock conditions; milestone animations.
   - Signals: ceremonial copy; opt-in reminders; clear consent patterns.
   - Evidence anchors: Time Capsule & Legacy features. Source: /Users/luborfedak/Documents/Github/hollywood/docs/README.md:66-79

Channel strategy
- In-app: progress modules, celebratory micro-moments, calm empty states.
- Email (Resend): welcome, task nudges, expiry notices, security alerts, subscription lifecycle; formal/respectful tone. Sources: EMAIL_NOTIFICATIONS_SYSTEM.md:9-19
- Push (optional): gentle reminders with context; deep link to the exact action. Source: EMAIL_NOTIFICATIONS_SYSTEM.md:21-29
- SMS (minimal): 2FA and emergencies only. Source: EMAIL_NOTIFICATIONS_SYSTEM.md:31-36

Copy principles (examples)
- Empathy first: “I noticed your Insurance Policy expires soon—shall we renew it together?”
- Active help: Offer one-click actions; never dead-end information.
- Transparency: Show why we’re asking something; link to privacy notes.
- Dignity: Avoid fear-based language; default to calm, professional tone. Source: NOTIFICATION_SYSTEM.md:171-191

Design system guidance
- Use Storybook pages to illustrate journeys (onboarding scenes, guardianship, time-capsule). Source: STORYBOOK_GUIDE.md:83-120
- Bake tone into story docs; include real sample copy; assert a11y and dark mode.

Measurement
- Leading: first document added, first guardian added, first time-capsule created.
- Lagging: document renewal rate post-reminder; search adoption; monthly active protectors.
- Comms: open rate, CTR, “completed action after nudge,” opt-out rate. Source: NOTIFICATION_SYSTEM.md:221-235

Operational guardrails
- Preferences: frequency controls and snooze to avoid annoyance; summarize history of nudges.
- Security & privacy: email content minimization; TLS; no sensitive content in messages; consent tracking. Source: NOTIFICATION_SYSTEM.md:236-251
- Error handling: log to Supabase + alert via Resend for critical failures; never expose secrets.

Implementation backlog (succinct)
- Onboarding: progressive profile, “first safe step” flow, celebratory microcopy.
- OCR UX: confidence display, entity chips, explainability panel; manual override mode. Source: OCR_SETUP_GUIDE.md:101-113,166-177
- Guardianship: invite flow, emergency readiness test, role cards.
- Notifications: preference center, empathetic templates, deliverability checks.
- Storybook: journey stories + a11y, regression and interaction tests.

