const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrinho = sequelize.define('Carrinho', {
    id_carrinho: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacidade_total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_patrimonio: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'carrinhos',
    timestamps: false
});

module.exports = Carrinho;
