// FIX: Populating the file with component logic.
import React, { useState } from 'react';
import type { Dependent } from '../../types';
import Modal from '../common/Modal';

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDependent: (dependent: Omit<Dependent, 'id'>) => void;
}

const AddDependentModal: React.FC<AddDependentModalProps> = ({ isOpen, onClose, onAddDependent }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  // FIX: Add state for missing properties cpf and birthDate
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Check for new fields before submitting
    if (name && relationship && cpf && birthDate) {
      // FIX: Pass a complete object that satisfies the Omit<Dependent, 'id'> type
      onAddDependent({
        name,
        relationship,
        status,
        cpf,
        birthDate,
        registrationDate: new Date().toISOString(),
      });
      handleClose();
    }
  };
  
  const handleClose = () => {
      setName('');
      setRelationship('');
      // FIX: Reset new state fields
      setCpf('');
      setBirthDate('');
      setStatus('pending');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Dependente">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {/* FIX: Add CPF input */}
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
        {/* FIX: Add Birth Date input */}
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
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Adicionar</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDependentModal;