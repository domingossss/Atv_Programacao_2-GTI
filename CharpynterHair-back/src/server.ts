import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/database';
import Nonce from './modules/nonces/nonce.entity';
import * as configuracoesService from './modules/configuracoes/configuracoes.service';

const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    // 1. Inicializar Conexão TypeORM
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco de dados MySQL estabelecida!');

    // 2. Garantir Seed das Configurações Iniciais
    await configuracoesService.seedDefault();
    console.log('✅ Configurações padrão verificadas/garantidas no banco!');

    // 3. Iniciar Job de Limpeza de Nonces Expirados
    // Executa a cada 5 minutos para deletar nonces expirados do MySQL
    setInterval(async () => {
      try {
        const nonceRepository = AppDataSource.getRepository(Nonce);
        const result = await nonceRepository
          .createQueryBuilder()
          .delete()
          .where('expiresAt < :now', { now: new Date() })
          .execute();
        
        if (result.affected > 0) {
          console.log(`🧹 Limpeza: ${result.affected} nonces expirados deletados`);
        }
      } catch (error) {
        console.error('❌ Erro ao limpar nonces expirados:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos
    console.log('✅ Job de limpeza de nonces iniciado (intervalo: 5 minutos)');

    // 4. Iniciar Servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Charpynter Hair rodando na porta ${PORT}`);
      console.log(`🔒 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();
