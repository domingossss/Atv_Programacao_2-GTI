import { z } from 'zod';

/**
 * Zod validation schemas for authentication endpoints.
 * 
 * Security Enhancements:
 * - Type-safe validation with detailed error messages
 * - Prevents injection attacks through strict schema validation
 * - Custom error messages in Portuguese for better UX
 * - Email format validation
 * - Password strength validation
 */

/**
 * Schema for user registration
 * Validates nome, email, and senha fields
 */
export const registerSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(255, 'O nome deve ter no máximo 255 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .max(255, 'O email deve ter no máximo 255 caracteres')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(255, 'A senha deve ter no máximo 255 caracteres'),
});

/**
 * Schema for user login
 * Validates email and senha fields
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .max(255, 'O email deve ter no máximo 255 caracteres')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string()
    .min(1, 'A senha é obrigatória')
    .max(255, 'A senha deve ter no máximo 255 caracteres'),
  keepLoggedIn: z.boolean().optional(),
});

/**
 * Schema for refresh token
 * Validates the refresh token field
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'O refresh token é obrigatório')
    .uuid('Formato de refresh token inválido'),
});

/**
 * Schema for forgot password request
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .max(255, 'O email deve ter no máximo 255 caracteres')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
});

/**
 * Schema for reset password request
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'O token é obrigatório')
    .uuid('Formato de token inválido'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve ter no mínimo 6 caracteres')
    .max(255, 'A nova senha deve ter no máximo 255 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
