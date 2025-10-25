const { Router } = require('express');
const CarrinhoController = require('../controllers/CarrinhoController');

const router = Router();

router.get('/', CarrinhoController.listar);
router.post('/', CarrinhoController.criar);
router.put('/:id', CarrinhoController.atualizar);
router.delete('/:id', CarrinhoController.deletar);

module.exports = router;
