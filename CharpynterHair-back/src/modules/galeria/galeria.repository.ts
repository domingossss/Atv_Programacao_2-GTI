import { AppDataSource } from '../../config/database';
import GaleriaItem from './galeria.entity';

const repository = AppDataSource.getRepository(GaleriaItem);

export const findAll = async (): Promise<GaleriaItem[]> => {
  return repository.find({ order: { data_upload: 'DESC' } });
};

export const findById = async (id: string): Promise<GaleriaItem | null> => {
  return repository.findOneBy({ id });
};

export const create = async (data: Partial<GaleriaItem>): Promise<GaleriaItem> => {
  const item = repository.create(data);
  return repository.save(item);
};

export const update = async (id: string, data: Partial<GaleriaItem>): Promise<GaleriaItem | null> => {
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
