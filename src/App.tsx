

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './screens/LoginPage';
import AdminDashboard from './screens/AdminDashboard';
import ClientDashboard from './screens/ClientDashboard';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

const AppContent: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <LoginPage />;
    }

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    return <ClientDashboard />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="bg-gray-100 min-h-screen font-sans">
                <AppContent />
                <PWAInstallPrompt />
            </div>
        </AuthProvider>
    );
};

export default App;