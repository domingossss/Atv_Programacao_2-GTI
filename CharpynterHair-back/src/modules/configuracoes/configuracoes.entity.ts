import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configuracoes')
export default class Configuracoes {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  telefone!: string;

  @Column({ type: 'varchar', length: 50 })
  whatsapp!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  instagram!: string;

  @Column('text')
  endereco!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_segunda!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_terca!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_quarta!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_quinta!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_sexta!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_sabado!: string;

  @Column({ type: 'varchar', length: 50 })
  horario_domingo!: string;
}
