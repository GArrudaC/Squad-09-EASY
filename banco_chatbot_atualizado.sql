-- Banco de Dados do Chatbot Fiscal (Versão Atualizada)
-- Estrutura final com tabelas: usuarios, atendentes, conversas, avaliacoes

-- ============================
-- Criar Banco
-- ============================
CREATE DATABASE chatbot_fiscal;

\c chatbot_fiscal;

-- ============================
-- Tabela: usuarios
-- ============================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- Tabela: atendentes
-- ============================
CREATE TABLE atendentes (
    id_atendente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    cargo VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- Tabela: conversas
-- ============================
CREATE TABLE conversas (
    id_conversa SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    status VARCHAR(20) DEFAULT 'em_andamento',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- Tabela: avaliacoes
-- ============================
CREATE TABLE avaliacoes (
    id_avaliacao SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    nota INTEGER CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- Inserts de Exemplo (Opcional)
-- ============================
INSERT INTO usuarios (nome, email) VALUES
('João Silva', 'joao@email.com'),
('Maria Santos', 'maria@email.com');

INSERT INTO atendentes (nome, email, cargo) VALUES
('Carlos Almeida', 'carlos@empresa.com', 'Suporte Fiscal');

INSERT INTO conversas (id_usuario, id_atendente, status) VALUES
(1, 1, 'em_andamento');

INSERT INTO avaliacoes (id_usuario, nota, comentario) VALUES
(1, 5, 'Atendimento excelente!');
