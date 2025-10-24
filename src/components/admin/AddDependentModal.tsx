// FIX: Populating the file with component logic.
import React, { useState } from 'react';
import type { Dependent } from '../../types';
import Modal from '../common/Modal';

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDependent: (dependent: Omit<Dependent, 'id'>) => Promise<void>;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AddDependentModal: React.FC<AddDependentModalProps> = ({ isOpen, onClose, onAddDependent }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive'>('pending');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && relationship && cpf && birthDate) {
      setIsSaving(true);
      try {
        await onAddDependent({
          name,
          relationship,
          status,
          cpf,
          birthDate,
          registrationDate: new Date().toISOString(),
        });
        handleClose();
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleClose = () => {
      setName('');
      setRelationship('');
      setCpf('');
      setBirthDate('');
      setStatus('pending');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Dependente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={isSaving}>
            <div>
              <label htmlFor="dep-name-admin" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input
                type="text"
                id="dep-name-admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
              <label htmlFor="dep-relationship-admin" className="block text-sm font-medium text-gray-700">Parentesco</label>
              <input
                type="text"
                id="dep-relationship-admin"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
                placeholder="Ex: Cônjuge, Filho(a)"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
              <label htmlFor="dep-cpf-admin" className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                type="text"
                id="dep-cpf-admin"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
              <label htmlFor="dep-birthdate-admin" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input
                type="date"
                id="dep-birthdate-admin"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'pending' | 'inactive')} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-ds-dourado focus:border-ds-dourado">
                    <option value="pending">Pendente</option>
                    <option value="active">Ativo</option>
                </select>
            </div>
        </fieldset>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
          <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving}>
            {isSaving && <ButtonSpinner />}
            {isSaving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDependentModal;