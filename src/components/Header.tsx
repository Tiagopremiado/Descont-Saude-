
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    pendingCount?: number;
    onNotificationClick?: () => void;
    onLogoutRequest: () => void;
}

const Header: React.FC<HeaderProps> = ({ pendingCount = 0, onNotificationClick, onLogoutRequest }) => {
    const { user } = useAuth();

    return (
        <header className="bg-ds-vinho text-white shadow-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ds-dourado" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold tracking-wide font-serif">Descont'Saúde</h1>
                </div>
                
                <div className="flex items-center gap-4">
                     {user?.role === 'admin' && (
                        <button onClick={onNotificationClick} className="relative text-white/80 hover:text-white transition-colors p-1">
                            <BellIcon />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold shadow-sm">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                     )}
                    
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-sm text-white/90">Olá, <span className="font-semibold">{user?.name.split(' ')[0]}</span></span>
                        <button
                            onClick={onLogoutRequest}
                            className="text-sm bg-black/20 hover:bg-black/30 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 backdrop-blur-sm"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

export default Header;
