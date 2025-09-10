# Data model outline (first pass)

## Core

- User(id, profile, locale)
- FamilyMember(id, userId?, name, relation, birthDate)
- Relationship(id, fromMemberId, toMemberId, type)
- RoleAssignment(id, memberId, role, conditions)
- Milestone(id, type, status, completedAt)
- Achievement(id, memberId, type, awardedAt)

## Documents

- Document(id, ownerId, bundleId?, categoryId, title, storageUri, checksum, encrypted)
- DocumentVersion(id, documentId, createdAt, metadata)
- Category(id, name, parentId?)
- Bundle(id, type: property|vehicle|account|custom, title, metadata)
- Metadata(key, value, documentId?)

## Will & legacy

- Will(id, userId, jurisdiction, status, draftedAt, finalizedAt)
- Bequest(id, willId, beneficiaryId, assetRef?, percentage?)
- Executor(id, willId, memberId)
- LegalTemplate(id, jurisdiction, version, schema)

## Guardians & emergency

- Guardian(id, memberId, role, accessScope)
- EmergencyTrigger(id, type, threshold)
- AccessPolicy(id, guardianId, conditions, stage)
- AuditEvent(id, actorId, targetId, action, at)

## Professional network

- Professional(id, verified, barNumber, specializations)
- ReviewRequest(id, userId, willId?, status, tier)
- Consultation(id, professionalId, userId, startAt, duration, type)
- Commission(id, professionalId, amount, bookingId?)
- Specialization(id, name)

## Messaging & notifications

- VideoMessage(id, toMemberId, deliveryRule, mediaUri, encrypted)
- Notification(id, userId, type, payload, seen)
- Suggestion(id, userId, type, payload, createdAt)

## Internationalization

- LocaleContent(namespace, key, value, locale)

## Relations (examples)

- User 1—N FamilyMember
- FamilyMember N—N Relationship
- FamilyMember 1—N RoleAssignment
- Document 1—N DocumentVersion
- Bundle 1—N Document
- Will 1—N Bequest
- Will 1—1 Executor
- Professional 1—N ReviewRequest, 1—N Consultation
