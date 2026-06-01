const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/google', authController.loginGoogle);
router.post('/login', authController.loginLocal);
router.post('/definir-senha', authMiddleware, authController.definirSenha);

module.exports = router;
