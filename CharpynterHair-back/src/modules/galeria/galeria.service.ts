import * as galeriaRepository from './galeria.repository';
import GaleriaItem from './galeria.entity';

export const findAll = async (): Promise<GaleriaItem[]> => {
  return galeriaRepository.findAll();
};

export const create = async (data: Partial<GaleriaItem>): Promise<GaleriaItem> => {
  if (!data.titulo || !data.categoria) {
    const error: any = new Error('Título e categoria são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  return galeriaRepository.create(data);
};

export const update = async (id: string, data: Partial<GaleriaItem>): Promise<GaleriaItem> => {
  const updated = await galeriaRepository.update(id, data);
  if (!updated) {
    const error: any = new Error('Item da galeria não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

export const remove = async (id: string): Promise<void> => {
  const removed = await galeriaRepository.remove(id);
  if (!removed) {
    const error: any = new Error('Item da galeria não encontrado.');
    error.statusCode = 404;
    throw error;
  }
};
