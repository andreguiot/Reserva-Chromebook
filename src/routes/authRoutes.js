const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/google', authController.loginGoogle);
router.post('/login', authController.loginLocal);
router.post('/register', authController.registerLocal);

module.exports = router;
