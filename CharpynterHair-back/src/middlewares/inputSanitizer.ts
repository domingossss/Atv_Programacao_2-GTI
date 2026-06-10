import { Request, Response, NextFunction } from 'express';

/**
 * Sanitiza um valor recursivamente.
 * - Strings: remove tags <script>, escapa < e >
 * - Arrays: sanitiza cada elemento
 * - Objetos: sanitiza cada propriedade
 */
export const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    let sanitized = value.trim();
    // Remove tags <script>...</script> (case insensitive)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Escapa caracteres HTML
    sanitized = sanitized.replace(/</g, '&lt;');
    sanitized = sanitized.replace(/>/g, '&gt;');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }

  return value;
};

/**
 * Middleware de sanitização de input.
 * Aplica sanitização recursiva ao req.body para prevenir XSS.
 */
export const inputSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
};
