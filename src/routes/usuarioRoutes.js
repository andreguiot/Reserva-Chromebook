const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, usuarioController.listar);
router.patch('/:id/perfil', authMiddleware, adminMiddleware, usuarioController.mudarPerfil);

module.exports = router;
