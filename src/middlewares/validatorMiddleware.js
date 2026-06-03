function validar(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            return res.status(400).json({ 
                erro: 'Dados inválidos', 
                detalhes: error.errors.map(e => e.message) 
            });
        }
    };
}

module.exports = validar;
