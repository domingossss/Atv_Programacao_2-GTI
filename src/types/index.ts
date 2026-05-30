export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  imagem?: string;
  midias?: string[];
  imagem_url?: string;
  data_upload: string;
}

export interface CatalogoItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  tipo: string;
  comprimento: string;
  estoque: number;
}

export interface Configuracoes {
  telefone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  endereco: string;
  horario_segunda: string;
  horario_terca: string;
  horario_quarta: string;
  horario_quinta: string;
  horario_sexta: string;
  horario_sabado: string;
  horario_domingo: string;
}

export interface Lead {
  id: string;
  nome_cliente: string;
  telefone_whatsapp: string;
  email?: string;
  servico: string;
  data_contato: string;
  status_lead?: string;
  lido?: boolean;
  mensagem?: string;
  criadoEm?: string;
}

export interface AdminUser {
  email: string;
  password: string;
}
