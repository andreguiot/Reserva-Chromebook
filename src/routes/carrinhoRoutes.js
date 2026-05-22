const { Router } = require('express');
const CarrinhoController = require('../controllers/CarrinhoController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = Router();

router.get('/', CarrinhoController.listar); // Publico
router.post('/', authMiddleware, adminMiddleware, CarrinhoController.criar); // Protegido
router.put('/:id', authMiddleware, adminMiddleware, CarrinhoController.atualizar); // Protegido
router.delete('/:id', authMiddleware, adminMiddleware, CarrinhoController.deletar); // Protegido

module.exports = router;
