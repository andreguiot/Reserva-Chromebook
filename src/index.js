const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (pasta public)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Servidor do Sistema de Reservas de Chromebooks rodando!');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
