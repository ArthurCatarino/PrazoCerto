const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const configuracaoController = require('../controllers/configuracaoController');

// Todas as rotas de configuração exigem usuário logado
router.use(authMiddleware);

// GET /api/configuracoes -> Retorna dados da loja e antecedência atual
router.get('/', configuracaoController.obterConfiguracao);

// PUT /api/configuracoes/antecedencia -> Atualiza dias de antecedência (ex: 7, 10, 15)
router.put('/antecedencia', configuracaoController.atualizarAntecedencia);

module.exports = router;