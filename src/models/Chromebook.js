const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Carrinho = require('./Carrinho');

const Chromebook = sequelize.define('Chromebook', {
    id_chromebook: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero_serie: {
        type: DataTypes.STRING,
        allowNull: true
    },
    id_patrimonio: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    id_carrinho: {
        type: DataTypes.INTEGER,
        references: {
            model: Carrinho,
            key: 'id_carrinho'
        },
        allowNull: true
    }
}, {
    tableName: 'chromebooks',
    timestamps: true
});

Carrinho.hasMany(Chromebook, { foreignKey: 'id_carrinho' });
Chromebook.belongsTo(Carrinho, { foreignKey: 'id_carrinho' });

module.exports = Chromebook;
