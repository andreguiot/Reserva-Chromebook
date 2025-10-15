const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inicializa a conexão com o banco de dados via variável de ambiente
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Necessário para serviços cloud como Supabase/Neon
        }
    },
    logging: false // Desativa os logs de SQL no console para manter limpo
});

module.exports = sequelize;
