import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { securityMiddleware } from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { inputSanitizer } from './middlewares/inputSanitizer';
import { errorHandler } from './middlewares/errorHandler';

// Import Routers
import admsRouter from './modules/adms/adms.controller';
import galeriaRouter from './modules/galeria/galeria.controller';
import catalogoRouter from './modules/catalogo/catalogo.controller';
import leadsRouter from './modules/leads/leads.controller';
import configuracoesRouter from './modules/configuracoes/configuracoes.controller';

const app = express();

// 1. Security Headers (Helmet com CSP)
app.use(securityMiddleware());

// 2. Cookie Parser (para ler cookies httpOnly)
app.use(cookieParser());

// 3. CORS (Restrito)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // Permite envio de cookies
  })
);

// 4. Proteção contra Poluição de Parâmetros HTTP
app.use(hpp());

// 5. Limitação do tamanho do Body (Express JSON) - aumentado para suportar imagens base64
app.use(express.json({ limit: '50mb' }));

// 6. Sanitização de Input (Anti-XSS Persistente)
app.use(inputSanitizer);

// 7. Rate Limiter Geral
app.use(generalLimiter);

// 8. Rotas da Aplicação
app.use('/auth', admsRouter);
app.use('/galeria', galeriaRouter);
app.use('/catalogo', catalogoRouter);
app.use('/leads', leadsRouter);
app.use('/configuracoes', configuracoesRouter);

// 9. Error Handler Global (Sempre deve ser o último middleware)
app.use(errorHandler);

export default app;
