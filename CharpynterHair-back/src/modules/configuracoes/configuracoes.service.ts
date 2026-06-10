import * as configuracoesRepository from './configuracoes.repository';
import Configuracoes from './configuracoes.entity';

export const seedDefault = async (): Promise<Configuracoes> => {
  const defaultData: Partial<Configuracoes> = {
    telefone: '+55 12 98200-1553',
    whatsapp: '5512982001553',
    email: 'contato@josemegahair.com',
    instagram: '@josemegahair',
    endereco: 'Av. Sete de Setembro, 317, 12606-150 Lorena, SP',
    horario_segunda: '09:00 - 18:00',
    horario_terca: '09:00 - 18:00',
    horario_quarta: '09:00 - 18:00',
    horario_quinta: '09:00 - 18:00',
    horario_sexta: '09:00 - 18:00',
    horario_sabado: '09:00 - 17:00',
    horario_domingo: 'Fechado',
  };

  return configuracoesRepository.upsert(defaultData);
};

export const get = async (): Promise<Configuracoes> => {
  const config = await configuracoesRepository.get();

  if (!config) {
    // Seed automático na primeira consulta
    return seedDefault();
  }

  return config;
};

export const update = async (
  data: Partial<Configuracoes>,
): Promise<Configuracoes> => {
  return configuracoesRepository.upsert(data);
};
