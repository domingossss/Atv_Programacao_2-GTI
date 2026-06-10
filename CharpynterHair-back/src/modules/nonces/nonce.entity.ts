import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Nonce Entity for Anti-Replay Protection
 * 
 * This table stores nonces used in requests to prevent replay attacks.
 * Nonces are unique values that can only be used once within a time window.
 * 
 * Security Notes:
 * - Nonces expire after 30 minutes to prevent table bloat
 * - Unique constraint on nonce field prevents reuse
 * - Cleanup job runs every 5 minutes to delete expired nonces
 * - This replaces in-memory nonce storage with MySQL for persistence
 */
@Entity('nonces')
export default class Nonce {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  nonce!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
