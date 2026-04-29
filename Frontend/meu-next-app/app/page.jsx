'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getTarefas, criarTarefa, updateStatus, deletarTarefa } from '@/services/tarefas';

// Os 3 status possíveis, em ordem
const COLUNAS = [
  { id: 'a_fazer',   label: 'A fazer',   cor: 'bg-slate-100  border-slate-300'  },
  { id: 'fazendo',   label: 'Fazendo',   cor: 'bg-blue-50    border-blue-300'    },
  { id: 'concluido', label: 'Concluído', cor: 'bg-emerald-50 border-emerald-300' },
];

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
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
    setModalAberto(false);
    carregarTarefas();
  }

  async function handleDeletar(id) {
    await deletarTarefa(id);
    carregarTarefas();
  }

  // Essa função é chamada quando o usuário solta uma tarefa numa coluna
  async function handleDragEnd(result) {
    // result.destination é onde a tarefa foi solta
    // result.source é de onde ela veio
    // Se soltou fora de qualquer coluna, destination é null — ignora
    if (!result.destination) return;

    const novoStatus = result.destination.droppableId; // o id da coluna destino é o próprio status
    const tarefaId   = result.draggableId;             // o id da tarefa arrastada

    // Se soltou na mesma coluna, não faz nada
    if (result.source.droppableId === novoStatus) return;

    // Atualiza otimisticamente na tela antes de esperar a API
    // (deixa mais rápido visualmente)
    setTarefas(prev =>
      prev.map(t => t.id === Number(tarefaId) ? { ...t, status: novoStatus } : t)
    );

    // Manda pra API salvar no banco
    await updateStatus(tarefaId, novoStatus);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ───────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Minhas Tarefas</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Adicionar tarefa
        </button>
      </header>

      {/* ── KANBAN ───────────────────────────────── */}
      {/* DragDropContext envolve tudo que pode ser arrastado */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-center gap-10 p-6 overflow-x-auto">
          {COLUNAS.map((coluna) => {
            // Filtra só as tarefas dessa coluna
            const tarefasDaColuna = tarefas.filter(t => t.status === coluna.id);

            return (
              <div key={coluna.id} className="flex flex-col w-72 shrink-0">

                {/* Título da coluna */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {coluna.label}
                  </h2>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {tarefasDaColuna.length}
                  </span>
                </div>

                {/* Droppable é a área que aceita drops — o droppableId é o status da coluna */}
                <Droppable droppableId={coluna.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}        // ref obrigatório do dnd
                      {...provided.droppableProps}   // props obrigatórias do dnd
                      className={`flex flex-col gap-2 min-h-24 rounded-xl border-2 p-2 transition-colors ${
                        snapshot.isDraggingOver      // muda cor quando está arrastando em cima
                          ? 'border-emerald-400 bg-emerald-50'
                          : coluna.cor
                      }`}
                    >
                      {tarefasDaColuna.map((tarefa, index) => (
                        // Draggable é cada card arrastável
                        // draggableId precisa ser string
                        // index é a posição na lista (obrigatório)
                        <Draggable key={String(tarefa.id)} draggableId={String(tarefa.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}   // faz o card se mover
                              {...provided.dragHandleProps}  // define onde clicar pra arrastar
                              className="cursor-grab active:cursor-grabbing"
                            >
                              {/* div interno — a biblioteca não mexe aqui, então a animação funciona */}
                              <div
                                className={`bg-white rounded-lg border border-gray-200 p-3 ${
                                  snapshot.isDragging ? 'shadow-xl' : 'shadow-sm hover:shadow-md'
                                }`}
                                style={snapshot.isDragging ? {
                                  animation: 'balancar 1s ease-in-out infinite',
                                  transformOrigin: 'top center',
                                } : {}}
                              >
                                <p className="text-sm text-gray-800 font-medium leading-snug">
                                  {tarefa.titulo}
                                </p>
                                <button
                                  onClick={() => handleDeletar(tarefa.id)}
                                  className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                                >
                                  Deletar
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder} {/* espaço reservado enquanto arrasta */}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* ── MODAL DE ADICIONAR ────────────────────── */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setModalAberto(false)} // fecha ao clicar fora
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4">Nova tarefa</h2>
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
              placeholder="Nome da tarefa..."
              maxLength={50}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriar}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}