# Observability, Security Hardening, and Performance Optimization - API Contracts

This directory contains the API contracts for the Observability, Security Hardening, and Performance Optimization system.

## API Contract Specifications

The system uses the following API contract patterns for secure, scalable integration:

### observability-api.yaml

#### Observability API

```yaml
openapi: 3.0.3
info:
  title: Observability API
  version: 1.0.0
  description: API for comprehensive system observability and error tracking

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /observability/errors:
    post:
      summary: Log application error
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - error
                - context
              properties:
                error:
                  type: object
                  required:
                    - message
                  properties:
                    message:
                      type: string
                    code:
                      type: string
                    stack:
                      type: string
                    severity:
                      type: string
                      enum: [debug, info, warning, error, critical]
                context:
                  type: object
                  properties:
                    userId:
                      type: string
                    sessionId:
                      type: string
                    url:
                      type: string
                    userAgent:
                      type: string
                    ipAddress:
                      type: string
                    tags:
                      type: array
                      items:
                        type: string
      responses:
        '200':
          description: Error logged successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  errorId:
                    type: string
                  logged:
                    type: boolean
        '400':
          description: Invalid request

  /observability/errors:
    get:
      summary: Get error logs
      security:
        - bearerAuth: []
      parameters:
        - name: severity
          in: query
          schema:
            type: string
            enum: [debug, info, warning, error, critical]
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
          description: Error logs retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  errors:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        timestamp:
                          type: string
                          format: date-time
                        severity:
                          type: string
                        errorMessage:
                          type: string
                        userId:
                          type: string
                        resolved:
                          type: boolean
                  total:
                    type: integer
                  hasMore:
                    type: boolean

  /observability/health:
    get:
      summary: Get system health status
      security:
        - bearerAuth: []
      responses:
        '200':
          description: System health status
          content:
            application/json:
              schema:
                type: object
                properties:
                  overall:
                    type: string
                    enum: [healthy, degraded, unhealthy]
                  services:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        status:
                          type: string
                        responseTime:
                          type: integer
                        lastChecked:
                          type: string
                          format: date-time

  /observability/alerts:
    get:
      summary: Get active alerts
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, acknowledged, resolved]
        - name: severity
          in: query
          schema:
            type: string
            enum: [low, medium, high, critical]
      responses:
        '200':
          description: Active alerts retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  alerts:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        type:
                          type: string
                        severity:
                          type: string
                        title:
                          type: string
                        message:
                          type: string
                        status:
                          type: string
                        createdAt:
                          type: string
                          format: date-time

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ErrorLog:
      type: object
      properties:
        id:
          type: string
        timestamp:
          type: string
          format: date-time
        severity:
          type: string
          enum: [debug, info, warning, error, critical]
        errorMessage:
          type: string
        stackTrace:
          type: string
        userId:
          type: string
        sessionId:
          type: string
        url:
          type: string
        context:
          type: object
        tags:
          type: array
          items:
            type: string
        resolved:
          type: boolean
        resolvedAt:
          type: string
          format: date-time
```

### security-api.yaml

#### Security API

```yaml
openapi: 3.0.3
info:
  title: Security API
  version: 1.0.0
  description: API for security monitoring and vulnerability management

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /security/events:
    post:
      summary: Log security event
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
                - severity
              properties:
                eventType:
                  type: string
                severity:
                  type: string
                  enum: [low, medium, high, critical]
                userId:
                  type: string
                ipAddress:
                  type: string
                userAgent:
                  type: string
                details:
                  type: object
      responses:
        '200':
          description: Security event logged
          content:
            application/json:
              schema:
                type: object
                properties:
                  eventId:
                    type: string
                  logged:
                    type: boolean

  /security/scan:
    post:
      summary: Trigger security scan
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - scanType
              properties:
                scanType:
                  type: string
                  enum: [dependency, container, infrastructure, code]
                target:
                  type: string
      responses:
        '200':
          description: Security scan initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  scanId:
                    type: string
                  status:
                    type: string
                  startedAt:
                    type: string
                    format: date-time

  /security/scan/{scanId}:
    get:
      summary: Get scan results
      security:
        - bearerAuth: []
      parameters:
        - name: scanId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Scan results retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  scanId:
                    type: string
                  status:
                    type: string
                  results:
                    type: object
                    properties:
                      totalVulnerabilities:
                        type: integer
                      critical:
                        type: integer
                      high:
                        type: integer
                      medium:
                        type: integer
                      low:
                        type: integer
                      details:
                        type: array
                        items:
                          type: object

  /security/csp-report:
    post:
      summary: Report CSP violation
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                'csp-report':
                  type: object
                  properties:
                    'document-uri':
                      type: string
                    'violated-directive':
                      type: string
                    'original-policy':
                      type: string
                    'blocked-uri':
                      type: string
      responses:
        '204':
          description: CSP violation reported

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    SecurityEvent:
      type: object
      properties:
        id:
          type: string
        eventType:
          type: string
        severity:
          type: string
          enum: [low, medium, high, critical]
        userId:
          type: string
        ipAddress:
          type: string
        userAgent:
          type: string
        details:
          type: object
        createdAt:
          type: string
          format: date-time

    VulnerabilityScan:
      type: object
      properties:
        id:
          type: string
        scanType:
          type: string
        status:
          type: string
        target:
          type: string
        results:
          type: object
        startedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
```

### performance-api.yaml

#### Performance API

```yaml
openapi: 3.0.3
info:
  title: Performance API
  version: 1.0.0
  description: API for performance monitoring and optimization

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /performance/metrics:
    post:
      summary: Record performance metric
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - metricType
                - metricName
                - value
              properties:
                metricType:
                  type: string
                metricName:
                  type: string
                value:
                  type: number
                unit:
                  type: string
                tags:
                  type: object
                userId:
                  type: string
                sessionId:
                  type: string
                url:
                  type: string
      responses:
        '200':
          description: Performance metric recorded
          content:
            application/json:
              schema:
                type: object
                properties:
                  metricId:
                    type: string
                  recorded:
                    type: boolean

  /performance/web-vitals:
    post:
      summary: Record Web Vitals metrics
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - metricName
                - value
              properties:
                metricName:
                  type: string
                  enum: [LCP, FID, CLS, FCP, TTFB]
                value:
                  type: number
                rating:
                  type: string
                  enum: [good, needs-improvement, poor]
                userId:
                  type: string
                sessionId:
                  type: string
                pageUrl:
                  type: string
                deviceInfo:
                  type: object
      responses:
        '200':
          description: Web Vitals recorded
          content:
            application/json:
              schema:
                type: object
                properties:
                  vitalsId:
                    type: string
                  recorded:
                    type: boolean

  /performance/budgets:
    get:
      summary: Get performance budgets
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Performance budgets retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  budgets:
                    type: array
                    items:
                      type: object
                      properties:
                        path:
                          type: string
                        timings:
                          type: array
                          items:
                            type: object
                            properties:
                              metric:
                                type: string
                              budget:
                                type: number

  /performance/test:
    post:
      summary: Run performance test
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - testType
                - target
              properties:
                testType:
                  type: string
                  enum: [load, stress, spike]
                target:
                  type: string
                duration:
                  type: integer
                  default: 60
                concurrency:
                  type: integer
                  default: 10
      responses:
        '200':
          description: Performance test initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  testId:
                    type: string
                  status:
                    type: string
                  startedAt:
                    type: string
                    format: date-time

  /performance/test/{testId}:
    get:
      summary: Get test results
      security:
        - bearerAuth: []
      parameters:
        - name: testId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Test results retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  testId:
                    type: string
                  status:
                    type: string
                  results:
                    type: object
                    properties:
                      duration:
                        type: integer
                      totalRequests:
                        type: integer
                      successfulRequests:
                        type: integer
                      failedRequests:
                        type: integer
                      averageResponseTime:
                        type: number
                      p95ResponseTime:
                        type: number
                      p99ResponseTime:
                        type: number
                      throughput:
                        type: number
                      errorRate:
                        type: number

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    PerformanceMetric:
      type: object
      properties:
        id:
          type: string
        metricType:
          type: string
        metricName:
          type: string
        value:
          type: number
        unit:
          type: string
        tags:
          type: object
        userId:
          type: string
        sessionId:
          type: string
        measuredAt:
          type: string
          format: date-time

    WebVitals:
      type: object
      properties:
        id:
          type: string
        metricName:
          type: string
        value:
          type: number
        rating:
          type: string
        userId:
          type: string
        sessionId:
          type: string
        pageUrl:
          type: string
        measuredAt:
          type: string
          format: date-time

    LoadTestResult:
      type: object
      properties:
        id:
          type: string
        testName:
          type: string
        testType:
          type: string
        status:
          type: string
        results:
          type: object
        startedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
```

### monitoring-api.yaml

#### Monitoring API

```yaml
openapi: 3.0.3
info:
  title: Monitoring API
  version: 1.0.0
  description: API for system monitoring and alerting

servers:
  - url: https://api.schwalbe.app/v1
    description: Production server

paths:
  /monitoring/dashboard:
    get:
      summary: Get monitoring dashboard
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Monitoring dashboard data
          content:
            application/json:
              schema:
                type: object
                properties:
                  systemHealth:
                    type: object
                    properties:
                      overall:
                        type: string
                      services:
                        type: array
                        items:
                          type: object
                          properties:
                            name:
                              type: string
                            status:
                              type: string
                            responseTime:
                              type: integer
                  recentErrors:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        severity:
                          type: string
                        message:
                          type: string
                        timestamp:
                          type: string
                          format: date-time
                  activeAlerts:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        type:
                          type: string
                        severity:
                          type: string
                        title:
                          type: string
                        createdAt:
                          type: string
                          format: date-time
                  performance:
                    type: object
                    properties:
                      webVitals:
                        type: object
                        properties:
                          lcp:
                            type: object
                            properties:
                              value:
                                type: number
                              rating:
                                type: string
                          fid:
                            type: object
                            properties:
                              value:
                                type: number
                              rating:
                                type: string
                          cls:
                            type: object
                            properties:
                              value:
                                type: number
                              rating:
                                type: string

  /monitoring/config:
    get:
      summary: Get monitoring configuration
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Monitoring configuration retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  errorTracking:
                    type: object
                    properties:
                      enabled:
                        type: boolean
                      severityLevels:
                        type: array
                        items:
                          type: string
                      retentionDays:
                        type: integer
                  alerting:
                    type: object
                    properties:
                      enabled:
                        type: boolean
                      channels:
                        type: array
                        items:
                          type: string
                      rules:
                        type: array
                        items:
                          type: object
                  performance:
                    type: object
                    properties:
                      webVitals:
                        type: boolean
                      budgets:
                        type: object
                      retentionDays:
                        type: integer

    put:
      summary: Update monitoring configuration
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                errorTracking:
                  type: object
                alerting:
                  type: object
                performance:
                  type: object
      responses:
        '200':
          description: Monitoring configuration updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  updated:
                    type: boolean
                  config:
                    type: object

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    MonitoringDashboard:
      type: object
      properties:
        systemHealth:
          type: object
        recentErrors:
          type: array
          items:
            type: object
        activeAlerts:
          type: array
          items:
            type: object
        performance:
          type: object

    MonitoringConfig:
      type: object
      properties:
        errorTracking:
          type: object
        alerting:
          type: object
        performance:
          type: object
```

These API contracts define the interface between the Observability, Security Hardening, and Performance Optimization system and other Schwalbe components. They ensure consistent integration, maintainable code, and reliable communication across the entire platform.
