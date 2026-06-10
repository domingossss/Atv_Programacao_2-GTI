import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getPrivateKey } from '../../config/keys';
import * as admsRepository from './adms.repository';
import { sendEmail, createAccountConfirmationEmail, createPasswordResetEmail } from '../../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;
const REFRESH_TOKEN_DAYS_LONG = 30; // 30 dias quando "manter logado" está ativo
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Registra um novo administrador
 */
export async function register(data: { nome: string; email: string; senha: string }) {
  const { nome, email, senha } = data;

  // Validação dos campos obrigatórios
  if (!nome || !email || !senha) {
    const error: any = new Error('Os campos nome, email e senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  // Validação do formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error: any = new Error('Formato de email inválido.');
    error.statusCode = 400;
    throw error;
  }

  // Validação do tamanho mínimo da senha
  if (senha.length < 6) {
    const error: any = new Error('A senha deve ter no mínimo 6 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  // Verificar se o email já está em uso
  const existingAdmin = await admsRepository.findByEmail(email);
  if (existingAdmin) {
    const error: any = new Error('Email já cadastrado.');
    error.statusCode = 409;
    throw error;
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

  // Criar o administrador com email não verificado
  const emailVerificationToken = uuidv4();
  const emailVerificationExpiresAt = new Date();
  emailVerificationExpiresAt.setHours(emailVerificationExpiresAt.getHours() + 24); // 24 horas

  const admin = await admsRepository.createAdmin({
    nome,
    email,
    senha: hashedPassword,
    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpiresAt,
  });

  // Enviar email de confirmação
  const emailHtml = createAccountConfirmationEmail(emailVerificationToken, email, nome);
  await sendEmail({
    to: email,
    subject: 'Confirme sua conta - Charpynter Hair',
    html: emailHtml,
  });

  // Retornar sem a senha
  const { senha: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
}

/**
 * Realiza o login do administrador com account lockout logic
 */
export async function login(email: string, senha: string, keepLoggedIn: boolean = false) {
  if (!email || !senha) {
    const error: any = new Error('Email e senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  // Buscar administrador pelo email
  const admin = await admsRepository.findByEmail(email);
  if (!admin) {
    const error: any = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  // Verificar se a conta está bloqueada
  if (admin.lockedUntil && new Date() < admin.lockedUntil) {
    const error: any = new Error('Conta temporariamente bloqueada devido a múltiplas tentativas falhas.');
    error.statusCode = 423;
    throw error;
  }

  // Verificar se o email está verificado
  if (!admin.isEmailVerified) {
    const error: any = new Error('Por favor, confirme seu email antes de fazer login.');
    error.statusCode = 403;
    throw error;
  }

  // Comparar senhas
  const isPasswordValid = await bcrypt.compare(senha, admin.senha);
  if (!isPasswordValid) {
    // Incrementar tentativas falhas
    await admsRepository.incrementFailedLoginAttempts(admin.id);

    // Verificar se deve bloquear a conta
    const updatedAdmin = await admsRepository.findById(admin.id);
    if (updatedAdmin && updatedAdmin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      await admsRepository.lockAccount(admin.id, LOCKOUT_DURATION_MINUTES);
      const error: any = new Error('Conta bloqueada devido a múltiplas tentativas falhas.');
      error.statusCode = 423;
      throw error;
    }

    const error: any = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  // Resetar tentativas falhas e atualizar último login
  await admsRepository.resetFailedLoginAttempts(admin.id);
  await admsRepository.updateLastLogin(admin.id);

  // Gerar token family UUID para RTR (Refresh Token Rotation)
  const tokenFamily = uuidv4();

  // Gerar access token usando RS256
  const privateKey = getPrivateKey();
  const accessToken = jwt.sign(
    { userId: admin.id, email: admin.email, role: admin.role },
    privateKey,
    { algorithm: 'RS256', expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Gerar refresh token
  const refreshToken = uuidv4();
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Calcular data de expiração baseada na opção "manter logado"
  const expiresAt = new Date();
  const refreshDays = keepLoggedIn ? REFRESH_TOKEN_DAYS_LONG : REFRESH_TOKEN_DAYS;
  expiresAt.setDate(expiresAt.getDate() + refreshDays);

  // Salvar no banco com token family
  await admsRepository.saveRefreshToken(admin.id, tokenHash, tokenFamily, expiresAt);

  // Retornar dados sem a senha
  const { senha: _, ...adminWithoutPassword } = admin;

  return {
    accessToken,
    refreshToken,
    admin: adminWithoutPassword,
  };
}

/**
 * Renova o access token usando RTR (Refresh Token Rotation)
 * Detecta reuso de tokens e revoga toda a família se detectado
 */
export async function refreshToken(token: string) {
  if (!token) {
    const error: any = new Error('Refresh token é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  // Hash do token recebido para comparar com o armazenado
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Buscar token no banco
  const storedToken = await admsRepository.findRefreshTokenByHash(tokenHash);
  if (!storedToken) {
    const error: any = new Error('Refresh token inválido.');
    error.statusCode = 401;
    throw error;
  }

  // Verificar se o token foi revogado
  if (storedToken.revokedAt) {
    const error: any = new Error('Refresh token revogado.');
    error.statusCode = 401;
    throw error;
  }

  // Verificar se o token expirou
  if (new Date() > storedToken.expiresAt) {
    await admsRepository.deleteRefreshToken(storedToken.id);
    const error: any = new Error('Refresh token expirado.');
    error.statusCode = 401;
    throw error;
  }

  // RTR: Detectar reuso - se o token já foi usado antes (replacedBy não é null)
  if (storedToken.replacedBy) {
    // Token reuso detectado - revogar toda a família
    await admsRepository.revokeTokenFamily(storedToken.userId, storedToken.tokenFamily);
    const error: any = new Error('Possível ataque de reuso de token detectado. Todos os tokens foram revogados.');
    error.statusCode = 401;
    throw error;
  }

  const admin = storedToken.user;

  // Gerar novo access token usando RS256
  const privateKey = getPrivateKey();
  const newAccessToken = jwt.sign(
    { userId: admin.id, email: admin.email, role: admin.role },
    privateKey,
    { algorithm: 'RS256', expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Gerar novo refresh token
  const newRefreshToken = uuidv4();
  const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  // Calcular nova data de expiração
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  // Salvar novo token no banco com a mesma família
  const newStoredToken = await admsRepository.saveRefreshToken(
    admin.id,
    newTokenHash,
    storedToken.tokenFamily,
    expiresAt
  );

  // Marcar o token antigo como substituído pelo novo (RTR)
  const { getRefreshTokenRepository } = admsRepository;
  await getRefreshTokenRepository().update(storedToken.id, {
    replacedBy: newStoredToken.id,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Realiza o logout deletando todos os refresh tokens do administrador
 */
export async function logout(userId: string) {
  await admsRepository.deleteAllRefreshTokensByUser(userId);
}

/**
 * Retorna o perfil do administrador autenticado
 */
export async function getProfile(userId: string) {
  const admin = await admsRepository.findById(userId);
  if (!admin) {
    const error: any = new Error('Administrador não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const { senha, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
}

/**
 * Troca a senha do administrador autenticado
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  if (!currentPassword || !newPassword) {
    const error: any = new Error('Senha atual e nova senha são obrigatórias.');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error: any = new Error('A nova senha deve ter no mínimo 6 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  // Buscar administrador pelo ID
  const admin = await admsRepository.findById(userId);
  if (!admin) {
    const error: any = new Error('Administrador não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  // Verificar se a senha atual está correta
  const isPasswordValid = await bcrypt.compare(currentPassword, admin.senha);
  if (!isPasswordValid) {
    const error: any = new Error('A senha atual está incorreta.');
    error.statusCode = 401;
    throw error;
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Atualizar a senha no banco
  await admsRepository.updatePassword(userId, hashedPassword);

  return { message: 'Senha atualizada com sucesso.' };
}

/**
 * Atualiza o email do administrador autenticado
 */
export async function changeEmail(userId: string, newEmail: string) {
  if (!newEmail) {
    const error: any = new Error('O novo email é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  // Validação do formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    const error: any = new Error('Formato de email inválido.');
    error.statusCode = 400;
    throw error;
  }

  // Verificar se o email já está em uso
  const existingAdmin = await admsRepository.findByEmail(newEmail);
  if (existingAdmin && existingAdmin.id !== userId) {
    const error: any = new Error('Email já cadastrado.');
    error.statusCode = 409;
    throw error;
  }

  // Atualizar o email no banco
  await admsRepository.updateEmail(userId, newEmail);

  return { message: 'Email atualizado com sucesso.' };
}

/**
 * Solicita recuperação de senha
 * Gera um token de reset e envia por email
 */
export async function forgotPassword(email: string) {
  if (!email) {
    const error: any = new Error('O email é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  // Validação do formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error: any = new Error('Formato de email inválido.');
    error.statusCode = 400;
    throw error;
  }

  // Buscar administrador pelo email
  const admin = await admsRepository.findByEmail(email);
  if (!admin) {
    // Por segurança, não informamos se o email existe ou não
    // Mas retornamos sucesso para evitar enumeração de emails
    return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' };
  }

  // Gerar token de reset
  const resetToken = uuidv4();
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Calcular data de expiração (1 hora)
  const resetTokenExpiresAt = new Date();
  resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

  // Salvar token no banco
  await admsRepository.savePasswordResetToken(admin.id, resetTokenHash, resetTokenExpiresAt);

  // Enviar email com link de reset
  const emailHtml = createPasswordResetEmail(resetToken, email);
  await sendEmail({
    to: email,
    subject: 'Redefinição de Senha - Charpynter Hair',
    html: emailHtml,
  });

  // Por segurança, não informamos se o email existe ou não
  return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' };
}

/**
 * Redefine a senha usando o token de reset
 */
export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    const error: any = new Error('Token e nova senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error: any = new Error('A nova senha deve ter no mínimo 6 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  // Hash do token recebido
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Buscar token no banco
  const resetTokenData = await admsRepository.findPasswordResetToken(tokenHash);
  if (!resetTokenData) {
    const error: any = new Error('Token de reset inválido ou expirado.');
    error.statusCode = 400;
    throw error;
  }

  // Verificar se o token expirou
  if (new Date() > resetTokenData.expiresAt) {
    await admsRepository.deletePasswordResetToken(resetTokenData.id);
    const error: any = new Error('Token de reset expirado.');
    error.statusCode = 400;
    throw error;
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Atualizar a senha
  await admsRepository.updatePassword(resetTokenData.userId, hashedPassword);

  // Marcar email como verificado (se ainda não estiver)
  await admsRepository.verifyEmail(resetTokenData.userId);

  // Deletar o token usado
  await admsRepository.deletePasswordResetToken(resetTokenData.id);

  return { message: 'Senha redefinida com sucesso.' };
}

/**
 * Reenvia email de verificação
 */
export async function resendVerificationEmail(email: string) {
  if (!email) {
    const error: any = new Error('O email é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  // Validação do formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error: any = new Error('Formato de email inválido.');
    error.statusCode = 400;
    throw error;
  }

  // Buscar administrador pelo email
  const admin = await admsRepository.findByEmail(email);
  if (!admin) {
    // Por segurança, não informamos se o email existe ou não
    return { message: 'Se o email estiver cadastrado, você receberá um novo email de verificação.' };
  }

  // Verificar se o email já foi verificado
  if (admin.isEmailVerified) {
    return { message: 'Email já verificado.' };
  }

  // Gerar novo token de verificação
  const newToken = uuidv4();
  const newExpiresAt = new Date();
  newExpiresAt.setHours(newExpiresAt.getHours() + 24); // 24 horas

  // Atualizar token no banco
  await admsRepository.updateEmailVerificationToken(admin.id, newToken, newExpiresAt);

  // Enviar novo email
  const emailHtml = createAccountConfirmationEmail(newToken, email, admin.nome);
  await sendEmail({
    to: email,
    subject: 'Confirme sua conta - Charpynter Hair',
    html: emailHtml,
  });

  return { message: 'Novo email de verificação enviado com sucesso!' };
}
