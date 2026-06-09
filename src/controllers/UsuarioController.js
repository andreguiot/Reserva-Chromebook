const { Usuario } = require('../models');
const AuditoriaController = require('./AuditoriaController');

class UsuarioController {
    async listar(req, res) {
        try {
            const usuarios = await Usuario.findAll({
                attributes: ['id_usuario', 'nome', 'email', 'tipo_perfil'],
                order: [['nome', 'ASC']]
            });
            return res.json(usuarios);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar usuários.' });
        }
    }

    async mudarPerfil(req, res) {
        try {
            const { id } = req.params;
            const { tipo_perfil } = req.body;

            if (!['Admin', 'Comum'].includes(tipo_perfil)) {
                return res.status(400).json({ erro: 'Perfil inválido. Use "Admin" ou "Comum".' });
            }

            if (parseInt(id) === req.usuario.id) {
                return res.status(403).json({ erro: 'Você não pode alterar o seu próprio perfil.' });
            }

            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            const perfilAnterior = usuario.tipo_perfil;
            await usuario.update({ tipo_perfil });

            await AuditoriaController.registrar(
                req,
                'MUDANCA_PERFIL',
                `Perfil de ${usuario.email} alterado de ${perfilAnterior} para ${tipo_perfil}`
            );

            return res.json({ success: true, mensagem: `Perfil de ${usuario.nome} atualizado para ${tipo_perfil}.` });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao alterar perfil.' });
        }
    }
}

module.exports = new UsuarioController();
