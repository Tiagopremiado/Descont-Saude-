import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    pendingCount?: number;
    onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ pendingCount = 0, onNotificationClick }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-ds-vinho text-white shadow-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ds-dourado mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h1 className="text-xl font-bold tracking-wider">Descont'Saúde</h1>
            </div>
            <div className="flex items-center">
                 {user?.role === 'admin' && (
                    <button onClick={onNotificationClick} className="relative mr-4 text-white hover:text-ds-dourado transition-colors">
                        <BellIcon />
                        {pendingCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                 )}
                <span className="mr-4 hidden sm:inline">Olá, {user?.name.split(' ')[0]}</span>
                <button
                    onClick={logout}
                    className="bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors duration-200"
                >
                    Sair
                </button>
            </div>
        </header>
    );
};

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

export default Header;