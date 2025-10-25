const { Router } = require('express');
const ChromebookController = require('../controllers/ChromebookController');

const router = Router();

router.get('/', ChromebookController.listar);
router.post('/', ChromebookController.criar);
router.put('/:id', ChromebookController.atualizar);
router.delete('/:id', ChromebookController.deletar);

module.exports = router;
