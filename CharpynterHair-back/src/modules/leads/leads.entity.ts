import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('leads')
export default class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome_cliente!: string;

  @Column({ type: 'varchar', length: 50 })
  telefone_whatsapp!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 150 })
  servico!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_contato!: Date;

  @Column({ type: 'varchar', length: 50, default: 'novo' })
  status_lead!: string;

  @Column({ type: 'boolean', default: false })
  lido!: boolean;

  @Column({ type: 'text', nullable: true })
  mensagem!: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;
}
