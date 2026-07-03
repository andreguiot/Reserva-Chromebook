const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    // Pegar o token do cookie
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const segredo = process.env.JWT_SECRET;
        const decodificado = jwt.verify(token, segredo);
        
        req.usuario = decodificado; // Salva as infos do usuário logado na requisição (ex: { role: 'admin' })
        next(); // Tudo certo, pode seguir para o controller!
    } catch (error) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
}

module.exports = authMiddleware;
