# 💬 Banco de Dados — Chatbot Fiscal

Este arquivo contém o **banco de dados do projeto Chatbot Fiscal**, desenvolvido pelo Squad 09 (EASY).  
O banco foi criado no **PostgreSQL** e serve para armazenar informações de usuários, atendentes, FAQs e mensagens trocadas entre o chatbot e os clientes.

---

## 🧠 Estrutura do Banco

- **usuarios** → armazena dados dos clientes (nome, e-mail, data de criação)  
- **atendentes** → guarda dados dos atendentes humanos (nome, e-mail, cargo)  
- **faq** → perguntas e respostas frequentes que o chatbot usa  
- **conversas** → registros de conversas entre usuários e chatbot  
- **mensagens** → mensagens trocadas dentro de cada conversa  

---

## ⚙️ Como Restaurar no PgAdmin

1. Abra o **pgAdmin** e conecte-se ao seu servidor PostgreSQL.  
2. Clique com o botão direito em **Databases** → **Create → Database...**  
   - Nome: `chatbot_fiscal`
3. Após criado, clique com o botão direito no banco `chatbot_fiscal` → **Restore...**
4. Em “Filename”, selecione o arquivo:  








































