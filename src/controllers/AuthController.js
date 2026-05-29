const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

// O Client ID do Google deve estar no .env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
    async loginGoogle(req, res) {
        try {
            const { credential } = req.body;
            if (!credential) {
                return res.status(400).json({ success: false, erro: 'Token não fornecido.' });
            }

            // Validar o token com o Google
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const email = payload.email;
            const nome = payload.name;

            // Bloqueio de Domínio (@lasalle.org.br)
            if (!email.endsWith('@lasalle.org.br')) {
                return res.status(403).json({ success: false, erro: 'Acesso restrito a contas @lasalle.org.br' });
            }

            // Buscar usuário no banco ou criar
            let usuario = await Usuario.findOne({ where: { email } });
            
            if (!usuario) {
                // Auto-cadastro para novos professores/funcionários
                usuario = await Usuario.create({
                    nome,
                    email,
                    senha: null, // Sem senha local
                    tipo_perfil: 'Comum' // Perfil padrão inicial
                });
            }

            // Gerar token JWT interno da aplicação
            const token = jwt.sign(
                { id: usuario.id_usuario, role: usuario.tipo_perfil, nome: usuario.nome, email: usuario.email },
                process.env.JWT_SECRET || 'chave_super_secreta_padrao',
                { expiresIn: '8h' }
            );

            return res.json({ success: true, token, role: usuario.tipo_perfil, nome: usuario.nome });
        } catch (error) {
            console.error('Erro no login via Google:', error);
            return res.status(500).json({ success: false, erro: 'Erro na validação do login com Google.' });
        }
    }
    async registerLocal(req, res) {
        try {
            const { nome, email, senha } = req.body;
            if (!nome || !email || !senha) {
                return res.status(400).json({ success: false, erro: 'Preencha todos os campos obrigatórios.' });
            }

            if (!email.endsWith('@lasalle.org.br')) {
                return res.status(403).json({ success: false, erro: 'O cadastro é restrito a contas @lasalle.org.br.' });
            }

            const usuarioExistente = await Usuario.findOne({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({ success: false, erro: 'E-mail já cadastrado no sistema.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(senha, salt);

            await Usuario.create({
                nome,
                email,
                senha: hashSenha,
                tipo_perfil: 'Comum'
            });

            return res.json({ success: true, mensagem: 'Cadastro realizado com sucesso! Efetue login para continuar.' });
        } catch (error) {
            console.error('Erro no cadastro local:', error);
            return res.status(500).json({ success: false, erro: 'Erro interno ao tentar cadastrar usuário.' });
        }
    }

    async loginLocal(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ success: false, erro: 'Forneça e-mail e senha.' });
            }

            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario || !usuario.senha) {
                return res.status(401).json({ success: false, erro: 'Credenciais incorretas ou conta vinculada apenas ao Google.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ success: false, erro: 'Credenciais incorretas.' });
            }

            const token = jwt.sign(
                { id: usuario.id_usuario, role: usuario.tipo_perfil, nome: usuario.nome, email: usuario.email },
                process.env.JWT_SECRET || 'chave_super_secreta_padrao',
                { expiresIn: '8h' }
            );

            return res.json({ success: true, token, role: usuario.tipo_perfil, nome: usuario.nome });
        } catch (error) {
            console.error('Erro no login local:', error);
            return res.status(500).json({ success: false, erro: 'Erro ao processar as credenciais.' });
        }
    }
}

module.exports = new AuthController();
