import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPassModalOpen, setForgotPassModalOpen] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const rememberedIdentifier = localStorage.getItem('rememberedIdentifier');
        if (rememberedIdentifier) {
            setIdentifier(rememberedIdentifier);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(identifier, password);
            if (user) {
                if (rememberMe) {
                    localStorage.setItem('rememberedIdentifier', identifier);
                } else {
                    localStorage.removeItem('rememberedIdentifier');
                }
            } else {
                setError('Login, CPF/Telefone ou senha inválidos.');
            }
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-ds-vinho to-[#4c0415] p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-ds-dourado/10 border border-ds-dourado/20 p-8 space-y-6">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-ds-dourado mx-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-4xl font-bold text-ds-vinho mt-2 font-script">Descont'Saúde</h1>
                        <p className="text-gray-500">Seu bem-estar em primeiro lugar.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                Login, CPF ou Telefone
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado"
                                placeholder="Digite seu login, CPF ou telefone"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado"
                                placeholder="Sua senha"
                                required
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                 <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado"
                                    />
                                    <span className="text-sm text-gray-700">Lembrar meu acesso</span>
                                </label>
                            </div>

                            <div className="text-sm">
                                <button type="button" onClick={() => setForgotPassModalOpen(true)} className="font-medium text-ds-vinho hover:underline">
                                    Esqueceu a senha?
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-ds-vinho bg-ds-dourado hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ds-dourado disabled:bg-opacity-50 transition-all duration-200 ease-in-out hover:scale-105"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <Modal
                isOpen={isForgotPassModalOpen}
                onClose={() => setForgotPassModalOpen(false)}
                title="Recuperar Senha"
            >
                <div className="space-y-4 text-center">
                    <p className="text-gray-600">
                        Para clientes, a senha padrão são os <strong className="text-ds-vinho">4 últimos dígitos do seu CPF</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                        Para administradores ou em caso de problemas, por favor, entre em contato com o suporte.
                    </p>
                    <button 
                        onClick={() => setForgotPassModalOpen(false)}
                        className="w-full bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors">
                        Entendi
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default LoginPage;
