# Auth + RLS Baseline: API Contracts

This directory contains the API contract specifications for the authentication and authorization system.

## API Contract Files

### supabase-auth-api.yaml

Supabase Auth integration contract and Postgres RLS policy interfaces.

```yaml
openapi: 3.0.3
info:
title: Supabase Authentication API
  version: 1.0.0
description: Supabase authentication service integration contract

servers:
- url: https://your-project.supabase.co
    description: Supabase REST API

paths:
  /users:
    get:
      summary: Get user information
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User information retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /sessions:
    post:
      summary: Create user session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSessionRequest'
      responses:
        '200':
          description: Session created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        firstName:
          type: string
        lastName:
          type: string

    CreateSessionRequest:
      type: object
      properties:
        email:
          type: string
        password:
          type: string

    Session:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        expiresAt:
          type: string
          format: date-time
```

### supabase-rls-api.yaml

Supabase Row Level Security API contract.

```yaml
openapi: 3.0.3
info:
  title: Supabase RLS API
  version: 1.0.0
  description: Supabase database with Row Level Security policies

servers:
  - url: https://your-project.supabase.co/rest/v1
    description: Supabase REST API

paths:
  /user_auth:
    get:
      summary: Get user authentication data
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User auth data retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserAuth'

    post:
      summary: Create user authentication record
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserAuthRequest'
      responses:
        '201':
          description: User auth record created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserAuth'

  /rls_policies:
    get:
      summary: Get RLS policies
      security:
        - bearerAuth: []
      responses:
        '200':
          description: RLS policies retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/RLSPolicy'

components:
  schemas:
    UserAuth:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        email:
          type: string
        role:
          type: string
        is_active:
          type: boolean

    CreateUserAuthRequest:
      type: object
      properties:
        user_id:
          type: string
        email:
          type: string
        first_name:
          type: string
        last_name:
          type: string

    RLSPolicy:
      type: object
      properties:
        id:
          type: string
        table_name:
          type: string
        policy_name:
          type: string
        command:
          type: string
        roles:
          type: array
          items:
            type: string
        is_active:
          type: boolean
```

### session-management-api.yaml

Session management API contract.

```yaml
openapi: 3.0.3
info:
  title: Session Management API
  version: 1.0.0
  description: User session management and security

servers:
  - url: https://your-api.com/api/v1
    description: Session management API

paths:
  /sessions:
    get:
      summary: Get user sessions
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User sessions retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/SessionData'

    post:
      summary: Create new session
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSessionRequest'
      responses:
        '201':
          description: Session created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionData'

  /sessions/{sessionId}:
    delete:
      summary: Terminate session
      security:
        - bearerAuth: []
      parameters:
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Session terminated

components:
  schemas:
    SessionData:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        session_token:
          type: string
        expires_at:
          type: string
          format: date-time
        last_activity:
          type: string
          format: date-time
        is_active:
          type: boolean

    CreateSessionRequest:
      type: object
      properties:
        device_info:
          type: object
        ip_address:
          type: string
```

### access-control-api.yaml

Access control API contract.

```yaml
openapi: 3.0.3
info:
  title: Access Control API
  version: 1.0.0
  description: Role-based access control and permissions

servers:
  - url: https://your-api.com/api/v1
    description: Access control API

paths:
  /permissions:
    get:
      summary: Get permissions
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Permissions retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AccessPermission'

  /roles:
    get:
      summary: Get user roles
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User roles retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UserRole'

    post:
      summary: Assign role to user
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AssignRoleRequest'
      responses:
        '201':
          description: Role assigned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserRole'

components:
  schemas:
    AccessPermission:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        resource:
          type: string
        action:
          type: string
        is_active:
          type: boolean

    UserRole:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        role_name:
          type: string
        assigned_by:
          type: string
        assigned_at:
          type: string
          format: date-time
        is_active:
          type: boolean

    AssignRoleRequest:
      type: object
      properties:
        user_id:
          type: string
        role_name:
          type: string
        expires_at:
          type: string
          format: date-time
```

### security-hardening-api.yaml

Security hardening API contract.

```yaml
openapi: 3.0.3
info:
  title: Security Hardening API
  version: 1.0.0
  description: Security monitoring and hardening features

servers:
  - url: https://your-api.com/api/v1
    description: Security API

paths:
  /security/logs:
    get:
      summary: Get security logs
      security:
        - bearerAuth: []
      parameters:
        - name: user_id
          in: query
          schema:
            type: string
        - name: event_type
          in: query
          schema:
            type: string
        - name: severity
          in: query
          schema:
            type: string
            enum: [low, medium, high, critical]
      responses:
        '200':
          description: Security logs retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/SecurityLog'

  /security/audit:
    post:
      summary: Perform security audit
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Security audit completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SecurityAuditResult'

components:
  schemas:
    SecurityLog:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        event_type:
          type: string
        severity:
          type: string
          enum: [low, medium, high, critical]
        resource_type:
          type: string
        resource_id:
          type: string
        action:
          type: string
        ip_address:
          type: string
        details:
          type: object
        risk_score:
          type: integer
        created_at:
          type: string
          format: date-time

    SecurityAuditResult:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        score:
          type: number
        critical_issues:
          type: array
          items:
            type: string
        high_issues:
          type: array
          items:
            type: string
        medium_issues:
          type: array
          items:
            type: string
        low_issues:
          type: array
          items:
            type: string
        recommendations:
          type: array
          items:
            type: string
        compliance:
          type: object
          properties:
            gdpr:
              type: boolean
            sox:
              type: boolean
            pci:
              type: boolean
            hipaa:
              type: boolean
