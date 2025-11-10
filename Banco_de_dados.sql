-- ==========================================================
-- BANCO DE DADOS: Chatbot Fiscal
-- Projeto: Squad-09-EASY
-- Autor: João Guilherme
-- Descrição: Estrutura base do banco para o Chatbot Fiscal
-- ==========================================================

CREATE DATABASE chatbot_fiscal;
\c chatbot_fiscal;

-- ==========================================================
-- TABELA: usuarios
-- ==========================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABELA: atendentes
-- ==========================================================
CREATE TABLE atendentes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    setor VARCHAR(100),
    turno VARCHAR(50)
);

-- ==========================================================
-- TABELA: faq
-- ==========================================================
CREATE TABLE faq (
    id SERIAL PRIMARY KEY,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABELA: conversas
-- ==========================================================
CREATE TABLE conversas (
    id SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id),
    id_atendente INT REFERENCES atendentes(id),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativa'
);

-- ==========================================================
-- TABELA: mensagens
-- ==========================================================
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    id_conversa INT REFERENCES conversas(id),
    remetente VARCHAR(50) CHECK (remetente IN ('usuario', 'atendente', 'bot')),
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
