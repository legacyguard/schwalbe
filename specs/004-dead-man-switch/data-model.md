# Data Model: Dead Man Switch

## Core Entities

- FamilyShieldSettings(id, userId, inactivityPeriodMonths, requiredGuardiansForActivation, isEnabled, lastActivityCheck, shieldStatus, createdAt, updatedAt)
- EmergencyDetectionRule(id, userId, ruleName, description, ruleType, isEnabled, triggerConditions, responseActions, priority, lastTriggeredAt, triggerCount, createdAt, updatedAt)
- UserHealthCheck(id, userId, checkType, status, scheduledAt, respondedAt, responseMethod, metadata, createdAt)
- Guardian(id, userId, email, name, phone?, isActive, canTriggerEmergency, createdAt)
- GuardianNotification(id, guardianId, userId, notificationType, title, message, actionRequired, actionUrl, verificationToken, priority, deliveryMethod, sentAt, readAt, respondedAt, expiresAt, deliveryError, attemptedAt, deliveryStatus, createdAt)
- SurvivorAccessRequest(id, userId, accessToken, requesterEmail, requesterName, relationship, purpose, requestedAccessTypes, status, reviewedBy, reviewedAt, reviewNotes, expiresAt, ipAddress, userAgent, createdAt)
- EmergencyAccessAudit(id, userId, accessorType, accessorId, accessType, resourceType, resourceId, action, success, ipAddress, userAgent, metadata, createdAt)

## Relations

- User 1—1 FamilyShieldSettings
- User 1—N EmergencyDetectionRule
- User 1—N UserHealthCheck
- User 1—N Guardian
- Guardian 1—N GuardianNotification
- User 1—N SurvivorAccessRequest
- User 1—N EmergencyAccessAudit

## Indexing & Performance

- Composite indexes on status + timestamps for sweepers.
- Partial indexes for pending/active records.
- GIN on JSONB payloads where applicable.
