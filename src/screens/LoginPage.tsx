import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

const Benefit: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-white/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-white/80">{description}</p>
        </div>
    </div>
);

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

    const iconClass = "h-6 w-6 text-white";
    const benefits = [
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21V5a2 2 0 00-2-2H9a2 2 0 00-2 2v16" /></svg>,
            title: "Ampla Rede Credenciada",
            description: "Acesso a médicos, clínicas, laboratórios e farmácias parceiras."
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
            title: "Descontos Exclusivos",
            description: "Pague menos em consultas, exames e medicamentos."
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
            title: "Cuidado para toda Família",
            description: "Planos que incluem dependentes para proteger quem você ama."
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            title: "Sem Carência",
            description: "Comece a usar seus benefícios imediatamente após a contratação."
        }
    ];

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
                {/* Institutional Side */}
                <div className="relative w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 text-white bg-ds-vinho" 
                     style={{ backgroundImage: `linear-gradient(rgba(117, 7, 33, 0.85), rgba(76, 4, 21, 0.95)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    
                    <div className="max-w-md mx-auto">
                        <h1 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Cuidar da sua saúde ficou mais fácil.</h1>
                        <p className="text-lg text-white/90 mb-8">Tenha acesso a uma ampla rede de médicos, laboratórios e farmácias com descontos que cabem no seu bolso.</p>
                        
                        <div className="space-y-6">
                           {benefits.map(b => <Benefit key={b.title} {...b} />)}
                        </div>
                    </div>
                </div>

                {/* Login Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                             <div className="inline-flex items-center justify-center h-16 w-16 bg-ds-vinho rounded-full shadow-md mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-ds-vinho mt-2 font-script">Descont'Saúde</h1>
                            <p className="text-gray-500">Seu bem-estar em primeiro lugar.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                             <h3 className="text-2xl font-bold text-gray-800 mb-1">Acesse sua conta</h3>
                            <p className="text-gray-500 mb-6">Bem-vindo(a) de volta!</p>
                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div>
                                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Login, CPF ou Telefone</label>
                                    <input
                                        id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-200 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ds-dourado focus:border-transparent"
                                        placeholder="Digite seu login, CPF ou telefone" required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                    <input
                                        id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-200 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ds-dourado focus:border-transparent"
                                        placeholder="Sua senha" required
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado border-gray-400" />
                                        <span>Lembrar meu acesso</span>
                                    </label>
                                    <button type="button" onClick={() => setForgotPassModalOpen(true)} className="font-medium text-ds-vinho hover:underline">Esqueceu a senha?</button>
                                </div>
                                {error && <p className="text-red-500 text-sm text-center !mt-4">{error}</p>}
                                <div>
                                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-ds-vinho bg-ds-dourado hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ds-dourado disabled:bg-opacity-50 transition-all duration-200 ease-in-out hover:scale-105">
                                        {loading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isForgotPassModalOpen} onClose={() => setForgotPassModalOpen(false)} title="Recuperar Senha">
                <div className="space-y-4 text-center">
                    <p className="text-gray-600">Para clientes, a senha padrão são os <strong className="text-ds-vinho">4 últimos dígitos do seu CPF</strong>.</p>
                    <p className="text-sm text-gray-500">Para administradores ou em caso de problemas, por favor, entre em contato com o suporte.</p>
                    <button onClick={() => setForgotPassModalOpen(false)} className="w-full bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors">Entendi</button>
                </div>
            </Modal>
        </>
    );
};

export default LoginPage;
