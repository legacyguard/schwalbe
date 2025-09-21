
import { z } from 'zod';

// Document categories enum
export const DocumentCategory = {
  IDENTITY: 'identity',
  FINANCIAL: 'financial',
  PROPERTY: 'property',
  INSURANCE: 'insurance',
  MEDICAL: 'medical',
  LEGAL: 'legal',
  TAX: 'tax',
  EMPLOYMENT: 'employment',
  OTHER: 'other',
} as const;

export type DocumentCategoryType =
  (typeof DocumentCategory)[keyof typeof DocumentCategory];

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Document upload schema
export const documentUploadSchema = z.object({
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name must be less than 255 characters'),

  category: z.enum(Object.values(DocumentCategory) as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file.type),
      'File type not supported. Please upload PDF, Word, or image files.'
    ),

  expiryDate: z
    .string()
    .optional()
    .refine(
      date => !date || new Date(date) > new Date(),
      'Expiry date must be in the future'
    ),

  isConfidential: z.boolean().optional().default(false),

  tags: z
    .array(z.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

// Document update schema (without file)
export const documentUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name must be less than 255 characters'),

  category: z.enum(Object.values(DocumentCategory) as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  expiryDate: z
    .string()
    .optional()
    .refine(
      date => !date || new Date(date) > new Date(),
      'Expiry date must be in the future'
    ),

  isConfidential: z.boolean().optional().default(false),

  tags: z
    .array(z.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

// Document search schema
export const documentSearchSchema = z
  .object({
    query: z
      .string()
      .max(100, 'Search query must be less than 100 characters')
      .optional(),

    category: z
      .enum(Object.values(DocumentCategory) as [string, ...string[]])
      .optional(),

    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),

    tags: z.array(z.string()).optional(),

    includeExpired: z.boolean().optional().default(false),
    includeConfidential: z.boolean().optional().default(true),
  })
  .refine(
    data => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'Date from must be before date to',
      path: ['dateTo'],
    }
  );

// OCR request schema
export const ocrRequestSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  language: z.enum(['en', 'cs', 'sk', 'de']).optional().default('en'),
  enhanceQuality: z.boolean().optional().default(true),
});

// Type exports
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateFormData = z.infer<typeof documentUpdateSchema>;
export type DocumentSearchFormData = z.infer<typeof documentSearchSchema>;
export type OcrRequestFormData = z.infer<typeof ocrRequestSchema>;
