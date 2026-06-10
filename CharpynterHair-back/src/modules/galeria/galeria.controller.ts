import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth';
import { antiReplayMiddleware } from '../../middlewares/antiReplay';
import * as galeriaService from './galeria.service';

const router = Router();

// GET / — público, lista todos os itens da galeria
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await galeriaService.findAll();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

// POST / — admin, cria novo item na galeria
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await galeriaService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id — admin, atualiza item da galeria
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await galeriaService.update(req.params.id, req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id — admin, remove item da galeria
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await galeriaService.remove(req.params.id);
      res.status(200).json({ message: 'Foto removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
