# 🤖 Zizy - Assistente Virtual Financeiro (WhatsApp)

> **Projeto:** SQUAD-09-EASY  
> **Status:** ✅ Funcional / Em Produção

Este projeto é um **Chatbot de WhatsApp** desenvolvido em Node.js e TypeScript, projetado para atuar como uma interface conversacional segura para o ERP **Omie**. Ele permite que gestores e usuários autorizados consultem relatórios de fluxo de caixa, contas a pagar e receber de forma rápida e segura diretamente pelo celular.

---

## 🚀 Funcionalidades Principais

* **🔐 Autenticação Segura (Allowlist):**
    * O bot possui um sistema de segurança via Banco de Dados. Apenas números de WhatsApp previamente cadastrados na tabela `usuarios` do MySQL têm permissão para interagir.
    * Usuários não cadastrados recebem uma mensagem de bloqueio e não acessam os menus.

* **📊 Relatórios Gerenciais Automatizados:**
    * **Relatório Realizado (Passado):** Consolida entradas e saídas efetivamente pagas/recebidas (Regime de Caixa).
    * **Relatório de Previsão (Futuro):** Projeta o fluxo de caixa com base nos vencimentos em aberto (Regime de Competência).
    * **Período Personalizado:** Permite ao usuário definir qualquer intervalo de datas para análise.

* **🧮 Inteligência Financeira (DRE Simplificado):**
    * O sistema processa os dados brutos da API e calcula automaticamente:
        * (+) Receitas Operacionais (Categoria 1.0)
        * (-) Custos Variáveis (Categoria 2.1)
        * (-) Despesas Fixas (Categorias 3.x)
        * **(=) Resultado Operacional**

* **🔄 Navegação Fluida:** Sistema de menus intuitivo, tratamento de erros automático e reconexão resiliente.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Runtime:** [Node.js](https://nodejs.org/) (v18+)
* **WhatsApp API:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
* **Banco de Dados:** [MySQL](https://www.mysql.com/) (Driver `mysql2`)
* **Integração:** API ERP Omie
* **Utilitários:** `dotenv` (Segurança), `moment-timezone` (Manipulação de Datas).

---

## ⚙️ Pré-requisitos

Para rodar este projeto, você precisa ter instalado em sua máquina ou servidor:

1.  **Node.js** e **npm**.
2.  **Servidor MySQL** rodando (Local ou Nuvem).
3.  Credenciais de API da **Omie** (`APP_KEY` e `APP_SECRET`) ativas.

---

## 📥 Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone [https://github.com/SEU-USUARIO/SQUAD-09-EASY.git](https://github.com/SEU-USUARIO/SQUAD-09-EASY.git)
cd SQUAD-09-EASY
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env` na raiz do projeto (copie o conteúdo abaixo).
**IMPORTANTE:** Nunca suba este arquivo para o GitHub.

```env
# Credenciais da API Omie (Pegue no Painel do Desenvolvedor Omie)
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui
```

### 4. Configurar o Banco de Dados
Execute o script SQL abaixo no seu gerenciador de banco de dados (MySQL Workbench, DBeaver, HeidiSQL, etc) para criar a estrutura necessária:

```sql
CREATE DATABASE IF NOT EXISTS chatbot_fiscal;
USE chatbot_fiscal;

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    codigo_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE
);

-- Tabela de Usuários (Controle de Acesso)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    numero_whatsapp VARCHAR(20) NOT NULL,
    codigo_empresa INT NOT NULL,
    FOREIGN KEY (codigo_empresa) REFERENCES empresas(codigo_empresa)
);

-- DADOS DE EXEMPLO (EDITE COM SEUS DADOS REAIS)
INSERT INTO empresas (nome, cnpj) VALUES ('Minha Empresa Teste', '00.000.000/0001-00');

-- IMPORTANTE: O número deve conter DDI (55) + DDD + 9 + Número.
-- Exemplo: 5579996921016 (Apenas números, sem traços ou espaços)
INSERT INTO usuarios (nome, cpf, numero_whatsapp, codigo_empresa)
VALUES ('Admin', '000.000.000-00', '5511999999999', 1);
```

---

## ▶️ Como Rodar

Para iniciar o bot em modo de desenvolvimento:

```bash
npx ts-node src/index.ts
```

1.  O terminal exibirá logs de inicialização e verificação de chaves.
2.  Um **QR Code** será gerado no terminal.
3.  Abra o WhatsApp no seu celular, vá em **Menu > Aparelhos Conectados > Conectar** e escaneie o código.
4.  Após a mensagem `✅ Conexão bem sucedida!`, envie um "Oi" de um número cadastrado no banco.

---

## 📂 Estrutura do Projeto

```
src/
├── functions/
│   ├── authService.ts       # Validação de usuário no MySQL e limpeza de string
│   ├── database.ts          # Configuração do Pool de conexões MySQL
│   └── fetchApi.ts          # Lógica inteligente de busca e cálculo financeiro (Omie)
├── index.ts                 # Ponto de entrada, Conexão WhatsApp e Roteamento
└── processarMensagens.ts    # Cérebro do Bot (Máquina de Estados e Menus)
```

---

## 🐛 Solução de Problemas (FAQ)

### 🔴 O bot responde "🚫 Acesso Negado"
**Causa:** O número que enviou a mensagem não é idêntico ao cadastrado no banco. O WhatsApp geralmente envia o formato `55 + DDD + 9 + Número`.
**Solução:**
1.  Olhe o terminal onde o bot está rodando. Ele mostrará um log: `🚫 Acesso negado para: 5579999999999`.
2.  Copie esse número exato.
3.  Atualize o registro na tabela `usuarios` no MySQL com esse número.

### 🔴 Erro de API (500) ou Relatórios Vazios
**Causa:** Filtros de data incorretos enviados diretamente para a Omie.
**Solução:**
Este projeto utiliza uma estratégia de **"Filtragem Local"**. O bot baixa os dados brutos da Omie (sem enviar filtros de data que causam erro 500) e o Node.js processa e filtra o período correto localmente.
*Certifique-se de não alterar a lógica de `fetch` no arquivo `fetchApi.ts` para enviar tags de data no corpo da requisição.*

---

## 👨‍💻 Desenvolvedores

Projeto desenvolvido pelo **Squad 09**.
