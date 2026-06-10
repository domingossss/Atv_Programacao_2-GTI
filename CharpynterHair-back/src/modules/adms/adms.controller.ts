import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { authLimiter } from '../../middlewares/rateLimiter';
import { antiReplayMiddleware } from '../../middlewares/antiReplay';
import { decryptMiddleware } from '../../middlewares/decrypt';
import { validateRequest } from '../../middlewares/validation';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../../validations/auth.validation';
import * as admsService from './adms.service';

const router = Router();

/**
 * POST /register — Cadastro de novo administrador
 * Uses Zod validation for input sanitization
 */
router.post(
  '/register',
  authLimiter,
  antiReplayMiddleware,
  // decryptMiddleware, // Temporariamente desabilitado para debug
  validateRequest(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, email, senha } = req.body;
      const admin = await admsService.register({ nome, email, senha });
      res.status(201).json({ admin });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /login — Autenticação do administrador
 * Uses Zod validation for input sanitization
 */
router.post(
  '/login',
  authLimiter,
  // decryptMiddleware, // Temporariamente desabilitado para debug
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Body recebido no login:', req.body);
    next();
  },
  validateRequest(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, senha, keepLoggedIn } = req.body;
      const result = await admsService.login(email, senha, keepLoggedIn === true || keepLoggedIn === 'true');

      // Calcular maxAge baseado em keepLoggedIn
      const maxAge = (keepLoggedIn ? 30 : 7) * 24 * 60 * 60 * 1000;

      // Setar refresh token como cookie httpOnly
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: maxAge, // 30 dias se keepLoggedIn, 7 dias se não
      });

      res.json({
        accessToken: result.accessToken,
        admin: result.admin,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /refresh — Renovação do access token com RTR
 * Tenta ler refresh token do cookie primeiro, depois do body
 */
router.post(
  '/refresh',
  async (req: any, res: Response, next: NextFunction) => {
    try {
      // Tenta ler do cookie primeiro (httpOnly)
      let refreshToken = req.cookies?.refreshToken;

      // Se não estiver no cookie, tenta do body (para compatibilidade)
      if (!refreshToken && req.body?.refreshToken) {
        refreshToken = req.body.refreshToken;
      }

      if (!refreshToken) {
        const error: any = new Error('Refresh token não fornecido.');
        error.statusCode = 401;
        throw error;
      }

      const result = await admsService.refreshToken(refreshToken);

      // Setar novo refresh token como cookie httpOnly
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      res.json({ accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /logout — Encerramento da sessão do administrador
 */
router.post(
  '/logout',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await admsService.logout(req.userId!);

      // Limpar o cookie de refresh token
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
      });

      res.json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /me — Perfil do administrador autenticado
 */
router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await admsService.getProfile(req.userId!);
      res.json({ admin });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /change-password — Troca a senha do administrador autenticado
 */
router.put(
  '/change-password',
  authMiddleware,
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await admsService.changePassword(req.userId!, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /change-email — Troca o email do administrador autenticado
 */
router.put(
  '/change-email',
  authMiddleware,
  antiReplayMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail } = req.body;
      const result = await admsService.changeEmail(req.userId!, newEmail);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /forgot-password — Solicita recuperação de senha
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await admsService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /reset-password — Redefine a senha usando token
 */
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      const result = await admsService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /verify-email — Verifica email usando token
 */
router.get(
  '/verify-email',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        const error: any = new Error('Token de verificação é obrigatório.');
        error.statusCode = 400;
        throw error;
      }
      const result = await admsService.verifyEmail(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /resend-verification — Reenvia email de verificação
 */
router.post(
  '/resend-verification',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Validação manual básica
      if (!email) {
        const error: any = new Error('O email é obrigatório.');
        error.statusCode = 400;
        throw error;
      }

      const result = await admsService.resendVerificationEmail(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
