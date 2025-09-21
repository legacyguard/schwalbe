/**
 * Accessibility testing and validation utilities
 */

export interface AccessibilityCheckResult {
  passes: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Check if an element has proper accessibility attributes
 */
export function checkElementAccessibility(element: HTMLElement): AccessibilityCheckResult {
  const passes: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for proper labeling
  if (element.tagName.toLowerCase() === 'input' ||
      element.tagName.toLowerCase() === 'select' ||
      element.tagName.toLowerCase() === 'textarea') {

    const hasLabel = element.labels && element.labels.length > 0;
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');

    if (hasLabel || hasAriaLabel || hasAriaLabelledBy) {
      passes.push('Form element has proper labeling');
    } else {
      errors.push('Form element missing label');
    }

    // Check for aria-describedby for help text
    if (element.hasAttribute('aria-describedby')) {
      passes.push('Form element has descriptive text');
    }

    // Check for required attribute
    if (element.hasAttribute('required') && !element.hasAttribute('aria-required')) {
      warnings.push('Required field should have aria-required="true"');
    }
  }

  // Check for proper button labeling
  if (element.tagName.toLowerCase() === 'button') {
    const hasText = element.textContent && element.textContent.trim().length > 0;
    const hasAriaLabel = element.hasAttribute('aria-label');

    if (hasText || hasAriaLabel) {
      passes.push('Button has accessible name');
    } else {
      errors.push('Button missing accessible name');
    }
  }

  // Check for keyboard accessibility
  const isFocusable = element.tabIndex >= 0 ||
                     ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());

  if (element.hasAttribute('onclick') && !isFocusable) {
    errors.push('Clickable element is not keyboard accessible');
  }

  // Check color contrast (simplified check)
  const style = window.getComputedStyle(element);
  const color = style.color;
  const backgroundColor = style.backgroundColor;

  if (color && backgroundColor && color !== backgroundColor) {
    passes.push('Element has color and background color set');
  }

  return { passes, warnings, errors };
}

/**
 * Check color contrast ratio (simplified implementation)
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  passes: { aa: boolean; aaa: boolean };
  level: 'fail' | 'aa' | 'aaa';
} {
  // This is a simplified implementation
  // In a real app, you'd use a proper color contrast library
  const luminance1 = getLuminance(foreground);
  const luminance2 = getLuminance(background);

  const ratio = luminance1 > luminance2
    ? (luminance1 + 0.05) / (luminance2 + 0.05)
    : (luminance2 + 0.05) / (luminance1 + 0.05);

  return {
    ratio,
    passes: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7
    },
    level: ratio >= 7 ? 'aaa' : ratio >= 4.5 ? 'aa' : 'fail'
  };
}

function getLuminance(color: string): number {
  // Simplified luminance calculation
  // This should be replaced with a proper implementation
  return 0.5; // Placeholder
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(element: HTMLElement): AccessibilityCheckResult {
  const passes: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check aria-describedby references
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const ids = describedBy.split(' ');
    const missingIds = ids.filter(id => !document.getElementById(id));

    if (missingIds.length === 0) {
      passes.push('All aria-describedby references are valid');
    } else {
      errors.push(`Invalid aria-describedby references: ${missingIds.join(', ')}`);
    }
  }

  // Check aria-labelledby references
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(' ');
    const missingIds = ids.filter(id => !document.getElementById(id));

    if (missingIds.length === 0) {
      passes.push('All aria-labelledby references are valid');
    } else {
      errors.push(`Invalid aria-labelledby references: ${missingIds.join(', ')}`);
    }
  }

  // Check for proper role usage
  const role = element.getAttribute('role');
  if (role) {
    const validRoles = [
      'alert', 'button', 'checkbox', 'dialog', 'form', 'grid', 'list', 'listitem',
      'main', 'navigation', 'region', 'status', 'tab', 'tabpanel', 'textbox'
    ];

    if (validRoles.includes(role)) {
      passes.push(`Valid ARIA role: ${role}`);
    } else {
      warnings.push(`Unknown or invalid ARIA role: ${role}`);
    }
  }

  return { passes, warnings, errors };
}

/**
 * Check keyboard accessibility
 */
export function checkKeyboardAccessibility(element: HTMLElement): AccessibilityCheckResult {
  const passes: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if interactive elements are focusable
  const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
  const isInteractive = interactiveElements.includes(element.tagName.toLowerCase()) ||
                       element.hasAttribute('onclick') ||
                       element.hasAttribute('onkeydown');

  if (isInteractive) {
    const isFocusable = element.tabIndex >= 0 ||
                       !element.hasAttribute('tabindex');

    if (isFocusable) {
      passes.push('Interactive element is keyboard accessible');
    } else {
      errors.push('Interactive element is not keyboard accessible');
    }

    // Check for keyboard event handlers
    const hasKeyboardHandler = element.hasAttribute('onkeydown') ||
                              element.hasAttribute('onkeyup') ||
                              element.hasAttribute('onkeypress');

    if (element.hasAttribute('onclick') && !hasKeyboardHandler) {
      warnings.push('Click handler should have corresponding keyboard handler');
    }
  }

  return { passes, warnings, errors };
}

/**
 * Generate accessibility report for a form
 */
export function generateFormAccessibilityReport(formElement: HTMLFormElement): AccessibilityCheckResult {
  const allResults: AccessibilityCheckResult = {
    passes: [],
    warnings: [],
    errors: []
  };

  // Check form-level attributes
  if (formElement.hasAttribute('aria-labelledby') || formElement.hasAttribute('aria-label')) {
    allResults.passes.push('Form has accessible name');
  } else {
    allResults.warnings.push('Form should have accessible name');
  }

  // Check all form controls
  const formControls = formElement.querySelectorAll('input, select, textarea, button');
  formControls.forEach((control, index) => {
    const controlResults = checkElementAccessibility(control as HTMLElement);
    const ariaResults = validateAriaAttributes(control as HTMLElement);
    const keyboardResults = checkKeyboardAccessibility(control as HTMLElement);

    // Prefix with control identifier
    const prefix = `Control ${index + 1}:`;
    allResults.passes.push(...controlResults.passes.map(p => `${prefix} ${p}`));
    allResults.warnings.push(...controlResults.warnings.map(w => `${prefix} ${w}`));
    allResults.errors.push(...controlResults.errors.map(e => `${prefix} ${e}`));

    allResults.passes.push(...ariaResults.passes.map(p => `${prefix} ${p}`));
    allResults.warnings.push(...ariaResults.warnings.map(w => `${prefix} ${w}`));
    allResults.errors.push(...ariaResults.errors.map(e => `${prefix} ${e}`));

    allResults.passes.push(...keyboardResults.passes.map(p => `${prefix} ${p}`));
    allResults.warnings.push(...keyboardResults.warnings.map(w => `${prefix} ${w}`));
    allResults.errors.push(...keyboardResults.errors.map(e => `${prefix} ${e}`));
  });

  return allResults;
}

/**
 * Debug accessibility in development mode
 */
export function debugAccessibility() {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🔍 Accessibility Debug Information');

  // Check for forms
  const forms = document.querySelectorAll('form');
  forms.forEach((form, index) => {
    console.group(`Form ${index + 1}`);
    const report = generateFormAccessibilityReport(form as HTMLFormElement);

    if (report.errors.length > 0) {
      console.error('❌ Errors:', report.errors);
    }
    if (report.warnings.length > 0) {
      console.warn('⚠️ Warnings:', report.warnings);
    }
    if (report.passes.length > 0) {
      console.log('✅ Passes:', report.passes);
    }

    console.groupEnd();
  });

  console.groupEnd();
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugAccessibility);
  } else {
    setTimeout(debugAccessibility, 1000);
  }
}