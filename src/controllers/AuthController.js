const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const AuditoriaController = require('./AuditoriaController');

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

            const precisaDefinirSenha = !usuario.senha;

            const token = jwt.sign(
                { id: usuario.id_usuario, role: usuario.tipo_perfil, nome: usuario.nome, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: precisaDefinirSenha ? '15m' : '8h' }
            );

            // Mockar o req.usuario para o log capturar o email
            req.usuario = { email: usuario.email };
            await AuditoriaController.registrar(req, 'LOGIN_GOOGLE_SUCESSO', precisaDefinirSenha ? 'Primeiro acesso (pendente de senha)' : 'Login padrão');

            // Define o Cookie HTTP-Only
            res.cookie('auth_token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000 // 8 horas (previne restauração infinita do navegador)
            });

            return res.json({ success: true, role: usuario.tipo_perfil, nome: usuario.nome, precisaDefinirSenha });
        } catch (error) {
            await AuditoriaController.registrar(req, 'LOGIN_GOOGLE_FALHA', error.message || 'Erro de validação');
            return res.status(500).json({ success: false, erro: 'Erro na validação do login com Google.' });
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
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            req.usuario = { email: usuario.email };
            await AuditoriaController.registrar(req, 'LOGIN_LOCAL_SUCESSO', 'Autenticação com e-mail e senha locais');

            res.cookie('auth_token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000 // 8 horas
            });

            return res.json({ success: true, role: usuario.tipo_perfil, nome: usuario.nome });
        } catch (error) {
            await AuditoriaController.registrar(req, 'LOGIN_LOCAL_FALHA', error.message || 'Erro ao processar');
            return res.status(500).json({ success: false, erro: 'Erro ao processar as credenciais.' });
        }
    }
    async definirSenha(req, res) {
        try {
            const { novaSenha, confirmarSenha } = req.body;

            if (!novaSenha || !confirmarSenha) {
                return res.status(400).json({ success: false, erro: 'Preencha todos os campos.' });
            }

            if (novaSenha !== confirmarSenha) {
                return res.status(400).json({ success: false, erro: 'As senhas não coincidem.' });
            }

            if (novaSenha.length < 8) {
                return res.status(400).json({ success: false, erro: 'A senha deve ter no mínimo 8 caracteres.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(novaSenha, salt);

            await Usuario.update(
                { senha: hashSenha },
                { where: { id_usuario: req.usuario.id } }
            );

            const token = jwt.sign(
                { id: req.usuario.id, role: req.usuario.role, nome: req.usuario.nome, email: req.usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            await AuditoriaController.registrar(req, 'DEFINICAO_SENHA_SUCESSO', 'Senha local cadastrada com sucesso');

            res.cookie('auth_token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000 // 8 horas
            });

            return res.json({ success: true, role: req.usuario.role, nome: req.usuario.nome });
        } catch (error) {
            await AuditoriaController.registrar(req, 'DEFINICAO_SENHA_FALHA', error.message || 'Erro genérico');
            return res.status(500).json({ success: false, erro: 'Erro ao salvar a senha.' });
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('auth_token');
            return res.json({ success: true, mensagem: 'Logout realizado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ success: false, erro: 'Erro ao fazer logout.' });
        }
    }
}

module.exports = new AuthController();
