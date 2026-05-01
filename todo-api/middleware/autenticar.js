// ─── MIDDLEWARE DE AUTENTICAÇÃO ───────────────────────────────
// Essa função fica na frente das rotas protegidas.
// Ela lê o token do cabeçalho, valida, e coloca o id do usuário em req.usuarioId.
// Se não tiver token ou for inválido, barra a requisição com erro 401.

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'todo_secret_123';

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

module.exports = autenticar;