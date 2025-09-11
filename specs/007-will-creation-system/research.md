# Will Creation System - Technical Research & Analysis

## Product Scope

### Legal Will Generation
The will creation system provides comprehensive legal document generation with jurisdiction-specific templates and automated clause assembly. The system supports multiple legal jurisdictions with localized templates and validation rules.

### Technical Architecture
- **Will Engine**: Core generation logic with template processing and clause assembly
- **Legal Templates**: Jurisdiction-aware document templates with version control
- **User Experience**: Guided will creation with step-by-step wizard interface
- **Performance**: Optimized generation speed with caching and background processing
- **Security**: End-to-end encryption with zero-knowledge architecture
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Analytics**: Usage tracking and completion rate analytics
- **Future Enhancements**: AI-powered legal assistance and automated review

## Hollywood Implementation Analysis

### Database Architecture

#### Core Tables

**wills** table structure (from Hollywood migration):
```sql
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Last Will and Testament',
  status will_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Personal Information
  testator_data JSONB NOT NULL DEFAULT '{}',

  -- Beneficiaries and inheritance
  beneficiaries JSONB NOT NULL DEFAULT '[]',

  -- Assets and property
  assets JSONB NOT NULL DEFAULT '{}',

  -- Executor information
  executor_data JSONB NOT NULL DEFAULT '{}',

  -- Guardian information
  guardianship_data JSONB NOT NULL DEFAULT '{}',

  -- Special instructions
  special_instructions JSONB NOT NULL DEFAULT '{}',

  -- Legal and technical data
  legal_data JSONB NOT NULL DEFAULT '{}',

  -- Generated document data
  document_data JSONB NOT NULL DEFAULT '{}',

  -- Version control
  version_number INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL
);
```

**Key Design Decisions:**
- JSONB for flexible data storage allowing complex nested structures
- Version control with parent-child relationships
- Status tracking for workflow management
- Comprehensive audit trail capabilities

#### Template System

**will_templates** table:
```sql
CREATE TABLE will_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0',
  template_structure JSONB NOT NULL,
  legal_requirements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

**Template Structure Example:**
```json
{
  "sections": [
    {"id": "declaration", "title": "Declaration", "required": true},
    {"id": "personal_info", "title": "Personal Information", "required": true},
    {"id": "revocation", "title": "Revocation of Previous Wills", "required": true},
    {"id": "beneficiaries", "title": "Beneficiaries and Bequests", "required": true},
    {"id": "executor", "title": "Executor Appointment", "required": true},
    {"id": "guardianship", "title": "Guardian Appointment", "required": false},
    {"id": "special_instructions", "title": "Special Instructions", "required": false},
    {"id": "execution", "title": "Execution and Witnesses", "required": true}
  ],
  "clauses": {
    "revocation": "I hereby revoke all wills and codicils previously made by me.",
    "residual_estate": "All the rest, residue and remainder of my estate I give to my beneficiaries as specified herein."
  }
}
```

### Legal Requirements System

**Jurisdiction-Specific Requirements:**
```json
{
  "witnessCount": 2,
  "notarizationRequired": false,
  "selfProving": true,
  "minimumAge": 18,
  "mentalCapacity": true
}
```

**Supported Jurisdictions:**
- US-General (base template)
- US-California
- US-Texas
- US-New York
- EU-General
- UK-England
- Canada-General

### Security Implementation

#### Row Level Security (RLS)
```sql
-- Users can only access their own wills
CREATE POLICY "Users can view own wills" ON wills
  FOR SELECT USING (app.current_external_id() = user_id);

-- Templates are read-only for all authenticated users
CREATE POLICY "Authenticated users can view templates" ON will_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
```

#### Data Encryption
- Client-side encryption using TweetNaCl
- PBKDF2 key derivation with 100,000 iterations
- Unique nonces for each document
- Zero-knowledge storage architecture

### PDF Generation System

**Hollywood's PDF Generation Approach:**
- Server-side PDF generation using Puppeteer
- HTML templates with CSS styling
- Legal document formatting standards
- Digital signature integration
- Timestamp and versioning metadata

**Key Components:**
- Template rendering engine
- CSS-based layout system
- Font and typography management
- Page break and pagination handling
- Accessibility compliance (PDF/UA)

### AI Integration Patterns

**Sofia AI Integration:**
- Context-aware guidance during will creation
- Content suggestions for special instructions
- Legal requirement explanations
- Beneficiary relationship suggestions
- Asset categorization assistance

**AI Boundaries:**
- No generation of legal advice
- Human confirmation required for all AI suggestions
- Fallback to template-only generation
- Audit trail of AI interactions

## Technical Research Findings

### PDF Generation Libraries

#### Option 1: Puppeteer + HTML Templates
```typescript
import puppeteer from 'puppeteer';

async function generateWillPDF(willData: WillData): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = renderWillTemplate(willData);
  await page.setContent(html);

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  });

  await browser.close();
  return pdf;
}
```

**Pros:**
- Full CSS support
- Complex layouts possible
- Familiar web development workflow
- Good accessibility support

**Cons:**
- Resource intensive
- Browser dependency
- Performance considerations

#### Option 2: PDF-lib
```typescript
import { PDFDocument, rgb } from 'pdf-lib';

async function generateWillPDF(willData: WillData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  // Add content programmatically
  page.drawText('Last Will and Testament', {
    x: 50,
    y: page.getHeight() - 50,
    size: 24,
    color: rgb(0, 0, 0)
  });

  return await pdfDoc.save();
}
```

**Pros:**
- Lightweight
- No browser dependency
- Better performance
- Smaller bundle size

**Cons:**
- Complex layouts harder to implement
- Limited styling options
- Steeper learning curve

#### Option 3: React-PDF
```typescript
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40 },
  title: { fontSize: 24, marginBottom: 20 }
});

const WillDocument = ({ willData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Last Will and Testament</Text>
      {/* Will content */}
    </Page>
  </Document>
);
```

**Pros:**
- React-like development experience
- Good performance
- Flexible layouts
- TypeScript support

**Cons:**
- Learning curve for React developers not familiar with PDF concepts
- Limited compared to full web styling

### Legal Template Management

#### Template Versioning Strategy
- Semantic versioning (MAJOR.MINOR.PATCH)
- Jurisdiction-specific version tracking
- Template deprecation and migration
- Audit trail of template changes

#### Template Validation
- JSON Schema validation for template structure
- Legal requirement compliance checking
- Template completeness verification
- Cross-reference validation

### Performance Optimization

#### Database Optimization
- JSONB path indexes for common queries
- Partial indexes for status-based filtering
- Connection pooling for high concurrency
- Query result caching

#### Frontend Optimization
- Progressive loading of template sections
- Lazy loading of complex components
- Service worker caching for templates
- Web Workers for PDF generation

### Security Considerations

#### Data Protection
- End-to-end encryption
- Secure key management
- Audit logging of all operations
- Data retention policies

#### Compliance Requirements
- GDPR compliance for EU users
- CCPA compliance for California users
- Legal hold capabilities
- Data export/deletion features

## Integration Patterns

### With Document Vault
- Automatic encryption of generated PDFs
- Version control synchronization
- Metadata extraction and indexing
- Secure sharing capabilities

### With Sofia AI
- Context-aware content suggestions
- Legal requirement explanations
- User intent analysis
- Progressive disclosure guidance

### With Authentication System
- User identity verification
- Multi-factor authentication for sensitive operations
- Session management and timeouts
- Audit trail integration

## Migration Strategy

### From Hollywood to Schwalbe
1. **Database Schema Migration**
   - Port existing tables with modifications
   - Update RLS policies for Clerk authentication
   - Migrate template data with validation

2. **Code Migration**
   - Extract will generation logic to packages/logic
   - Port UI components to packages/ui
   - Update API contracts and types

3. **Security Enhancements**
   - Implement client-side encryption
   - Add comprehensive audit logging
   - Update authentication patterns

4. **Performance Optimization**
   - Implement caching strategies
   - Optimize database queries
   - Add monitoring and alerting

## Recommendations

### Technology Stack
- **PDF Generation**: Puppeteer for initial implementation, React-PDF for future enhancement
- **Template Engine**: Handlebars.js for server-side rendering
- **Validation**: JSON Schema with custom legal validators
- **Caching**: Redis for template and session caching

### Architecture Decisions
- **Microservices**: Keep will generation as separate service for scalability
- **Event-Driven**: Use events for will status changes and notifications
- **CQRS Pattern**: Separate read/write models for complex queries

### Development Priorities
1. Core will generation engine
2. Basic US template implementation
3. PDF generation and formatting
4. Security and encryption
5. Sofia AI integration
6. Advanced features (versioning, collaboration)

This research provides the foundation for implementing a robust, secure, and user-friendly will creation system in Schwalbe.