'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const API = 'https://api-de-to-do-list.onrender.com';

export default function Login() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [tela, setTela] = useState('login');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) router.push('/');
    }, []);

    async function handleLogin() {
        setErro('');
        setCarregando(true);
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });
        const data = await res.json();
        setCarregando(false);
        if (!res.ok) { setErro(data.error); return; }
        localStorage.setItem('token', data.token);
        localStorage.setItem('nome', data.nome);
        router.push('/');
    }

    async function handleCadastro() {
        setErro('');
        setCarregando(true);
        const res = await fetch(`${API}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha }),
        });
        const data = await res.json();
        setCarregando(false);
        if (!res.ok) { setErro(data.error); return; }
        setTela('login');
        setErro('');
        setNome('');
        setSenha('');
    }

    const isLogin = tela === 'login';

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-stone-50 dark:bg-gray-900">

            {/* ── Lado esquerdo — decorativo ── */}
            <div className="hidden md:flex md:w-1/2 bg-stone-800 dark:bg-gray-800 flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* círculos decorativos */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-stone-700/50 dark:bg-gray-700/50 rounded-full" />

                <div className="relative z-10 text-center">
                    {/* logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {resolvedTheme === 'dark' ? (
              <img src="/logotipoRoxa.png" className="w-12" />
            ) : (
              <img src="/logotipoLaranja.png" className="w-12" />
            )}
                        <span className="text-3xl font-bold text-white">Nexo</span>
                    </div>

                    <p className="text-stone-300 text-base leading-relaxed max-w-xs mb-10">
                        Organize suas tarefas de forma simples e eficiente.
                    </p>

                    {/* mini kanban decorativo */}
                    <div className="flex gap-3 justify-center">
                        {[
                            { label: 'A fazer', cards: 2, cor: 'border-stone-600' },
                            { label: 'Fazendo', cards: 1, cor: 'border-amber-500/60' },
                            { label: 'Concluído', cards: 2, cor: 'border-stone-600' },
                        ].map((col) => (
                            <div key={col.label} className={`bg-stone-700/60 dark:bg-gray-700/60 border ${col.cor} rounded-xl p-3 w-28`}>
                                <p className="text-stone-400 text-xs font-medium mb-2">{col.label}</p>
                                {[...Array(col.cards)].map((_, j) => (
                                    <div key={j} className={`rounded-lg h-6 mb-1.5 ${col.label === 'Fazendo' ? 'bg-amber-500/30' : 'bg-stone-600/60'}`} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Lado direito — formulário ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen md:min-h-0">

                {/* logo mobile */}
                <div className="flex md:hidden items-center gap-2 mb-8">
                    {resolvedTheme === 'dark'
                        ? <img src="/logotiporoxa.png" className="w-8" />
                        : <img src="/logotipoLaranja.png" className="w-8" />
                    }
                    <span className="text-xl font-bold text-stone-800 dark:text-white">Nexo</span>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-white">
                            {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
                        </h2>
                        <p className="text-stone-500 dark:text-gray-400 text-sm mt-1">
                            {isLogin ? 'Entre para continuar organizando suas tarefas.' : 'Comece a organizar suas tarefas hoje.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                                    Nome
                                </label>
                                <input
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    maxLength={30}
                                    className="w-full bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                onKeyDown={(e) => e.key === 'Enter' && (isLogin ? handleLogin() : handleCadastro())}
                                className="w-full bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* erro */}
                    {erro && (
                        <div className="mt-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                            <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>
                        </div>
                    )}

                    {/* botão principal */}
                    <button
                        onClick={isLogin ? handleLogin : handleCadastro}
                        disabled={carregando}
                        className="mt-6 w-full bg-amber-600 hover:bg-amber-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {carregando ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Aguarde...
                            </span>
                        ) : isLogin ? 'Entrar' : 'Criar conta'}
                    </button>

                    {/* troca de tela */}
                    <p className="text-center text-sm text-stone-500 dark:text-gray-400 mt-6">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => { setTela(isLogin ? 'cadastro' : 'login'); setErro(''); }}
                            className="ml-1.5 text-amber-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                        >
                            {isLogin ? 'Cadastre-se' : 'Entrar'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
