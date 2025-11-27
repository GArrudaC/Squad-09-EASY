# 🤖 Zizy - Assistente Virtual Financeiro (WhatsApp)

> **Projeto:** SQUAD-09-EASY  
> **Status:** ✅ Funcional / Em Produção

Este projeto é um **Chatbot de WhatsApp** desenvolvido em Node.js e TypeScript, projetado para atuar como uma interface conversacional para o ERP **Omie**. Ele permite que gestores e usuários autorizados consultem relatórios de fluxo de caixa, contas a pagar e receber de forma rápida e segura.

---

## 🚀 Funcionalidades Principais

* **🔐 Autenticação Segura via Banco de Dados:**
    * O bot possui um sistema de *Allowlist*. Apenas números de WhatsApp cadastrados previamente na tabela `usuarios` do banco MySQL têm permissão para interagir.
    * Bloqueio automático de usuários não autorizados.

* **📊 Relatórios Gerenciais Automatizados:**
    * **Relatório Realizado (Passado):** Consolida entradas e saídas efetivamente pagas/recebidas.
    * **Relatório de Previsão (Futuro):** Projeta o fluxo de caixa com base nos vencimentos em aberto.
    * **Período Personalizado:** Permite ao usuário definir qualquer intervalo de datas para análise.

* **🧮 Inteligência Financeira (DRE Simplificado):**
    * O bot não apenas lista dados, ele calcula indicadores:
        * (+) Receitas Operacionais
        * (-) Custos Variáveis
        * (-) Despesas Fixas
        * **(=) Resultado Operacional**

* **🔄 Navegação Fluida:** Sistema de menus intuitivo com tratamento de erros e reconexão automática.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Runtime:** [Node.js](https://nodejs.org/) (v18+)
* **WhatsApp API:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
* **Banco de Dados:** [MySQL](https://www.mysql.com/) (Driver `mysql2`)
* **Integração:** API ERP Omie
* **Utilitários:** `dotenv` (Segurança), `moment-timezone` (Datas).

---

## ⚙️ Pré-requisitos

Para rodar este projeto, você precisa ter instalado:

1.  **Node.js** e **npm**.
2.  **Servidor MySQL** rodando localmente ou na nuvem.
3.  Credenciais de API da **Omie** (`APP_KEY` e `APP_SECRET`).
