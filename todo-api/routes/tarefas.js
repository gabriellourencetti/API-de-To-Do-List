const autenticar = require('../middleware/autenticar')
const express = require('express');
const db      = require('../db');
const router = express.Router();

// ─── GET /tarefas ─────────────────────────────────────────────
// autenticar é o middleware — ele roda primeiro e só deixa passar se o token for válido

router.get('/tarefas', autenticar, (req, res) => {
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

router.post('/tarefas', autenticar, (req, res) => {
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

router.patch('/tarefas/:id/status', autenticar, (req, res) => {
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

router.delete('/tarefas/:id', autenticar, (req, res) => {
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

module.exports = router;

