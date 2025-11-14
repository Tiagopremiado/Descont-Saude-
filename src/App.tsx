import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext'; // Import the new provider and hook
import LoginPage from './screens/LoginPage';
import AdminDashboard from './screens/AdminDashboard';
import ClientDashboard from './screens/ClientDashboard';
import EntregadorDashboard from './screens/EntregadorDashboard';
import AboutPage from './screens/AboutPage';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import Spinner from './components/common/Spinner';

const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    const { isLoadingData } = useData();

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ds-vinho text-white">
                <Spinner />
                <p className="mt-4 text-lg">Carregando dados mais recentes...</p>
            </div>
        );
    }

    const getRedirectPath = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'client': return '/client';
            case 'entregador': return '/entregador';
            default: return '/login';
        }
    }

    return (
        <Routes>
            <Route path="/about" element={<AboutPage />} />

            <Route 
                path="/login" 
                element={!user ? <LoginPage /> : <Navigate to={getRedirectPath()} replace />} 
            />
            
            <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
            />

            <Route 
                path="/client" 
                element={user?.role === 'client' ? <ClientDashboard /> : <Navigate to="/login" replace />} 
            />

            <Route 
                path="/entregador" 
                element={user?.role === 'entregador' ? <EntregadorDashboard /> : <Navigate to="/login" replace />} 
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <BrowserRouter>
                    <div className="bg-gray-100 min-h-screen font-sans">
                        <AppRoutes />
                        <PWAInstallPrompt />
                    </div>
                </BrowserRouter>
            </DataProvider>
        </AuthProvider>
    );
};

export default App;
