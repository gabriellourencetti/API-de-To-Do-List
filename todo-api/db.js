// A função desse arquivo é conectar o mysql com o codigo
const mysql = require('mysql2'); // importa o mysql2 para conectar ao banco de dados

// configuração do banco de dados
const db = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',  // usuario do banco
    password: '', // senha do banco 
    database: 'todo_db'
});

// Conectando ao banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
});

module.exports = db; // exporta a conexão para ser usada em outros arquivos
