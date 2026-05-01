const express = require('express');
const cors    = require('cors');
// const db = require('./db')

const authRotas = require('./routes/auth')
const tarefasRoutes = require('./routes/tarefas')

const app = express();

app.use(cors());
app.use(express.json());
app.use(authRotas);
app.use(tarefasRoutes);

// Segredo usado pra assinar os tokens — em produção ficaria num arquivo .env
const JWT_SECRET = 'todo_secret_123';

app.listen(3001, () => { console.log('API rodando em http://localhost:3001'); });