const pool = require('../config/db');

exports.obterConfiguracao = async (req, res) => {
  try {
    const estabelecimentoId = req.estabelecimento.id;

    const [rows] = await pool.query(
      `SELECT id, nome_estabelecimento, nome_responsavel, email, dias_antecedencia_alerta, plano 
       FROM estabelecimentos 
       WHERE id = ?`,
      [estabelecimentoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Estabelecimento não encontrado.' });
    }

    const [contagem] = await pool.query(
      `SELECT COUNT(*) AS total_ativos 
       FROM produtos_lotes 
       WHERE estabelecimento_id = ? AND status = 'ATIVO'`,
      [estabelecimentoId]
    );

    const estabelecimento = rows[0];
    const totalAtivos = contagem[0].total_ativos;

    return res.status(200).json({
      ...estabelecimento,
      lotes_ativos: totalAtivos,
      limite_plano_gratuito: estabelecimento.plano === 'GRATUITO' ? 50 : null
    });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    return res.status(500).json({
      erro: 'Erro interno ao buscar as configurações do estabelecimento.'
    });
  }
};

exports.atualizarAntecedencia = async (req, res) => {
  try {
    const estabelecimentoId = req.estabelecimento.id;
    const { dias_antecedencia_alerta } = req.body;

    const dias = Number(dias_antecedencia_alerta);

    // Validação contra entradas inválidas
    if (dias_antecedencia_alerta === undefined || !Number.isInteger(dias) || dias < 1 || dias > 365) {
      return res.status(400).json({
        erro: 'Informe um número inteiro válido de dias de antecedência (entre 1 e 365, ex: 7, 10 ou 15).'
      });
    }

    await pool.query(
      'UPDATE estabelecimentos SET dias_antecedencia_alerta = ? WHERE id = ?',
      [dias, estabelecimentoId]
    );

    return res.status(200).json({
      mensagem: 'Configuração de antecedência de alerta atualizada com sucesso!',
      dias_antecedencia_alerta: dias
    });
  } catch (error) {
    console.error('Erro ao atualizar antecedência:', error);
    return res.status(500).json({
      erro: 'Erro interno ao atualizar a configuração de antecedência.'
    });
  }
};