import { Request, Response, NextFunction } from 'express';
import { decryptPayload, getE2EKey } from '../utils/crypto';

/**
 * Middleware para descriptografar automaticamente campos sensíveis no req.body.
 * Ele verifica se existe um campo complementar indicador com o sufixo _encrypted (ex: senha_encrypted: true)
 * e descriptografa o respectivo campo (ex: senha) antes de prosseguir.
 */
export const decryptMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    try {
      const key = getE2EKey();
      
      for (const [field, val] of Object.entries(req.body)) {
        const encryptedIndicator = `${field}_encrypted`;
        if (req.body[encryptedIndicator] === true && typeof val === 'string') {
          req.body[field] = decryptPayload(val, key);
          delete req.body[encryptedIndicator]; // Remove a flag para limpar o body
        }
      }
    } catch (error) {
      res.status(400).json({ error: 'Falha na descriptografia da requisição. Verifique as chaves e dados.' });
      return;
    }
  }
  next();
};
