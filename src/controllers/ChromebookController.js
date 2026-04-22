const { Chromebook } = require('../models');

class ChromebookController {
    async listar(req, res) {
        try {
            const { Carrinho } = require('../models');
            const chromebooks = await Chromebook.findAll({
                include: [{ model: Carrinho, attributes: ['descricao'] }]
            });
            return res.json(chromebooks);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar chromebooks' });
        }
    }

    async criar(req, res) {
        try {
            const { numero_serie, id_patrimonio, id_carrinho } = req.body;
            const novoChromebook = await Chromebook.create({ numero_serie, id_patrimonio, id_carrinho });
            return res.status(201).json(novoChromebook);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar chromebook' });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { numero_serie, id_patrimonio, id_carrinho } = req.body;
            
            const chromebook = await Chromebook.findByPk(id);
            if (!chromebook) return res.status(404).json({ erro: 'Chromebook não encontrado' });

            await chromebook.update({ numero_serie, id_patrimonio, id_carrinho });
            return res.json(chromebook);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar chromebook' });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const chromebook = await Chromebook.findByPk(id);
            if (!chromebook) return res.status(404).json({ erro: 'Chromebook não encontrado' });

            await chromebook.destroy();
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao deletar chromebook' });
        }
    }
}

module.exports = new ChromebookController();
