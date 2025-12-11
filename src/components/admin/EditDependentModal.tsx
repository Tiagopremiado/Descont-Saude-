
import React, { useState, useEffect } from 'react';
import type { Dependent } from '../../types';
import Modal from '../common/Modal';
import { formatCPF } from '../../utils/cpfValidator';

interface EditDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent: Dependent;
  onSave: (dependentId: string, data: Partial<Omit<Dependent, 'id'>>) => Promise<void>;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const EditDependentModal: React.FC<EditDependentModalProps> = ({ isOpen, onClose, dependent, onSave }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Dependente: ${dependent?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={isSaving}>
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
              <label htmlFor="edit-dep-cpf" className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                type="text"
                id="edit-dep-cpf"
                value={cpf}
                onChange={handleCpfChange}
                required
                maxLength={14}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
              />
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
