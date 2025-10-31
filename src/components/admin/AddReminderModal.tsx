import React, { useState, useMemo } from 'react';
import type { Reminder, Client } from '../../types';
import { addReminder } from '../../services/apiService';
import Modal from '../common/Modal';

interface AddReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReminderAdded: () => void;
    clients: Client[];
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const AddReminderModal: React.FC<AddReminderModalProps> = ({ isOpen, onClose, onReminderAdded, clients }) => {
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Reminder['priority']>('medium');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    
    const sortedClients = useMemo(() => {
        return [...clients].sort((a, b) => a.name.localeCompare(b.name));
    }, [clients]);

    const handleClose = () => {
        setDescription('');
        setPriority('medium');
        setSelectedClientId('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) return;
        
        setIsSaving(true);
        try {
            const selectedClient = clients.find(c => c.id === selectedClientId);
            
            await addReminder({
                description,
                priority,
                clientId: selectedClient?.id,
                clientName: selectedClient?.name
            });
            onReminderAdded();
            handleClose();
        } catch(error) {
            console.error("Failed to add reminder", error);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "bg-white text-gray-900 mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Lembrete">
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={isSaving}>
                    <div>
                        <label htmlFor="description" className={labelClass}>Descrição da Tarefa</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            required
                            className={inputClass}
                            placeholder="Ex: Gerar cartão para o filho do cliente..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priority" className={labelClass}>Prioridade</label>
                            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Reminder['priority'])} className={inputClass}>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="client" className={labelClass}>Associar ao Cliente (Opcional)</label>
                            <select id="client" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className={inputClass}>
                                <option value="">Nenhum</option>
                                {sortedClients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>
                        Cancelar
                    </button>
                    <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving || !description}>
                        {isSaving && <ButtonSpinner />}
                        {isSaving ? 'Salvando...' : 'Salvar Lembrete'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddReminderModal;
