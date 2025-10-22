import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('574.201.300-00');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPassModalOpen, setForgotPassModalOpen] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(identifier, password);
            if (!user) {
                setError('CPF/Telefone ou senha inválidos.');
            }
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-ds-vinho p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                    <div className="text-center">
                        <svg xmlns="http://www.w.org/2000/svg" className="h-16 w-16 text-ds-dourado mx-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-3xl font-bold text-ds-vinho mt-2">Descont'Saúde</h1>
                        <p className="text-gray-500">Seu bem-estar em primeiro lugar.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                CPF ou Telefone
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado"
                                placeholder="Seu CPF ou telefone"
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
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-ds-vinho bg-ds-dourado hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ds-dourado disabled:bg-opacity-50 transition-colors"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>

                        <div className="text-center">
                            <button type="button" onClick={() => setForgotPassModalOpen(true)} className="text-sm text-ds-vinho hover:underline">
                                Esqueceu a senha?
                            </button>
                        </div>
                    </form>
                    <div className="text-xs text-gray-400 text-center">
                        <p>Cliente: 574.201.300-00 / password123</p>
                        <p>Admin: 111.111.111-11 / password123</p>
                    </div>
                </div>
            </div>
            
            <Modal
                isOpen={isForgotPassModalOpen}
                onClose={() => setForgotPassModalOpen(false)}
                title="Recuperar Senha"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Insira seu CPF ou e-mail abaixo para receber as instruções de recuperação de senha.
                    </p>
                    <input
                        type="text"
                        placeholder="Seu CPF ou e-mail"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                    />
                    <button className="w-full bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors">
                        Enviar
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default LoginPage;
