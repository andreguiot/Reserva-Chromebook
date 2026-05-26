const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
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
}

module.exports = new AuthController();
