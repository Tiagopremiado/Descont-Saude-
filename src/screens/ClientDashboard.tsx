
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Client, Dependent } from '../types';
import { getClientById } from '../services/apiService';
import Spinner from '../components/common/Spinner';
import PaymentHistory from '../components/client/PaymentHistory';
import DependentsManager from '../components/client/DependentsManager';
import DoctorRating from '../components/client/DoctorRating';
import ServiceHistory from '../components/client/ServiceHistory';
import Profile from '../components/client/Profile';
import DoctorList from '../components/client/DoctorList';
import DigitalCards from '../components/client/DigitalCards';

type ClientTab = 'home' | 'payments' | 'dependents' | 'doctors' | 'rating' | 'history' | 'profile' | 'cards';

const ClientDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { isDirty, setDirty } = useData();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ClientTab>('home');

    const isDependent = user?.role === 'dependent';
    
    const fetchClientData = useCallback(async () => {
        if (user?.clientId) {
            const data = await getClientById(user.clientId);
            setClient(data || null);
        }
    }, [user]);

    useEffect(() => {
        const initialFetch = async () => {
            if (user?.clientId) {
                setLoading(true);
                await fetchClientData();
                setLoading(false);
            }
        };
        initialFetch();
        
        window.addEventListener('focus', fetchClientData);

        return () => {
            window.removeEventListener('focus', fetchClientData);
        };
    }, [user, fetchClientData]);
    
    // Determine the current user's data (if dependent)
    const currentUserData = useMemo(() => {
        if (!client) return null;
        if (isDependent && user?.dependentId) {
            const dep = client.dependents.find(d => d.id === user.dependentId);
            return dep || null;
        }
        return client; // If titular, return full client object
    }, [client, isDependent, user]);

    // Check if the current user has access (Active Plan AND Active Individual Status)
    const isUserActive = useMemo(() => {
        if (!client) return false;
        
        // 1. O contrato principal deve estar ativo
        const isContractActive = client.status === 'active';
        if (!isContractActive) return false;

        // 2. Se for dependente, o status individual dele deve estar ativo
        if (isDependent && user?.dependentId) {
            const dep = client.dependents.find(d => d.id === user.dependentId);
            return dep?.status === 'active';
        }

        return true;
    }, [client, isDependent, user]);

    const handleLogoutRequest = () => {
        if (isDirty) {
             if (window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
                setDirty(false);
                logout();
            }
        } else {
            logout();
        }
    };
    
    const TabButton: React.FC<{tab: ClientTab, label: string, icon: React.ReactElement}> = ({ tab, label, icon }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap shadow-sm ${
                activeTab === tab 
                ? 'bg-ds-vinho text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const QuickAction: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, colorClass: string }> = ({ icon, title, subtitle, onClick, colorClass }) => (
        <button 
            onClick={onClick}
            className="flex flex-col items-start p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-left w-full group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300 ${colorClass}`}>
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">{icon}</svg>
            </div>
            <div className={`p-3 rounded-lg ${colorClass} text-white mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-6 h-6">{icon}</div>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-ds-vinho transition-colors">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </button>
    );

    const renderHome = () => {
        const userName = currentUserData ? ('name' in currentUserData ? currentUserData.name : '') : '';
        const firstName = userName.split(' ')[0];
        
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Hero Card */}
                <div className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${isUserActive ? 'bg-gradient-to-br from-ds-vinho to-[#4a0415]' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}>
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-ds-dourado opacity-10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-ds-dourado font-medium text-sm mb-1 uppercase tracking-wider">
                                    {isDependent ? 'Área do Dependente' : 'Bem-vindo(a)'}
                                </p>
                                <h2 className="text-3xl font-serif font-bold">{firstName}</h2>
                                {isDependent && (
                                    <p className="text-white/80 text-sm mt-1">Titular: {client?.name}</p>
                                )}
                                {!isDependent && <p className="text-white/80 text-sm mt-1">{client?.plan}</p>}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isUserActive ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'}`}>
                                {isUserActive ? 'PLANO ATIVO' : 'INATIVO'}
                            </span>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {/* Only show avatars for Titular, Dependents don't need to see everyone's face here */}
                                {!isDependent && (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-ds-vinho flex items-center justify-center text-xs font-bold">
                                            {client?.name.charAt(0)}
                                        </div>
                                        {client?.dependents.slice(0, 3).map((dep, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-ds-vinho flex items-center justify-center text-xs font-bold">
                                                {dep.name.charAt(0)}
                                            </div>
                                        ))}
                                        {client?.dependents && client.dependents.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-ds-dourado border-2 border-ds-vinho flex items-center justify-center text-xs font-bold text-ds-vinho">
                                                +{client.dependents.length - 3}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <button 
                                onClick={() => setActiveTab('cards')}
                                className="text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <CardIcon /> Ver Carteirinha
                            </button>
                        </div>
                    </div>
                </div>

                {/* INACTIVE ALERT BANNER */}
                {!isUserActive && (
                    <div className="bg-red-600 rounded-xl p-6 shadow-lg text-white text-center animate-pulse border-2 border-red-400">
                        <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">SEU PLANO ESTÁ INATIVO</h3>
                        <p className="mb-4 text-sm opacity-90">
                            Para voltar a utilizar todos os benefícios e visualizar sua carteirinha, entre em contato com o suporte agora mesmo.
                        </p>
                        <button 
                            onClick={() => window.open('https://wa.me/5553991560861?text=Ol%C3%A1%2C%20meu%20plano%20est%C3%A1%20inativo%20e%20gostaria%20de%20reativar.', '_blank')}
                            className="bg-white text-red-600 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 mx-auto"
                        >
                            <WhatsAppIcon /> Reativar Plano Agora
                        </button>
                    </div>
                )}

                {/* Quick Actions Grid - Only show functional if active */}
                {isUserActive && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAction 
                            title="Guia Médico" 
                            subtitle="Encontre especialistas" 
                            icon={<StethoscopeIcon />} 
                            colorClass="bg-blue-500"
                            onClick={() => setActiveTab('doctors')}
                        />
                        {!isDependent && (
                            <>
                                <QuickAction 
                                    title="Faturas" 
                                    subtitle="2ª via e histórico" 
                                    icon={<PaymentIcon />} 
                                    colorClass="bg-green-500"
                                    onClick={() => setActiveTab('payments')}
                                />
                                <QuickAction 
                                    title="Dependentes" 
                                    subtitle="Gerenciar família" 
                                    icon={<UsersIcon />} 
                                    colorClass="bg-purple-500"
                                    onClick={() => setActiveTab('dependents')}
                                />
                            </>
                        )}
                        {isDependent && (
                             <QuickAction 
                                title="Avaliar" 
                                subtitle="Avalie seu atendimento" 
                                icon={<StarIcon />} 
                                colorClass="bg-yellow-500"
                                onClick={() => setActiveTab('rating')}
                            />
                        )}
                        <QuickAction 
                            title="Suporte" 
                            subtitle="Fale no WhatsApp" 
                            icon={<WhatsAppIcon />} 
                            colorClass="bg-[#25D366]"
                            onClick={() => window.open('https://wa.me/5553991560861', '_blank')}
                        />
                    </div>
                )}

                {/* Promo Banner */}
                {isUserActive && (
                    <div className="bg-gradient-to-r from-ds-dourado to-yellow-500 rounded-xl p-4 shadow-md text-ds-vinho flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-lg">Economize Energia! ⚡</h4>
                            <p className="text-sm opacity-90">Clientes Descont'Saúde têm até 30% de desconto na conta de luz.</p>
                        </div>
                        <button onClick={() => window.open('https://wa.me/5553991560861?text=Quero%20saber%20sobre%20o%20desconto%20de%20energia', '_blank')} className="bg-white/20 hover:bg-white/30 text-ds-vinho font-bold py-2 px-4 rounded-lg text-sm whitespace-nowrap ml-2">
                            Saiba Mais
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const renderContent = () => {
        if (loading || !client) return <div className="flex justify-center py-20"><Spinner /></div>;

        switch (activeTab) {
            case 'home': return renderHome();
            case 'payments': return !isDependent ? <PaymentHistory client={client} /> : null;
            case 'dependents': return !isDependent ? <DependentsManager client={client} /> : null;
            case 'doctors': return <DoctorList />;
            case 'rating': return <DoctorRating clientId={client.id} />;
            case 'history': return <ServiceHistory clientId={client.id} />;
            case 'profile': return <Profile client={client} />;
            case 'cards': return <DigitalCards client={client} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header onLogoutRequest={handleLogoutRequest} />
            
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Mobile Horizontal Scroll Menu */}
                    <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm py-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 sm:border-none sm:static">
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                           <TabButton tab="home" label="Início" icon={<HomeIcon />} />
                           <TabButton tab="cards" label="Carteira" icon={<CardIcon />} />
                           {!isDependent && <TabButton tab="payments" label="Faturas" icon={<PaymentIcon />} />}
                           <TabButton tab="doctors" label="Rede" icon={<StethoscopeIcon />} />
                           {!isDependent && <TabButton tab="dependents" label="Família" icon={<UsersIcon />} />}
                           <TabButton tab="rating" label="Avaliar" icon={<StarIcon />} />
                           <TabButton tab="profile" label="Perfil" icon={<ProfileIcon />} />
                        </div>
                    </div>
                    
                    <div className="min-h-[500px]">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const PaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 10a2 2 0 00-2 2v.5a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V16a2 2 0 00-2-2H4z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-3 4a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5zm9-4a3 3 0 11-6 0 3 3 0 016 0zm-3 4a5 5 0 00-4.545 3.334 3.99 3.99 0 011.545-2.012 5.003 5.003 0 003-1.322z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const StethoscopeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v3a1 1 0 002 0V6h1a1 1 0 000-2H4zm11.293 1.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414l2-2a1 1 0 000-1.414zM4 10a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM5.293 13.293a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414l-2-2a1 1 0 00-1.414 0zM15 12a1 1 0 00-1-1h-1a1 1 0 000 2h1a1 1 0 001-1zM4.032 10.968a5.022 5.022 0 014.5-2.434 1 1 0 10.4-1.96 7.022 7.022 0 00-6.3 3.42A7.022 7.022 0 0010 18a7.022 7.022 0 006.868-5.968 1 1 0 10-1.96-.4 5.022 5.022 0 01-4.908 4.336A5.022 5.022 0 014.032 10.968z" clipRule="evenodd" /></svg>;
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v1H4V6zm0 3h12v5H4v-5z" clipRule="evenodd" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/></svg>;

export default ClientDashboard;
