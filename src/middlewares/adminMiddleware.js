function adminMiddleware(req, res, next) {
    if (!req.usuario || req.usuario.role !== 'Admin') {
        return res.status(403).json({ erro: 'Acesso negado. Requer privilégios de Administrador.' });
    }
    next();
}

module.exports = adminMiddleware;
