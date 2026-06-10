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
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'Lorena35FAF&',
  database: process.env.DB_NAME || 'bd_charpynterhair',
  synchronize: process.env.NODE_ENV !== 'production', // Cria/atualiza tabelas automaticamente (apenas em dev!)
  logging: process.env.NODE_ENV === 'development',
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
