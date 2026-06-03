const { Router } = require('express');
const AuditoriaController = require('../controllers/AuditoriaController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = Router();

router.get('/', authMiddleware, adminMiddleware, AuditoriaController.listar);

module.exports = router;
