/**
 * TypeScript types for the application
 * These should match the backend entities
 */

export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  imagem: string;
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
  id?: number;
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
  nome: string;
  email?: string;
  telefone?: string;
  mensagem: string;
  interesses?: string[];
  created_at?: string;
}
