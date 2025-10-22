import React, { useState } from 'react';
import type { Client, Dependent } from '../../types';
import { requestAddDependent } from '../../services/apiService';
import { isValidCPF, formatCPF } from '../../utils/cpfValidator';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface DependentsManagerProps {
  client: Client;
}

const DependentsManager: React.FC<DependentsManagerProps> = ({ client: initialClient }) => {
  const [client, setClient] = useState<Client>(initialClient);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const initialFormState: Omit<Dependent, 'id' | 'status' | 'registrationDate' | 'inactivationDate'> = {
    name: '',
    relationship: '',
    cpf: '',
    birthDate: '',
  };

  const [newDependent, setNewDependent] = useState(initialFormState);
  const [dependentForConfirmation, setDependentForConfirmation] = useState<typeof initialFormState | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [cpfError, setCpfError] = useState('');
  
  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setCpfError('');

    if (!isValidCPF(newDependent.cpf)) {
      setCpfError('CPF inválido. Por favor, verifique os dígitos.');
      return;
    }
    
    setDependentForConfirmation(newDependent);
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAndSubmit = async () => {
    if (!client || !dependentForConfirmation) return;
    
    setIsSaving(true);
    try {
      const updatedClient = await requestAddDependent(client.id, dependentForConfirmation);
      if (updatedClient) {
        setClient(updatedClient);
      }
      handleCloseAndReset();
    } catch (error) {
      console.error("Failed to request dependent addition", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setCpfError(''); // Clear error on new input
      setNewDependent(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
      setNewDependent(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCloseAndReset = () => {
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setNewDependent(initialFormState);
    setDependentForConfirmation(null);
    setCpfError('');
  }

  const getStatusChip = (status: Dependent['status']) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-red-100 text-red-800'
    };
    const text = {
        active: 'Ativo',
        pending: 'Aguardando Aprovação',
        inactive: 'Inativo'
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
  };

  return (
    <>
      <Card title="Meus Dependentes">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors"
          >
            Solicitar Inclusão
          </button>
        </div>
        {client.dependents.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {client.dependents.map(dep => (
              <li key={dep.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{dep.name}</p>
                  <p className="text-sm text-gray-500">{dep.relationship} - CPF: {dep.cpf}</p>
                  <p className="text-xs text-gray-400">Nascimento: {new Date(dep.birthDate).toLocaleDateString('pt-BR')}</p>
                </div>
                {getStatusChip(dep.status)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum dependente cadastrado.</p>
        )}
      </Card>
      
      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseAndReset} title="Solicitar Inclusão de Dependente">
        <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" name="name" id="name" value={newDependent.name} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado" />
              </div>
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Parentesco</label>
                <input type="text" name="relationship" id="relationship" value={newDependent.relationship} onChange={handleChange} required placeholder="Ex: Cônjuge, Filho(a)" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado" />
              </div>
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                <input type="text" name="cpf" id="cpf" value={newDependent.cpf} onChange={handleChange} required maxLength={14} placeholder="000.000.000-00" className={`mt-1 w-full p-2 border rounded-md focus:ring-ds-dourado focus:border-ds-dourado ${cpfError ? 'border-red-500' : 'border-gray-300'}`} />
                {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <input type="date" name="birthDate" id="birthDate" value={newDependent.birthDate} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={handleCloseAndReset} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Verificar Dados</button>
              </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      {dependentForConfirmation && (
        <Modal isOpen={isConfirmModalOpen} onClose={() => {}} title="Confirme os Dados do Dependente">
            {isSaving ? <Spinner /> : (
            <div className="space-y-4">
                <p className="text-gray-700">Por favor, verifique se as informações abaixo estão corretas antes de enviar a solicitação.</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200 text-gray-800">
                    <p><strong>Nome:</strong> {dependentForConfirmation.name}</p>
                    <p><strong>Parentesco:</strong> {dependentForConfirmation.relationship}</p>
                    <p><strong>CPF:</strong> {dependentForConfirmation.cpf}</p>
                    <p><strong>Data de Nascimento:</strong> {new Date(dependentForConfirmation.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={() => { setIsConfirmModalOpen(false); setIsFormModalOpen(true); }} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Voltar e Corrigir</button>
                    <button onClick={handleConfirmAndSubmit} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Confirmar e Enviar</button>
                </div>
            </div>
            )}
        </Modal>
      )}
    </>
  );
};

export default DependentsManager;