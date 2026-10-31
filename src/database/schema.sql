CREATE DATABASE IF NOT EXISTS prazocerto
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prazocerto;

-- Tabela de Estabelecimentos / Usuários (Escopo Pessoa 1)
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_estabelecimento VARCHAR(120) NOT NULL,
    nome_responsavel VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    dias_antecedencia_alerta INT NOT NULL DEFAULT 7,
    plano ENUM('GRATUITO', 'PRO') NOT NULL DEFAULT 'GRATUITO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Produtos / Lotes (Base pronta para a Pessoa 2)
CREATE TABLE IF NOT EXISTS produtos_lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estabelecimento_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    codigo_barras VARCHAR(60) NULL,
    lote VARCHAR(60) NOT NULL,
    quantidade INT NOT NULL,
    data_validade DATE NOT NULL,
    status ENUM('ATIVO', 'VENDIDO_PROMOCAO', 'DESCARTADO') NOT NULL DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_produto_estabelecimento
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
        ON DELETE CASCADE
);

-- Índices para acelerar a ordenação por proximidade de vencimento no Dashboard
CREATE INDEX idx_estabelecimento_validade ON produtos_lotes (estabelecimento_id, status, data_validade);