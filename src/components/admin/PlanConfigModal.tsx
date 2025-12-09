
import React, { useState, useEffect } from 'react';
import type { PlanConfig } from '../../types';
import { updatePlanConfig } from '../../services/apiService';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';

interface PlanConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PlanConfigModal: React.FC<PlanConfigModalProps> = ({ isOpen, onClose }) => {
    const { planConfig, setDirty, reloadData } = useData();
    const [formData, setFormData] = useState<PlanConfig>(planConfig);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(planConfig);
        }
    }, [isOpen, planConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updatePlanConfig(formData);
            setDirty(true);
            reloadData();
            onClose();
        } catch (error) {
            console.error("Failed to update plan config", error);
            alert("Erro ao salvar configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuração de Valores dos Planos">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800 mb-4">
                    Estes valores serão usados como base para novos cadastros. O sistema ajustará automaticamente o valor sugerido conforme o número de dependentes.
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="individualPrice" className={labelClass}>Titular Individual (0 dependentes)</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <input type="number" step="0.01" name="individualPrice" id="individualPrice" value={formData.individualPrice} onChange={handleChange} className={`${inputClass} pl-10`} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="familySmallPrice" className={labelClass}>Titular + 1 a 3 Dependentes</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <input type="number" step="0.01" name="familySmallPrice" id="familySmallPrice" value={formData.familySmallPrice} onChange={handleChange} className={`${inputClass} pl-10`} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="familyMediumPrice" className={labelClass}>Titular + 4 Dependentes</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <input type="number" step="0.01" name="familyMediumPrice" id="familyMediumPrice" value={formData.familyMediumPrice} onChange={handleChange} className={`${inputClass} pl-10`} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="familyLargePrice" className={labelClass}>Titular + 5 Dependentes</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <input type="number" step="0.01" name="familyLargePrice" id="familyLargePrice" value={formData.familyLargePrice} onChange={handleChange} className={`${inputClass} pl-10`} required />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <label htmlFor="extraDependentPrice" className={labelClass}>Custo por Dependente Extra (acima de 5)</label>
                        <p className="text-xs text-gray-500 mb-1">Este valor será somado ao plano "Titular + 5" para cada dependente adicional.</p>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <input type="number" step="0.01" name="extraDependentPrice" id="extraDependentPrice" value={formData.extraDependentPrice} onChange={handleChange} className={`${inputClass} pl-10`} required />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
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

export default PlanConfigModal;
