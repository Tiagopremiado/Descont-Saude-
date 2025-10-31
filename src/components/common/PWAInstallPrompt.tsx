import React, { useState, useEffect } from 'react';

const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Only show the prompt if it hasn't been dismissed in this session
      if (!sessionStorage.getItem('pwaInstallDismissed')) {
        setInstallPrompt(e);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    // Resetting state
    setIsVisible(false);
    setInstallPrompt(null);
  };

  const handleDismissClick = () => {
    sessionStorage.setItem('pwaInstallDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-40 animate-slide-up border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-ds-vinho hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-bold text-ds-vinho">Instale o App Descont'Saúde</h4>
            <p className="text-sm text-gray-600">Acesso rápido e fácil na sua tela de início.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={handleDismissClick} className="text-sm font-medium text-gray-500 hover:text-gray-800">
            Agora não
          </button>
          <button
            onClick={handleInstallClick}
            className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors whitespace-nowrap"
          >
            Instalar
          </button>
        </div>
      </div>
       <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s ease-out;
        }
       `}</style>
    </div>
  );
};

export default PWAInstallPrompt;