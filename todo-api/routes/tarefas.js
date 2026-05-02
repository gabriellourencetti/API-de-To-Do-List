const autenticar = require('../middleware/autenticar');
const express    = require('express');
const db         = require('../db');
const router     = express.Router();

// Cache: chave = usuarioId, valor = { data: [...], expiresAt: timestamp }
const tarefasCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 segundos

function getCache(usuarioId) {
    const entry = tarefasCache.get(usuarioId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        tarefasCache.delete(usuarioId); // expirado
        return null;
    }
    return entry.data;
}

function setCache(usuarioId, data) {
    tarefasCache.set(usuarioId, { data, expiresAt: Date.now() + CACHE_TTL });
}

function invalidarCache(usuarioId) {
    tarefasCache.delete(usuarioId);
}

// ─── GET /tarefas ─────────────────────────────────────────────
router.get('/tarefas', autenticar, (req, res) => {
    const cached = getCache(req.usuarioId);
    if (cached) {
        return res.json(cached); // retorna do cache sem bater no banco
    }

    // Só busca colunas necessárias em vez de SELECT *
    db.query(
        'SELECT id, titulo, status, criado_em FROM tarefas WHERE usuario_id = ? ORDER BY criado_em DESC',
        [req.usuarioId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' });
            setCache(req.usuarioId, results);
            res.json(results);
        }
    );
});

// ─── POST /tarefas ────────────────────────────────────────────
router.post('/tarefas', autenticar, (req, res) => {
    const { titulo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'O título é obrigatório' });

    db.query(
        'INSERT INTO tarefas (titulo, usuario_id) VALUES (?, ?)',
        [titulo, req.usuarioId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            invalidarCache(req.usuarioId); // força novo GET no banco
            res.status(201).json({ id: results.insertId, titulo, status: 'a_fazer' });
        }
    );
});

// ─── PATCH /tarefas/:id/status ────────────────────────────────
router.patch('/tarefas/:id/status', autenticar, (req, res) => {
    const { id }     = req.params;
    const { status } = req.body;

    const validos = ['a_fazer', 'fazendo', 'concluido'];
    if (!validos.includes(status))
        return res.status(400).json({ error: 'Status inválido.' });

    db.query(
        'UPDATE tarefas SET status = ? WHERE id = ? AND usuario_id = ?',
        [status, id, req.usuarioId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
            invalidarCache(req.usuarioId); // força novo GET no banco
            res.json({ 'Novo status': status });
        }
    );
});

// ─── DELETE /tarefas/:id ──────────────────────────────────────
router.delete('/tarefas/:id', autenticar, (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuarioId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao deletar tarefa' });
            invalidarCache(req.usuarioId); // força novo GET no banco
            res.json({ message: 'Tarefa deletada com sucesso' });
        }
    );
});

module.exports = router;