'use client';
import { useState, useEffect } from 'react';
import { getTarefas, criarTarefa, updateStatus, deletarTarefa } from '@/services/tarefas';

const STATUS_LABELS = {
  a_fazer:   'A fazer',
  fazendo:   'Fazendo',
  concluido: 'Concluído',
};

const PROXIMOS_STATUS = {
  a_fazer:   'fazendo',
  fazendo:   'concluido',
  concluido: null,
};

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState('');

  useEffect(() => { carregarTarefas(); }, []);

  async function carregarTarefas() {
    const data = await getTarefas();
    setTarefas(data);
  }

  async function handleCriar() {
    if (!titulo.trim()) return;
    await criarTarefa(titulo);
    setTitulo('');
    carregarTarefas();
  }

  async function handleAvancar(tarefa) {
    const proximo = PROXIMOS_STATUS[tarefa.status];
    if (!proximo) return;
    await updateStatus(tarefa.id, proximo);
    carregarTarefas();
  }

  async function handleDeletar(id) {
    await deletarTarefa(id);
    carregarTarefas();
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-medium mb-6">Minhas tarefas</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
          placeholder="Nova tarefa..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button onClick={handleCriar} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">
          Adicionar
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {tarefas.map((tarefa) => (
          <li key={tarefa.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <p className="text-sm font-medium">{tarefa.titulo}</p>
              <p className="text-xs text-gray-500">{STATUS_LABELS[tarefa.status]}</p>
            </div>
            <div className="flex gap-2">
              {PROXIMOS_STATUS[tarefa.status] && (
                <button onClick={() => handleAvancar(tarefa)} className="text-xs border px-2 py-1 rounded">
                  Avançar →
                </button>
              )}
              <button onClick={() => handleDeletar(tarefa.id)} className="text-xs text-red-500 px-2 py-1">
                Deletar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}