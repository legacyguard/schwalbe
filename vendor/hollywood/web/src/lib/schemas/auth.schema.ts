
import { z } from 'zod';
import { createValidationMessage, ValidationMessages } from '../validation-messages';

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, createValidationMessage(ValidationMessages.password.minLength(8)))
  .max(100, createValidationMessage(ValidationMessages.password.maxLength(100)))
  .regex(/[A-Z]/, createValidationMessage(ValidationMessages.password.uppercase()))
  .regex(/[a-z]/, createValidationMessage(ValidationMessages.password.lowercase()))
  .regex(/[0-9]/, createValidationMessage(ValidationMessages.password.number()))
  .regex(
    /[^A-Za-z0-9]/,
    createValidationMessage(ValidationMessages.password.specialChar())
  );

// Email validation
const emailSchema = z
  .string()
  .email(createValidationMessage(ValidationMessages.email.invalid()))
  .min(1, createValidationMessage(ValidationMessages.email.required()))
  .max(255, createValidationMessage(ValidationMessages.email.maxLength(255)));

// Sign up form schema
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, createValidationMessage(ValidationMessages.password.confirm())),
    firstName: z
      .string()
      .min(1, createValidationMessage(ValidationMessages.name.firstRequired()))
      .max(50, createValidationMessage(ValidationMessages.name.firstMaxLength(50)))
      .regex(/^[a-zA-Z\s-']+$/, createValidationMessage(ValidationMessages.name.invalidChars())),
    lastName: z
      .string()
      .min(1, createValidationMessage(ValidationMessages.name.lastRequired()))
      .max(50, createValidationMessage(ValidationMessages.name.lastMaxLength(50)))
      .regex(/^[a-zA-Z\s-']+$/, createValidationMessage(ValidationMessages.name.invalidChars())),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, createValidationMessage(ValidationMessages.terms.mustAccept())),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: createValidationMessage(ValidationMessages.password.noMatch()),
    path: ['confirmPassword'],
  });

// Sign in form schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, createValidationMessage(ValidationMessages.password.required())),
  rememberMe: z.boolean().optional(),
});

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, createValidationMessage(ValidationMessages.password.confirm())),
    token: z.string().min(1, createValidationMessage(ValidationMessages.token.resetRequired())),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: createValidationMessage(ValidationMessages.password.noMatch()),
    path: ['confirmPassword'],
  });

// Change password schema (for authenticated users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, createValidationMessage(ValidationMessages.password.current())),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, createValidationMessage(ValidationMessages.password.confirmNew())),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: createValidationMessage(ValidationMessages.password.noMatch()),
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: createValidationMessage(ValidationMessages.password.mustBeDifferent()),
    path: ['newPassword'],
  });

// Type exports
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
