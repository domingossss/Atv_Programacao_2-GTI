import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware using Zod schemas.
 * 
 * Security Enhancements:
 * - Replaces manual validation in controllers
 * - Type-safe validation with detailed error messages
 * - Prevents injection attacks through strict schema validation
 * - Complements inputSanitizer as a defense-in-depth layer
 * 
 * This middleware validates request body against a Zod schema
 * before passing to the controller.
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      schema.parse(req.body);
      
      // If validation passes, proceed to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors for client
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Erro de validação',
          details: formattedErrors,
        });
        return;
      }

      // Handle unexpected errors
      res.status(500).json({ error: 'Erro interno ao validar requisição' });
    }
  };
};

/**
 * Validation middleware for query parameters.
 * Useful for validating GET request parameters.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Erro de validação nos parâmetros',
          details: formattedErrors,
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno ao validar parâmetros' });
    }
  };
};

/**
 * Validation middleware for route parameters.
 * Useful for validating URL parameters like /users/:id.
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Erro de validação nos parâmetros da rota',
          details: formattedErrors,
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno ao validar parâmetros da rota' });
    }
  };
};
