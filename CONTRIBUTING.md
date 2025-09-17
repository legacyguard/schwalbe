# Contributing to Hollywood

Thank you for your interest in contributing to Hollywood! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Be mindful of your language

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information
- Any conduct that could be considered inappropriate

## Getting Started

### Prerequisites

1. **Fork the repository**
   ```bash
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR_USERNAME/hollywood.git
   cd hollywood
   ```

2. **Set up the development environment**
   ```bash
   # Add upstream remote
   git remote add upstream https://github.com/legacyguard/hollywood.git
   
   # Install dependencies
   npm install --legacy-peer-deps
   
   # Build packages
   npm run build:packages
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Setup

1. **Install required tools**
   - Node.js 20.18+
   - npm 10.8+
   - Git
   - VS Code (recommended)

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development values
   ```

3. **Verify setup**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

## Development Process

### 1. Find or Create an Issue

- Check existing issues for something you'd like to work on
- If creating a new issue, provide clear description and context
- Wait for maintainer feedback before starting major work

### 2. Work on Your Feature

```bash
# Keep your fork updated
git fetch upstream
git merge upstream/main

# Make your changes
npm run dev  # Development mode

# Test your changes
npm test
npm run type-check
npm run lint
```

### 3. Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(ui): add new button component"
git commit -m "fix(auth): resolve login timeout issue"
git commit -m "docs: update README with new examples"
git commit -m "refactor(logic): simplify date formatting"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code change that neither fixes nor adds feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scope** (optional):
- `ui`: UI components package
- `logic`: Logic package
- `shared`: Shared package
- `web`: Web application
- `mobile`: Mobile application
- `demo`: Demo application

### 4. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no warnings
- [ ] I have added tests for my changes
- [ ] All tests pass locally

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #[issue number]
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review code quality and architecture
3. **Feedback**: Address review comments
4. **Approval**: Two maintainer approvals required
5. **Merge**: Maintainer merges PR

## Coding Standards

### TypeScript

```typescript
// Use explicit types
interface UserData {
  id: string;
  name: string;
  email: string;
}

// Prefer const assertions
const COLORS = ['red', 'green', 'blue'] as const;

// Use descriptive names
const getUserById = async (userId: string): Promise<UserData> => {
  // Implementation
};

// Document complex logic
/**
 * Calculates the document expiration date
 * @param createdAt - Document creation date
 * @param retentionDays - Number of days to retain
 * @returns Expiration date or null if permanent
 */
const calculateExpiration = (
  createdAt: Date,
  retentionDays?: number
): Date | null => {
  if (!retentionDays) return null;
  // ...
};
```

### React Components

```tsx
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {label}
    </button>
  );
};

// Use custom hooks for logic
const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  return { documents, loading };
};
```

### File Organization

```
src/
├── components/       # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
├── hooks/           # Custom React hooks
├── services/        # Business logic
├── utils/           # Utility functions
├── types/           # TypeScript types
└── styles/          # Global styles
```

## Testing Requirements

### Unit Tests

```typescript
// packages/logic/src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('validates correct email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  
  it('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
  
  it('handles empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### Component Tests

```tsx
// components/Button/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(
      <Button label="Click me" onClick={() => {}} />
    );
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByTestId } = render(
      <Button label="Click" onClick={handleClick} />
    );
    
    fireEvent.click(getByTestId('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Coverage Requirements

- New features: 80% coverage minimum
- Bug fixes: Include regression tests
- Refactoring: Maintain existing coverage

## Documentation

### Code Comments

```typescript
// Good: Explains why
// We need to debounce to prevent API rate limiting
const debouncedSearch = debounce(search, 300);

// Bad: Explains what (obvious from code)
// Set loading to true
setLoading(true);
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing setup process
- Modifying API
- Adding dependencies

### API Documentation

```typescript
/**
 * Service for managing user documents
 * @example
 * const service = new DocumentService();
 * const docs = await service.getDocuments(userId);
 */
export class DocumentService {
  /**
   * Retrieves all documents for a user
   * @param userId - The user's unique identifier
   * @param options - Optional query parameters
   * @returns Promise resolving to array of documents
   * @throws {ApiError} If the request fails
   */
  async getDocuments(
    userId: string,
    options?: QueryOptions
  ): Promise<Document[]> {
    // Implementation
  }
}
```

## Community

### Getting Help

- **Documentation**: Check [docs/](docs/) first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (link in README)

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Use the bug template** when creating issues
3. **Provide reproduction steps** and environment details
4. **Include error messages** and screenshots if applicable

### Suggesting Features

1. **Check the roadmap** for planned features
2. **Open a discussion** for major features
3. **Provide use cases** and examples
4. **Consider implementation** complexity

### First-Time Contributors

Look for issues labeled:
- `good first issue` - Simple tasks for newcomers
- `help wanted` - Tasks where we need assistance
- `documentation` - Documentation improvements

## Recognition

Contributors are recognized in:
- Project README
- Release notes
- Contributors page

Thank you for contributing to Hollywood! 🎬
