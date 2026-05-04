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
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const chromebookRoutes = require('./routes/chromebookRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

app.use('/api/carrinhos', carrinhoRoutes);
app.use('/api/chromebooks', chromebookRoutes);
app.use('/api/reservas', reservaRoutes);

app.get('/', (req, res) => {
    res.send('Servidor do Sistema de Reservas de Chromebooks rodando!');
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Banco de dados sincronizado');
}).catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err.message);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port} e acessível na rede local (0.0.0.0)`);
});
