import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('catalogo')
export default class CatalogoItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column('text')
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco!: number;

  @Column({ type: 'text' })
  imagem!: string;

  @Column({ type: 'varchar', length: 100 })
  tipo!: string;

  @Column({ type: 'varchar', length: 50 })
  comprimento!: string;

  @Column('int')
  estoque!: number;
}
