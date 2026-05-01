const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db'); // ../ porque está dentro de routes/
const router = express.Router();

// ─── POST /cadastro ───────────────────────────────────────────
// Recebe nome, email e senha — salva o usuário no banco com a senha criptografada

router.post('/cadastro', async (req, res) => {
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

router.post('/login', (req, res) => {
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

module.exports = router;