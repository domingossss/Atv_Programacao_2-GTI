import { AppDataSource } from '../../config/database';
import Lead from './leads.entity';

const getRepo = () => AppDataSource.getRepository(Lead);

export const findAll = async (): Promise<Lead[]> => {
  return getRepo().find({ order: { criadoEm: 'DESC' } });
};

export const findById = async (id: string): Promise<Lead | null> => {
  return getRepo().findOneBy({ id });
};

export const create = async (data: Partial<Lead>): Promise<Lead> => {
  const repo = getRepo();
  const lead = repo.create(data);
  return repo.save(lead);
};

export const update = async (
  id: string,
  data: Partial<Lead>,
): Promise<Lead | null> => {
  const repo = getRepo();
  const lead = await repo.findOneBy({ id });
  if (!lead) return null;

  repo.merge(lead, data);
  return repo.save(lead);
};

export const remove = async (id: string): Promise<boolean> => {
  const repo = getRepo();
  const lead = await repo.findOneBy({ id });
  if (!lead) return false;

  await repo.remove(lead);
  return true;
};
