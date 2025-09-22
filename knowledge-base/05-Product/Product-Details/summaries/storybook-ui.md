# Storybook and UI (Summary for Schwalbe)

Purpose
- Maintain a living, narrative-rich component library that accelerates UI work and keeps the customer experience cohesive.

What to run
- Start: npm run storybook; Build static: npm run build-storybook; default at http://localhost:6006. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/STORYBOOK_GUIDE.md:7-23

Coverage and categories
- Core UI: Buttons, Inputs, Select, Checkbox, RadioGroup, Switch, Slider, Calendar, Form; Layout: Card, Dialog, Sheet, Drawer, Accordion, Tabs; Data: Table, Badge, Avatar, Progress, KPI, Charts; Nav: NavigationMenu, Breadcrumb, Pagination, Sidebar, CommandMenu; Feedback: Alert, AlertDialog, Toast, Tooltip, Popover, HoverCard. Evidence: STORYBOOK_GUIDE.md:26-82
- App components: Auth (SignIn/Up, ProtectedRoute), Dashboard (Layout, PillarCard), Family (FamilyShield, GuardianSetup), Documents (DocumentCard, IntelligentOrganizer, VaultPage), Legacy (LegacyGarden, TimeCapsule), AI (SofiaSystem, Firefly). Evidence: STORYBOOK_GUIDE.md:83-120

Design system
- Theming variables, typography, spacing guidance to reinforce consistent tone/voice. Evidence: STORYBOOK_GUIDE.md:121-154

Writing great stories
- Basic meta/args structure; interactive controls; real-world scenarios; a11y; dark mode. Evidence: STORYBOOK_GUIDE.md:155-188,190-198

Testing and addons
- Visual regression (Chromatic), interaction play functions, a11y addon; addons essentials/a11y/themes/viewport/docs. Evidence: STORYBOOK_GUIDE.md:199-237,208-219,221-227

Build & deploy
- Build command and Vercel deployment on push to main; CI example provided. Evidence: STORYBOOK_GUIDE.md:261-284

Quality bar
- Component/variant/interaction/documentation coverage goals; performance and accessibility targets. Evidence: STORYBOOK_GUIDE.md:397-412

Schwalbe adaptations
- Use stories to demonstrate the emotional journey (moments that matter) and copy tone; include storybook pages for onboarding scenes, time-capsule moments, and guardianship flows using realistic content.

