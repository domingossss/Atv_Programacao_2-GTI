import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import Nonce from '../modules/nonces/nonce.entity';

/**
 * Middleware anti-replay com persistência em MySQL.
 * 
 * Security Enhancements:
 * - Stores nonces in MySQL database instead of in-memory
 * - Unique constraint on nonce field prevents reuse
 * - 30-minute expiration for nonces
 * - Cleanup job runs every 5 minutes to delete expired nonces
 * - Survives server restarts (persistent storage)
 * 
 * Valida X-Request-Nonce e X-Request-Timestamp em requisições POST, PUT e DELETE
 * para prevenir ataques de replay e requisições duplicadas.
 */
export const antiReplayMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Apenas aplica a métodos que modificam dados
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const nonce = req.headers['x-request-nonce'] as string | undefined;
  const timestamp = req.headers['x-request-timestamp'] as string | undefined;

  // Verifica presença dos headers de segurança
  if (!nonce || !timestamp) {
    res.status(400).json({
      error: 'Headers de segurança ausentes (X-Request-Nonce, X-Request-Timestamp)',
    });
    return;
  }

  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();

  // Verifica se o timestamp não é muito antigo (5 minutos)
  if (isNaN(requestTime) || now - requestTime > 300000) {
    res.status(408).json({
      error: 'Requisição expirada. Timestamp muito antigo.',
    });
    return;
  }

  try {
    const nonceRepository = AppDataSource.getRepository(Nonce);

    // Verifica se o nonce já foi utilizado
    const existingNonce = await nonceRepository.findOne({ where: { nonce } });
    if (existingNonce) {
      res.status(409).json({
        error: 'Requisição duplicada detectada (nonce já utilizado).',
      });
      return;
    }

    // Armazena o nonce com expiração de 30 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const newNonce = nonceRepository.create({
      nonce,
      expiresAt,
    });
    await nonceRepository.save(newNonce);

    next();
  } catch (error) {
    console.error('Erro no middleware anti-replay:', error);
    res.status(500).json({ error: 'Erro interno ao validar nonce' });
  }
};
