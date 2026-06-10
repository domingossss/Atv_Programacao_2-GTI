import { AppDataSource } from '../../config/database';
import CatalogoItem from './catalogo.entity';

const repository = AppDataSource.getRepository(CatalogoItem);

export const findAll = async (): Promise<CatalogoItem[]> => {
  return repository.find({ order: { nome: 'ASC' } });
};

export const findById = async (id: string): Promise<CatalogoItem | null> => {
  return repository.findOneBy({ id });
};

export const create = async (data: Partial<CatalogoItem>): Promise<CatalogoItem> => {
  const item = repository.create(data);
  return repository.save(item);
};

export const update = async (id: string, data: Partial<CatalogoItem>): Promise<CatalogoItem | null> => {
  const item = await repository.findOneBy({ id });
  if (!item) return null;

  repository.merge(item, data);
  return repository.save(item);
};

export const remove = async (id: string): Promise<boolean> => {
  const item = await repository.findOneBy({ id });
  if (!item) return false;

  await repository.remove(item);
  return true;
};
