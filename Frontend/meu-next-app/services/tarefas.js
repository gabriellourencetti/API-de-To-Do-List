const API = 'http://localhost:3001';

// Pega o token salvo no localStorage — é ele que prova pro backend quem é o usuário
function getToken() {
    return localStorage.getItem('token');
}

// Os headers agora incluem o Authorization com o token em todas as requisições
function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}` // o backend lê isso no middleware autenticar
    };
}

export async function getTarefas() {
    const res = await fetch(`${API}/tarefas`, { headers: headers() });
    return res.json();
}

export async function criarTarefa(titulo) {
    const res = await fetch(`${API}/tarefas`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ titulo })
    });
    return res.json();
}

export async function updateStatus(id, status) {
    const res = await fetch(`${API}/tarefas/${id}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status })
    });
    return res.json();
}

export async function deletarTarefa(id) {
    await fetch(`${API}/tarefas/${id}`, {
        method: 'DELETE',
        headers: headers()
    });
}
