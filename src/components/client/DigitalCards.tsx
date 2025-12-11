
import React, { useState, useMemo } from 'react';
import type { Client, Dependent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import IdCardView from '../admin/IdCardView';
import Spinner from '../common/Spinner';

declare const html2canvas: any;

interface DigitalCardsProps {
  client: Client;
}

type CardPerson = Client | Dependent;

const DigitalCards: React.FC<DigitalCardsProps> = ({ client }) => {
    const { user } = useAuth();
    const [selectedPerson, setSelectedPerson] = useState<CardPerson | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);

    const isDependent = user?.role === 'dependent';

    const cardholders = useMemo(() => {
        // Se for dependente logado, mostra só o dele
        if (isDependent && user?.dependentId) {
            const myCard = client.dependents.find(d => d.id === user.dependentId);
            return myCard ? [myCard] : [];
        }
        // Se for titular, mostra ele e todos os dependentes que não estão inativos/excluídos permanentemente da lista
        // (Aqui vamos mostrar todos para o titular ver quem está bloqueado também)
        return [client, ...client.dependents];
    }, [client, isDependent, user]);

    // Função para verificar se um cartão específico deve estar bloqueado
    const isCardLocked = (person: CardPerson) => {
        // 1. Se o plano principal (titular) estiver inativo, TUDO está bloqueado
        if (client.status !== 'active') return true;

        // 2. Se for um dependente, verifica o status individual dele
        if ('contractNumber' in person) {
            return false; // Titular já checado acima
        } else {
            return person.status !== 'active';
        }
    };

    const handleGenerateCard = (person: CardPerson) => {
        if (isCardLocked(person)) {
            setIsInactiveModalOpen(true);
        } else {
            setSelectedPerson(person);
        }
    };

    const handleCloseModal = () => {
        setSelectedPerson(null);
    };

    const processCardAction = async (action: 'download' | 'share') => {
        const cardElement = document.getElementById('digital-card-to-capture');
        if (!cardElement) {
            alert('Erro: Não foi possível encontrar o elemento do cartão.');
            return;
        }
        
        setIsProcessing(true);

        try {
            const canvas = await html2canvas(cardElement, { 
                scale: 3, 
                useCORS: true, 
                backgroundColor: null,
                logging: false,
                scrollY: 0
            });
            
            if (action === 'download') {
                const image = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = `cartao_${selectedPerson?.name.replace(/\s/g, '_')}.png`;
                link.href = image;
                link.click();
            } else if (action === 'share') {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], `cartao_${selectedPerson?.name.replace(/\s/g, '_')}.png`, { type: 'image/png' });
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: `Cartão Descont'Saúde - ${selectedPerson?.name}`,
                                text: `Aqui está o cartão digital de ${selectedPerson?.name}.`
                            });
                        } else {
                            alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, utilize a opção 'Baixar' e envie manualmente.");
                        }
                    }
                }, 'image/png');
            }
        } catch (error) {
            console.error('Erro ao processar o cartão:', error);
            alert('Ocorreu um erro ao gerar o cartão. Por favor, tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Card title={isDependent ? "Meu Cartão Digital" : "Minha Carteira Digital"}>
                {!isDependent && <p className="text-sm text-gray-600 mb-6">Estes são seus cartões digitais. Clique em um cartão para abrir.</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cardholders.map(person => {
                        const isTitular = 'contractNumber' in person;
                        const locked = isCardLocked(person);

                        return (
                            <button 
                                key={person.id}
                                onClick={() => handleGenerateCard(person)}
                                className={`relative overflow-hidden group rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left border border-gray-100 w-full ${locked ? 'grayscale opacity-90' : ''}`}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 ${locked ? 'bg-gray-800' : isTitular ? 'bg-gradient-to-r from-ds-vinho to-[#4a0415]' : 'bg-gradient-to-r from-ds-dourado to-yellow-600'} opacity-90 transition-opacity`}></div>
                                
                                {/* Pattern */}
                                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>

                                <div className="relative p-5 text-white flex justify-between items-center w-full">
                                    <div className="overflow-hidden">
                                        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                                            {isTitular ? 'Titular' : 'Dependente'} 
                                            {locked && <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">INATIVO</span>}
                                        </p>
                                        <p className="font-bold text-lg font-serif tracking-wide truncate pr-2">{person.name}</p>
                                        <p className="text-xs mt-2 opacity-75">{locked ? 'Toque para saber mais' : 'Toque para abrir'}</p>
                                    </div>
                                    <div className={`p-2 rounded-full backdrop-blur-sm flex-shrink-0 ${locked ? 'bg-red-600/50' : 'bg-white/20'}`}>
                                        {locked ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {!isDependent && cardholders.length === 1 && client.dependents.length > 0 && (
                    <p className="text-center text-gray-500 mt-6 text-sm bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        Seus dependentes aparecerão aqui assim que forem aprovados pela administração.
                    </p>
                )}
            </Card>

            {/* Modal de Cartão */}
            <Modal isOpen={!!selectedPerson} onClose={handleCloseModal} title={`Cartão de ${selectedPerson?.name.split(' ')[0]}`}>
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col justify-center items-center z-50 rounded-xl">
                        <Spinner />
                        <p className="mt-2 text-ds-vinho font-semibold animate-pulse">Gerando imagem...</p>
                    </div>
                )}
                
                <div className="flex justify-center items-center bg-gray-200 p-4 rounded-xl border border-gray-300">
                    <div id="digital-card-to-capture" className="w-full max-w-[520px] p-4 bg-transparent flex justify-center">
                        {selectedPerson && (
                             <IdCardView
                                name={selectedPerson.name}
                                role={'contractNumber' in selectedPerson ? 'TITULAR' : 'DEPENDENTE'}
                                cardNumber="528753"
                                holderName={'contractNumber' in selectedPerson ? undefined : client.name}
                            />
                        )}
                    </div>
                </div>

                 <div className="flex gap-3 pt-6">
                    <button 
                        type="button" 
                        onClick={() => processCardAction('share')}
                        className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 shadow-md transition-colors flex items-center justify-center gap-2"
                        disabled={isProcessing}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Compartilhar
                    </button>
                    <button 
                        type="button" 
                        onClick={() => processCardAction('download')}
                        className="flex-1 bg-ds-vinho text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 shadow-md transition-colors flex items-center justify-center gap-2"
                        disabled={isProcessing}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Salvar
                    </button>
                </div>
            </Modal>

            {/* Modal de Alerta de Inatividade */}
            <Modal isOpen={isInactiveModalOpen} onClose={() => setIsInactiveModalOpen(false)} title="Acesso Restrito">
                <div className="text-center p-4">
                    <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-700 mb-2">Plano Inativo</h3>
                    <p className="text-gray-600 mb-6">
                        Este cartão está temporariamente indisponível. Para continuar utilizando os benefícios do Descont'Saúde, é necessário reativar o plano.
                    </p>
                    <button 
                        onClick={() => window.open('https://wa.me/5553991560861?text=Ol%C3%A1%2C%20preciso%20reativar%20meu%20plano%20para%20acessar%20o%20cart%C3%A3o.', '_blank')}
                        className="bg-[#25D366] text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2 w-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/></svg>
                        Falar com Suporte
                    </button>
                    <button 
                        onClick={() => setIsInactiveModalOpen(false)}
                        className="mt-4 text-gray-500 hover:text-gray-700 font-medium text-sm"
                    >
                        Fechar
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default DigitalCards;
