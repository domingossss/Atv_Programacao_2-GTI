import { Router, Request, Response, NextFunction } from 'express';
import * as configuracoesService from './configuracoes.service';
import { authMiddleware, requireRole } from '../../middlewares/auth';
import { antiReplayMiddleware } from '../../middlewares/antiReplay';

const router = Router();

// GET / — Público
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await configuracoesService.get();
      return res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  },
);

// PUT / — Apenas admin autenticado
router.put(
  '/',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await configuracoesService.update(req.body);
      return res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
