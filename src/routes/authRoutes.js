const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/google', authController.loginGoogle);

module.exports = router;
