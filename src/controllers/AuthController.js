const jwt = require('jsonwebtoken');

class AuthController {
    async login(req, res) {
        try {
            const { senha } = req.body;
            // Lê a senha do .env ou usa o fallback aprovado
            const senhaMestra = process.env.ADMIN_PASSWORD || '@abel123#';

            if (senha === senhaMestra) {
                // Senha correta, gerar token JWT
                const token = jwt.sign(
                    { role: 'admin' }, 
                    process.env.JWT_SECRET || 'chave_super_secreta_padrao', 
                    { expiresIn: '8h' } // Token expira em 8 horas (um turno de aula)
                );
                return res.json({ success: true, token });
            }

            return res.status(401).json({ success: false, erro: 'Senha incorreta. Acesso negado.' });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ success: false, erro: 'Erro interno no servidor' });
        }
    }
}

module.exports = new AuthController();
