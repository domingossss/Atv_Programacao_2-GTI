import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('galeria')
export default class GaleriaItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string | null;

  @Column({ type: 'varchar', length: 100 })
  categoria!: string;

  @Column({ type: 'text', nullable: true })
  imagem!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  midias!: string[] | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagem_url!: string | null;

  @CreateDateColumn({ name: 'data_upload' })
  data_upload!: Date;
}
