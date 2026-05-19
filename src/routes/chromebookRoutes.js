const { Router } = require('express');
const ChromebookController = require('../controllers/ChromebookController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.get('/', ChromebookController.listar); // Publico
router.post('/', authMiddleware, ChromebookController.criar); // Protegido
router.put('/:id', authMiddleware, ChromebookController.atualizar); // Protegido
router.delete('/:id', authMiddleware, ChromebookController.deletar); // Protegido

module.exports = router;
