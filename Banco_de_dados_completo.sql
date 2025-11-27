-- ==========================================================
-- DROP TABLES (para recriar sem erros)
-- ==========================================================
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS empresas;

-- ==========================================================
-- CRIAÇÃO DO BANCO DE DADOS
-- ==========================================================
CREATE DATABASE IF NOT EXISTS chatbot_fiscal;

USE chatbot_fiscal;

-- ==========================================================
-- TABELA: empresas
-- ==========================================================
CREATE TABLE empresas (
    codigo_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE
);

-- ==========================================================
-- TABELA: usuarios
-- ==========================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    numero_whatsapp VARCHAR(20) NOT NULL,
    codigo_empresa INT NOT NULL,
    FOREIGN KEY (codigo_empresa) REFERENCES empresas(codigo_empresa)
);

-- ==========================================================
-- INSERTS DE EXEMPLO
-- ==========================================================

INSERT INTO empresas (nome, cnpj)
VALUES ('EASY LTDA', '01.234.567/0001-89');

INSERT INTO usuarios (nome, cpf, numero_whatsapp, codigo_empresa)
VALUES ('Pedro Aurélio', '123.456.789-10', '+55 79 9692-1016', 1),
VALUES ('Gabriel Cordeiro', '123.456.789-01', '+55 79 9106-9397', 1);

SHOW TABLES;
SELECT * FROM empresas;