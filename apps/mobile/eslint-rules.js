/**
 * Custom ESLint rules for mobile app
 */

module.exports = {
  rules: {
    'no-hardcoded-strings': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Detect hardcoded user-facing strings that should be translated',
          category: 'i18n',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              allowed: {
                type: 'array',
                items: { type: 'string' },
              },
              ignore: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          hardcodedString: 'Hardcoded user-facing string detected: "{{text}}". Use translation key instead.',
        },
      },
      create(context) {
        const options = context.options[0] || {};
        const allowed = options.allowed || [];
        const ignore = options.ignore || [];

        // Check if file should be ignored
        const filename = context.getFilename();
        const shouldIgnore = ignore.some(pattern => {
          if (pattern.includes('*')) {
            // Simple glob matching
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(filename);
          }
          return filename.includes(pattern);
        });

        if (shouldIgnore) {
          return {};
        }

        return {
          Literal(node) {
            // Only check string literals
            if (typeof node.value !== 'string') {
              return;
            }

            const text = node.value.trim();

            // Skip empty strings or very short strings
            if (text.length < 3) {
              return;
            }

            // Skip strings that are allowed
            if (allowed.some(allowedPattern => {
              if (allowedPattern.startsWith('/') && allowedPattern.endsWith('/')) {
                // Regex pattern
                const regex = new RegExp(allowedPattern.slice(1, -1));
                return regex.test(text);
              }
              return text === allowedPattern;
            })) {
              return;
            }

            // Check if it looks like user-facing text
            // Contains spaces and letters, not code-like
            const hasSpaces = text.includes(' ');
            const hasLetters = /[a-zA-Z]/.test(text);
            const isNotCode = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text); // Not a variable name
            const isNotUrl = !/^https?:\/\//.test(text);
            const isNotColor = !/^#[0-9a-fA-F]{3,8}$/.test(text);
            const isNotCssVar = !/^\$.+/.test(text);

            if (hasSpaces && hasLetters && isNotCode && isNotUrl && isNotColor && isNotCssVar) {
              context.report({
                node,
                messageId: 'hardcodedString',
                data: { text },
              });
            }
          },
        };
      },
    },
  },
};