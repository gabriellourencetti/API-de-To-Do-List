# API de To-Do List

###  Objetivo
Este projeto tem como objetivo aprender, na prática, como criar e consumir uma API.

Como desenvolvedor focado em frontend, muitas vezes tenho dificuldade em entender o funcionamento do backend. Este projeto existe justamente para mudar isso — colocando a mão na massa e evoluindo na prática.

---

### ⚙️ Tecnologias e Dependências

### 📦 Inicialização do projeto
```bash
npm init -y
```

### 📚 Dependências utilizadas

- **express**  
  Responsável por criar o servidor e definir as rotas da API (os “endereços” que podem ser acessados).

- **mysql2**  
  Permite a conexão entre o Node.js e o banco de dados MySQL.

- **cors**  
  Libera a comunicação entre o frontend (ex: Next.js) e o backend, evitando bloqueios do navegador.

### 📥 Instalação
```bash
npm install express mysql2 cors
```

---

### Conceitos importantes

### 🔹 req (request)
Representa a requisição recebida pelo servidor.

Contém todos os dados enviados pelo cliente (frontend), como:
- `req.body` → dados enviados no corpo (JSON)
- `req.params` → parâmetros da URL (ex: `/usuarios/:id`)
- `req.query` → parâmetros de consulta (ex: `?nome=Gabriel`)



### 🔹 res (response)
Representa a resposta que o servidor envia de volta.

Exemplos:
- `res.json()` → envia dados em formato JSON
- `res.status(404)` → define o código de status da resposta
- `res.send()` → envia uma resposta simples

---
