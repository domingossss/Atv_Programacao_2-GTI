import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral — 100 requisições por IP a cada 15 minutos.
 * 
 * Security Enhancements:
 * - Uses in-memory MemoryStore (default express-rate-limit)
 * - IP-based limiting to prevent abuse
 * - Standard headers for rate limit information
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // MemoryStore is used by default (in-memory storage)
});

/**
 * Rate limiter para autenticação — 5 tentativas por IP a cada 15 minutos.
 * 
 * Security Enhancements:
 * - Stricter limit for auth endpoints to prevent brute force
 * - IP-based limiting
 * - Complements account lockout logic in service layer
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // MemoryStore is used by default (in-memory storage)
});
