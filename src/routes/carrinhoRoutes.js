const { Router } = require('express');
const CarrinhoController = require('../controllers/CarrinhoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.get('/', CarrinhoController.listar); // Publico
router.post('/', authMiddleware, CarrinhoController.criar); // Protegido
router.put('/:id', authMiddleware, CarrinhoController.atualizar); // Protegido
router.delete('/:id', authMiddleware, CarrinhoController.deletar); // Protegido

module.exports = router;
