# Will Generation Engine - Technical Research & Analysis

## Product Scope

### Will Generation and Legal Document System

The will generation engine provides comprehensive legal document creation with jurisdiction-aware templates, automated clause assembly, and professional PDF generation. The system ensures legal compliance across multiple jurisdictions while providing an intuitive user experience for estate planning.

### Technical Architecture

- **Will Engine**: Core generation logic with template processing and clause assembly
- **Legal Templates**: Jurisdiction-aware document templates with version control
- **Clause Assembly**: Automated clause composition with conditional logic
- **PDF Generation**: Professional document creation with accessibility features
- **Legal Validation**: Real-time compliance checking and error reporting
- **Security**: End-to-end encryption with audit trails
- **Performance**: Optimized generation with caching and background processing
- **Analytics**: Usage tracking and performance monitoring

## User Experience

### Will Generation User Experience

The will generation system provides an intuitive, guided experience for users to create legally valid wills. The interface includes:

- Step-by-step wizard with progress tracking
- Real-time validation and error feedback
- Template selection based on user needs
- Preview functionality for generated documents
- Sofia AI integration for guidance and suggestions

### Accessibility Features

- WCAG 2.1 AA compliance for web interface
- PDF/UA compliance for generated documents
- Screen reader support and keyboard navigation
- High contrast mode and font scaling
- Multi-language support with proper RTL handling

## Performance

### Will Engine Performance Optimization

- Template caching for faster generation
- Background processing for large documents
- Database query optimization with proper indexing
- Memory management for concurrent users
- CDN integration for static assets

### Scalability Considerations

- Horizontal scaling for generation services
- Database connection pooling
- Load balancing for PDF generation
- Caching strategies for frequently used templates
- Monitoring and alerting for performance issues

## Security

### Will Engine Security Measures

- End-to-end encryption for sensitive data
- Secure key management with rotation
- Audit logging for all operations
- GDPR compliance for EU users
- Regular security audits and penetration testing

### Data Protection

- Client-side encryption before transmission
- Secure storage with access controls
- Data retention policies and deletion procedures
- Compliance with international privacy regulations
- Regular security updates and patches

## Accessibility

### Legal Document Accessibility

- PDF/UA compliance for screen readers
- Structured content with proper headings
- Alternative text for all images
- Logical reading order and navigation
- Color contrast and font requirements

### User Interface Accessibility

- Keyboard navigation support
- Screen reader compatibility
- Focus management and indicators
- Error identification and descriptions
- Consistent navigation patterns

## Analytics

### Will Engine Analytics and Insights

- Usage tracking and completion rates
- Template popularity and effectiveness
- Performance metrics and bottlenecks
- Error rates and user issues
- Jurisdiction usage patterns

### Business Intelligence

- Conversion funnel analysis
- User engagement and retention metrics
- Legal compliance reporting
- Revenue attribution and ROI tracking
- Market analysis and competitive insights

## Future Enhancements

### Advanced Will Generation Features

- AI-powered legal content suggestions
- Automated legal research and updates
- Multi-party collaboration features
- Advanced customization options
- Integration with legal services

### Technology Improvements

- Machine learning for template optimization
- Blockchain integration for document verification
- Advanced PDF features and digital signatures
- Mobile app integration
- Voice-guided will creation

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
  is_active BOOLEAN DEFAULT true,
  UNIQUE(jurisdiction, template_name, template_version)
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
- US-California, US-Texas, US-New York
- EU-General, EU-Czech Republic, EU-Slovakia
- Canada-General
- UK-England

### Security Implementation

#### Row Level Security (RLS)

```sql
-- Users can only access their own wills
CREATE POLICY "Users can view own wills" ON wills
  FOR SELECT USING (auth.uid()::text = user_id);

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

#### Option 1: Puppeteer + HTML Templates (Recommended)

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

- Full CSS support for complex layouts
- Familiar web development workflow
- Good accessibility support
- Professional typography control

**Cons:**

- Resource intensive (browser process)
- Performance considerations for high volume
- Bundle size impact

#### Option 2: React-PDF (Alternative)

```typescript
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Times-Roman' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' }
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
- Better performance than Puppeteer
- Smaller bundle size
- TypeScript support

**Cons:**

- Limited styling compared to CSS
- Steeper learning curve
- Less mature ecosystem

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

#### Security Data Protection

- End-to-end encryption for sensitive data
- Secure key management with rotation
- Audit logging of all operations
- GDPR compliance for EU users

#### Compliance Requirements

- CCPA compliance for California users
- Legal hold capabilities
- Data export/deletion features
- Regular security audits

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
- **Testing**: Jest with snapshot testing for template outputs

### Architecture Decisions

- **Microservices**: Keep will generation as separate service for scalability
- **Event-Driven**: Use events for will status changes and notifications
- **CQRS Pattern**: Separate read/write models for complex queries

### Development Priorities

1. Core will generation engine migration
2. Basic US/EU template implementation
3. PDF generation and formatting
4. Security and encryption integration
5. Sofia AI integration
6. Advanced features (versioning, collaboration)

## Legal Compliance Research

### Jurisdiction Analysis

#### United States

- **Uniform Probate Code (UPC)**: Adopted by 19 states
- **State-Specific Variations**: California, Texas, New York have unique requirements
- **Witness Requirements**: 2 witnesses typically required
- **Notarization**: Some states require self-proving affidavits
- **Age Requirements**: 18+ years old

#### European Union

- **Forced Heirship Rules**: Vary significantly by country
  - Czech Republic: 25% minimum for adult children
  - Slovakia: 50% minimum for minor children
  - Germany: Complex rules based on family structure
- **Formal Requirements**: Vary by country (witnesses, notarization)
- **Language Requirements**: Official language of jurisdiction

#### United Kingdom

- **Wills Act 1837**: Foundation for will validity
- **Witness Requirements**: 2 witnesses required
- **Age Requirements**: 18+ years old
- **Formalities**: Strict compliance required

### Legal Validation Rules

#### Beneficiary Validation

- Age verification for beneficiaries
- Relationship validation
- Contingent beneficiary requirements
- Charitable organization verification

#### Asset Distribution

- Percentage validation (must total 100%)
- Specific bequest validation
- Residual estate handling
- Tax implication considerations

#### Executor Validation

- Age and capacity requirements
- Professional executor licensing
- Conflict of interest checking
- Backup executor requirements

### Accessibility Standards

#### PDF/UA Compliance

- Tagged PDF structure
- Alternative text for images
- Logical reading order
- Language identification
- Color and contrast requirements

#### WCAG 2.1 AA Compliance

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Error identification
- Color contrast ratios

## Performance Benchmarks

### Generation Speed Targets

- Simple will: <2 seconds
- Complex will: <5 seconds
- PDF generation: <3 seconds
- Validation: <500ms

### Scalability Targets

- Concurrent users: 1000+
- Templates: 10000+
- Daily generations: 10000+
- Database queries: <100ms average

### Resource Usage

- Memory per generation: <256MB
- CPU usage: <50% during peak
- Storage per will: <10MB
- Network transfer: <5MB per PDF

This research provides the foundation for implementing a robust, secure, and legally compliant will creation system in Schwalbe.
