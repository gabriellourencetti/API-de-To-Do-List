const express = require('express'); // importa o express para criar o servidor
const cors = require('cors'); // importa o cors para permitir requisições de outros domínios
const db = require('./db'); // importa a conexão com o banco de dados

const app = express(); // cria uma instância do express
app.use(cors()); // libera o Next.js a fazer requisições
app.use(express.json()); // entende JSON no corpo da requisição

// ─── GET /tarefas ──────────────────────────────────
// Busca todas as tarefas usando o metodo GET

app.get('/tarefas', (req, res) => { // rota para buscar todas as tarefas
    db.query('select * from tarefas order by criado_em desc', (err, results) => { // consulta SQL para buscar todas as tarefas ordenadas por data de criação
        if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' }); // se houver um erro, retorna status 500 com uma mensagem de erro
        res.json(results); // se não houver erro, retorna as tarefas em formato JSON
    });
})

// ─── POST /tarefas ──────────────────────────────────
// Cria uma nova tarefa usando o metodo POST

app.post('/tarefas', (req, res) => { // rota para criar uma nova tarefa
    const { titulo } = req.body //  pega o título que o front enviou
    if(!titulo) return res.status(400).json({error: 'O título é obrigatório'}) 

        db.query('inset into tarefas (titulo) values (?)', [titulo], (err, results) => { // consulta SQL para inserir uma nova tarefa com o título fornecido
            if (err) return res.status(500).json({ error: 'Erro ao criar tarefa' });
            res.status(201).json({id: result.insertId, titulo, status:'a_fazer'})// retorna a nova tarefa criada com o ID gerado, título e status padrão 'a_fazer'
        })
})

// ─── PATCH /tarefas/:id/status ──────────────────────────────────
// Atualiza o status de uma tarefa usando o metodo PATCH

app.patch('/tarefas/:id/status', (req, res) => { 
    const { id } = req.params // pega o ID da tarefa a ser atualizada
    const { status } = req.body // pega o novo status que o front enviou

    const validos = ['a_fazer', 'fazendo', 'concluido'] // define os status válidos
    if(!validos.includes(status)) //o includes verifica se o status enviado é um dos válidos, se não for, retorna um erro 400
        return res.status(400).json({error: 'Status inválido.'})

    db.query('update tarefas set status = ? where id = ?', [status, id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
        res.json({'Novo status': status})
    })
})