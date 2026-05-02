const express = require('express');
const cors    = require('cors');

const authRotas      = require('./routes/auth');
const tarefasRoutes  = require('./routes/tarefas');

const app = express();

app.use(cors());
app.use(express.json());

// Cache simples em memória
const cache = new Map();

// Disponibiliza o cache para as rotas via app.locals
app.locals.cache = cache;

app.use(authRotas);
app.use(tarefasRoutes);

const JWT_SECRET = 'todo_secret_123';

app.listen(3001, () => { console.log('API rodando em http://localhost:3001'); });