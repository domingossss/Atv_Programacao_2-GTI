import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

/**
 * RSA Key Pair Management for RS256 JWT
 * 
 * This utility handles:
 * - Loading RSA keys from files or environment
 * - Generating new RSA key pairs (for development/setup)
 * - Key validation
 * 
 * Security Notes:
 * - Private keys must be kept secret and have restricted file permissions (600)
 * - Public keys can be distributed to verify JWT signatures
 * - Use 2048-bit or higher RSA keys for production
 * - Key rotation should be implemented for production (future enhancement)
 */

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

/**
 * Load RSA keys from file paths specified in environment variables
 * Falls back to generating keys if files don't exist (development only)
 */
export function loadKeys(): KeyPair {
  const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;
  const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;

  if (!privateKeyPath || !publicKeyPath) {
    throw new Error(
      'JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH must be set in environment variables'
    );
  }

  // Resolve absolute paths
  const resolvedPrivateKeyPath = path.resolve(privateKeyPath);
  const resolvedPublicKeyPath = path.resolve(publicKeyPath);

  try {
    const privateKey = fs.readFileSync(resolvedPrivateKeyPath, 'utf-8');
    const publicKey = fs.readFileSync(resolvedPublicKeyPath, 'utf-8');

    // Validate key format
    if (!privateKey.includes('-----BEGIN') || !publicKey.includes('-----BEGIN')) {
      throw new Error('Invalid key format: keys must be in PEM format');
    }

    return { privateKey, publicKey };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Keys don't exist - generate them for development
      console.warn(
        'RSA keys not found. Generating new keys for development. ' +
        'In production, keys should be pre-generated and secured.'
      );
      return generateAndSaveKeys(resolvedPrivateKeyPath, resolvedPublicKeyPath);
    }
    throw error;
  }
}

/**
 * Generate a new RSA key pair and save to files
 * This should only be used in development or initial setup
 */
function generateAndSaveKeys(privateKeyPath: string, publicKeyPath: string): KeyPair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Ensure directory exists
  const keyDir = path.dirname(privateKeyPath);
  if (!fs.existsSync(keyDir)) {
    fs.mkdirSync(keyDir, { recursive: true });
  }

  // Save keys with restricted permissions (600)
  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });

  console.log(`Generated RSA key pair:\n  Private: ${privateKeyPath}\n  Public: ${publicKeyPath}`);

  return { privateKey, publicKey };
}

/**
 * Validate that a key is a valid RSA key in PEM format
 */
export function validateKey(key: string, type: 'private' | 'public'): boolean {
  try {
    const beginMarker = type === 'private' 
      ? '-----BEGIN PRIVATE KEY-----' 
      : '-----BEGIN PUBLIC KEY-----';
    const endMarker = type === 'private'
      ? '-----END PRIVATE KEY-----'
      : '-----END PUBLIC KEY-----';

    return key.includes(beginMarker) && key.includes(endMarker);
  } catch {
    return false;
  }
}

/**
 * Get the public key for JWT verification
 * This is used by the auth middleware to verify JWT signatures
 */
export function getPublicKey(): string {
  const { publicKey } = loadKeys();
  return publicKey;
}

/**
 * Get the private key for JWT signing
 * This is used by the auth service to sign JWT tokens
 */
export function getPrivateKey(): string {
  const { privateKey } = loadKeys();
  return privateKey;
}
