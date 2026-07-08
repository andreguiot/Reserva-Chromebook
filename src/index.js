const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const requiredEnvVars = ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'JWT_SECRET', 'CORS_ORIGIN'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
    console.error(`\n[SEGURANÇA] ERRO FATAL: As seguintes variáveis de ambiente obrigatórias não foram encontradas: ${missingVars.join(', ')}`);
    console.error('O servidor foi interrompido (Fail-Safe) por segurança.\n');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "https:", "http:", "data:", "'unsafe-inline'", "'unsafe-eval'"],
            scriptSrc: ["'self'", "https:", "http:", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "https:", "http:", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'self'", "https:"]
        }
    }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN.split(',')
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { erro: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { erro: 'Muitas tentativas de login, tente novamente mais tarde.' }
});

const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
    const protectedPages = ['/reserva.html', '/painel.html'];
    if (protectedPages.includes(req.path.toLowerCase())) {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.redirect('/logintela.html');
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return next();
        } catch (e) {
            return res.redirect('/logintela.html');
        }
    }
    next();
});

app.use(express.static('public'));

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const chromebookRoutes = require('./routes/chromebookRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/carrinhos', carrinhoRoutes);
app.use('/api/chromebooks', chromebookRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);

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
