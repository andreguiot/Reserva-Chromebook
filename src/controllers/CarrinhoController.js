const { Carrinho } = require('../models');

class CarrinhoController {
    async listar(req, res) {
        try {
            const carrinhos = await Carrinho.findAll();
            return res.json(carrinhos);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar carrinhos' });
        }
    }

    async criar(req, res) {
        try {
            const { descricao, capacidade_total, id_patrimonio } = req.body;
            // Apenas os campos esperados são enviados para a criação (Prevenção de Mass Assignment)
            const novoCarrinho = await Carrinho.create({ descricao, capacidade_total, id_patrimonio });
            return res.status(201).json(novoCarrinho);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar carrinho' });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { descricao, capacidade_total, id_patrimonio } = req.body;
            
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) return res.status(404).json({ erro: 'Carrinho não encontrado' });

            // Apenas os campos esperados são enviados para a atualização
            await carrinho.update({ descricao, capacidade_total, id_patrimonio });
            return res.json(carrinho);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar carrinho' });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) return res.status(404).json({ erro: 'Carrinho não encontrado' });

            await carrinho.destroy();
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao deletar carrinho' });
        }
    }
}

module.exports = new CarrinhoController();
