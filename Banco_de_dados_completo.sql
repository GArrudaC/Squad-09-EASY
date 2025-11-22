-- ==========================================================
-- CRIAÇÃO DO BANCO DE DADOS
-- ==========================================================
CREATE DATABASE chatbot_fiscal;
\c chatbot_fiscal;

-- ==========================================================
-- TABELA: empresas
-- ==========================================================
CREATE TABLE empresas (
    codigo_empresa SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL
);

-- ==========================================================
-- TABELA: usuarios
-- ==========================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    numero_whatsapp VARCHAR(20) NOT NULL,
    codigo_empresa INT NOT NULL,
    FOREIGN KEY (codigo_empresa) REFERENCES empresas(codigo_empresa)
);

-- ==========================================================
-- INSERTS DE EXEMPLO
-- ==========================================================

-- Empresas
INSERT INTO empresas (nome, cnpj)
VALUES
('Tech Solutions LTDA', '12.345.678/0001-90'),
('Contabilidade Alfa', '98.765.432/0001-10');

-- Usuários
INSERT INTO usuarios (nome, cpf, numero_whatsapp, codigo_empresa)
VALUES
('João Mendes', '123.456.789-10', '+55 11 98877-6655', 1),
('Mariana Souza', '987.654.321-00', '+55 11 97766-5544', 2);
