const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/registro -> Cadastra estabelecimento
router.post('/registro', authController.registrarEstabelecimento);

// POST /api/auth/login -> Autentica usuário e retorna JWT
router.post('/login', authController.login);

module.exports = router;