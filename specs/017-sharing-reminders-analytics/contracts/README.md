# Sharing, Reminders, Analytics, and Sofia AI Expansion - API Contracts

This directory contains the API contracts for the Sharing, Reminders, Analytics, and Sofia AI Expansion system.

## API Contract Specifications

The system uses the following API contract patterns for secure, scalable integration:

### sharing-system-api.yaml

#### Sharing System API

```yaml
openapi: 3.0.3
info:
  title: Sharing System API
  version: 1.0.0
  description: API for secure document and resource sharing

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /sharing/config:
    post:
      summary: Create sharing configuration
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - resourceType
                - resourceId
                - permissions
              properties:
                resourceType:
                  type: string
                  enum: [document, will, vault, family]
                resourceId:
                  type: string
                permissions:
                  type: object
                  properties:
                    read:
                      type: boolean
                    download:
                      type: boolean
                    comment:
                      type: boolean
                    share:
                      type: boolean
                expiryHours:
                  type: integer
                  minimum: 1
                  maximum: 8760
                maxAccessCount:
                  type: integer
                  minimum: 1
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: Sharing configuration created
          content:
            application/json:
              schema:
                type: object
                properties:
                  sharingConfig:
                    type: object
                    properties:
                      id:
                        type: string
                      shareUrl:
                        type: string
                      permissions:
                        type: object
                      expiresAt:
                        type: string
                        format: date-time
        '400':
          description: Invalid request
        '401':
          description: Unauthorized
        '429':
          description: Rate limit exceeded

  /sharing/config:
    get:
      summary: Get sharing configurations
      security:
        - bearerAuth: []
      parameters:
        - name: resourceType
          in: query
          schema:
            type: string
            enum: [document, will, vault, family]
        - name: status
          in: query
          schema:
            type: string
            enum: [active, expired, revoked]
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: Sharing configurations retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  sharingConfigs:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        shareUrl:
                          type: string
                        permissions:
                          type: object
                        expiresAt:
                          type: string
                          format: date-time
                        accessCount:
                          type: integer
                  total:
                    type: integer
                  hasMore:
                    type: boolean

  /sharing/config/{id}:
    get:
      summary: Get sharing configuration
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Sharing configuration retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  sharingConfig:
                    type: object
                    properties:
                      id:
                        type: string
                      shareUrl:
                        type: string
                      permissions:
                        type: object
                      expiresAt:
                        type: string
                        format: date-time
                      sharingLogs:
                        type: array
                        items:
                          type: object
                          properties:
                            action:
                              type: string
                            timestamp:
                              type: string
                              format: date-time
                            userId:
                              type: string
                            ipAddress:
                              type: string
                            userAgent:
                              type: string
    put:
      summary: Update sharing configuration
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                permissions:
                  type: object
                  properties:
                    read:
                      type: boolean
                    download:
                      type: boolean
                    comment:
                      type: boolean
                    share:
                      type: boolean
                expiresAt:
                  type: string
                  format: date-time
                isActive:
                  type: boolean
      responses:
        '200':
          description: Sharing configuration updated
        '404':
          description: Sharing configuration not found

    delete:
      summary: Delete sharing configuration
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Sharing configuration deleted
        '404':
          description: Sharing configuration not found

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    SharePermissions:
      type: object
      properties:
        read:
          type: boolean
        download:
          type: boolean
        comment:
          type: boolean
        share:
          type: boolean

    SharingConfig:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        resourceType:
          type: string
          enum: [document, will, vault, family]
        resourceId:
          type: string
        shareUrl:
          type: string
        permissions:
          $ref: '#/components/schemas/SharePermissions'
        expiresAt:
          type: string
          format: date-time
        maxAccessCount:
          type: integer
        accessCount:
          type: integer
        createdAt:
          type: string
          format: date-time
        createdBy:
          type: string
        lastAccessedAt:
          type: string
          format: date-time
        isActive:
          type: boolean
```

### reminder-management-api.yaml

#### Reminder Management API

```yaml
openapi: 3.0.3
info:
  title: Reminder Management API
  version: 1.0.0
  description: API for intelligent reminder scheduling and delivery

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /reminders/rules:
    post:
      summary: Create reminder rule
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - scheduledAt
                - channels
              properties:
                title:
                  type: string
                  minLength: 1
                  maxLength: 200
                description:
                  type: string
                  maxLength: 1000
                scheduledAt:
                  type: string
                  format: date-time
                recurrenceRule:
                  type: string
                recurrenceEndAt:
                  type: string
                  format: date-time
                channels:
                  type: array
                  items:
                    type: object
                    required:
                      - type
                    properties:
                      type:
                        type: string
                        enum: [email, in_app, sms, push]
                      priority:
                        type: string
                        enum: [low, normal, high, urgent]
                        default: normal
                      enabled:
                        type: boolean
                        default: true
                priority:
                  type: string
                  enum: [low, medium, high, urgent]
                  default: medium
      responses:
        '201':
          description: Reminder rule created
          content:
            application/json:
              schema:
                type: object
                properties:
                  reminderRule:
                    type: object
                    properties:
                      id:
                        type: string
                      title:
                        type: string
                      scheduledAt:
                        type: string
                        format: date-time
                      channels:
                        type: array
                        items:
                          type: object
                      priority:
                        type: string
                      status:
                        type: string
        '400':
          description: Invalid request

  /reminders/rules:
    get:
      summary: Get reminder rules
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, paused, completed, cancelled]
        - name: priority
          in: query
          schema:
            type: string
            enum: [low, medium, high, urgent]
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: Reminder rules retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  reminderRules:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        title:
                          type: string
                        scheduledAt:
                          type: string
                          format: date-time
                        channels:
                          type: array
                          items:
                            type: object
                        priority:
                          type: string
                        status:
                          type: string
                  total:
                    type: integer
                  hasMore:
                    type: boolean

  /reminders/rules/{id}:
    put:
      summary: Update reminder rule
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  minLength: 1
                  maxLength: 200
                description:
                  type: string
                  maxLength: 1000
                scheduledAt:
                  type: string
                  format: date-time
                status:
                  type: string
                  enum: [active, paused, completed, cancelled]
                channels:
                  type: array
                  items:
                    type: object
                    properties:
                      type:
                        type: string
                        enum: [email, in_app, sms, push]
                      enabled:
                        type: boolean
      responses:
        '200':
          description: Reminder rule updated
        '404':
          description: Reminder rule not found

    delete:
      summary: Delete reminder rule
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Reminder rule deleted
        '404':
          description: Reminder rule not found

  /reminders/rules/{id}/execute:
    post:
      summary: Execute reminder
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                channel:
                  type: string
                  enum: [email, in_app, sms, push]
                force:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Reminder executed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  deliveryId:
                    type: string
                  scheduledFor:
                    type: string
                    format: date-time

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ReminderRule:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        title:
          type: string
        description:
          type: string
        scheduledAt:
          type: string
          format: date-time
        recurrenceRule:
          type: string
        recurrenceEndAt:
          type: string
          format: date-time
        channels:
          type: array
          items:
            type: object
            properties:
              type:
                type: string
                enum: [email, in_app, sms, push]
              priority:
                type: string
                enum: [low, normal, high, urgent]
              enabled:
                type: boolean
        priority:
          type: string
          enum: [low, medium, high, urgent]
        status:
          type: string
          enum: [active, paused, completed, cancelled]
        nextExecutionAt:
          type: string
          format: date-time
        lastExecutedAt:
          type: string
          format: date-time
        executionCount:
          type: integer
        maxExecutions:
          type: integer
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

### analytics-tracking-api.yaml

#### Analytics Tracking API

```yaml
openapi: 3.0.3
info:
  title: Analytics Tracking API
  version: 1.0.0
  description: API for privacy-first analytics tracking and insights

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /analytics/events:
    post:
      summary: Track analytics event
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - eventType
                - eventCategory
                - eventData
              properties:
                eventType:
                  type: string
                  minLength: 1
                  maxLength: 100
                eventCategory:
                  type: string
                  enum: [sharing, reminder, sofia, document, will, vault, family, navigation, engagement]
                eventData:
                  type: object
                  additionalProperties: true
                userConsentGiven:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Event tracked
          content:
            application/json:
              schema:
                type: object
                properties:
                  eventId:
                    type: string
                  success:
                    type: boolean
        '400':
          description: Invalid request
        '429':
          description: Rate limit exceeded

  /analytics/events/batch:
    post:
      summary: Track multiple analytics events
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - events
              properties:
                events:
                  type: array
                  items:
                    type: object
                    required:
                      - eventType
                      - eventCategory
                      - eventData
                    properties:
                      eventType:
                        type: string
                      eventCategory:
                        type: string
                      eventData:
                        type: object
                      userConsentGiven:
                        type: boolean
      responses:
        '200':
          description: Events tracked
          content:
            application/json:
              schema:
                type: object
                properties:
                  successful:
                    type: integer
                  failed:
                    type: integer
                  errors:
                    type: array
                    items:
                      type: string

  /analytics/dashboard:
    get:
      summary: Get analytics dashboard
      security:
        - bearerAuth: []
      parameters:
        - name: dateRange.start
          in: query
          schema:
            type: string
            format: date
        - name: dateRange.end
          in: query
          schema:
            type: string
            format: date
        - name: categories
          in: query
          schema:
            type: array
            items:
              type: string
              enum: [sharing, reminder, sofia, document, will, vault, family, navigation, engagement]
        - name: metrics
          in: query
          schema:
            type: array
            items:
              type: string
      responses:
        '200':
          description: Analytics dashboard data
          content:
            application/json:
              schema:
                type: object
                properties:
                  summary:
                    type: object
                    properties:
                      totalEvents:
                        type: integer
                      uniqueUsers:
                        type: integer
                      topCategories:
                        type: array
                        items:
                          type: object
                          properties:
                            category:
                              type: string
                            count:
                              type: integer
                            percentage:
                              type: number
                      dateRange:
                        type: object
                        properties:
                          start:
                            type: string
                            format: date
                          end:
                            type: string
                            format: date
                  metrics:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        value:
                          type: number
                        change:
                          type: number
                        trend:
                          type: string
                          enum: [up, down, stable]
                  insights:
                    type: array
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                        title:
                          type: string
                        description:
                          type: string
                        impact:
                          type: string
                          enum: [high, medium, low]
                        recommendation:
                          type: string
                  charts:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        type:
                          type: string
                          enum: [line, bar, pie, area]
                        title:
                          type: string
                        data:
                          type: array
                          items:
                            type: object
                            additionalProperties: true
                  privacyStatus:
                    type: object
                    properties:
                      analyticsEnabled:
                        type: boolean
                      dataRetentionDays:
                        type: integer
                      consentVersion:
                        type: string
                      lastUpdated:
                        type: string
                        format: date-time

  /analytics/preferences:
    get:
      summary: Get analytics preferences
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Analytics preferences retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  preferences:
                    type: object
                    properties:
                      analyticsEnabled:
                        type: boolean
                      dataRetentionDays:
                        type: integer
                      allowedCategories:
                        type: array
                        items:
                          type: string
                      consentVersion:
                        type: string
                      lastUpdated:
                        type: string
                        format: date-time

    put:
      summary: Update analytics preferences
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                analyticsEnabled:
                  type: boolean
                dataRetentionDays:
                  type: integer
                  minimum: 30
                  maximum: 2555
                allowedCategories:
                  type: array
                  items:
                    type: string
                    enum: [sharing, reminder, sofia, document, will, vault, family, navigation, engagement]
      responses:
        '200':
          description: Analytics preferences updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  preferences:
                    type: object
                    properties:
                      analyticsEnabled:
                        type: boolean
                      dataRetentionDays:
                        type: integer
                      allowedCategories:
                        type: array
                        items:
                          type: string
                      consentVersion:
                        type: string
                      lastUpdated:
                        type: string
                        format: date-time
                  requiresReconsent:
                    type: boolean

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    AnalyticsEvent:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        sessionId:
          type: string
        eventType:
          type: string
        eventCategory:
          type: string
        eventData:
          type: object
          additionalProperties: true
        userConsentGiven:
          type: boolean
        ipAddress:
          type: string
        userAgent:
          type: string
        referrer:
          type: string
        createdAt:
          type: string
          format: date-time

    UserAnalyticsPreferences:
      type: object
      properties:
        userId:
          type: string
        analyticsEnabled:
          type: boolean
        dataRetentionDays:
          type: integer
        allowedCategories:
          type: array
          items:
            type: string
        lastUpdated:
          type: string
          format: date-time
        consentVersion:
          type: string
```

### sofia-ai-expansion-api.yaml

#### Sofia AI Expansion API

```yaml
openapi: 3.0.3
info:
  title: Sofia AI Expansion API
  version: 1.0.0
  description: API for enhanced Sofia AI with context awareness and task routing

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /sofia/expansion/chat:
    post:
      summary: Send message to Sofia AI
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - message
              properties:
                message:
                  type: string
                  minLength: 1
                  maxLength: 2000
                sessionId:
                  type: string
                context:
                  type: object
                  properties:
                    currentTopic:
                      type: string
                    userIntent:
                      type: string
                    entities:
                      type: object
                      additionalProperties: true
                    sentiment:
                      type: string
                      enum: [positive, neutral, negative]
                    urgency:
                      type: string
                      enum: [low, medium, high]
                taskType:
                  type: string
                  enum: [general, sharing, reminder, document, will]
      responses:
        '200':
          description: Message processed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  sessionId:
                    type: string
                  context:
                    type: object
                    properties:
                      currentTopic:
                        type: string
                      userIntent:
                        type: string
                      entities:
                        type: object
                        additionalProperties: true
                      sentiment:
                        type: string
                      urgency:
                        type: string
                      messageHistory:
                        type: array
                        items:
                          type: object
                          properties:
                            user:
                              type: string
                            ai:
                              type: string
                            timestamp:
                              type: string
                              format: date-time
                            intent:
                              type: string
                            entities:
                              type: object
                  suggestedActions:
                    type: array
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                        title:
                          type: string
                        description:
                          type: string
                        priority:
                          type: string
                          enum: [high, medium, low]
                        data:
                          type: object
                          additionalProperties: true
                  personalityState:
                    type: object
                    properties:
                      mode:
                        type: string
                        enum: [adaptive, empathetic, pragmatic, professional]
                      empathyLevel:
                        type: integer
                        minimum: 1
                        maximum: 10
                      communicationStyle:
                        type: string
                        enum: [formal, casual, balanced]
                      adaptationHistory:
                        type: array
                        items:
                          type: object
                          properties:
                            trigger:
                              type: string
                            change:
                              type: string
                            timestamp:
                              type: string
                              format: date-time
                  processingTime:
                    type: integer
                    description: Processing time in milliseconds
        '400':
          description: Invalid request
        '429':
          description: Rate limit exceeded
        '503':
          description: AI service temporarily unavailable

  /sofia/expansion/conversations:
    get:
      summary: Get Sofia AI conversations
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: Conversations retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversations:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        sessionId:
                          type: string
                        conversationContext:
                          type: object
                        personalityState:
                          type: object
                        taskHistory:
                          type: array
                          items:
                            type: object
                        createdAt:
                          type: string
                          format: date-time
                        updatedAt:
                          type: string
                          format: date-time
                        lastActivityAt:
                          type: string
                          format: date-time
                  total:
                    type: integer
                  hasMore:
                    type: boolean

  /sofia/expansion/personality:
    get:
      summary: Get Sofia AI personality
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Personality retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  personality:
                    type: object
                    properties:
                      mode:
                        type: string
                        enum: [adaptive, empathetic, pragmatic, professional]
                      empathyLevel:
                        type: integer
                        minimum: 1
                        maximum: 10
                      communicationStyle:
                        type: string
                        enum: [formal, casual, balanced]
                      preferredLanguage:
                        type: string
                      culturalContext:
                        type: object
                        additionalProperties: true
                      taskPreferences:
                        type: object
                        additionalProperties: true
                  preferences:
                    type: object
                    properties:
                      autoAdaptation:
                        type: boolean
                      feedbackEnabled:
                        type: boolean
                      memoryRetentionDays:
                        type: integer

    put:
      summary: Update Sofia AI personality
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                mode:
                  type: string
                  enum: [adaptive, empathetic, pragmatic, professional]
                empathyLevel:
                  type: integer
                  minimum: 1
                  maximum: 10
                communicationStyle:
                  type: string
                  enum: [formal, casual, balanced]
                preferredLanguage:
                  type: string
                autoAdaptation:
                  type: boolean
      responses:
        '200':
          description: Personality updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  personality:
                    type: object
                    properties:
                      mode:
                        type: string
                      empathyLevel:
                        type: integer
                      communicationStyle:
                        type: string
                      preferredLanguage:
                        type: string
                      culturalContext:
                        type: object
                      taskPreferences:
                        type: object
                  adaptationHistory:
                    type: array
                    items:
                      type: object
                      properties:
                        trigger:
                          type: string
                        change:
                          type: string
                        timestamp:
                          type: string
                        format: date-time

  /sofia/expansion/context/reset:
    post:
      summary: Reset Sofia AI conversation context
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - sessionId
              properties:
                sessionId:
                  type: string
                preserveMemory:
                  type: boolean
                  default: true
      responses:
        '200':
          description: Context reset
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  newSessionId:
                    type: string

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ConversationContext:
      type: object
      properties:
        currentTopic:
          type: string
        userIntent:
          type: string
        entities:
          type: object
          additionalProperties: true
        sentiment:
          type: string
          enum: [positive, neutral, negative]
        urgency:
          type: string
          enum: [low, medium, high]
        messageHistory:
          type: array
          items:
            type: object
            properties:
              user:
                type: string
              ai:
                type: string
              timestamp:
                type: string
              intent:
                type: string
              entities:
                type: object

    PersonalityState:
      type: object
      properties:
        mode:
          type: string
          enum: [adaptive, empathetic, pragmatic, professional]
        empathyLevel:
          type: integer
          minimum: 1
          maximum: 10
        communicationStyle:
          type: string
          enum: [formal, casual, balanced]
        adaptationHistory:
          type: array
          items:
            type: object
            properties:
              trigger:
                type: string
              change:
                type: string
              timestamp:
                type: string

    SofiaAIExpansion:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        sessionId:
          type: string
        conversationContext:
          type: object
        personalityState:
          type: object
        taskHistory:
          type: array
          items:
            type: object
        memoryItems:
          type: array
          items:
            type: object
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        lastActivityAt:
          type: string
          format: date-time
```

### sharing-analytics-api.yaml

#### Sharing Analytics API

```yaml
openapi: 3.0.3
info:
  title: Sharing Analytics API
  version: 1.0.0
  description: API for sharing system analytics and insights

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /sharing/analytics/overview:
    get:
      summary: Get sharing analytics overview
      security:
        - bearerAuth: []
      parameters:
        - name: dateRange.start
          in: query
          schema:
            type: string
            format: date
        - name: dateRange.end
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Sharing analytics overview
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalShares:
                    type: integer
                  activeShares:
                    type: integer
                  totalAccesses:
                    type: integer
                  uniqueAccessors:
                    type: integer
                  topResources:
                    type: array
                    items:
                      type: object
                      properties:
                        resourceType:
                          type: string
                        resourceId:
                          type: string
                        accessCount:
                          type: integer
                        lastAccessed:
                          type: string
                          format: date-time
                  accessTrends:
                    type: array
                    items:
                      type: object
                      properties:
                        date:
                          type: string
                          format: date
                        accesses:
                          type: integer
                        uniqueUsers:
                          type: integer
                  permissionUsage:
                    type: object
                    properties:
                      read:
                        type: integer
                      download:
                        type: integer
                      comment:
                        type: integer
                      share:
                        type: integer

  /sharing/analytics/shares/{shareId}:
    get:
      summary: Get analytics for specific share
      security:
        - bearerAuth: []
      parameters:
        - name: shareId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Share analytics
          content:
            application/json:
              schema:
                type: object
                properties:
                  shareId:
                    type: string
                  resourceType:
                    type: string
                  resourceId:
                    type: string
                  permissions:
                    type: object
                    properties:
                      read:
                        type: boolean
                      download:
                        type: boolean
                      comment:
                        type: boolean
                      share:
                        type: boolean
                  totalAccesses:
                    type: integer
                  uniqueAccessors:
                    type: integer
                  accessHistory:
                    type: array
                    items:
                      type: object
                      properties:
                        timestamp:
                          type: string
                          format: date-time
                        action:
                          type: string
                        userId:
                          type: string
                        ipAddress:
                          type: string
                        userAgent:
                          type: string
                  expiryStatus:
                    type: string
                    enum: [active, expired, expiring_soon]
                  timeToExpiry:
                    type: integer
                    description: Hours until expiry (null if not expiring)

  /sharing/analytics/export:
    post:
      summary: Export sharing analytics data
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - dateRange
                - format
              properties:
                dateRange:
                  type: object
                  required:
                    - start
                    - end
                  properties:
                    start:
                      type: string
                      format: date
                    end:
                      type: string
                      format: date
                format:
                  type: string
                  enum: [json, csv, pdf]
                includePersonalData:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Export initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  exportId:
                    type: string
                  status:
                    type: string
                  downloadUrl:
                    type: string
                  expiresAt:
                    type: string
                    format: date-time

  /sharing/analytics/export/{exportId}:
    get:
      summary: Get export status
      security:
        - bearerAuth: []
      parameters:
        - name: exportId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Export status
          content:
            application/json:
              schema:
                type: object
                properties:
                  exportId:
                    type: string
                  status:
                    type: string
                  downloadUrl:
                    type: string
                  expiresAt:
                    type: string
                    format: date-time
                  error:
                    type: string

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    SharingAnalyticsOverview:
      type: object
      properties:
        totalShares:
          type: integer
        activeShares:
          type: integer
        totalAccesses:
          type: integer
        uniqueAccessors:
          type: integer
        topResources:
          type: array
          items:
            type: object
            properties:
              resourceType:
                type: string
              resourceId:
                type: string
              accessCount:
                type: integer
              lastAccessed:
                type: string
              format: date-time
        accessTrends:
          type: array
          items:
            type: object
            properties:
              date:
                type: string
                format: date
              accesses:
                type: integer
              uniqueUsers:
                type: integer
        permissionUsage:
          type: object
          properties:
            read:
              type: integer
            download:
              type: integer
            comment:
              type: integer
            share:
              type: integer

    ShareAnalytics:
      type: object
      properties:
        shareId:
          type: string
        resourceType:
          type: string
        resourceId:
          type: string
        permissions:
          type: object
          properties:
            read:
              type: boolean
            download:
              type: boolean
            comment:
              type: boolean
            share:
              type: boolean
        totalAccesses:
          type: integer
        uniqueAccessors:
          type: integer
        accessHistory:
          type: array
          items:
            type: object
            properties:
              timestamp:
                type: string
                format: date-time
              action:
                type: string
              userId:
                type: string
              ipAddress:
                type: string
              userAgent:
                type: string
        expiryStatus:
          type: string
          enum: [active, expired, expiring_soon]
        timeToExpiry:
          type: integer
```

These API contracts define the interface between the Sharing, Reminders, Analytics, and Sofia AI Expansion system and other Schwalbe components. They ensure consistent integration, maintainable code, and reliable communication across the entire platform.
