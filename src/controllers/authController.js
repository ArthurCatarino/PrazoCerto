const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.registrarEstabelecimento = async (req, res) => {
  try {
    const {
      nome_estabelecimento,
      nome_responsavel,
      email,
      senha,
      dias_antecedencia_alerta
    } = req.body;

    // Tratamento de situações inválidas relevantes
    if (!nome_estabelecimento || !nome_responsavel || !email || !senha) {
      return res.status(400).json({
        erro: 'Preencha todos os campos obrigatórios: nome_estabelecimento, nome_responsavel, email e senha.'
      });
    }

    if (String(senha).length < 6) {
      return res.status(400).json({
        erro: 'A senha deve possuir pelo menos 6 caracteres.'
      });
    }

    const antecedencia = dias_antecedencia_alerta !== undefined ? Number(dias_antecedencia_alerta) : 7;
    if (!Number.isInteger(antecedencia) || antecedencia < 1 || antecedencia > 365) {
      return res.status(400).json({
        erro: 'Os dias de antecedência devem ser um número inteiro entre 1 e 365.'
      });
    }

    // Verifica se o e-mail já está cadastrado
    const [usuariosExistentes] = await pool.query(
      'SELECT id FROM estabelecimentos WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({
        erro: 'Já existe um estabelecimento cadastrado com este e-mail.'
      });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const [resultado] = await pool.query(
      `INSERT INTO estabelecimentos 
        (nome_estabelecimento, nome_responsavel, email, senha_hash, dias_antecedencia_alerta) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome_estabelecimento.trim(),
        nome_responsavel.trim(),
        email.trim().toLowerCase(),
        senhaHash,
        antecedencia
      ]
    );

    const novoId = resultado.insertId;

    const token = jwt.sign(
      {
        id: novoId,
        email: email.trim().toLowerCase(),
        nome_estabelecimento: nome_estabelecimento.trim()
      },
      process.env.JWT_SECRET || 'prazocerto_chave_secreta_mvp_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      mensagem: 'Estabelecimento cadastrado com sucesso!',
      token,
      estabelecimento: {
        id: novoId,
        nome_estabelecimento: nome_estabelecimento.trim(),
        nome_responsavel: nome_responsavel.trim(),
        email: email.trim().toLowerCase(),
        dias_antecedencia_alerta: antecedencia,
        plano: 'GRATUITO'
      }
    });
  } catch (error) {
    console.error('Erro ao registrar estabelecimento:', error);
    return res.status(500).json({
      erro: 'Erro interno no servidor ao cadastrar o estabelecimento.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Informe o e-mail e a senha para realizar o login.'
      });
    }

    const [rows] = await pool.query(
      `SELECT id, nome_estabelecimento, nome_responsavel, email, senha_hash, dias_antecedencia_alerta, plano 
       FROM estabelecimentos 
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        erro: 'E-mail ou senha incorretos.'
      });
    }

    const estabelecimento = rows[0];
    const senhaValida = await bcrypt.compare(String(senha), estabelecimento.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'E-mail ou senha incorretos.'
      });
    }

    const token = jwt.sign(
      {
        id: estabelecimento.id,
        email: estabelecimento.email,
        nome_estabelecimento: estabelecimento.nome_estabelecimento
      },
      process.env.JWT_SECRET || 'prazocerto_chave_secreta_mvp_2026',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      estabelecimento: {
        id: estabelecimento.id,
        nome_estabelecimento: estabelecimento.nome_estabelecimento,
        nome_responsavel: estabelecimento.nome_responsavel,
        email: estabelecimento.email,
        dias_antecedencia_alerta: estabelecimento.dias_antecedencia_alerta,
        plano: estabelecimento.plano
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      erro: 'Erro interno no servidor ao realizar o login.'
    });
  }
};