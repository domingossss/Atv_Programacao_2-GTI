# Charpynter Hair - Security Documentation

## Overview

This document describes the security architecture and implementation details for the Charpynter Hair backend API. The system follows an "Assume Breach" security model, implementing defense-in-depth strategies to protect against common attacks.

## Architecture

### Security Layers

1. **Transport Layer**: TLS 1.3 (configured at reverse proxy)
2. **Application Layer**: Helmet, CORS, Rate Limiting
3. **Authentication**: RS256 JWT with Refresh Token Rotation (RTR)
4. **Input Validation**: Zod schemas + input sanitization
5. **Data Protection**: E2E encryption for sensitive fields
6. **Anti-Replay**: MySQL-based nonce validation
7. **Account Security**: Lockout after failed attempts

## Threat Model

### Mitigated Threats

- **Brute Force Attacks**: Rate limiting + account lockout
- **Replay Attacks**: Nonce validation with MySQL persistence
- **XSS Attacks**: Input sanitization + CSP headers
- **CSRF Attacks**: SameSite cookies + CSRF tokens (future)
- **SQL Injection**: TypeORM parameterized queries
- **Token Theft**: RTR with family tracking
- **Man-in-the-Middle**: TLS 1.3 + E2E encryption
- **Key Exposure**: RS256 asymmetric encryption

## Security Decisions Rationale

### RS256 vs HS256 JWT

**Decision**: Use RS256 (asymmetric) instead of HS256 (symmetric)

**Rationale**:
- Private key stays on server, public key can be distributed
- Supports key rotation without invalidating all tokens
- More secure for distributed systems
- Industry standard for production applications

### MySQL vs Redis for Nonces

**Decision**: Use MySQL instead of Redis for nonce storage

**Rationale**:
- Simplifies infrastructure (single database)
- Survives server restarts
- Sufficient performance for nonce operations
- No additional service to manage
- Cleanup job handles expired nonces

### In-Memory vs Redis for Rate Limiting

**Decision**: Use in-memory MemoryStore (express-rate-limit default)

**Rationale**:
- Sufficient for single-instance deployment
- No additional infrastructure
- Fast and low latency
- Can be upgraded to Redis if horizontal scaling is needed

### E2E Encryption Implementation

**Decision**: AES-256-GCM with Web Crypto API

**Rationale**:
- Authenticated encryption prevents tampering
- Web Crypto API is browser-native and secure
- Compatible with Node.js crypto module
- Industry-standard algorithm

## Key Management

### RSA Key Pair (RS256 JWT)

**Generation**:
```bash
# Generate private key (2048-bit)
openssl genrsa -out keys/private.pem 2048

# Generate public key
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Set permissions
chmod 600 keys/private.pem
chmod 644 keys/public.pem
```

**Storage**:
- Private key: `./keys/private.pem` (chmod 600)
- Public key: `./keys/public.pem` (chmod 644)
- Environment variables: `JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH`

**Rotation**:
1. Generate new key pair
2. Update environment variables
3. Gradually phase out old tokens (implement grace period)
4. Delete old keys after all tokens expired

### E2E Encryption Key

**Development**: Hardcoded in `.env` (E2E_ENCRYPTION_KEY)

**Production**: Implement ECDH key exchange
```javascript
// Future implementation
// 1. Server generates ECDH key pair
// 2. Client generates ECDH key pair
// 3. Exchange public keys
// 4. Derive shared secret
// 5. Use shared secret for encryption
```

## MySQL Nonce Cleanup Job

**Configuration**: Runs every 5 minutes

**Implementation** (in `src/server.ts`):
```typescript
// Cleanup expired nonces every 5 minutes
setInterval(async () => {
  try {
    const nonceRepository = AppDataSource.getRepository(Nonce);
    const result = await nonceRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    
    if (result.affected > 0) {
      console.log(`Cleaned up ${result.affected} expired nonces`);
    }
  } catch (error) {
    console.error('Error cleaning up nonces:', error);
  }
}, 5 * 60 * 1000); // 5 minutes
```

## TLS 1.3 Configuration

### Nginx Example

```nginx
server {
    listen 443 ssl http2;
    server_name api.charpynterhair.com;

    # TLS 1.3 only
    ssl_protocols TLSv1.3;
    
    # Strong cipher suites
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
    ssl_prefer_server_ciphers off;
    
    # SSL certificates
    ssl_certificate /etc/ssl/certs/api.charpynterhair.com.crt;
    ssl_certificate_key /etc/ssl/private/api.charpynterhair.com.key;
    
    # HSTS (1 year, include subdomains, preload)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Other security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Refresh Token Rotation (RTR)

### Implementation

1. **Token Family**: Each login generates a unique family UUID
2. **Rotation**: Each refresh creates a new token in the same family
3. **Reuse Detection**: If an old token is used, entire family is revoked
4. **Storage**: MySQL with `tokenFamily` and `replacedBy` columns

### Flow

```
Login → Generate token family → Store refresh token
Refresh → Create new token → Mark old as replaced → Return new token
Reuse old token → Detect reuse → Revoke entire family → Force re-login
```

## Account Lockout

### Configuration

- **Max Failed Attempts**: 5
- **Lockout Duration**: 15 minutes
- **Reset on Success**: Yes

### Implementation

```typescript
// Increment failed attempts
await incrementFailedLoginAttempts(userId);

// Check if should lock
if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
  await lockAccount(userId, LOCKOUT_DURATION_MINUTES);
}

// Reset on successful login
await resetFailedLoginAttempts(userId);
```

## Environment Variables

### Required

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=charpynter_hair

# JWT (RS256)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# E2E Encryption
E2E_ENCRYPTION_KEY=change_this_to_a_secure_32_byte_key_in_production

# Server
PORT=3333
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Security Best Practices

### Development

1. Never commit `.env` files
2. Use strong, unique passwords
3. Keep dependencies updated
4. Enable security headers in development
5. Test with realistic attack scenarios

### Production

1. Use TLS 1.3 only
2. Enable HSTS with preload
3. Implement proper key rotation
4. Use ECDH for E2E key exchange
5. Monitor for suspicious activity
6. Regular security audits
7. Keep backups encrypted
8. Use secrets management (AWS Secrets Manager, etc.)

## Testing Security

### Test Scenarios

1. **RS256 JWT Verification**
   - Sign with private key
   - Verify with public key
   - Test expired tokens
   - Test invalid signatures

2. **MySQL Token Storage**
   - Store refresh token
   - Retrieve by hash
   - Test token family tracking
   - Test cleanup job

3. **Refresh Token Rotation**
   - Normal refresh flow
   - Reuse detection
   - Family revocation
   - Concurrent refresh handling

4. **Anti-Replay Nonce**
   - Valid nonce acceptance
   - Duplicate nonce rejection
   - Expired nonce rejection
   - Timestamp validation

5. **E2E Encryption**
   - Encrypt with frontend
   - Decrypt with backend
   - Test tampering detection
   - Test key mismatch

6. **Zod Validation**
   - Valid input acceptance
   - Invalid input rejection
   - Type coercion
   - Custom error messages

## Monitoring and Alerts

### Key Metrics

- Failed login attempts per IP
- Rate limit violations
- Nonce reuse attempts
- Token family revocations
- Decryption failures

### Alert Thresholds

- >10 failed logins from same IP in 5 minutes
- >100 rate limit violations per hour
- Any nonce reuse detection
- >5 token family revocations per hour

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [TLS 1.3 RFC](https://tools.ietf.org/html/rfc8446)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
