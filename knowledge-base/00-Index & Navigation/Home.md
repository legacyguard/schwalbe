# 🏠 LegacyGuard Project Knowledge Base

Welcome to the centralised knowledge base for the LegacyGuard project. This Obsidian vault contains all project documentation, organized for easy navigation and discovery.

## 📍 Quick Navigation

### Core Areas

- [[01-Architecture/System Overview|System Architecture]]
- [[02-Development/Getting Started|Development Guide]]
- [[03-Features/Will Creation/Will Creation Overview|Features]]
- [[04-Operations/Monitoring/Monitoring Overview|Operations]]
- [[05-Product/User Stories/User Stories Overview|Product]]

### Key Resources

- [[Project Overview]] - High-level project summary
- [[Knowledge Map]] - Visual overview of all documentation
- [[02-Development/Coding Standards|Coding Standards]]
- [[04-Operations/Security/Security Overview|Security Guidelines]]

## 🔍 Search & Discovery

Use the search function (Ctrl+Shift+F) to find specific topics, or browse by tags:

- #architecture
- #development
- #features
- #operations
- #product
- #security

## 📊 Project Status

```dataview
TABLE status as Status, priority as Priority, due as Due
FROM "05-Product/Roadmaps"
WHERE status != "completed"
SORT priority desc, due asc
```

## 🏷️ Recent Updates

```dataview
TABLE file.mtime as "Last Modified", file.size as "Size"
FROM ""
SORT file.mtime desc
LIMIT 10
```

## 📝 Templates

Use these templates for consistent documentation:

- [[07-Templates/Feature Spec]]
- [[07-Templates/Decision Record]]

---

*This knowledge base is maintained in the `knowledge-base/` folder of the Schwalbe repository.*
