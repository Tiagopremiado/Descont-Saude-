import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import type { Client } from '../types';
import { getClientById } from '../services/apiService';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import PaymentHistory from '../components/client/PaymentHistory';
import DependentsManager from '../components/client/DependentsManager';
import DoctorRating from '../components/client/DoctorRating';
import ServiceHistory from '../components/client/ServiceHistory';
import Profile from '../components/client/Profile';
import DoctorList from '../components/client/DoctorList';
import DigitalCards from '../components/client/DigitalCards';

type ClientTab = 'home' | 'payments' | 'dependents' | 'doctors' | 'rating' | 'history' | 'profile' | 'cards';

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ClientTab>('home');

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
        
        // Adiciona um listener para recarregar os dados quando o usuário volta para a aba
        window.addEventListener('focus', fetchClientData);

        // Limpa o listener ao desmontar o componente para evitar memory leaks
        return () => {
            window.removeEventListener('focus', fetchClientData);
        };
    }, [user, fetchClientData]);
    
    // FIX: Replaced JSX.Element with React.ReactElement to resolve the "Cannot find namespace 'JSX'" error.
    // This ensures the type for the icon prop is correctly recognized from the imported React module.
    const TabButton: React.FC<{tab: ClientTab, label: string, icon: React.ReactElement}> = ({ tab, label, icon }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab 
                ? 'bg-ds-vinho text-white' 
                : 'text-gray-600 hover:bg-ds-vinho/10'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    const renderContent = () => {
        if (loading || !client) return <Spinner />;

        switch (activeTab) {
            case 'home':
                return (
                    <Card title="Bem-vindo(a) de volta!">
                        <p className="text-gray-600">Aqui está um resumo do seu plano Descont'Saúde.</p>
                        <div className="mt-4 space-y-2">
                            <p><strong>Plano:</strong> {client.plan}</p>
                            <p><strong>Status:</strong> <span className="font-bold text-green-600 capitalize">{client.status}</span></p>
                            <p><strong>Dependentes:</strong> {client.dependents.length}</p>
                            <p className="mt-4 text-sm text-ds-dourado italic">"Cuidar de você é o nosso plano."</p>
                        </div>
                    </Card>
                );
            case 'payments':
                return <PaymentHistory clientId={client.id} />;
            case 'dependents':
                return <DependentsManager client={client} />;
            case 'doctors':
                return <DoctorList />;
            case 'rating':
                return <DoctorRating clientId={client.id} />;
            case 'history':
                return <ServiceHistory clientId={client.id} />;
             case 'profile':
                return <Profile client={client} />;
            case 'cards':
                return <DigitalCards client={client} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">
                    {loading ? <Spinner /> : client && (
                        <div className="mb-6">
                             <h2 className="text-3xl font-bold text-ds-vinho">Área do Cliente</h2>
                             <p className="text-gray-500">Olá, {client.name}.</p>
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <div className="flex space-x-1 sm:space-x-2 p-2 bg-white rounded-lg shadow-sm overflow-x-auto">
                           <TabButton tab="home" label="Início" icon={<HomeIcon />} />
                           <TabButton tab="payments" label="Pagamentos" icon={<PaymentIcon />} />
                           <TabButton tab="dependents" label="Dependentes" icon={<UsersIcon />} />
                           <TabButton tab="doctors" label="Guia Médico" icon={<StethoscopeIcon />} />
                           <TabButton tab="cards" label="Cartões" icon={<CardIcon />} />
                           <TabButton tab="rating" label="Avaliações" icon={<StarIcon />} />
                           <TabButton tab="history" label="Histórico" icon={<HistoryIcon />} />
                           <TabButton tab="profile" label="Meu Perfil" icon={<ProfileIcon />} />
                        </div>
                    </div>
                    
                    <div>{renderContent()}</div>
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

export default ClientDashboard;