import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../config/keys';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware de autenticação JWT com RS256.
 * 
 * Security Enhancements:
 * - Uses RS256 asymmetric encryption with public/private key pair
 * - Verifies JWT signature with public key (private key stays on server)
 * - More secure than HS256 symmetric encryption
 * - Supports key rotation without invalidating all tokens
 * 
 * Extrai o token do header Authorization, verifica a assinatura
 * e popula req.userId e req.userRole.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Get public key for RS256 verification
    const publicKey = getPublicKey();

    // Verify token with RS256 algorithm using public key
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as TokenPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware de autorização por role.
 * Verifica se o role do usuário autenticado está na lista de roles permitidos.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }

    next();
  };
};
