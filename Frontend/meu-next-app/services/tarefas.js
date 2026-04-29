const API = 'http://localhost:3001' // URL da API para tarefas

//Função para buscar as tarefas
export async function getTarefas() {
    const res = await fetch(`${API}/tarefas`)  // faz uma requisição GET para a URL da API seguida de /tarefas
    // o fetch é usado para fazer uma requisição HTTP (seja get, post, patch, etc) para a URL da API
    return res.json() // retorna a resposta em formato JSON
}

//Função para criar uma nova tarefa
export async function criarTarefa(titulo) {
    const res = await fetch(`${API}/tarefas`, { // faz uma requisição POST para a URL da API
        method: 'POST', // define o método da requisição como POST, caso contrário, o fetch usaria GET por padrão
        headers: {'Content-Type': 'application/json'}, // define o cabeçalho da requisição para indicar que o corpo é JSON
        body: JSON.stringify({titulo}) // converte o título da tarefa em uma string JSON para enviar no corpo da requisição
    })
    return res.json() // retorna a resposta em formato JSON
}

//Função para atualizar o status de uma tarefa
export async function updateStatus(id, status) {
    const res = await fetch(`${API}/tarefas/${id}/status`, { // faz uma requisição PATCH para a URL da API seguida do ID da tarefa e /status
        method: 'PATCH', // define o método da requisição como PATCH, caso contrário, o fetch usaria GET por padrão
        headers: {'Content-Type': 'application/json'}, // define o cabeçalho da requisição para indicar que o corpo é JSON
        body: JSON.stringify({status}) // converte o status da tarefa em uma string JSON para enviar no corpo da requisição
    })
    return res.json() // retorna a resposta em formato JSON
}

//  Deletar uma tarefa
export async function deletarTarefa(id) {
    await fetch(`${API}/tarefas/${id}`, {method: 'DELETE'})
}