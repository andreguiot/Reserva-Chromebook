const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservaChromebook = sequelize.define('ReservaChromebook', {
    id_item: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_reserva: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_chromebook: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('entregue', 'devolvido', 'deslocado'),
        defaultValue: 'entregue'
    },
    data_confirmacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reserva_chromebooks',
    timestamps: false
});

module.exports = ReservaChromebook;
