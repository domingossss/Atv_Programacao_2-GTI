import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth';
import { antiReplayMiddleware } from '../../middlewares/antiReplay';
import * as catalogoService from './catalogo.service';

const router = Router();

// GET / — público, lista todos os produtos do catálogo
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await catalogoService.findAll();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

// POST / — admin, cria novo produto no catálogo
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await catalogoService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id — admin, atualiza produto do catálogo
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await catalogoService.update(id, req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id — admin, remove produto do catálogo
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await catalogoService.remove(id);
      res.status(200).json({ message: 'Produto removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
