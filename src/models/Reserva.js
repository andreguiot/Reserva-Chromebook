const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
    id_reserva: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_reserva: {
        type: DataTypes.ENUM('carrinho', 'individual'),
        allowNull: false
    },
    id_carrinho: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    quantidade_chromebooks: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sala: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nome_professor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email_solicitante: {
        type: DataTypes.STRING,
        allowNull: true // Reservas antigas podem não ter este campo
    },
    data_reserva: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    horario_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    horario_fim: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendente', 'ativa', 'atrasada', 'encerrada'),
        defaultValue: 'pendente'
    }
}, {
    tableName: 'reservas',
    timestamps: false
});

module.exports = Reserva;
