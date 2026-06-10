import * as catalogoRepository from './catalogo.repository';
import CatalogoItem from './catalogo.entity';

export const findAll = async (): Promise<CatalogoItem[]> => {
  return catalogoRepository.findAll();
};

export const create = async (data: Partial<CatalogoItem>): Promise<CatalogoItem> => {
  if (!data.nome || !data.descricao || data.preco === undefined || data.preco === null || !data.tipo) {
    const error: any = new Error('Nome, descrição, preço e tipo são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  if (Number(data.preco) < 0) {
    const error: any = new Error('Preço não pode ser negativo.');
    error.statusCode = 400;
    throw error;
  }

  if (data.estoque !== undefined && data.estoque !== null && Number(data.estoque) < 0) {
    const error: any = new Error('Estoque não pode ser negativo.');
    error.statusCode = 400;
    throw error;
  }

  return catalogoRepository.create(data);
};

export const update = async (id: string, data: Partial<CatalogoItem>): Promise<CatalogoItem> => {
  const updated = await catalogoRepository.update(id, data);
  if (!updated) {
    const error: any = new Error('Produto não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

export const remove = async (id: string): Promise<void> => {
  const removed = await catalogoRepository.remove(id);
  if (!removed) {
    const error: any = new Error('Produto não encontrado.');
    error.statusCode = 404;
    throw error;
  }
};
