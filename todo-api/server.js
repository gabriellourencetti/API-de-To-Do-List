const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');       // criptografa e compara senhas
const jwt     = require('jsonwebtoken'); // gera e valida tokens
const db      = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Segredo usado pra assinar os tokens — em produção ficaria num arquivo .env
const JWT_SECRET = 'todo_secret_123';

// ─── MIDDLEWARE DE AUTENTICAÇÃO ───────────────────────────────
// Essa função fica na frente das rotas protegidas.
// Ela lê o token do cabeçalho, valida, e coloca o id do usuário em req.usuarioId.
// Se não tiver token ou for inválido, barra a requisição com erro 401.

function autenticar(req, res, next) {
    const authHeader = req.headers['authorization']; // ex: "Bearer eyJhbG..."
    const token = authHeader && authHeader.split(' ')[1]; // pega só a parte depois de "Bearer "

    if (!token) return res.status(401).json({ error: 'Token não enviado.' });

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).json({ error: 'Token inválido.' });
        req.usuarioId = payload.id; // guarda o id do usuário pra usar nas rotas
        next(); // deixa a requisição continuar para a rota
    });
}

// ─── POST /cadastro ───────────────────────────────────────────
// Recebe nome, email e senha — salva o usuário no banco com a senha criptografada

app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });

    try {
        // bcrypt.hash criptografa a senha — o 10 é o "custo" (quanto mais alto, mais seguro e lento)
        const senha_hash = await bcrypt.hash(senha, 10);

        db.query(
            'insert into usuarios (nome, email, senha_hash) values (?, ?, ?)',
            [nome, email, senha_hash],
            (err, results) => {
                if (err) {
                    // Erro 1062 = email duplicado (violou o UNIQUE)
                    if (err.errno === 1062)
                        return res.status(400).json({ error: 'Este email já está cadastrado.' });
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'Usuário criado com sucesso!' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /login ──────────────────────────────────────────────
// Recebe email e senha — verifica se batem e retorna um token JWT

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha)
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    db.query('select * from usuarios where email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const usuario = results[0]; // pega o primeiro (e único) resultado
        if (!usuario)
            return res.status(401).json({ error: 'Email ou senha incorretos.' });

        // bcrypt.compare compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta)
            return res.status(401).json({ error: 'Email ou senha incorretos.' });

        // Gera o token com o id do usuário dentro — expira em 8 horas
        const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, nome: usuario.nome });
    });
});

// ─── GET /tarefas ─────────────────────────────────────────────
// autenticar é o middleware — ele roda primeiro e só deixa passar se o token for válido

app.get('/tarefas', autenticar, (req, res) => {
    // req.usuarioId foi preenchido pelo middleware — busca só as tarefas desse usuário
    db.query(
        'select * from tarefas where usuario_id = ? order by criado_em desc',
        [req.usuarioId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' });
            res.json(results);
        }
    );
});

// ─── POST /tarefas ────────────────────────────────────────────

app.post('/tarefas', autenticar, (req, res) => {
    const { titulo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'O título é obrigatório' });

    // inclui o usuario_id na inserção — a tarefa já nasce com dono
    db.query(
        'insert into tarefas (titulo, usuario_id) values (?, ?)',
        [titulo, req.usuarioId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: results.insertId, titulo, status: 'a_fazer' });
        }
    );
});

// ─── PATCH /tarefas/:id/status ────────────────────────────────

app.patch('/tarefas/:id/status', autenticar, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validos = ['a_fazer', 'fazendo', 'concluido'];
    if (!validos.includes(status))
        return res.status(400).json({ error: 'Status inválido.' });

    // o WHERE garante que o usuário só consegue atualizar as próprias tarefas
    db.query(
        'update tarefas set status = ? where id = ? and usuario_id = ?',
        [status, id, req.usuarioId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
            res.json({ 'Novo status': status });
        }
    );
});

// ─── DELETE /tarefas/:id ──────────────────────────────────────

app.delete('/tarefas/:id', autenticar, (req, res) => {
    const { id } = req.params;

    // o WHERE garante que o usuário só consegue deletar as próprias tarefas
    db.query(
        'delete from tarefas where id = ? and usuario_id = ?',
        [id, req.usuarioId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao deletar tarefa' });
            res.json({ message: 'Tarefa deletada com sucesso' });
        }
    );
});

app.listen(3001, () => { console.log('API rodando em http://localhost:3001'); });