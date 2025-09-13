# Will Generation Engine - API Contracts

This directory contains the API contracts for the Will Generation Engine specification 029.

## API Contract Specifications

The Will Generation Engine uses the following API contract patterns:

### Will Generation API

Main API endpoints for will generation operations:

- `POST /api/wills` - Will creation and management
- `GET /api/wills/:id` - Will retrieval and status
- `PUT /api/wills/:id` - Will updates and modifications
- `POST /api/wills/:id/generate` - Document generation and export

### Template Management API

APIs for legal template management:

- `GET /api/templates` - Template listing and filtering
- `POST /api/templates` - Template creation and updates
- `GET /api/templates/:id` - Template retrieval
- `PUT /api/templates/:id` - Template modifications

### Validation API

APIs for legal validation services:

- `POST /api/validate` - Real-time validation checks
- `GET /api/validation/:id` - Validation results and history
- `POST /api/compliance` - Compliance verification
- `GET /api/rules/:jurisdiction` - Jurisdiction rule retrieval

### Document Generation API

APIs for PDF generation services:

- `POST /api/documents/generate` - PDF generation
- `GET /api/documents/:id` - Document retrieval
- `POST /api/documents/:id/sign` - Digital signature operations
- `GET /api/documents/:id/download` - Document download

## Usage

These API contracts define the interface between the Will Generation Engine and other Schwalbe components. They ensure consistent integration and maintainable code across the system.

## Contract Updates

When updating these contracts:

1. Ensure backward compatibility
2. Update version numbers appropriately
3. Test against existing implementations
4. Document breaking changes
5. Update dependent specifications

## Related Specifications

- See main spec.md for overall requirements
- See data-model.md for data structures
- See quickstart.md for implementation examples
- See tasks.md for development tasks
