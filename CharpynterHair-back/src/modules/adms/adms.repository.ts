import { AppDataSource } from '../../config/database';
import Admin from './adms.entity';
import RefreshToken from './refreshToken.entity';

const getAdminRepository = () => AppDataSource.getRepository(Admin);
export const getRefreshTokenRepository = () => AppDataSource.getRepository(RefreshToken);

/**
 * Busca um administrador pelo email
 */
export async function findByEmail(email: string): Promise<Admin | null> {
  const repo = getAdminRepository();
  return repo.findOne({ where: { email } });
}

/**
 * Busca um administrador pelo ID
 */
export async function findById(id: string): Promise<Admin | null> {
  const repo = getAdminRepository();
  return repo.findOne({ where: { id } });
}

/**
 * Busca todos os administradores
 */
export async function getAll(): Promise<Admin[]> {
  const repo = getAdminRepository();
  return repo.find();
}

/**
 * Cria e salva um novo administrador
 */
export async function createAdmin(data: {
  nome: string;
  email: string;
  senha: string;
  role?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiresAt?: Date;
}): Promise<Admin> {
  const repo = getAdminRepository();
  const admin = repo.create(data);
  return repo.save(admin);
}

/**
 * Salva um refresh token no banco de dados
 */
export async function saveRefreshToken(
  userId: string,
  tokenHash: string,
  tokenFamily: string,
  expiresAt: Date
): Promise<RefreshToken> {
  const repo = getRefreshTokenRepository();
  const refreshToken = repo.create({ userId, tokenHash, tokenFamily, expiresAt });
  return repo.save(refreshToken);
}

/**
 * Busca um refresh token pelo hash, incluindo a relação com o administrador
 */
export async function findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
  const repo = getRefreshTokenRepository();
  return repo.findOne({
    where: { tokenHash },
    relations: ['admin'],
  });
}

/**
 * Busca todos os refresh tokens de uma família de tokens
 * Used for token reuse detection in RTR (Refresh Token Rotation)
 */
export async function findRefreshTokenFamily(
  userId: string,
  tokenFamily: string
): Promise<RefreshToken[]> {
  const repo = getRefreshTokenRepository();
  return repo.find({
    where: { userId, tokenFamily },
  });
}

/**
 * Revoga toda a família de tokens de um usuário
 * Used when token reuse is detected
 */
export async function revokeTokenFamily(
  userId: string,
  tokenFamily: string
): Promise<void> {
  const repo = getRefreshTokenRepository();
  const now = new Date();
  await repo.update(
    { userId, tokenFamily },
    { revokedAt: now }
  );
}

/**
 * Deleta um refresh token pelo ID
 */
export async function deleteRefreshToken(id: string): Promise<void> {
  const repo = getRefreshTokenRepository();
  await repo.delete(id);
}

/**
 * Deleta todos os refresh tokens de um administrador
 */
export async function deleteAllRefreshTokensByUser(userId: string): Promise<void> {
  const repo = getRefreshTokenRepository();
  await repo.delete({ userId });
}

/**
 * Incrementa o contador de tentativas de login falhadas
 */
export async function incrementFailedLoginAttempts(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.increment({ id: userId }, 'failedLoginAttempts', 1);
}

/**
 * Reseta o contador de tentativas de login falhadas
 */
export async function resetFailedLoginAttempts(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, { failedLoginAttempts: 0 });
}

/**
 * Bloqueia a conta de um administrador por uma duração específica
 */
export async function lockAccount(userId: string, durationMinutes: number): Promise<void> {
  const repo = getAdminRepository();
  const lockedUntil = new Date();
  lockedUntil.setMinutes(lockedUntil.getMinutes() + durationMinutes);
  await repo.update({ id: userId }, { lockedUntil });
}

/**
 * Desbloqueia a conta de um administrador
 */
export async function unlockAccount(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, { lockedUntil: null, failedLoginAttempts: 0 });
}

/**
 * Atualiza o último login de um administrador
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, { lastLoginAt: new Date() });
}

/**
 * Atualiza a senha de um administrador
 */
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, { senha: newPassword });
}

/**
 * Atualiza o email de um administrador
 */
export async function updateEmail(userId: string, newEmail: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, { email: newEmail });
}

/**
 * Salva um token de reset de senha
 */
export async function savePasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, {
    passwordResetToken: tokenHash,
    passwordResetExpiresAt: expiresAt
  });
}

/**
 * Busca um token de reset de senha pelo hash
 */
export async function findPasswordResetToken(tokenHash: string): Promise<{
  id: string;
  userId: string;
  expiresAt: Date;
} | null> {
  const repo = getAdminRepository();
  const admin = await repo.findOne({
    where: { passwordResetToken: tokenHash }
  });

  if (!admin) {
    return null;
  }

  return {
    id: admin.id,
    userId: admin.id,
    expiresAt: admin.passwordResetExpiresAt!
  };
}

/**
 * Deleta um token de reset de senha
 */
export async function deletePasswordResetToken(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, {
    passwordResetToken: null,
    passwordResetExpiresAt: null
  });
}

/**
 * Busca administrador pelo token de verificação de email
 */
export async function findByEmailVerificationToken(token: string): Promise<Admin | null> {
  const repo = getAdminRepository();
  return repo.findOne({ where: { emailVerificationToken: token } });
}

/**
 * Marca email como verificado
 */
export async function verifyEmail(userId: string): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, {
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null
  });
}

/**
 * Atualiza o token de verificação de email
 */
export async function updateEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
  const repo = getAdminRepository();
  await repo.update({ id: userId }, {
    emailVerificationToken: token,
    emailVerificationExpiresAt: expiresAt
  });
}
