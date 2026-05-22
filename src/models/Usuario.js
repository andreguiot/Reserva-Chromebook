const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo_perfil: {
        type: DataTypes.ENUM('Admin', 'Comum'),
        defaultValue: 'Comum'
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;
