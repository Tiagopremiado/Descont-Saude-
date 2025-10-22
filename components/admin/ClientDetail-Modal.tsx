// FIX: Providing full file content to resolve module import errors.
import React, { useState, useEffect } from 'react';
// FIX: Import the Dependent type to correctly type the getStatusChip function parameter.
import type { Client, Dependent } from '../../types';
import { updateClient } from '../../services/apiService';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ isOpen, onClose, client }) => {
  const [formData, setFormData] = useState<Client>(client);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'monthlyFee' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue as any }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await updateClient(client.id, formData);
        onClose();
    } catch (error) {
        console.error("Failed to update client", error);
    } finally {
        setIsSaving(false);
    }
  }
  
  // FIX: The function now accepts the full Dependent['status'] type, including 'inactive'.
  const getStatusChip = (status: Dependent['status']) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        // FIX: Added styles for the 'inactive' status.
        inactive: 'bg-gray-100 text-gray-800',
    };
    const text = {
        active: 'Ativo',
        pending: 'Pendente',
        // FIX: Added text for the 'inactive' status.
        inactive: 'Inativo'
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
  }

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";
  const selectClass = `${inputClass} bg-white`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Cliente: ${client.name}`}>
      {isSaving ? <Spinner /> : (
      <form onSubmit={handleSave} className="space-y-4">
        <div>
            <h4 className="font-bold text-gray-700 mb-2">Dados Pessoais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Nome Completo</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="cpf" className={labelClass}>CPF</label>
                    <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="phone" className={labelClass}>Telefone</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
                </div>
            </div>
             <div className="mt-4">
                <label htmlFor="address" className={labelClass}>Endereço</label>
                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} required />
            </div>
        </div>
        <hr/>
        <div>
            <h4 className="font-bold text-gray-700 mb-2">Plano e Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="plan" className={labelClass}>Plano</label>
                    <input type="text" id="plan" name="plan" value={formData.plan} onChange={handleChange} className={inputClass} required/>
                </div>
                <div>
                    <label htmlFor="monthlyFee" className={labelClass}>Mensalidade (R$)</label>
                    <input type="number" step="0.01" id="monthlyFee" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="status" className={labelClass}>Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={selectClass} required>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="pending">Pendente</option>
                    </select>
                </div>
            </div>
        </div>
         <hr/>
         <div>
            <h4 className="font-bold text-gray-700 mb-2">Dependentes</h4>
            {formData.dependents.length > 0 ? (
                <ul className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                    {formData.dependents.map(dep => (
                        <li key={dep.id} className="py-2 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">{dep.name}</p>
                                <p className="text-sm text-gray-500">{dep.relationship}</p>
                            </div>
                            {getStatusChip(dep.status)}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500">Nenhum dependente cadastrado.</p>}
         </div>
         <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
         </div>
      </form>
      )}
    </Modal>
  );
};

export default ClientDetailModal;