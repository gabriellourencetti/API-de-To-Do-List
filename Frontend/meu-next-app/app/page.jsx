'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getTarefas, criarTarefa, updateStatus, deletarTarefa } from '@/services/tarefas';
import { Settings2 } from "lucide-react";

const COLUNAS = [
  { id: 'a_fazer', label: 'A fazer', cor: 'bg-stone-100 border-stone-300 dark:bg-gray-700 dark:border-gray-600' },
  { id: 'fazendo', label: 'Fazendo', cor: 'bg-amber-50 border-amber-300 dark:bg-gray-700 dark:border-indigo-600' },
  { id: 'concluido', label: 'Concluído', cor: 'bg-stone-50 border-stone-200 dark:bg-gray-700 dark:border-gray-600' },
];

const name = 'Nexo';

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [frase, setFrase] = useState('');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);

  function abrirTarefa(tarefa) {
    setTarefaSelecionada(tarefa);
  }

  function fecharTarefa() {
    setTarefaSelecionada(null);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const nome = localStorage.getItem('nome') || '';
    setNomeUsuario(nome);

    const frases = [
      `O que faremos hoje, ${nome}?`,
      `O que está na lista hoje, ${nome}?`,
      `Bora trabalhar, ${nome}!`,
      `O que vamos conquistar hoje, ${nome}?`,
      `Mais um dia, mais uma vitória, ${nome}!`,
    ];
    setFrase(frases[Math.floor(Math.random() * frases.length)]);
    carregarTarefas();
  }, []);

  async function carregarTarefas() {
    const data = await getTarefas();
    if (!Array.isArray(data)) { router.push('/login'); return; }
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

  async function handleMudarStatus(id, novoStatus) {
    await updateStatus(id, novoStatus);
    fecharTarefa();
    carregarTarefas();
  }

  return (
    <>
      {/* ── LAYOUT WRAPPER ── */}
      <div className="min-h-screen bg-stone-50 dark:bg-gray-900 transition-colors duration-300 flex">

        {/* ── SIDEBAR (apenas desktop) ── */}
        <aside className="hidden lg:flex flex-col items-center bg-white dark:bg-gray-800 border-r border-stone-200 dark:border-gray-700 py-6 shadow-sm w-16 shrink-0">
          <div className="mb-auto">
            {theme === 'dark' ? (
              <img src="/logotipoRoxa.png" className="w-12" />
            ) : (
              <img src="/logotipoLaranja.png" className="w-12" />
            )}
          </div>
          <div className="flex flex-col gap-3 items-center">
            <button onClick={() => setModalConfigAberto(true)} title="Configurações"
              className="text-stone-400 hover:text-stone-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-stone-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-all cursor-pointer">
              <Settings2 size={18} />
            </button>
            <button onClick={() => setModalAberto(true)} title="Nova tarefa"
              className="bg-amber-700 hover:bg-amber-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
              <span className="text-lg font-light leading-none">+</span>
            </button>
          </div>
        </aside>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Frase de boas-vindas */}
          <header className="px-4 pt-6 pb-4 md:pt-8 md:pb-6">
            <p className="text-stone-500 dark:text-gray-400 font-semibold text-lg md:text-2xl text-center truncate">
              {frase}
            </p>
          </header>
          {/* Kanban */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="justify-center flex flex-col lg:flex-row gap-4 lg:gap-8 px-4 lg:px-8 pb-28 lg:pb-8">
              {COLUNAS.map((coluna) => {
                const tarefasDaColuna = tarefas.filter(t => t.status === coluna.id);
                return (
                  <div key={coluna.id} className="flex flex-col w-full lg:w-72 lg:shrink-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">

                    <div className="flex items-center justify-between mb-3 lg:sticky lg:top-0 lg:bg-stone-50 lg:dark:bg-gray-900 lg:py-1 lg:z-10">
                      <h2 className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wide">
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
                          className={`flex flex-col gap-2 min-h-24 rounded-xl border-2 p-2 transition-colors ${snapshot.isDraggingOver
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
                                  onClick={() => abrirTarefa(tarefa)}
                                >
                                  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-stone-200 dark:border-gray-600 p-3 transition-shadow ${snapshot.isDragging
                                    ? 'shadow-xl ring-2 ring-amber-400 dark:ring-indigo-400'
                                    : 'shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-indigo-400'
                                    }`}>
                                    <p className="text-sm text-stone-800 dark:text-gray-100 font-medium leading-snug">
                                      {tarefa.titulo}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletar(tarefa.id);
                                      }}
                                      className="mt-2 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
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
        </div>
      </div>

      {/* ── BOTTOM BAR (apenas mobile) ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-t border-stone-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-bold tracking-widest text-stone-400 dark:text-gray-500 uppercase">
            {name}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalConfigAberto(true)}
              className="text-stone-400 hover:text-stone-700 dark:text-gray-500 dark:hover:text-gray-200 p-2 rounded-lg transition-all"
            >
              <Settings2 size={20} />
            </button>
            <button
              onClick={() => setModalAberto(true)}
              className="bg-amber-700 dark:bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            >
              <span className="text-xl leading-none">+</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MODAL ADICIONAR ── */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4"
          onClick={() => setModalAberto(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200 dark:border-gray-700 mb-0 md:mb-0"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-stone-800 dark:text-gray-100 mb-4">Nova tarefa</h2>
            <input
              autoFocus
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCriar()}
              placeholder="Nome da tarefa..."
              maxLength={50}
              className="w-full border border-stone-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100 placeholder-stone-400 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-400 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalAberto(false)}
                className="text-sm cursor-pointer text-stone-500 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCriar}
                className="text-sm cursor-pointer text-white px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIGURAÇÕES ── */}
      {modalConfigAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4"
          onClick={() => setModalConfigAberto(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200 dark:border-gray-700"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-stone-800 dark:text-gray-100 mb-4">Configurações</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-700 dark:text-gray-300 text-sm">Modo escuro</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-stone-300'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('nome'); router.push('/login'); }}
              className="w-full text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 py-2 rounded-lg transition-colors">
              Sair da conta
            </button>
          </div>
        </div>
      )}

      {tarefaSelecionada && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={fecharTarefa}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-stone-800 dark:text-gray-100 mb-2">
              {tarefaSelecionada.titulo}
            </h2>

            <p className="text-sm text-stone-500 dark:text-gray-400 mb-4">
              Status atual: <span className='text-amber-700 dark:text-indigo-600'>{tarefaSelecionada.status}</span>
            </p>

            <div className="flex flex-col gap-2">
              {COLUNAS
                .filter((c) => c.id !== tarefaSelecionada.status)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleMudarStatus(tarefaSelecionada.id, c.id)}
                    className="dark:text-white cursor-pointer text-sm px-3 py-2 rounded-lg border border-stone-300 dark:border-gray-600 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    Marcar como {c.label}
                  </button>
                ))}
            </div>

            <button
              onClick={fecharTarefa}
              className="cursor-pointer mt-4 w-full text-sm px-3 py-2 rounded-lg bg-stone-200 dark:bg-gray-700 hover:bg-stone-300 dark:hover:bg-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}