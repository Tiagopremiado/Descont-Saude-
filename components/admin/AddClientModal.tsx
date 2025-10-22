import React, { useState } from 'react';
import type { Client, Dependent } from '../../types';
import { addClient } from '../../services/apiService';
import { formatCPF } from '../../utils/cpfValidator';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (newClient: Client) => void;
}

type DependentFormData = Omit<Dependent, 'id' | 'status' | 'registrationDate' | 'inactivationDate' | 'cpf' | 'relationship'>;


const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onClientAdded }) => {
  const initialFormState: Omit<Client, 'id' | 'dependents' | 'contractNumber'> = {
    name: '',
    cpf: '',
    birthDate: '',
    gender: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    addressNumber: '',
    neighborhood: '',
    city: 'Pedro Osório',
    plan: 'Plano Padrão',
    monthlyFee: 26.00,
    registrationFee: 0.00,
    paymentDueDateDay: 20,
    promotion: true,
    salesRep: 'TIAGO SILVA',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [dependents, setDependents] = useState<DependentFormData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const handleDependentChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newDependents = [...dependents];
    newDependents[index] = { ...newDependents[index], [name]: value };
    setDependents(newDependents);
  };

  const addDependentRow = () => {
    setDependents([...dependents, { name: '', birthDate: '' }]);
  };

  const removeDependentRow = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'cpf') {
        setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
        const parsedValue = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                             type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue as any }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const fullClientData = {
          ...formData,
          dependents: dependents.map(d => ({...d, cpf: '', relationship: ''})) as Dependent[],
      };
      const newClient = await addClient(fullClientData);
      onClientAdded(newClient); 
      handleClose();
    } catch (err) {
      setError('Falha ao adicionar cliente. Tente novamente.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setDependents([]);
    setError('');
    onClose();
  };
  
  const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-4">
        {isSaving ? <Spinner /> : (
          <>
            <fieldset>
                <legend className="text-lg font-semibold text-ds-vinho mb-2">Dados do Titular</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="add-name" className={labelClass}>Nome Completo</label>
                        <input type="text" name="name" id="add-name" value={formData.name} onChange={handleChange} required className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="add-cpf" className={labelClass}>CPF</label>
                        <input type="text" name="cpf" id="add-cpf" value={formData.cpf} onChange={handleChange} required maxLength={14} placeholder="000.000.000-00" className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="add-birthDate" className={labelClass}>Data Nasc.</label>
                        <input type="date" name="birthDate" id="add-birthDate" value={formData.birthDate} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div>
                        <label htmlFor="add-gender" className={labelClass}>Sexo</label>
                        <select name="gender" id="add-gender" value={formData.gender} onChange={handleChange} required className={`${inputClass} bg-white`}>
                            <option value="">Selecione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="X">Outro</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="add-phone" className={labelClass}>Fone</label>
                        <input type="tel" name="phone" id="add-phone" value={formData.phone} onChange={handleChange} required className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="add-whatsapp" className={labelClass}>Whatsapp</label>
                        <input type="tel" name="whatsapp" id="add-whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass}/>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend className="text-lg font-semibold text-ds-vinho mb-2">Endereço</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="add-address" className={labelClass}>Endereço</label>
                        <input type="text" name="address" id="add-address" value={formData.address} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div>
                        <label htmlFor="add-addressNumber" className={labelClass}>Nº</label>
                        <input type="text" name="addressNumber" id="add-addressNumber" value={formData.addressNumber} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="add-neighborhood" className={labelClass}>Bairro</label>
                        <input type="text" name="neighborhood" id="add-neighborhood" value={formData.neighborhood} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div>
                        <label htmlFor="add-city" className={labelClass}>Cidade</label>
                        <input type="text" name="city" id="add-city" value={formData.city} onChange={handleChange} required className={inputClass}/>
                    </div>
                 </div>
            </fieldset>

            <fieldset>
                 <legend className="text-lg font-semibold text-ds-vinho mb-2">Detalhes do Contrato</legend>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                        <label htmlFor="add-registrationFee" className={labelClass}>Taxa de Cadastro</label>
                        <input type="number" step="0.01" name="registrationFee" id="add-registrationFee" value={formData.registrationFee} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div>
                        <label htmlFor="add-monthlyFee" className={labelClass}>Mensalidade</label>
                        <input type="number" step="0.01" name="monthlyFee" id="add-monthlyFee" value={formData.monthlyFee} onChange={handleChange} required className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="add-paymentDueDateDay" className={labelClass}>Vencimento</label>
                        <input type="number" min="1" max="31" name="paymentDueDateDay" id="add-paymentDueDateDay" value={formData.paymentDueDateDay} onChange={handleChange} required className={inputClass}/>
                    </div>
                     <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" name="promotion" checked={formData.promotion} onChange={handleChange} className="h-5 w-5 rounded text-ds-vinho focus:ring-ds-dourado"/>
                            <span className={labelClass}>Promoção</span>
                        </label>
                    </div>
                 </div>
            </fieldset>
            
            <fieldset>
                <legend className="text-lg font-semibold text-ds-vinho mb-2">Dependentes</legend>
                <div className="space-y-3">
                    {dependents.map((dep, index) => (
                        <div key={index} className="flex items-end gap-2 p-2 bg-gray-50 rounded">
                            <div className="flex-grow">
                                <label className="text-xs font-medium text-gray-600">Nome do Dependente {index + 1}</label>
                                <input type="text" name="name" value={dep.name} onChange={e => handleDependentChange(index, e)} className={inputClass} />
                            </div>
                             <div className="flex-grow">
                                <label className="text-xs font-medium text-gray-600">Data de Nasc.</label>
                                <input type="date" name="birthDate" value={dep.birthDate} onChange={e => handleDependentChange(index, e)} className={inputClass} />
                            </div>
                            <button type="button" onClick={() => removeDependentRow(index)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 h-10 w-10 flex-shrink-0 flex items-center justify-center">&times;</button>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addDependentRow} className="mt-2 text-sm bg-ds-dourado text-ds-vinho font-semibold py-2 px-3 rounded-md hover:bg-opacity-90">+ Adicionar Dependente</button>
            </fieldset>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Cancelar</button>
              <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">{isSaving ? 'Salvando...' : 'Salvar Cliente'}</button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddClientModal;