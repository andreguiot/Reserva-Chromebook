const { Sequelize } = require('sequelize');
require('dotenv').config();

const enableSSL = process.env.DB_ENABLE_SSL === 'true';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: enableSSL ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    logging: false
});

module.exports = sequelize;
