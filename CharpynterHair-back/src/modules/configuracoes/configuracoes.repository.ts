import { AppDataSource } from '../../config/database';
import Configuracoes from './configuracoes.entity';

const getRepo = () => AppDataSource.getRepository(Configuracoes);

export const get = async (): Promise<Configuracoes | null> => {
  return getRepo().findOne({ where: { id: 1 } });
};

export const upsert = async (
  data: Partial<Configuracoes>,
): Promise<Configuracoes> => {
  const repo = getRepo();
  const existing = await repo.findOne({ where: { id: 1 } });

  if (existing) {
    repo.merge(existing, data);
    return repo.save(existing);
  }

  // Criar novo registro com id = 1
  const config = repo.create({ ...data, id: 1 });
  return repo.save(config);
};
