const sequelize = require('../config/database');
const Carrinho = require('./Carrinho');
const Chromebook = require('./Chromebook');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');
const ReservaChromebook = require('./ReservaChromebook');

const LogAuditoria = require('./LogAuditoria');

Carrinho.hasMany(Chromebook, { foreignKey: 'id_carrinho' });
Chromebook.belongsTo(Carrinho, { foreignKey: 'id_carrinho' });

Reserva.belongsTo(Carrinho, { foreignKey: 'id_carrinho' });
Carrinho.hasMany(Reserva, { foreignKey: 'id_carrinho' });

Reserva.hasMany(ReservaChromebook, { foreignKey: 'id_reserva' });
ReservaChromebook.belongsTo(Reserva, { foreignKey: 'id_reserva' });

ReservaChromebook.belongsTo(Chromebook, { foreignKey: 'id_chromebook' });
Chromebook.hasMany(ReservaChromebook, { foreignKey: 'id_chromebook' });

module.exports = { sequelize, Carrinho, Chromebook, Usuario, Reserva, ReservaChromebook, LogAuditoria };
