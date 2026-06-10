import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Admin from './adms.entity';

@Entity('refresh_tokens')
export default class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'token_hash' })
  tokenHash!: string;

  // Token family for refresh token rotation (RTR) and reuse detection
  @Column({ type: 'varchar', length: 255, name: 'token_family' })
  tokenFamily!: string;

  // ID of the token that replaced this one (for rotation tracking)
  @Column({ type: 'uuid', nullable: true, name: 'replaced_by' })
  replacedBy!: string | null;

  // When the token was revoked
  @Column({ type: 'timestamp', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Admin;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
