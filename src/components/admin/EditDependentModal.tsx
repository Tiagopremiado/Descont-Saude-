
import React, { useState, useEffect } from 'react';
import type { Dependent } from '../../types';
import Modal from '../common/Modal';
import { formatCPF } from '../../utils/cpfValidator';
import { resetDependentPassword } from '../../services/apiService';

interface EditDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent: Dependent;
  // Note: we need the client ID to properly call the reset function if needed, 
  // but if the parent doesn't pass it, we might need to rely on just updating the dependent object locally first
  // However, resetDependentPassword requires clientId. 
  // IMPORTANT: The parent `ClientDetailModal` calls this. We will assume the parent passes the function `onSave` 
  // which handles the general update. We will add a new prop or handle reset internally if possible or add a new prop.
  // Actually, let's keep it simple: Reset password just logs it. We can import the service.
  // We need the clientId. Since we don't have it in props, let's try to extract it from context or pass it.
  // Given the structure, `dependent` object usually doesn't have `clientId`.
  // We will modify the props to accept `clientId`.
  // Wait, `EditDependentModal` is used in `ClientDetailModal`. We can pass clientId there.
  onSave: (dependentId: string, data: Partial<Omit<Dependent, 'id'>>) => Promise<void>;
  clientId?: string; // Made optional to avoid breaking other usages if any, but should be passed
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const EditDependentModal: React.FC<EditDependentModalProps> = ({ isOpen, onClose, dependent, onSave, clientId }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (dependent) {
      setName(dependent.name || '');
      setRelationship(dependent.relationship || '');
      setCpf(dependent.cpf || '');
      // Format date for input type="date" (YYYY-MM-DD)
      if (dependent.birthDate) {
          const date = new Date(dependent.birthDate);
          if (!isNaN(date.getTime())) {
              setBirthDate(date.toISOString().split('T')[0]);
          } else {
              setBirthDate('');
          }
      } else {
          setBirthDate('');
      }
    }
  }, [dependent]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCpf(formatCPF(e.target.value));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      setIsSaving(true);
      try {
        await onSave(dependent.id, {
          name,
          relationship,
          cpf,
          birthDate: new Date(birthDate).toISOString(),
        });
        onClose();
      } catch (error) {
          console.error("Failed to update dependent", error);
          alert("Erro ao atualizar dependente");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleResetPassword = async () => {
      if (!clientId) {
          alert("Erro: ID do cliente não encontrado.");
          return;
      }
      if (!window.confirm("Deseja resetar a senha deste dependente para o padrão (4 últimos dígitos do CPF)?")) return;

      setIsResetting(true);
      try {
          await resetDependentPassword(clientId, dependent.id);
          alert(`Senha resetada com sucesso para o padrão: ${cpf.replace(/\D/g, '').slice(-4)}`);
      } catch (error) {
          alert("Erro ao resetar senha.");
      } finally {
          setIsResetting(false);
      }
  }

  // Calculate standard password for display
  const standardPassword = cpf.replace(/\D/g, '').slice(-4) || '----';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Dependente: ${dependent?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={isSaving} className="space-y-4">
            <div>
              <label htmlFor="edit-dep-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input
                type="text"
                id="edit-dep-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
              <label htmlFor="edit-dep-relationship" className="block text-sm font-medium text-gray-700">Parentesco</label>
              <input
                type="text"
                id="edit-dep-relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
                placeholder="Ex: Cônjuge, Filho(a)"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
              <label htmlFor="edit-dep-cpf" className="block text-sm font-medium text-gray-700">CPF (Login)</label>
              <input
                type="text"
                id="edit-dep-cpf"
                value={cpf}
                onChange={handleCpfChange}
                required
                maxLength={14}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
              <p className="text-xs text-gray-500 mt-1">O CPF é utilizado como Login de acesso.</p>
            </div>
            <div>
              <label htmlFor="edit-dep-birthdate" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input
                type="date"
                id="edit-dep-birthdate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
        </fieldset>

        {/* Section for Access/Credentials */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                <KeyIcon /> Credenciais de Acesso
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="block text-gray-500 font-semibold">Login:</span>
                    <span className="block font-mono bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800">
                        {cpf || 'Não informado'}
                    </span>
                </div>
                <div>
                    <span className="block text-gray-500 font-semibold">Senha Atual (Padrão):</span>
                    <span className="block font-mono bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800">
                        {standardPassword}
                    </span>
                </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                    A senha do dependente é automaticamente os <strong>4 últimos dígitos do CPF</strong>. 
                    Se precisar alterar o acesso, atualize o CPF acima.
                </p>
                {clientId && (
                    <button 
                        type="button" 
                        onClick={handleResetPassword} 
                        disabled={isResetting || !cpf}
                        className="text-xs bg-red-100 text-red-700 font-bold py-2 px-3 rounded hover:bg-red-200 transition-colors flex items-center disabled:opacity-50"
                    >
                        {isResetting ? 'Processando...' : 'Resetar Senha para Padrão'}
                    </button>
                )}
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
          <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving}>
            {isSaving && <ButtonSpinner />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDependentModal;
