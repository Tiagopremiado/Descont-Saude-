
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import BrandLogo from '../components/common/BrandLogo';

const Benefit: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-white/10 p-3 rounded-full border border-white/20">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-ds-dourado text-lg">{title}</h4>
            <p className="text-sm text-white/90 leading-relaxed">{description}</p>
        </div>
    </div>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/>
    </svg>
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

    const iconClass = "h-6 w-6 text-ds-dourado";
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
                     style={{ backgroundImage: `linear-gradient(rgba(92, 4, 22, 0.92), rgba(43, 2, 10, 0.95)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    
                    <div className="max-w-md mx-auto">
                        <div className="mb-8 flex items-center gap-4">
                            <BrandLogo className="w-16 h-16" />
                            <div>
                                <h1 className="text-4xl font-bold font-sans">
                                    Descont'<span className="text-ds-dourado font-serif italic">Saúde</span>
                                </h1>
                                <div className="h-1 w-20 bg-ds-dourado mt-1 rounded-full"></div>
                            </div>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-6 leading-tight">Cuidar da sua saúde ficou mais fácil.</h2>
                        <p className="text-lg text-white/90 mb-10">Tenha acesso a uma ampla rede de médicos, laboratórios e farmácias com descontos que cabem no seu bolso.</p>
                        
                        <div className="space-y-8">
                           {benefits.map(b => <Benefit key={b.title} {...b} />)}
                        </div>
                    </div>
                </div>

                {/* Login Side */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 bg-gray-50">
                    <main className="w-full max-w-md">
                        <div className="text-center mb-8 flex flex-col items-center">
                             <BrandLogo className="w-20 h-20 mb-4 drop-shadow-xl" />
                             <h1 className="text-3xl font-bold text-ds-vinho">
                                Descont'<span className="text-ds-dourado font-serif italic">Saúde</span>
                             </h1>
                            <p className="text-gray-500 mt-2">Seu bem-estar em primeiro lugar.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                             <h3 className="text-2xl font-bold text-gray-800 mb-1">Acesse sua conta</h3>
                            <p className="text-gray-500 mb-6">Bem-vindo(a) de volta!</p>
                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div>
                                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Login, CPF ou Telefone</label>
                                    <input
                                        id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ds-dourado focus:border-transparent transition-all"
                                        placeholder="Digite seu login, CPF ou telefone" required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                    <input
                                        id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ds-dourado focus:border-transparent transition-all"
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
                                {error && <p className="text-red-500 text-sm text-center !mt-4 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
                                <div>
                                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-ds-vinho hover:bg-[#5c0416] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ds-vinho disabled:bg-opacity-50 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5">
                                        {loading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>
                             <div className="text-center text-sm mt-6 pt-6 border-t border-gray-100">
                                <Link to="/about" className="font-medium text-ds-vinho hover:text-ds-dourado transition-colors">
                                    Sobre a Descont'Saúde
                                </Link>
                            </div>
                        </div>
                    </main>
                    <footer className="w-full text-center p-4 text-xs text-gray-400 mt-auto pt-8">
                        © {new Date().getFullYear()} Descont'Saúde. Todos os direitos reservados.
                    </footer>
                </div>
            </div>

             {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/5553991560861"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale conosco no WhatsApp"
                className="fixed bottom-6 right-6 group bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 z-50 flex items-center gap-2"
            >
                <WhatsAppIcon />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold pr-2">
                    Fale Conosco
                </span>
            </a>
            
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
