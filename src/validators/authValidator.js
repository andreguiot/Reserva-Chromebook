const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email('Formato de e-mail inválido'),
    senha: z.string().min(1, 'A senha é obrigatória')
});

const definirSenhaSchema = z.object({
    novaSenha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmarSenha: z.string().min(8, 'A confirmação de senha deve ter no mínimo 8 caracteres')
}).refine(data => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha']
});

module.exports = { loginSchema, definirSenhaSchema };
