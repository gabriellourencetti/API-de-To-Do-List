const mysql = require('mysql2');

const pool = mysql.createPool({ 
    host: 'm9kaz8.h.filess.io',
    user: 'todo_db_paledutyof',
    password: 'fa97f503e31e1c5e1c5aef2d8540042b17e4d94f',
    database: 'todo_db_paledutyof',
    port: 61002,
    ssl: { rejectUnauthorized: false },

    // 👇 configurações do pool
    connectionLimit: 5,       // máx conexões simultâneas (filess.io é limitado)
    waitForConnections: true, // fila em vez de erro quando lotado
    queueLimit: 0,            // fila ilimitada
    connectTimeout: 10000,    // 10s para conectar
});

// Testa se o pool está funcionando na inicialização
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
        return;
    }
    console.log('Pool conectado ao banco de dados!');
    connection.release(); // IMPORTANTE: devolve a conexão pro pool
});

module.exports = pool; // exporta o pool no lugar da conexão única