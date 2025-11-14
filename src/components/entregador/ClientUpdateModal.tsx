import React, { useState } from 'react';
import type { Client, UpdateApprovalRequest } from '../../types';
import Modal from '../common/Modal';
import { submitUpdateRequest } from '../../services/apiService';

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

const ClientUpdateModal: React.FC<ClientUpdateModalProps> = ({ isOpen, onClose, client, onUpdateComplete }) => {
    const [formData, setFormData] = useState({
        phone: client.phone,
        whatsapp: client.whatsapp,
        address: client.address,
        addressNumber: client.addressNumber,
        neighborhood: client.neighborhood,
        city: client.city,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [dataConfirmed, setDataConfirmed] = useState(false);

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

    const handleSubmit = async () => {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Atualizar Cadastro de ${client.name}`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Confirme ou atualize as informações de contato e endereço do cliente. As alterações serão enviadas para aprovação.</p>
                
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
                        <span className="font-semibold text-gray-700">Confirmo que os dados acima estão corretos e/ou foram atualizados conforme informado pelo cliente.</span>
                    </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>
                        Cancelar
                    </button>
                    {hasChanges() ? (
                        <button onClick={handleSubmit} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving || !dataConfirmed}>
                             {isSaving && <ButtonSpinner />}
                            Enviar Atualização
                        </button>
                    ) : (
                        <button onClick={handleConfirmAndClose} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 flex items-center disabled:opacity-75" disabled={isSaving || !dataConfirmed}>
                            {isSaving && <ButtonSpinner />}
                            Confirmar Dados (sem alteração)
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ClientUpdateModal;
