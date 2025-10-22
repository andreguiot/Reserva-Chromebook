const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const { sequelize } = require('./models');

app.get('/', (req, res) => {
    res.send('Servidor do Sistema de Reservas de Chromebooks rodando!');
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}).catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
});
