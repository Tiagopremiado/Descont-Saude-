import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext'; // Import the new provider
import LoginPage from './screens/LoginPage';
import AdminDashboard from './screens/AdminDashboard';
import ClientDashboard from './screens/ClientDashboard';
import AboutPage from './screens/AboutPage';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/about" element={<AboutPage />} />

            <Route 
                path="/login" 
                element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />} 
            />
            
            <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
            />

            <Route 
                path="/client" 
                element={user?.role === 'client' ? <ClientDashboard /> : <Navigate to="/login" replace />} 
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
            <DataProvider> {/* Wrap with DataProvider */}
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
