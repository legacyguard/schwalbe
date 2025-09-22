# 🗺️ Knowledge Map

This page provides a visual overview of the Schwalbe project knowledge base structure and relationships.

## 📂 Folder Structure

```text
knowledge-base/
├── 00-Index & Navigation/     # Entry points and navigation
├── 01-Architecture/          # System design and technical docs
├── 02-Development/           # Implementation guides and standards
├── 03-Features/              # Feature-specific documentation
│   ├── Will Creation/
│   ├── Document Management/
│   ├── User Authentication/
│   └── Payment Integration/
├── 04-Operations/            # DevOps, monitoring, security
│   ├── Monitoring/
│   ├── Security/
│   └── Incident Response/
├── 05-Product/               # Business and product docs
│   ├── User Stories/
│   ├── Requirements/
│   └── Roadmaps/
├── 06-Archive/               # Historical documentation
└── 07-Templates/             # Note templates
```

## 🔗 Key Relationships

### Architecture → Development

- [[01-Architecture/System Overview]] → [[02-Development/Getting Started]]
- [[01-Architecture/Database Schema]] → [[02-Development/Coding Standards]]

### Features → Operations

- [[03-Features/Will Creation/Will Creation Overview]] → [[04-Operations/Monitoring/Monitoring Overview]]
- [[03-Features/Payment Integration/Payment Integration Overview]] → [[04-Operations/Security/Security Overview]]

### Product → Features

- [[05-Product/Requirements/Requirements Overview]] → [[03-Features/Will Creation/Will Creation Overview]]
- [[05-Product/Roadmaps/Current Roadmap]] → All feature folders

## 📊 Content Overview

### By Category

```dataview
TABLE rows.file.link as "Document", rows.category as "Category"
FROM "00-Index & Navigation/Knowledge Map"
FLATTEN file.outlinks as outlink
WHERE outlink
GROUP BY outlink
FLATTEN outlink as file
FLATTEN regexmatch("^\d\d-", file.path) as category
WHERE category
```

### Recent Updates

```dataview
TABLE file.mtime as "Modified", file.size as "Size"
FROM ""
WHERE file.path != "00-Index & Navigation/Knowledge Map.md"
SORT file.mtime desc
LIMIT 20
```

### Document Status

```dataview
TABLE status as "Status", priority as "Priority"
FROM ""
WHERE status
SORT priority desc
```

## 🏷️ Tag Index

### Core Tags

- #architecture - System design and technical architecture
- #development - Development processes and standards
- #features - Feature specifications and implementation
- #operations - DevOps, monitoring, and maintenance
- #product - Business requirements and roadmaps
- #security - Security guidelines and practices

### Status Tags

- #draft - Work in progress
- #review - Needs review
- #approved - Finalized
- #deprecated - No longer current

## 📈 Progress Tracking

### Architecture Completion

- [x] System Overview
- [ ] Database Schema
- [ ] API Design
- [ ] Technology Stack

### Development Completion

- [x] Getting Started
- [ ] Coding Standards
- [ ] Testing Strategy
- [ ] Deployment Guide

### Features Completion

- [ ] Will Creation
- [ ] Document Management
- [ ] User Authentication
- [ ] Payment Integration

## 🔍 Quick Access

- [[Home]] - Main entry point
- [[Project Overview]] - High-level summary
- [[02-Development/Getting Started]] - New developer onboarding
- [[04-Operations/Security/Security Overview]] - Security guidelines

---

*This map is automatically updated as new documents are added. Use the graph view to explore relationships visually.*
