const { Reserva, ReservaChromebook, Chromebook, Carrinho } = require('../models');
const { Op } = require('sequelize');
const AuditoriaController = require('./AuditoriaController');

async function verificarAtrasadas() {
    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0];
    const horaStr = agora.toTimeString().slice(0, 8);

    await Reserva.update(
        { status: 'atrasada' },
        {
            where: {
                status: { [Op.in]: ['ativa', 'pendente'] }, 
                [Op.or]: [
                    { data_reserva: { [Op.lt]: hojeStr } },
                    {
                        data_reserva: hojeStr,
                        horario_fim: { [Op.lt]: horaStr }
                    }
                ]
            }
        }
    );
}

class ReservaController {
    async listar(req, res) {
        try {
            await verificarAtrasadas();
            
            const { status, data } = req.query;
            let whereClause = {};

            if (status) {
                whereClause.status = status;
            } else {
                whereClause.status = { [Op.in]: ['pendente', 'ativa', 'atrasada'] };
            }

            if (data) {
                whereClause.data_reserva = data;
            }

            const reservas = await Reserva.findAll({
                where: whereClause,
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
            // O email de quem está logado vem do token JWT (via authMiddleware)
            const email_solicitante = req.usuario ? req.usuario.email : null;

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataReserva = new Date(data_reserva + 'T00:00:00');
            if (dataReserva < hoje) {
                return res.status(400).json({ erro: 'Não é possível realizar reservas para datas passadas.' });
            }

            // --- Validação de Overbooking Global ---
            const totalCb = await Chromebook.count();
            const overlapping = await Reserva.findAll({
                where: {
                    data_reserva,
                    status: { [Op.in]: ['pendente', 'ativa'] },
                    horario_inicio: { [Op.lt]: horario_fim },
                    horario_fim: { [Op.gt]: horario_inicio }
                },
                include: [{ model: Carrinho }]
            });

            let ocupados = 0;
            for (const r of overlapping) {
                if (r.tipo_reserva === 'carrinho' && r.Carrinho) {
                    ocupados += r.Carrinho.capacidade_total;
                } else if (r.tipo_reserva === 'individual') {
                    ocupados += r.quantidade_chromebooks;
                }
            }

            let solicitados = 0;
            if (tipo_reserva === 'carrinho' && id_carrinho) {
                const carrinho = await Carrinho.findByPk(id_carrinho);
                if (!carrinho) return res.status(404).json({ erro: 'Carrinho não encontrado.' });
                solicitados = carrinho.capacidade_total;
                
                // Validação de conflito específico do carrinho
                const conflito = overlapping.find(r => r.id_carrinho == id_carrinho && r.tipo_reserva === 'carrinho');
                if (conflito) {
                    return res.status(409).json({ erro: `Conflito de horário: este carrinho já está reservado das ${conflito.horario_inicio} às ${conflito.horario_fim}.` });
                }
            } else if (tipo_reserva === 'individual') {
                solicitados = quantidade_chromebooks;
            }

            const disponiveis = totalCb - ocupados;
            if (solicitados > disponiveis) {
                return res.status(409).json({ erro: `Inventário insuficiente. Apenas ${disponiveis} Chromebook(s) disponíveis nesse horário.` });
            }
            // ----------------------------------------

            const novaReserva = await Reserva.create({
                tipo_reserva, id_carrinho, quantidade_chromebooks,
                sala, nome_professor, email_solicitante,
                data_reserva, horario_inicio, horario_fim,
                status: 'pendente'
            });

            await AuditoriaController.registrar(req, 'CRIACAO_RESERVA', `Reserva ${novaReserva.id_reserva} criada para ${nome_professor} (${tipo_reserva})`);

            return res.status(201).json(novaReserva);
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
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

            // Verifica se este Chromebook já foi escaneado para esta mesma reserva
            const jaEscaneado = await ReservaChromebook.findOne({
                where: { id_reserva: reserva.id_reserva, id_chromebook: chromebook.id_chromebook }
            });
            if (jaEscaneado) {
                return res.status(409).json({ erro: `O patrimônio ${id_patrimonio} já foi registrado nesta reserva.` });
            }

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

            await AuditoriaController.registrar(req, 'ESCANEAMENTO_CHROMEBOOK', `Patrimônio ${id_patrimonio} na reserva ${id}. Status: ${statusItem}`);

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

                await AuditoriaController.registrar(req, 'VALIDACAO_CARRINHO', `Carrinho da reserva ${id} validado com patrimônio ${id_patrimonio}`);

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

            await AuditoriaController.registrar(req, 'ENCERRAMENTO_RESERVA', `Reserva ${id} encerrada e itens marcados como devolvidos`);

            return res.json({ mensagem: 'Reserva encerrada com sucesso' });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao encerrar reserva' });
        }
    }

    async listarChromebooks(req, res) {
        try {
            const { id } = req.params;
            const itens = await ReservaChromebook.findAll({
                where: { id_reserva: id },
                include: [{ 
                    model: Chromebook, 
                    attributes: ['numero_serie', 'id_patrimonio'],
                    include: [{ model: Carrinho, attributes: ['descricao'] }]
                }],
                order: [['data_confirmacao', 'ASC']]
            });
            return res.json(itens);
        } catch (error) {
            console.error('Erro em listarChromebooks:', error);
            return res.status(500).json({ erro: 'Erro ao listar chromebooks da reserva' });
        }
    }
}

module.exports = new ReservaController();
