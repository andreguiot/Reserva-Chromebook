const { LogAuditoria } = require('../models');

class AuditoriaController {
    async registrar(req, acao, detalhes = '') {
        try {
            const email_usuario = req.usuario ? req.usuario.email : 'Anonimo';
            const ip = req.ip || req.connection.remoteAddress;
            await LogAuditoria.create({
                acao,
                email_usuario,
                detalhes: typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes),
                ip
            });
        } catch (error) {
            console.error('Erro ao gravar log de auditoria:', error);
        }
    }

    async listar(req, res) {
        try {
            const logs = await LogAuditoria.findAll({
                order: [['data_hora', 'DESC']],
                limit: 100
            });
            return res.json(logs);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar auditoria' });
        }
    }
}

module.exports = new AuditoriaController();
