const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const router  = express.Router();
const JWT_SECRET = 'todo_secret_123';

// Cache de usuários para evitar query no login repetido
const userCache = new Map();

// ─── POST /cadastro ───────────────────────────────────────────
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });

    try {
        const senha_hash = await bcrypt.hash(senha, 10);

        db.query(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, senha_hash],
            (err, results) => {
                if (err) {
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
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha)
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    // Só busca as colunas necessárias em vez de SELECT *
    const query = 'SELECT id, nome, senha_hash FROM usuarios WHERE email = ?';

    // Verifica cache antes de bater no banco
    if (userCache.has(email)) {
        const usuario = userCache.get(email);
        return validarSenhaEResponder(usuario, senha, res);
    }

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const usuario = results[0];
        if (!usuario)
            return res.status(401).json({ error: 'Email ou senha incorretos.' });

        // Salva no cache por 5 minutos
        userCache.set(email, usuario);
        setTimeout(() => userCache.delete(email), 5 * 60 * 1000);

        validarSenhaEResponder(usuario, senha, res);
    });
});

async function validarSenhaEResponder(usuario, senha, res) {
    try {
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta)
            return res.status(401).json({ error: 'Email ou senha incorretos.' });

        const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, nome: usuario.nome });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = router;