'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:3001';

export default function Login() {
    const router = useRouter();
    const [tela, setTela] = useState('login'); // 'login' ou 'cadastro'
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    // Campos do formulário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

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

        if (!res.ok) {
            setErro(data.error);
            return;
        }

        // Salva o token e o nome no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('nome', data.nome);

        // Redireciona para a página principal
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

        if (!res.ok) {
            setErro(data.error);
            return;
        }

        // Cadastrou com sucesso — manda pro login
        setTela('login');
        setErro('');
        setNome('');
        setSenha('');
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-stone-200 dark:border-gray-700 w-full max-w-sm p-8">

                {/* Título */}
                <h1 className="text-xl font-semibold text-stone-800 dark:text-gray-100 mb-1">
                    Lourencetti tarefas
                </h1>
                <p className="text-sm text-stone-500 dark:text-gray-400 mb-6">
                    {tela === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
                </p>

                {/* Campo nome — só aparece no cadastro */}
                {tela === 'cadastro' && (
                    <div className="mb-4">
                        <label className="text-xs font-medium text-stone-600 dark:text-gray-400 block mb-1">Nome</label>
                        <input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Seu nome"
                            maxLength={30}
                            className="
                                w-full border border-stone-300 dark:border-gray-600
                                bg-white dark:bg-gray-700
                                text-stone-800 dark:text-gray-100
                                placeholder-stone-400 dark:placeholder-gray-500
                                rounded-lg px-3 py-2 text-sm
                                focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-400
                            "
                        />
                    </div>
                )}

                {/* Campo email */}
                <div className="mb-4">
                    <label className="text-xs font-medium text-stone-600 dark:text-gray-400 block mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="
                            w-full border border-stone-300 dark:border-gray-600
                            bg-white dark:bg-gray-700
                            text-stone-800 dark:text-gray-100
                            placeholder-stone-400 dark:placeholder-gray-500
                            rounded-lg px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-400
                        "
                    />
                </div>

                {/* Campo senha */}
                <div className="mb-5">
                    <label className="text-xs font-medium text-stone-600 dark:text-gray-400 block mb-1">Senha</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        onKeyDown={(e) => e.key === 'Enter' && (tela === 'login' ? handleLogin() : handleCadastro())}
                        className="
                            w-full border border-stone-300 dark:border-gray-600
                            bg-white dark:bg-gray-700
                            text-stone-800 dark:text-gray-100
                            placeholder-stone-400 dark:placeholder-gray-500
                            rounded-lg px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-400
                        "
                    />
                </div>

                {/* Mensagem de erro */}
                {erro && (
                    <p className="text-xs text-red-500 dark:text-red-400 mb-4">{erro}</p>
                )}

                {/* Botão principal */}
                <button
                    onClick={tela === 'login' ? handleLogin : handleCadastro}
                    disabled={carregando}
                    className="
                        w-full text-sm font-medium text-white py-2 rounded-lg transition-colors
                        bg-amber-700 hover:bg-amber-800
                        dark:bg-indigo-600 dark:hover:bg-indigo-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {carregando ? 'Aguarde...' : tela === 'login' ? 'Entrar' : 'Criar conta'}
                </button>

                {/* Troca entre login e cadastro */}
                <p className="text-xs text-center text-stone-500 dark:text-gray-400 mt-4">
                    {tela === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
                    <button
                        onClick={() => { setTela(tela === 'login' ? 'cadastro' : 'login'); setErro(''); }}
                        className="ml-1 text-amber-700 dark:text-indigo-400 hover:underline font-medium"
                    >
                        {tela === 'login' ? 'Cadastre-se' : 'Entrar'}
                    </button>
                </p>

            </div>
        </div>
    );
}
