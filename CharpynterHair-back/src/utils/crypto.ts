import * as crypto from 'node:crypto';

/**
 * Backend Crypto Utility for E2E Encryption Decryption
 * 
 * Security Notes:
 * - Uses AES-256-GCM for authenticated encryption
 * - Supports key derivation from shared secret (for production key exchange)
 * - Development mode: Uses hardcoded key from E2E_ENCRYPTION_KEY env var
 * - Production mode: Should use ECDH key exchange for secure key establishment
 * - Handles authentication tag verification to prevent tampering
 * - Error handling for decryption failures
 * 
 * Key Management:
 * - Development: Hardcoded key in .env (E2E_ENCRYPTION_KEY)
 * - Production: Implement ECDH key exchange (documented in SECURITY.md)
 * - Key rotation strategy should be implemented for production
 */

/**
 * Decrypt E2E encrypted payload using AES-256-GCM
 * 
 * @param encryptedData - Base64-encoded encrypted data (IV + ciphertext + auth tag)
 * @param key - Encryption key (32 bytes for AES-256)
 * @returns Decrypted plaintext as string
 * @throws Error if decryption fails
 */
export function decryptPayload(encryptedData: string, key: string): string {
  try {
    // Decode base64 to buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Extract IV (first 12 bytes for GCM)
    const iv = encryptedBuffer.subarray(0, 12);
    
    // Extract auth tag (last 16 bytes for GCM)
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    
    // Extract ciphertext (middle part)
    const ciphertext = encryptedBuffer.subarray(12, encryptedBuffer.length - 16);

    // Derive key if needed (for production key exchange)
    const derivedKey = deriveKey(key);

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    
    // Set auth tag for GCM mode
    decipher.setAuthTag(authTag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  } catch (error) {
    throw new Error('Falha ao decriptar payload: dados inválidos ou chave incorreta');
  }
}

/**
 * Derive a 32-byte key from the provided key string
 * Uses HKDF (HMAC-based Extract-and-Expand Key Derivation Function)
 * 
 * @param key - Input key string
 * @returns 32-byte derived key for AES-256
 */
function deriveKey(key: string): Buffer {
  // Deve bater exatamente com a derivação do frontend (100k iterações, PBKDF2 com sha256 e sal fixo)
  return crypto.pbkdf2Sync(key, 'charpynter-salt', 100000, 32, 'sha256');
}

/**
 * Decrypt specific fields from an object
 * Useful for selectively decrypting sensitive fields
 * 
 * @param data - Object containing encrypted fields
 * @param fields - Array of field names to decrypt
 * @param key - Encryption key
 * @returns Object with specified fields decrypted
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[],
  key: string
): T {
  const decrypted = { ...data };
  
  for (const field of fields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decryptPayload(decrypted[field] as string, key) as T[keyof T];
      } catch (error) {
        // If decryption fails, keep original value
        // This allows graceful degradation for non-encrypted fields
        console.warn(`Failed to decrypt field ${String(field)}:`, error);
      }
    }
  }
  
  return decrypted;
}

/**
 * Get the E2E encryption key from environment
 * 
 * @returns Encryption key string
 * @throws Error if key is not configured
 */
export function getE2EKey(): string {
  const key = process.env.E2E_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('E2E_ENCRYPTION_KEY não configurado');
  }
  
  if (key.length < 32) {
    throw new Error('E2E_ENCRYPTION_KEY deve ter no mínimo 32 caracteres');
  }
  
  return key;
}
