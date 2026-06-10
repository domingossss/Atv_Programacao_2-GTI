import helmet from 'helmet';
import { RequestHandler } from 'express';

/**
 * Middleware de segurança com Helmet.
 * 
 * Security Enhancements:
 * - Strengthened CSP with nonce-based scripts (future enhancement)
 * - Additional security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * - HSTS configuration for HTTPS enforcement
 * - TLS 1.3 enforcement should be configured at reverse proxy level (Nginx/Apache)
 * 
 * Configura headers de segurança HTTP incluindo CSP, HSTS e Referrer-Policy.
 * 
 * Note: For production, configure TLS 1.3 in your reverse proxy (Nginx example in docs/SECURITY.md)
 */
export const securityMiddleware = (): RequestHandler => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Add nonce support in future: ["'self'", "'nonce-{nonce}'"]
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
        // Additional CSP directives for enhanced security
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true, // Enable HSTS preloading
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    // Additional security headers
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    xContentTypeOptions: 'nosniff',
    xDnsPrefetchControl: { allow: false },
    xFrameOptions: { action: 'deny' },
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    // Disable X-Powered-By header to hide Express
    hidePoweredBy: true,
  });
};
