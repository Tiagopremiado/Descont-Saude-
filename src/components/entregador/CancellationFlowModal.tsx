import React, { useState } from 'react';
import type { Client, UpdateApprovalRequest } from '../../types';
import Modal from '../common/Modal';
import { submitUpdateRequest } from '../../services/apiService';

interface CancellationFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onCancellationSubmitted: () => void;
}

type Step = 'reason' | 'retention' | 'confirm' | 'success_retention';

const retentionScripts = [
    {
        id: 'financial',
        label: 'Achei caro / Dificuldade Financeira',
        script: (clientName: string, value: number) => `Sr(a). ${clientName}, entendo perfeitamente que o orçamento aperta as vezes. Mas lembre-se que o plano custa apenas R$ ${value.toFixed(2)} por mês. Uma única consulta particular ou exame que o senhor(a) precise fazer sem o plano já custaria muito mais que um ano inteiro de mensalidade. É uma segurança para sua família que vale a pena manter.`
    },
    {
        id: 'not_using',
        label: 'Não estou usando',
        script: (clientName: string) => `Sr(a). ${clientName}, saúde é algo imprevisível. Ter o plano e não precisar usar é o melhor cenário! É como seguro de carro: a gente paga para ter a tranquilidade de que, se precisar, não vai ter uma despesa gigante de surpresa. Mantenha por segurança, o valor é muito acessível.`
    },
    {
        id: 'moving',
        label: 'Vou me mudar',
        script: (clientName: string) => `Sr(a). ${clientName}, que pena! Mas verifique se não atendemos na sua nova cidade. Nossa rede está crescendo sempre. Caso contrário, o senhor pode passar a titularidade para um parente aqui da cidade para não perder a carência e as condições antigas.`
    },
    {
        id: 'competitor',
        label: 'Fiz outro plano',
        script: (clientName: string) => `Sr(a). ${clientName}, entendo. Mas antes de cancelar, compare bem as carências e a rede de médicos. Muitas vezes o nosso plano tem parceiros exclusivos aqui na região que outros não têm. Vale a pena manter os dois por um mês para testar antes de cancelar definitivamente o nosso.`
    },
    {
        id: 'dissatisfaction',
        label: 'Insuatisfação com atendimento',
        script: (clientName: string) => `Sr(a). ${clientName}, peço mil desculpas por isso. O objetivo do Descont'Saúde é justamente ajudar. Vou registrar sua reclamação com prioridade para a gerência. Dê-nos mais uma chance de mostrar nosso serviço de qualidade no próximo mês?`
    }
];

const CancellationFlowModal: React.FC<CancellationFlowModalProps> = ({ isOpen, onClose, client, onCancellationSubmitted }) => {
    const [step, setStep] = useState<Step>('reason');
    const [selectedReasonId, setSelectedReasonId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    const handleReasonSelect = (reasonId: string) => {
        setSelectedReasonId(reasonId);
        setStep('retention');
    };

    const handleClientRetained = () => {
        setStep('success_retention');
    };

    const handleClientInsists = () => {
        setStep('confirm');
    };

    const handleSubmitCancellation = async () => {
        setIsSending(true);
        try {
            const reasonObj = retentionScripts.find(r => r.id === selectedReasonId);
            const reasonText = reasonObj ? reasonObj.label : 'Outro motivo';

            const currentData: UpdateApprovalRequest['currentData'] = {
                phone: client.phone,
                whatsapp: client.whatsapp,
                address: client.address,
                addressNumber: client.addressNumber,
                neighborhood: client.neighborhood,
                city: client.city
            };

            await submitUpdateRequest(client.id, currentData, {}, 'cancellation', reasonText);
            onCancellationSubmitted();
            onClose();
        } catch (error) {
            console.error("Failed to submit cancellation:", error);
            alert("Erro ao registrar. Tente novamente.");
        } finally {
            setIsSending(false);
        }
    };

    const reset = () => {
        setStep('reason');
        setSelectedReasonId('');
    };

    const currentScript = retentionScripts.find(r => r.id === selectedReasonId)?.script(client.name.split(' ')[0], client.monthlyFee);

    return (
        <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={step === 'reason' ? "Motivo do Cancelamento" : "Assistente de Retenção"}>
            <div className="min-h-[300px] flex flex-col">
                
                {/* STEP 1: SELECT REASON */}
                {step === 'reason' && (
                    <div className="space-y-3">
                        <p className="text-gray-600 mb-4">Por que o cliente deseja cancelar?</p>
                        {retentionScripts.map(reason => (
                            <button
                                key={reason.id}
                                onClick={() => handleReasonSelect(reason.id)}
                                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-ds-vinho hover:bg-red-50 transition-colors font-medium text-gray-700 flex justify-between items-center group"
                            >
                                {reason.label}
                                <span className="text-gray-400 group-hover:text-ds-vinho">&rarr;</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 2: RETENTION SCRIPT */}
                {step === 'retention' && (
                    <div className="flex-grow flex flex-col">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
                            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2">💡 Fale isso para o cliente:</p>
                            <p className="text-gray-800 text-lg leading-relaxed font-medium">
                                "{currentScript}"
                            </p>
                        </div>

                        <div className="mt-auto space-y-3">
                            <button 
                                onClick={handleClientRetained}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Consegui Convencer! (Manter Plano)
                            </button>
                            <button 
                                onClick={handleClientInsists}
                                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                Cliente insiste em cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: CONFIRM CANCELLATION */}
                {step === 'confirm' && (
                    <div className="text-center space-y-6 py-4">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Confirmar Solicitação</h3>
                        <p className="text-gray-600">
                            Você vai enviar uma solicitação de cancelamento para o administrador.
                            O cliente <strong>NÃO</strong> será excluído imediatamente. O Admin poderá entrar em contato.
                        </p>
                        
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setStep('retention')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300">
                                Voltar
                            </button>
                            <button 
                                onClick={handleSubmitCancellation}
                                disabled={isSending}
                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSending ? 'Enviando...' : 'Confirmar Cancelamento'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS RETENTION */}
                {step === 'success_retention' && (
                    <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">Parabéns!</h3>
                        <p className="text-gray-600">Você salvou um cliente! Isso é ótimo para o seu desempenho.</p>
                        <button onClick={() => { reset(); onClose(); }} className="mt-8 w-full bg-ds-vinho text-white font-bold py-3 rounded-xl hover:bg-opacity-90">
                            Continuar Trabalhando
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CancellationFlowModal;