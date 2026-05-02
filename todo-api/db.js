// A função desse arquivo é conectar o mysql com o codigo
const mysql = require('mysql2'); // importa o mysql2 para conectar ao banco de dados

// configuração do banco de dados
const db = mysql.createConnection({ 
    host: 'm9kaz8.h.filess.io',
    user: 'todo_db_paledutyof',  // usuario do banco
    password: 'fa97f503e31e1c5e1c5aef2d8540042b17e4d94f', // senha do banco 
    database: 'todo_db_paledutyof',
    port: 61002,
    ssl: { rejectUnauthorized: false }
});

// Conectando ao banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados!');
});

module.exports = db; // exporta a conexão para ser usada em outros arquivos
