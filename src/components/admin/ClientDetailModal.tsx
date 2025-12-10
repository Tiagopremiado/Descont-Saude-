import React, { useState, useEffect } from 'react';
import type { Client, Dependent } from '../../types';
import { updateClient, approveDependent, rejectDependent, inactivateDependent, reactivateDependent, resetClientPassword, addDependent, requestDelivery } from '../../services/apiService';
import { formatCPF } from '../../utils/cpfValidator';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import AddDependentModal from './AddDependentModal';
import ClientBillingsTab from './ClientBillingsTab';
import ClientHistoryTab from './ClientHistoryTab';


interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onShowGenerationResult: (client: Client) => void;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/>
    </svg>
);


const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ isOpen, onClose, client, onShowGenerationResult }) => {
  const [formData, setFormData] = useState<Client>(client);
  const [isFormSaving, setIsFormSaving] = useState(false);
  const [dependentActionLoading, setDependentActionLoading] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isAddDependentModalOpen, setIsAddDependentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'billings' | 'history'>('data');


  useEffect(() => {
    setFormData(client);
    setActiveTab('data'); // Reset to first tab when client changes
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
        setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
        const parsedValue = name === 'monthlyFee' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue as any }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSaving(true);
    try {
        await updateClient(client.id, formData);
        onClose();
    } catch (error) {
        console.error("Failed to update client", error);
    } finally {
        setIsFormSaving(false);
    }
  }
  
  const handleDependentAction = async (action: 'approve' | 'reject' | 'inactivate' | 'reactivate', dependentId: string) => {
      setDependentActionLoading(dependentId);
      let updatedClient: Client | null = null;
      try {
        if (action === 'approve') {
            updatedClient = await approveDependent(client.id, dependentId);
        } else if (action === 'reject') {
            updatedClient = await rejectDependent(client.id, dependentId);
        } else if (action === 'inactivate') {
            updatedClient = await inactivateDependent(client.id, dependentId);
        } else if (action === 'reactivate') {
            updatedClient = await reactivateDependent(client.id, dependentId);
        }

        if (updatedClient) {
            setFormData(updatedClient);
        }
      } finally {
        setDependentActionLoading(null);
      }
  }

  const handleAddDependent = async (dependentData: Omit<Dependent, 'id'>) => {
    const updatedClient = await addDependent(client.id, dependentData);
    if (updatedClient) {
        setFormData(updatedClient);
    }
  };

  const handleConfirmPasswordReset = async () => {
    setIsResettingPassword(true);
    try {
        await resetClientPassword(client.id);
        alert("A senha do cliente foi redefinida para os 4 últimos dígitos do CPF.");
        setIsResetPasswordModalOpen(false);
    } catch (error) {
        alert("Ocorreu um erro ao resetar a senha.");
        console.error("Password reset failed:", error);
    } finally {
        setIsResettingPassword(false);
    }
  }

  const handleRequestCardDelivery = async () => {
      if(window.confirm("Isso marcará este cliente para receber o Cartão Físico na próxima rota. Confirmar?")) {
          try {
              const updated = await requestDelivery(client.id, 'card', 'Entregar Cartão Físico');
              setFormData(updated);
              alert("Solicitação de entrega de cartão registrada! Exporte a rota para atualizar o entregador.");
          } catch(e) {
              alert("Erro ao solicitar entrega.");
          }
      }
  }

  const handleOpenWhatsApp = () => {
      const number = formData.whatsapp || formData.phone;
      const cleanNumber = number.replace(/\D/g, '');
      if (cleanNumber) {
          const url = `https://wa.me/55${cleanNumber}`;
          window.open(url, '_blank');
      } else {
          alert('Insira um número válido para chamar no WhatsApp.');
      }
  };

  const getDependentStatusChip = (status: Dependent['status']) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
    };
    const text = {
        active: 'Ativo',
        pending: 'Pendente',
        inactive: 'Inativo'
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
  }
  
  const getClientStatusChip = (status: Client['status']) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-red-100 text-red-800',
    };
    const text = {
        active: 'Ativo',
        pending: 'Pendente',
        inactive: 'Inativo'
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
  }


  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass = "bg-white text-gray-900 mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado disabled:bg-gray-100";
  const selectClass = `${inputClass}`;
  
  const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L4 19.743V16a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 000-2H5.257l5.9-5.9A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>;
  const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>;

  const TabButton: React.FC<{tab: 'data' | 'billings' | 'history', label: string}> = ({ tab, label }) => (
    <button
       type="button"
       onClick={() => setActiveTab(tab)}
       className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
           activeTab === tab 
           ? 'bg-gray-100 text-ds-vinho border-b-2 border-ds-vinho' 
           : 'text-gray-600 hover:bg-gray-200'
       }`}
   >
       {label}
   </button>
  );

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes do Cliente: ${client.name}`} size="3xl">
       <div className="border-b border-gray-200 -mt-6 -mx-6 mb-4">
            <nav className="-mb-px flex space-x-4 px-6 overflow-x-auto">
                <TabButton tab="data" label="Dados do Cliente" />
                <TabButton tab="billings" label="Mensalidades" />
                <TabButton tab="history" label="Histórico" />
            </nav>
        </div>
      
        <div className="min-h-[40vh] max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'data' && (
                <form id="client-detail-form" onSubmit={handleSave} className="space-y-4">
                    {/* Personal Data Section */}
                    <fieldset disabled={isFormSaving || !!dependentActionLoading}>
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2">Dados Pessoais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-name" className={labelClass}>Nome Completo</label>
                                <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label htmlFor="edit-cpf" className={labelClass}>CPF</label>
                                <input type="text" name="cpf" id="edit-cpf" value={formData.cpf} onChange={handleChange} className={inputClass} required maxLength={14} placeholder="000.000.000-00" />
                            </div>
                            <div>
                                <label htmlFor="edit-birthDate" className={labelClass}>Data Nascimento</label>
                                <input type="date" name="birthDate" id="edit-birthDate" value={formData.birthDate ? formData.birthDate.split('T')[0] : ''} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="edit-gender" className={labelClass}>Sexo</label>
                                <select name="gender" id="edit-gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                                    <option value="">Selecione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="X">Outro</option>
                                </select>
                            </div>
                        </div>
                        
                        <h4 className="font-bold text-gray-700 mt-4 mb-2">Contatos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="edit-email" className={labelClass}>Email</label>
                                <input type="email" name="email" id="edit-email" value={formData.email} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className={labelClass}>Telefone</label>
                                <input type="tel" name="phone" id="edit-phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label htmlFor="edit-whatsapp" className={labelClass}>WhatsApp</label>
                                <div className="relative">
                                    <input type="tel" name="whatsapp" id="edit-whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className={`${inputClass} pr-10`} />
                                    <button 
                                        type="button" 
                                        onClick={handleOpenWhatsApp}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors p-1"
                                        title="Chamar no WhatsApp"
                                    >
                                        <WhatsAppIcon />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-700 mt-4 mb-2">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="edit-cep" className={labelClass}>CEP</label>
                                <input type="text" name="cep" id="edit-cep" value={formData.cep || ''} onChange={handleChange} className={inputClass} placeholder="00000-000" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="edit-address" className={labelClass}>Endereço (Rua)</label>
                                <input type="text" name="address" id="edit-address" value={formData.address} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label htmlFor="edit-addressNumber" className={labelClass}>Número</label>
                                <input type="text" name="addressNumber" id="edit-addressNumber" value={formData.addressNumber || ''} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="edit-neighborhood" className={labelClass}>Bairro</label>
                                <input type="text" name="neighborhood" id="edit-neighborhood" value={formData.neighborhood || ''} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="edit-city" className={labelClass}>Cidade</label>
                                <input type="text" name="city" id="edit-city" value={formData.city || ''} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                    </div>
                    <hr/>
                    {/* Plan and Status Section */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2">Plano e Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="edit-plan" className={labelClass}>Plano</label>
                                <input type="text" id="edit-plan" name="plan" value={formData.plan} onChange={handleChange} className={inputClass} required/>
                            </div>
                            <div>
                                <label htmlFor="edit-monthlyFee" className={labelClass}>Mensalidade (R$)</label>
                                <input type="number" step="0.01" id="edit-monthlyFee" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label htmlFor="edit-status" className={`${labelClass} flex items-center`}>
                                    Status
                                    <span className="ml-2">{getClientStatusChip(formData.status)}</span>
                                </label>
                                <select id="edit-status" name="status" value={formData.status} onChange={handleChange} className={selectClass} required>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="pending">Pendente</option>
                                </select>
                            </div>
                        </div>
                        {formData.deliveryStatus && formData.deliveryStatus.pending && (
                            <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-200 text-sm text-yellow-800 flex items-center">
                                <span className="mr-2">🚚</span>
                                <strong>Entrega Pendente:</strong> {formData.deliveryStatus.description || formData.deliveryStatus.type}
                            </div>
                        )}
                    </div>
                    <hr/>
                    {/* Annotations Section */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2">Anotações e Solicitações</h4>
                        <div>
                            <label htmlFor="edit-annotations" className={labelClass}>Observações sobre o cliente</label>
                            <textarea 
                                name="annotations" 
                                id="edit-annotations" 
                                value={formData.annotations || ''} 
                                onChange={handleChange} 
                                className={`${inputClass} min-h-[100px]`} 
                                placeholder="Adicione observações, solicitações do cliente, ou informações de contato importantes..."
                            />
                        </div>
                    </div>
                    </fieldset>
                    <hr/>
                    {/* Login and Actions Section */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2">Acesso e Ações Rápidas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className={labelClass}>Login</label>
                                <p className="text-sm text-gray-600 mt-1">O cliente acessa com o CPF (<span className="font-semibold">{formData.cpf}</span>) ou Telefone (<span className="font-semibold">{formData.phone}</span>).</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>Ações</label>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsResetPasswordModalOpen(true)}
                                        className="flex-1 flex items-center justify-center bg-red-100 text-red-700 font-bold py-2 px-4 rounded-full hover:bg-red-200 transition-colors text-xs"
                                    >
                                    <KeyIcon /> Resetar Senha
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleRequestCardDelivery}
                                        className="flex-1 flex items-center justify-center bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-full hover:bg-blue-200 transition-colors text-xs"
                                    >
                                    <TruckIcon /> Solicitar Entrega Cartão
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    {/* Dependents Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-700">Dependentes</h4>
                            <button type="button" onClick={() => setIsAddDependentModalOpen(true)} className="text-sm bg-ds-dourado text-ds-vinho font-semibold py-1 px-3 rounded-md hover:bg-opacity-90">+ Adicionar</button>
                        </div>
                        {formData.dependents.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {formData.dependents.map(dep => (
                                    <li key={dep.id} className="py-3 flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{dep.name}</p>
                                            <p className="text-sm text-gray-500">{dep.relationship} - CPF: {dep.cpf}</p>
                                            <p className="text-xs text-gray-400">Nasc: {new Date(dep.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getDependentStatusChip(dep.status)}
                                            {dependentActionLoading === dep.id && <div className="w-5 h-5"><Spinner /></div>}
                                            {dep.status === 'pending' && dependentActionLoading !== dep.id && (
                                                <>
                                                    <button type="button" onClick={() => handleDependentAction('approve', dep.id)} className="text-xs bg-green-500 text-white font-bold py-1 px-2 rounded-full hover:bg-green-600">Aprovar</button>
                                                    <button type="button" onClick={() => handleDependentAction('reject', dep.id)} className="text-xs bg-red-500 text-white font-bold py-1 px-2 rounded-full hover:bg-red-600">Rejeitar</button>
                                                </>
                                            )}
                                            {dep.status === 'active' && dependentActionLoading !== dep.id && (
                                                <button type="button" onClick={() => handleDependentAction('inactivate', dep.id)} className="text-xs bg-gray-500 text-white font-bold py-1 px-2 rounded-full hover:bg-gray-600">Inativar</button>
                                            )}
                                            {dep.status === 'inactive' && dependentActionLoading !== dep.id && (
                                                <button type="button" onClick={() => handleDependentAction('reactivate', dep.id)} className="text-xs bg-blue-500 text-white font-bold py-1 px-2 rounded-full hover:bg-blue-600">Reativar</button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">Nenhum dependente cadastrado.</p>}
                    </div>
                </form>
            )}
            {activeTab === 'billings' && (
                <ClientBillingsTab client={client} />
            )}
            {activeTab === 'history' && (
                <ClientHistoryTab client={formData} />
            )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-4">
            <div>
                 <button
                    type="button"
                    onClick={() => onShowGenerationResult(client)}
                    className="bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors text-sm"
                    disabled={isFormSaving}
                >
                    Gerar Contrato e Cartões
                </button>
            </div>
            <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isFormSaving}>
                    Fechar
                </button>
                {activeTab === 'data' && (
                     <button 
                        type="submit" 
                        form="client-detail-form"
                        className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75 disabled:cursor-not-allowed" 
                        disabled={isFormSaving || !!dependentActionLoading}
                    >
                        {isFormSaving && <ButtonSpinner />}
                        {isFormSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                )}
            </div>
        </div>
      
    </Modal>
    
    <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Confirmar Reset de Senha"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Você tem certeza que deseja resetar a senha para o cliente <span className="font-bold">{client.name}</span>?
          </p>
          <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-md">
            A nova senha será os <code className="font-bold">4 últimos dígitos do CPF</code>. Por favor, informe o cliente sobre a alteração.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsResetPasswordModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isResettingPassword}>
              Cancelar
            </button>
            <button type="button" onClick={handleConfirmPasswordReset} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 flex items-center disabled:opacity-75" disabled={isResettingPassword}>
              {isResettingPassword && <ButtonSpinner />}
              {isResettingPassword ? 'Resetando...' : 'Sim, Resetar Senha'}
            </button>
          </div>
        </div>
    </Modal>

    <AddDependentModal 
        isOpen={isAddDependentModalOpen}
        onClose={() => setIsAddDependentModalOpen(false)}
        onAddDependent={handleAddDependent}
    />
    </>
  );
};

export default ClientDetailModal;