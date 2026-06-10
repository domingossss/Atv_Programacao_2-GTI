import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Entities
import Admin from '../modules/adms/adms.entity';
import RefreshToken from '../modules/adms/refreshToken.entity';
import Nonce from '../modules/nonces/nonce.entity';
import GaleriaItem from '../modules/galeria/galeria.entity';
import CatalogoItem  from '../modules/catalogo/catalogo.entity';
import Lead from '../modules/leads/leads.entity';
import Configuracoes from '../modules/configuracoes/configuracoes.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charpynterhair',
  synchronize: process.env.NODE_ENV !== 'production', // Cria/atualiza tabelas automaticamente (apenas em dev!)
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_HOST?.includes('render.com') ? true : false,
  entities: [
    Admin,
    RefreshToken,
    Nonce,
    GaleriaItem,
    CatalogoItem,
    Lead,
    Configuracoes,
  ],
  subscribers: [],
  migrations: ['src/migrations/**/*.ts'],
});
