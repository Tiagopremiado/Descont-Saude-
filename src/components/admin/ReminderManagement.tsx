import React, { useState, useMemo, useEffect } from 'react';
import type { Reminder, Client } from '../../types';
import { updateReminderStatus, deleteReminder } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import AddReminderModal from './AddReminderModal';
import ClientDetailModal from './ClientDetailModal';

interface ReminderManagementProps {
    clients: Client[];
    initialReminders: Reminder[];
    onUpdate: () => void;
}

const ReminderManagement: React.FC<ReminderManagementProps> = ({ clients, initialReminders, onUpdate }) => {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        setReminders(initialReminders);
    }, [initialReminders]);

    const filteredReminders = useMemo(() => {
        const sorted = [...reminders].sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'pending' ? -1 : 1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        });
        if (filter === 'all') return sorted;
        return sorted.filter(r => r.status === filter);
    }, [reminders, filter]);

    const handleAction = async (action: () => Promise<any>) => {
        setIsLoading(true);
        try {
            await action();
            onUpdate(); // This will trigger a re-fetch in AdminDashboard
        } catch (error) {
            console.error("Action failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = (reminder: Reminder) => {
        const newStatus = reminder.status === 'pending' ? 'completed' : 'pending';
        handleAction(() => updateReminderStatus(reminder.id, newStatus));
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este lembrete?")) {
            handleAction(() => deleteReminder(id));
        }
    };
    
    const handleClientClick = (clientId?: string) => {
        if (!clientId) return;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
        }
    };

    const priorityStyles: Record<Reminder['priority'], { bg: string, text: string, label: string }> = {
        high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Alta' },
        medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Média' },
        low: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Baixa' },
    };

    const FilterButton: React.FC<{ value: typeof filter, label: string, count: number }> = ({ value, label, count }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${
                filter === value
                ? 'bg-ds-vinho text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {label}
            <span className={`px-2 rounded-full text-xs ${filter === value ? 'bg-white/20' : 'bg-gray-400/50'}`}>{count}</span>
        </button>
    );

    return (
        <>
            <Card title="Lembretes e Tarefas">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <FilterButton value="pending" label="Pendentes" count={reminders.filter(r=>r.status === 'pending').length} />
                        <FilterButton value="completed" label="Concluídos" count={reminders.filter(r=>r.status === 'completed').length} />
                        <FilterButton value="all" label="Todos" count={reminders.length} />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors"
                    >
                        Adicionar Lembrete
                    </button>
                </div>

                {isLoading ? <Spinner /> : (
                    <div className="space-y-3">
                        {filteredReminders.length > 0 ? filteredReminders.map(reminder => (
                            <div key={reminder.id} className={`p-4 rounded-lg flex items-start gap-4 ${reminder.status === 'completed' ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm border'}`}>
                                <input
                                    type="checkbox"
                                    checked={reminder.status === 'completed'}
                                    onChange={() => handleToggleStatus(reminder)}
                                    className="h-6 w-6 mt-1 rounded text-ds-vinho focus:ring-ds-dourado cursor-pointer"
                                    aria-label="Marcar como concluído"
                                />
                                <div className="flex-grow">
                                    <p className={`font-medium ${reminder.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                        {reminder.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full font-semibold ${priorityStyles[reminder.priority].bg} ${priorityStyles[reminder.priority].text}`}>
                                            {priorityStyles[reminder.priority].label}
                                        </span>
                                        {reminder.clientName && (
                                            <button onClick={() => handleClientClick(reminder.clientId)} className="font-semibold text-blue-600 hover:underline">
                                                {reminder.clientName}
                                            </button>
                                        )}
                                        <span>Criado em: {new Date(reminder.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(reminder.id)} 
                                    className="text-gray-500 hover:text-red-600 flex-shrink-0 transition-all duration-200 transform hover:scale-110 focus:outline-none" 
                                    aria-label="Excluir lembrete"
                                    title="Excluir Lembrete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">Nenhum lembrete encontrado.</p>}
                    </div>
                )}
            </Card>

            <AddReminderModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReminderAdded={onUpdate}
                clients={clients}
            />

            {selectedClient && (
                <ClientDetailModal 
                    isOpen={!!selectedClient}
                    onClose={() => setSelectedClient(null)}
                    client={selectedClient}
                    onShowGenerationResult={() => {}} // Not needed here
                />
            )}
        </>
    );
};

export default ReminderManagement;
