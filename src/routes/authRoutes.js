const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');
const validar = require('../middlewares/validatorMiddleware');
const { loginSchema, definirSenhaSchema } = require('../validators/authValidator');

router.post('/google', authController.loginGoogle);
router.post('/login', validar(loginSchema), authController.loginLocal);
router.post('/definir-senha', authMiddleware, validar(definirSenhaSchema), authController.definirSenha);

module.exports = router;
