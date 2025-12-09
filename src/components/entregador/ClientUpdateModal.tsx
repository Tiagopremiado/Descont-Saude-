import React, { useState } from 'react';
import type { Client, UpdateApprovalRequest } from '../../types';
import Modal from '../common/Modal';
import { submitUpdateRequest } from '../../services/apiService';
import CancellationFlowModal from './CancellationFlowModal';
import { formatCPF, isValidCPF } from '../../utils/cpfValidator';

interface ClientUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onUpdateComplete: () => void;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

const ClientUpdateModal: React.FC<ClientUpdateModalProps> = ({ isOpen, onClose, client, onUpdateComplete }) => {
    const [formData, setFormData] = useState({
        phone: client.phone,
        whatsapp: client.whatsapp,
        address: client.address,
        addressNumber: client.addressNumber,
        neighborhood: client.neighborhood,
        city: client.city,
    });
    
    // State for extra actions
    const [actionMode, setActionMode] = useState<'none' | 'add_dependent' | 'request_card'>('none');
    const [newDependent, setNewDependent] = useState({ name: '', cpf: '', birthDate: '', relationship: '' });
    const [cardRequestPerson, setCardRequestPerson] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [dataConfirmed, setDataConfirmed] = useState(false);
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const hasChanges = () => {
        return (
            formData.phone !== client.phone ||
            formData.whatsapp !== client.whatsapp ||
            formData.address !== client.address ||
            formData.addressNumber !== client.addressNumber ||
            formData.neighborhood !== client.neighborhood ||
            formData.city !== client.city
        );
    };

    const handleSubmitUpdate = async () => {
        setIsSaving(true);
        try {
            const updates: UpdateApprovalRequest['updates'] = {};
            if (formData.phone !== client.phone) updates.phone = formData.phone;
            if (formData.whatsapp !== client.whatsapp) updates.whatsapp = formData.whatsapp;
            if (formData.address !== client.address) updates.address = formData.address;
            if (formData.addressNumber !== client.addressNumber) updates.addressNumber = formData.addressNumber;
            if (formData.neighborhood !== client.neighborhood) updates.neighborhood = formData.neighborhood;
            if (formData.city !== client.city) updates.city = formData.city;

            const currentData: UpdateApprovalRequest['currentData'] = {
                phone: client.phone,
                whatsapp: client.whatsapp,
                address: client.address,
                addressNumber: client.addressNumber,
                neighborhood: client.neighborhood,
                city: client.city
            };
            
            await submitUpdateRequest(client.id, currentData, updates);
            onUpdateComplete();
        } catch (error) {
            console.error("Failed to submit update request:", error);
            alert("Erro ao enviar a atualização. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddDependent = async () => {
        if (!newDependent.name || !newDependent.cpf || !newDependent.birthDate) {
            alert("Preencha todos os campos.");
            return;
        }
        if (!isValidCPF(newDependent.cpf)) {
            alert("CPF Inválido.");
            return;
        }

        setIsSaving(true);
        try {
            const currentData: UpdateApprovalRequest['currentData'] = {
                phone: client.phone,
                whatsapp: client.whatsapp,
                address: client.address,
                addressNumber: client.addressNumber,
                neighborhood: client.neighborhood,
                city: client.city
            };
            
            await submitUpdateRequest(client.id, currentData, {}, 'new_dependent', newDependent);
            alert("Solicitação de dependente enviada! O administrador entrará em contato.");
            onUpdateComplete();
        } catch(error) {
            alert("Erro ao enviar solicitação.");
        } finally {
            setIsSaving(false);
        }
    }

    const handleRequestCard = async () => {
        if (!cardRequestPerson) {
            alert("Selecione uma pessoa.");
            return;
        }
        setIsSaving(true);
        try {
            const currentData: UpdateApprovalRequest['currentData'] = {
                phone: client.phone,
                whatsapp: client.whatsapp,
                address: client.address,
                addressNumber: client.addressNumber,
                neighborhood: client.neighborhood,
                city: client.city
            };
            
            const isTitular = cardRequestPerson === client.name;
            const requestData = {
                personName: cardRequestPerson,
                role: isTitular ? 'Titular' : 'Dependente' as 'Titular' | 'Dependente'
            };

            await submitUpdateRequest(client.id, currentData, {}, 'card_request', requestData);
            alert("Solicitação de cartão registrada!");
            onUpdateComplete();
        } catch(error) {
            alert("Erro ao registrar.");
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleConfirmAndClose = async () => {
        setIsSaving(true);
        try {
            const currentData: UpdateApprovalRequest['currentData'] = {
                phone: client.phone,
                whatsapp: client.whatsapp,
                address: client.address,
                addressNumber: client.addressNumber,
                neighborhood: client.neighborhood,
                city: client.city
            };
            // Submit an empty update to mark as "visited"
            await submitUpdateRequest(client.id, currentData, {});
            onUpdateComplete();
        } catch (error) {
             console.error("Failed to submit confirmation:", error);
            alert("Erro ao confirmar os dados. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    }

    const labelClass = "block text-sm font-medium text-gray-500";
    const inputClass = "bg-white mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";

    // Close main modal when cancellation is done to refresh list
    const handleCancellationDone = () => {
        setIsCancellationModalOpen(false);
        onUpdateComplete();
    }

    if (isCancellationModalOpen) {
        return (
            <CancellationFlowModal 
                isOpen={isCancellationModalOpen} 
                onClose={() => setIsCancellationModalOpen(false)} 
                client={client}
                onCancellationSubmitted={handleCancellationDone}
            />
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Atendimento: ${client.name}`}>
            <div className="space-y-4">
                
                {actionMode === 'none' && (
                    <>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 mb-2">
                            Confirme os dados de contato e endereço abaixo.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className={labelClass}>Telefone</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="whatsapp" className={labelClass}>WhatsApp</label>
                                <input type="tel" name="whatsapp" id="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className={labelClass}>Endereço (Rua, Av.)</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="addressNumber" className={labelClass}>Nº</label>
                                <input type="text" name="addressNumber" id="addressNumber" value={formData.addressNumber} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="neighborhood" className={labelClass}>Bairro</label>
                                <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="city" className={labelClass}>Cidade</label>
                                <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        
                        <div className="!mt-6 pt-4 border-t">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={dataConfirmed}
                                    onChange={(e) => setDataConfirmed(e.target.checked)}
                                    className="h-5 w-5 rounded text-ds-vinho focus:ring-ds-dourado"
                                />
                                <span className="font-semibold text-gray-700">Confirmo que os dados acima estão corretos.</span>
                            </label>
                        </div>

                        {/* Extra Actions Area */}
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Solicitações do Cliente</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setActionMode('add_dependent')}
                                    className="flex-1 bg-indigo-50 border border-indigo-200 text-indigo-700 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-indigo-100"
                                >
                                    <UserPlusIcon /> Add Dependente
                                </button>
                                <button 
                                    onClick={() => setActionMode('request_card')}
                                    className="flex-1 bg-orange-50 border border-orange-200 text-orange-700 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-orange-100"
                                >
                                    <CardIcon /> Pedir Cartão
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-6">
                            <button 
                                onClick={() => setIsCancellationModalOpen(true)}
                                className="text-red-600 text-sm font-bold hover:underline"
                            >
                                Cliente quer Cancelar
                            </button>

                            <div className="flex space-x-3">
                                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>
                                    Cancelar
                                </button>
                                {hasChanges() ? (
                                    <button onClick={handleSubmitUpdate} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving || !dataConfirmed}>
                                        {isSaving && <ButtonSpinner />}
                                        Enviar Atualização
                                    </button>
                                ) : (
                                    <button onClick={handleConfirmAndClose} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 flex items-center disabled:opacity-75" disabled={isSaving || !dataConfirmed}>
                                        {isSaving && <ButtonSpinner />}
                                        Confirmar Dados
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Sub-screen: Add Dependent */}
                {actionMode === 'add_dependent' && (
                    <div className="space-y-4 animate-fade-in">
                        <h4 className="font-bold text-lg text-ds-vinho border-b pb-2">Adicionar Novo Dependente</h4>
                        <p className="text-sm text-gray-600">Preencha os dados abaixo. O administrador analisará se é possível adicionar e entrará em contato.</p>
                        <div>
                            <label className={labelClass}>Nome Completo</label>
                            <input type="text" value={newDependent.name} onChange={e => setNewDependent({...newDependent, name: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Parentesco</label>
                            <input type="text" value={newDependent.relationship} onChange={e => setNewDependent({...newDependent, relationship: e.target.value})} placeholder="Ex: Filho, Cônjuge" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>CPF</label>
                            <input type="text" value={newDependent.cpf} onChange={e => setNewDependent({...newDependent, cpf: formatCPF(e.target.value)})} maxLength={14} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Data Nascimento</label>
                            <input type="date" value={newDependent.birthDate} onChange={e => setNewDependent({...newDependent, birthDate: e.target.value})} className={inputClass} />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setActionMode('none')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Voltar</button>
                            <button onClick={handleAddDependent} disabled={isSaving} className="flex-1 bg-ds-vinho text-white font-bold py-2 px-4 rounded-lg">
                                {isSaving ? 'Enviando...' : 'Enviar para Análise'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Sub-screen: Request Card */}
                {actionMode === 'request_card' && (
                    <div className="space-y-4 animate-fade-in">
                        <h4 className="font-bold text-lg text-ds-vinho border-b pb-2">Solicitar 2ª Via de Cartão</h4>
                        <p className="text-sm text-gray-600">Selecione quem precisa do cartão físico.</p>
                        
                        <div className="space-y-2">
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="card_person" checked={cardRequestPerson === client.name} onChange={() => setCardRequestPerson(client.name)} className="h-4 w-4 text-ds-vinho focus:ring-ds-dourado" />
                                <span className="ml-3 font-medium text-gray-700">{client.name} (Titular)</span>
                            </label>
                            {client.dependents.map(dep => (
                                <label key={dep.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="card_person" checked={cardRequestPerson === dep.name} onChange={() => setCardRequestPerson(dep.name)} className="h-4 w-4 text-ds-vinho focus:ring-ds-dourado" />
                                    <span className="ml-3 font-medium text-gray-700">{dep.name} ({dep.relationship})</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setActionMode('none')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Voltar</button>
                            <button onClick={handleRequestCard} disabled={isSaving} className="flex-1 bg-ds-vinho text-white font-bold py-2 px-4 rounded-lg">
                                {isSaving ? 'Registrando...' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default ClientUpdateModal;