/**
 * Utilities for E2E Encryption
 * This provides encryption/decryption for sensitive data before sending to backend
 * Uses AES-256-GCM to match backend implementation
 */

/**
 * Gets the E2E encryption key from environment variables
 */
export const getE2EKey = (): string => {
  return import.meta.env.VITE_E2E_ENCRYPTION_KEY || 'default-key-change-in-production-at-least-32-chars';
};

/**
 * Derive a 32-byte key from the provided key string using PBKDF2
 * Matches the backend implementation
 */
async function deriveKey(key: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('charpynter-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a payload using AES-256-GCM
 * Matches backend implementation with IV and auth tag
 */
export const encryptPayload = async (data: string, key: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const derivedKey = await deriveKey(key);

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      dataBytes
    );

    const encryptedArray = new Uint8Array(encrypted);

    // Combine IV + ciphertext + auth tag (auth tag is included in encrypted array by Web Crypto API)
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    // Convert to base64 for transmission
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt payload');
  }
};

/**
 * Decrypts a payload using AES-256-GCM
 * Matches backend implementation
 */
export const decryptPayload = async (encryptedData: string, key: string): Promise<string> => {
  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    // Extract IV (first 12 bytes for GCM)
    const iv = combined.slice(0, 12);

    // Extract ciphertext and auth tag (remaining bytes)
    const encrypted = combined.slice(12);

    const derivedKey = await deriveKey(key);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt payload');
  }
};
