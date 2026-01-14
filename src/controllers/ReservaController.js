const { Reserva, ReservaChromebook, Chromebook, Carrinho } = require('../models');
const { Op } = require('sequelize');

class ReservaController {
    async listar(req, res) {
        try {
            const reservas = await Reserva.findAll({
                where: { status: { [Op.in]: ['pendente', 'ativa'] } },
                include: [{ model: Carrinho, attributes: ['descricao'] }],
                order: [['data_reserva', 'ASC']]
            });
            return res.json(reservas);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar reservas' });
        }
    }

    async criar(req, res) {
        try {
            const { tipo_reserva, id_carrinho, quantidade_chromebooks, sala, nome_professor, data_reserva, horario_inicio, horario_fim } = req.body;
            const novaReserva = await Reserva.create({
                tipo_reserva, id_carrinho, quantidade_chromebooks,
                sala, nome_professor, data_reserva, horario_inicio, horario_fim,
                status: 'pendente'
            });
            return res.status(201).json(novaReserva);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar reserva' });
        }
    }

    async escanear(req, res) {
        try {
            const { id } = req.params;
            const { id_patrimonio } = req.body;

            const reserva = await Reserva.findByPk(id);
            if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

            const chromebook = await Chromebook.findOne({ where: { id_patrimonio } });
            if (!chromebook) return res.status(404).json({ erro: 'Chromebook não encontrado' });

            // Verifica se o carrinho de origem do Chromebook está reservado por outra reserva ativa
            let statusItem = 'entregue';
            if (chromebook.id_carrinho) {
                const carrinhoReservado = await Reserva.findOne({
                    where: {
                        id_carrinho: chromebook.id_carrinho,
                        status: { [Op.in]: ['pendente', 'ativa'] },
                        id_reserva: { [Op.ne]: parseInt(id) }
                    }
                });
                if (carrinhoReservado) statusItem = 'deslocado';
            }

            const item = await ReservaChromebook.create({
                id_reserva: reserva.id_reserva,
                id_chromebook: chromebook.id_chromebook,
                status: statusItem,
                data_confirmacao: new Date()
            });

            const totalEscaneados = await ReservaChromebook.count({ where: { id_reserva: reserva.id_reserva } });
            if (reserva.status === 'pendente' && totalEscaneados >= reserva.quantidade_chromebooks) {
                await reserva.update({ status: 'ativa' });
            }

            return res.json({ item, alerta: statusItem === 'deslocado' });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao escanear chromebook' });
        }
    }

    async validar(req, res) {
        try {
            const { id } = req.params;
            const { id_patrimonio } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{ model: Carrinho }]
            });
            if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

            if (reserva.tipo_reserva === 'carrinho') {
                const carrinho = reserva.Carrinho;
                if (!carrinho) return res.status(400).json({ erro: 'Carrinho não associado à reserva' });

                const patrimonioRecebido = String(id_patrimonio).trim();
                const patrimonioBanco = String(carrinho.id_patrimonio).trim();

                if (patrimonioBanco !== patrimonioRecebido) {
                    return res.status(400).json({ erro: `Patrimônio incorreto. Esperado: ${patrimonioBanco}` });
                }

                await reserva.update({ status: 'ativa' });
                return res.json({ mensagem: 'Carrinho validado com sucesso', reserva });
            }

            return res.status(400).json({ erro: 'Use o endpoint de escanear para reservas individuais' });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao validar reserva' });
        }
    }


    async encerrar(req, res) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.findByPk(id);
            if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

            await ReservaChromebook.update(
                { status: 'devolvido' },
                { where: { id_reserva: id, status: 'entregue' } }
            );
            await reserva.update({ status: 'encerrada' });
            return res.json({ mensagem: 'Reserva encerrada com sucesso' });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao encerrar reserva' });
        }
    }
}

module.exports = new ReservaController();
