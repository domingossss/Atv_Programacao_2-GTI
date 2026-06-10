import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de tratamento de erros.
 * Captura erros lançados em qualquer rota/middleware e retorna
 * resposta JSON padronizada. Em produção, oculta detalhes de erros 500.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ERROR]', err);

  const statusCode: number = err.statusCode || 500;

  // Em produção, oculta detalhes de erros internos
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    res.status(statusCode).json({
      error: 'Erro interno do servidor.',
    });
    return;
  }

  res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor.',
    ...(statusCode === 500 && { stack: err.stack }),
  });
};
