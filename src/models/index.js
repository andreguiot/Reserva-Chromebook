const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Carrinho = require('./Carrinho');
const Chromebook = require('./Chromebook');

module.exports = {
    sequelize,
    Usuario,
    Carrinho,
    Chromebook
};
