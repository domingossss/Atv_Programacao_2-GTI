import * as leadsRepository from './leads.repository';
import Lead from './leads.entity';

export const findAll = async (): Promise<Lead[]> => {
  return leadsRepository.findAll();
};

export const create = async (data: Partial<Lead>): Promise<Lead> => {
  // Validação de campos obrigatórios
  if (!data.nome_cliente || !data.telefone_whatsapp || !data.servico) {
    const error: any = new Error(
      'Os campos nome_cliente, telefone_whatsapp e servico são obrigatórios.',
    );
    error.status = 400;
    throw error;
  }

  // Forçar valores padrão ao criar
  data.status_lead = 'novo';
  data.lido = false;

  return leadsRepository.create(data);
};

export const update = async (
  id: string,
  data: Partial<Lead>,
): Promise<Lead> => {
  const existing = await leadsRepository.findById(id);
  if (!existing) {
    const error: any = new Error('Lead não encontrado.');
    error.status = 404;
    throw error;
  }

  // Não permitir alteração de nome_cliente e telefone_whatsapp
  delete data.nome_cliente;
  delete data.telefone_whatsapp;

  const updated = await leadsRepository.update(id, data);
  return updated!;
};

export const remove = async (id: string): Promise<boolean> => {
  const success = await leadsRepository.remove(id);
  if (!success) {
    const error: any = new Error('Lead não encontrado.');
    error.status = 404;
    throw error;
  }
  return true;
};
