
import React, { useState, useMemo } from 'react';
import type { UpdateApprovalRequest } from '../../types';
import { useData } from '../../context/DataContext';
import { approveUpdateRequest, rejectUpdateRequest } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const ApprovalManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { updateRequests, isLoadingData } = useData();
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    
    const filteredRequests = useMemo(() => {
        const sorted = [...updateRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        if (filter === 'all') return sorted;
        return sorted.filter(r => r.status === filter);
    }, [updateRequests, filter]);
    
    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        setActionLoading(requestId);
        try {
            if (action === 'approve') {
                await approveUpdateRequest(requestId);
            } else {
                await rejectUpdateRequest(requestId);
            }
            onUpdate(); // Reloads all data via context
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
            alert(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} a solicitação.`);
        } finally {
            setActionLoading(null);
        }
    };
    
    const handleWhatsAppContact = (phone: string, message: string) => {
        const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const statusMap: Record<UpdateApprovalRequest['status'], { label: string; bg: string; text: string; }> = {
        pending: { label: 'Pendente', bg: 'bg-yellow-100', text: 'text-yellow-800' },
        approved: { label: 'Aprovado', bg: 'bg-green-100', text: 'text-green-800' },
        rejected: { label: 'Rejeitado', bg: 'bg-red-100', text: 'text-red-800' },
    };

    const hasNoChanges = (req: UpdateApprovalRequest) => 
        Object.keys(req.updates).length === 0 && 
        req.requestType === 'update'; // Only for standard updates

    const renderRequestContent = (req: UpdateApprovalRequest) => {
        switch (req.requestType) {
            case 'cancellation':
                return (
                    <div className="p-4 bg-white border border-red-200 rounded-md">
                        <p className="font-bold text-red-800 mb-1">Motivo informado pelo entregador:</p>
                        <p className="text-gray-800 italic">"{req.cancellationReason || 'Não especificado'}"</p>
                        <p className="text-xs text-gray-500 mt-3">Atenção: Ao aprovar, o cliente será marcado como INATIVO.</p>
                    </div>
                );
            case 'new_dependent':
                return (
                    <div className="p-4 bg-white border border-indigo-200 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-indigo-800 mb-2">Solicitação de Novo Dependente</p>
                                <ul className="text-sm space-y-1 text-gray-700">
                                    <li><strong>Nome:</strong> {req.newDependentData?.name}</li>
                                    <li><strong>CPF:</strong> {req.newDependentData?.cpf}</li>
                                    <li><strong>Nasc:</strong> {req.newDependentData?.birthDate ? new Date(req.newDependentData.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}</li>
                                    <li><strong>Parentesco:</strong> {req.newDependentData?.relationship}</li>
                                </ul>
                            </div>
                            <button 
                                onClick={() => handleWhatsAppContact(req.currentData.whatsapp || req.currentData.phone, `Olá, recebi sua solicitação para adicionar o dependente ${req.newDependentData?.name}.`)}
                                className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600 flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73z"/></svg>
                                Negociar no Zap
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Ao aprovar, o dependente será adicionado como 'Pendente' para que você possa ativar após o pagamento.</p>
                    </div>
                );
            case 'card_request':
                return (
                    <div className="p-4 bg-white border border-orange-200 rounded-md">
                        <p className="font-bold text-orange-800 mb-1">Solicitação de Cartão Físico</p>
                        <p className="text-gray-800">Para: <strong>{req.cardRequestData?.personName}</strong> ({req.cardRequestData?.role})</p>
                        <p className="text-xs text-gray-500 mt-3">Ao aprovar, o status de entrega do cliente será atualizado para "Entregar Cartão".</p>
                    </div>
                );
            case 'update':
            default:
                if (hasNoChanges(req)) {
                    return (
                        <div className="text-center p-4 bg-blue-50 text-blue-800 rounded-md">
                            <p className="font-semibold">Confirmação de Visita/Entrega</p>
                            <p className="text-sm">O entregador confirmou os dados sem alterações.</p>
                        </div>
                    );
                }
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2 pb-1 border-b">Dados Antigos</h4>
                            <dl className="text-sm space-y-2">
                                {Object.keys(req.updates).map(key => (
                                    <div key={key}>
                                        <dt className="font-medium text-gray-500 capitalize">{key}</dt>
                                        <dd className="text-gray-800">{req.currentData[key as keyof typeof req.currentData] || '-'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                         <div>
                            <h4 className="font-semibold text-green-700 mb-2 pb-1 border-b border-green-200">Dados Novos</h4>
                            <dl className="text-sm space-y-2">
                                 {Object.keys(req.updates).map(key => (
                                    <div key={key}>
                                        <dt className="font-medium text-gray-500 capitalize">{key}</dt>
                                        <dd className="font-bold text-green-800">{req.updates[key as keyof typeof req.updates] || '-'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card title="Aprovações de Atualização Cadastral">
            <div className="flex items-center gap-2 mb-6">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
                    <button 
                        key={status} 
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${filter === status ? 'bg-ds-vinho text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className={`px-2 rounded-full text-xs ${filter === status ? 'bg-white/20' : 'bg-gray-400/50'}`}>{status === 'all' ? updateRequests.length : updateRequests.filter(r => r.status === status).length}</span>
                    </button>
                ))}
            </div>

            {isLoadingData ? <Spinner/> : (
                <div className="space-y-4">
                    {filteredRequests.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma solicitação encontrada para este filtro.</p>}
                    {filteredRequests.map(req => (
                        <div key={req.id} className={`bg-white border rounded-lg shadow-sm ${req.requestType === 'cancellation' ? 'border-red-300 bg-red-50' : ''}`}>
                            <header className="flex justify-between items-center p-4 bg-gray-50/50 rounded-t-lg border-b">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-ds-vinho">{req.clientName}</h3>
                                        {req.requestType === 'cancellation' && (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white animate-pulse">
                                                CANCELAMENTO
                                            </span>
                                        )}
                                        {req.requestType === 'new_dependent' && (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-600 text-white">
                                                NOVO DEPENDENTE
                                            </span>
                                        )}
                                        {req.requestType === 'card_request' && (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500 text-white">
                                                CARTÃO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">Solicitado em: {new Date(req.requestedAt).toLocaleString('pt-BR')}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusMap[req.status].bg} ${statusMap[req.status].text}`}>
                                    {statusMap[req.status].label}
                                </span>
                            </header>

                            <div className="p-4">
                                {renderRequestContent(req)}
                                
                                {req.deliveryNote && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Observação do Entregador:</p>
                                        <p className="text-gray-800 text-sm whitespace-pre-line">{req.deliveryNote}</p>
                                    </div>
                                )}
                            </div>

                            {req.status === 'pending' && (
                                <footer className="flex justify-end items-center gap-3 p-3 bg-gray-50 rounded-b-lg border-t">
                                    {actionLoading === req.id && <Spinner />}
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        disabled={!!actionLoading}
                                        className="bg-gray-500 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    >
                                        Rejeitar
                                    </button>
                                     <button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        disabled={!!actionLoading}
                                        className={`${req.requestType === 'cancellation' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-full transition-colors disabled:opacity-50`}
                                    >
                                        {req.requestType === 'cancellation' ? 'Confirmar Cancelamento' : 'Aprovar Solicitação'}
                                    </button>
                                </footer>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ApprovalManagement;
