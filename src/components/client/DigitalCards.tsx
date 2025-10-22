import React, { useState, useMemo } from 'react';
import type { Client, Dependent } from '../../types';
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
    const [selectedPerson, setSelectedPerson] = useState<CardPerson | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const cardholders = useMemo(() => {
        const activeDependents = client.dependents.filter(d => d.status === 'active');
        return [client, ...activeDependents];
    }, [client]);

    const handleGenerateCard = (person: CardPerson) => {
        setSelectedPerson(person);
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
            const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, backgroundColor: null });
            
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
            <Card title="Meus Cartões Digitais">
                <p className="text-sm text-gray-600 mb-6">Selecione para quem você deseja gerar o cartão digital. Somente dependentes com status "Ativo" estão disponíveis.</p>
                <ul className="divide-y divide-gray-200">
                    {cardholders.map(person => {
                        const isTitular = 'contractNumber' in person;
                        return (
                            <li key={person.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{person.name}</p>
                                    <p className="text-sm text-gray-500">{isTitular ? 'Titular' : 'Dependente'}</p>
                                </div>
                                <button
                                    onClick={() => handleGenerateCard(person)}
                                    className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors text-sm"
                                >
                                    Gerar Cartão
                                </button>
                            </li>
                        )
                    })}
                </ul>
                {cardholders.length === 1 && client.dependents.length > 0 && (
                    <p className="text-center text-gray-500 mt-4 text-sm bg-yellow-50 p-3 rounded-md">
                        Você tem dependentes, mas eles precisam ser aprovados pela administração antes que os cartões fiquem disponíveis.
                    </p>
                )}
            </Card>

            <Modal isOpen={!!selectedPerson} onClose={handleCloseModal} title={`Cartão Digital de ${selectedPerson?.name}`}>
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col justify-center items-center z-10">
                        <Spinner />
                        <p className="mt-2 text-ds-vinho font-semibold">Processando cartão...</p>
                    </div>
                )}
                <div id="digital-card-to-capture" className="p-1">
                    {selectedPerson && (
                         <IdCardView
                            name={selectedPerson.name}
                            role={'contractNumber' in selectedPerson ? 'TITULAR' : 'DEPENDENTE'}
                            cardNumber="528753"
                            holderName={'contractNumber' in selectedPerson ? undefined : client.name}
                        />
                    )}
                </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                    <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
                    <button 
                        type="button" 
                        onClick={() => processCardAction('share')}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600"
                    >
                        Compartilhar
                    </button>
                    <button 
                        type="button" 
                        onClick={() => processCardAction('download')}
                        className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90"
                    >
                        Baixar
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default DigitalCards;