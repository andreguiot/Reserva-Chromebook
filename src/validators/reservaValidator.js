const { z } = require('zod');

const criarReservaSchema = z.object({
    tipo_reserva: z.enum(['carrinho', 'individual'], { errorMap: () => ({ message: 'Tipo de reserva inválido' }) }),
    nome_professor: z.string().min(2, 'O nome do professor é obrigatório'),
    sala: z.string().min(1, 'A sala é obrigatória'),
    data_reserva: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de início deve estar no formato HH:MM'),
    horario_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de fim deve estar no formato HH:MM'),
    id_carrinho: z.union([z.number(), z.string().transform(Number)]).nullable().optional(),
    quantidade_chromebooks: z.union([z.number(), z.string().transform(Number)])
        .nullable()
        .optional()
        .refine(val => val === null || val === undefined || val >= 1, { message: 'A quantidade deve ser de pelo menos 1' })
}).refine(data => {
    if (data.tipo_reserva === 'carrinho' && !data.id_carrinho) return false;
    if (data.tipo_reserva === 'individual' && !data.quantidade_chromebooks) return false;
    return true;
}, {
    message: 'Para carrinho, informe o ID. Para individual, informe a quantidade.',
    path: ['tipo_reserva']
});

module.exports = { criarReservaSchema };
