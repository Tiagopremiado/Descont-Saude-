import React, { useState } from 'react';
import type { Client } from '../../types';
import Modal from '../common/Modal';
import ContractView from './ContractView';
import IdCardView from './IdCardView';

interface GenerationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

type ActiveTab = 'contract' | 'cards';

const GenerationResultModal: React.FC<GenerationResultModalProps> = ({ isOpen, onClose, client }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('contract');
  
  if (!client) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const message = `Olá! Para visualizar seu contrato da Descont' Saúde, por favor, utilize a função "Imprimir / Salvar como PDF", salve o documento em seu dispositivo e anexe-o aqui na conversa.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
    <button
       onClick={() => setActiveTab(tab)}
       className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
           activeTab === tab 
           ? 'bg-gray-200 text-ds-vinho border-b-2 border-ds-vinho' 
           : 'text-gray-600 hover:bg-gray-100'
       }`}
   >
       {label}
   </button>
  );

  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241zM12 6.422c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm-.001 4.29c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm0 2.894c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56z"/>
    </svg>
  );
  
  const baseCardNumber = "528753";

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center ${isOpen ? '' : 'hidden'}`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
            <h3 className="text-xl font-bold text-ds-vinho">Documentos Gerados</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="border-b border-gray-200 no-print">
            <nav className="-mb-px flex space-x-4 px-6">
                <TabButton tab="contract" label="Contrato" />
                <TabButton tab="cards" label="Cartões Digitais" />
            </nav>
          </div>
          <div className="p-2 sm:p-6 bg-gray-200 overflow-y-auto flex-grow printable-area">
             {activeTab === 'contract' && <ContractView client={client} />}
             {activeTab === 'cards' && (
                <div className="space-y-8">
                    <IdCardView name={client.name} role="TITULAR" cardNumber={baseCardNumber} />
                    {client.dependents.map((dep) => (
                        <IdCardView 
                            key={dep.id} 
                            name={dep.name} 
                            role="DEPENDENTE" 
                            cardNumber={baseCardNumber} 
                            holderName={client.name}
                        />
                    ))}
                </div>
             )}
          </div>
           <div className="flex justify-end items-center gap-3 p-4 border-t no-print">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
                <button type="button" onClick={handleWhatsAppShare} className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 flex items-center gap-2">
                    <WhatsAppIcon /> Enviar via WhatsApp
                </button>
                <button type="button" onClick={handlePrint} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Imprimir / Salvar como PDF</button>
            </div>
        </div>
      </div>
    </>
  );
};

export default GenerationResultModal;