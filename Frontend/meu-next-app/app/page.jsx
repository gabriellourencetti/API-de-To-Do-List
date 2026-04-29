'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getTarefas, criarTarefa, updateStatus, deletarTarefa } from '@/services/tarefas';
import { Settings, Settings2 } from "lucide-react";

const COLUNAS = [
  { id: 'a_fazer',   label: 'A fazer',   cor: 'bg-stone-100 border-stone-300 dark:bg-gray-700 dark:border-gray-600' },
  { id: 'fazendo',   label: 'Fazendo',   cor: 'bg-amber-50  border-amber-300  dark:bg-gray-700 dark:border-indigo-600' },
  { id: 'concluido', label: 'Concluído', cor: 'bg-stone-50  border-stone-200  dark:bg-gray-700 dark:border-gray-600' },
];

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const { theme, setTheme } = useTheme();

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

  async function handleDragEnd(result) {
    if (!result.destination) return;
    const novoStatus = result.destination.droppableId;
    const tarefaId = result.draggableId;
    if (result.source.droppableId === novoStatus) return;
    setTarefas(prev =>
      prev.map(t => t.id === Number(tarefaId) ? { ...t, status: novoStatus } : t)
    );
    await updateStatus(tarefaId, novoStatus);
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-900 transition-colors duration-300">

      {/* ── HEADER ───────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 border-b border-stone-200 dark:border-gray-700 px-6 py-4 flex items-center shadow-sm">
        <div className="w-50">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-gray-100">
            Lourencetti tarefas
          </h1>
        </div>
        <div className="flex justify-end gap-3 w-full">

          <button
            onClick={() => setModalConfigAberto(true)}
            className="
              bg-stone-200 hover:bg-stone-300 text-stone-700
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
              cursor-pointer text-sm font-medium px-4 py-2 rounded-lg transition-colors
            "
          >
            <Settings2/>
          </button>

          <button
            onClick={() => setModalAberto(true)}
            className="
              bg-amber-700 hover:bg-amber-800 text-white
              dark:bg-indigo-600 dark:hover:bg-indigo-500
              cursor-pointer text-sm font-medium px-4 py-2 rounded-lg transition-colors
            "
          >
            + Adicionar tarefa
          </button>

        </div>
      </header>

      {/* ── KANBAN ───────────────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-center gap-10 p-6 overflow-x-auto bg-stone-50 dark:bg-gray-900 transition-colors duration-300">
          {COLUNAS.map((coluna) => {
            const tarefasDaColuna = tarefas.filter(t => t.status === coluna.id);

            return (
              <div key={coluna.id} className="flex flex-col w-72 shrink-0 max-h-screen">

                {/* Título da coluna */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wide">
                    {coluna.label}
                  </h2>
                  <span className="text-xs bg-stone-200 dark:bg-gray-700 text-stone-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {tarefasDaColuna.length}
                  </span>
                </div>

                <Droppable droppableId={coluna.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2 min-h-24 rounded-xl border-2 p-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? 'border-amber-600 bg-amber-50 dark:border-indigo-400 dark:bg-indigo-950'
                          : coluna.cor
                      }`}
                    >
                      {tarefasDaColuna.map((tarefa, index) => (
                        <Draggable key={String(tarefa.id)} draggableId={String(tarefa.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <div
                                className={`
                                  bg-white dark:bg-gray-800
                                  rounded-lg border
                                  border-stone-200 dark:border-gray-600
                                  p-3 transition-shadow
                                  ${snapshot.isDragging
                                    ? 'shadow-xl ring-2 ring-amber-400 dark:ring-indigo-400'
                                    : 'shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-indigo-400'
                                  }
                                `}
                                style={snapshot.isDragging ? {
                                  animation: 'balancar 1s ease-in-out infinite',
                                  transformOrigin: 'top center',
                                } : {}}
                              >
                                <p className="text-sm text-stone-800 dark:text-gray-100 font-medium leading-snug">
                                  {tarefa.titulo}
                                </p>
                                <button
                                  onClick={() => handleDeletar(tarefa.id)}
                                  className="mt-2 text-xs text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                >
                                  Deletar
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
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
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-stone-800 dark:text-gray-100 mb-4">Nova tarefa</h2>
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
              placeholder="Nome da tarefa..."
              maxLength={50}
              className="
                w-full border border-stone-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-stone-800 dark:text-gray-100
                placeholder-stone-400 dark:placeholder-gray-400
                rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-400
                mb-4
              "
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                className="text-sm cursor-pointer text-stone-500 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriar}
                className="
                  text-sm cursor-pointer text-white px-4 py-2 rounded-lg transition-colors
                  bg-amber-700 hover:bg-amber-800
                  dark:bg-indigo-600 dark:hover:bg-indigo-500
                "
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIGURAÇÕES ──────────────────────  */}
      {modalConfigAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setModalConfigAberto(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-stone-800 dark:text-gray-100 mb-4">Configurações</h2>

            <div className="flex justify-between items-center">
              <span className="text-stone-700 dark:text-gray-300 text-sm">Modo escuro</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-indigo-500' : 'bg-stone-300'
                }`}
                title={theme === 'dark' ? 'Mudar para claro' : 'Mudar para escuro'}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}