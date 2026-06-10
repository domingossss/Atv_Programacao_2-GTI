import { Router, Request, Response, NextFunction } from 'express';
import * as leadsService from './leads.service';
import { authMiddleware, requireRole } from '../../middlewares/auth';
import { antiReplayMiddleware } from '../../middlewares/antiReplay';

const router = Router();

// POST / — Público (sem auth), antiReplayMiddleware
router.post(
  '/',
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadsService.create(req.body);
      return res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  },
);

// GET / — Apenas admin autenticado
router.get(
  '/',
  authMiddleware,
  requireRole('admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const leads = await leadsService.findAll();
      return res.status(200).json(leads);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /:id — Apenas admin autenticado
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadsService.update(req.params.id, req.body);
      return res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /:id — Apenas admin autenticado
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadsService.remove(req.params.id);
      return res.status(200).json({ message: 'Lead removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
