const { Client } = require('pg');

async function testConnection() {
  console.log('Testando conexão com SSL=true...');
  try {
    const client = new Client({
      host: 'dpg-d8krq8ernols73c320s0-a.oregon-postgres.render.com',
      port: 5432,
      user: 'charpynterhair_user',
      password: '7KV28g2Npdb5qNVJbVEegKJDFpvX3D9F',
      database: 'charpynterhair',
      ssl: true
    });
    
    await client.connect();
    console.log('✅ Conexão bem-sucedida com SSL=true!');
    await client.end();
    return;
  } catch (error) {
    console.log('❌ Erro com SSL=true:', error.message);
  }

  console.log('\nTestando conexão sem SSL...');
  try {
    const client = new Client({
      host: 'dpg-d8krq8ernols73c320s0-a.oregon-postgres.render.com',
      port: 5432,
      user: 'charpynterhair_user',
      password: '7KV28g2Npdb5qNVJbVEegKJDFpvX3D9F',
      database: 'charpynterhair',
      ssl: false
    });
    
    await client.connect();
    console.log('✅ Conexão bem-sucedida sem SSL!');
    await client.end();
  } catch (error) {
    console.log('❌ Erro sem SSL:', error.message);
  }
}

testConnection();
