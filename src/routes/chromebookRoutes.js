const { Router } = require('express');
const ChromebookController = require('../controllers/ChromebookController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = Router();

router.get('/', ChromebookController.listar); // Publico
router.post('/', authMiddleware, adminMiddleware, ChromebookController.criar); // Protegido
router.put('/:id', authMiddleware, adminMiddleware, ChromebookController.atualizar); // Protegido
router.delete('/:id', authMiddleware, adminMiddleware, ChromebookController.deletar); // Protegido

module.exports = router;
