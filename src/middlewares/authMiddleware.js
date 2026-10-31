const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Acesso negado. Token de autenticação não fornecido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'prazocerto_chave_secreta_mvp_2026');
    req.estabelecimento = {
      id: decoded.id,
      email: decoded.email,
      nome_estabelecimento: decoded.nome_estabelecimento
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      erro: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
};