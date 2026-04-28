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

/* 

no banco de dados, crie um banco chamado "todo_db" e uma
tabela chamada "tarefas" com os seguintes campos:


create table tarefas (
id int auto_increment primary key,
titulo varchar(200) not null,
status ENUM('a_fazer', 'fazendo', 'concluido') DEFAULT 'a_fazer',
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

*/