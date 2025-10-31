import React, { useState, useMemo } from 'react';
import type { Doctor } from '../../types';
import { addDoctor, updateDoctor, deleteDoctor } from '../../services/apiService';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DoctorManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { doctors, isLoadingData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formState, setFormState] = useState<Omit<Doctor, 'id'>>({ name: '', specialty: '', address: '', city: '', phone: '', whatsapp: '' });
    const [suggestion, setSuggestion] = useState<Doctor | null>(null);

    const [step, setStep] = useState<'city' | 'specialty' | 'list'>('city');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const allSpecialties = useMemo(() => [...new Set(doctors.map(doc => doc.specialty))].sort(), [doctors]);
    const recentDoctors = useMemo(() => [...doctors].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 5), [doctors]);
    const cities = useMemo(() => [...new Set(doctors.map(doc => doc.city))].sort(), [doctors]);
    
    const specialtiesInCity = useMemo(() => {
        if (!selectedCity) return allSpecialties;
        const specs = doctors.filter(doc => doc.city === selectedCity).map(doc => doc.specialty);
        return ['Todas', ...Array.from(new Set(specs)).sort()];
    }, [doctors, selectedCity, allSpecialties]);

    const filteredDoctors = useMemo(() => {
        if (step !== 'list') return [];
        return doctors.filter(doc => {
            const matchesCity = !selectedCity || doc.city === selectedCity;
            const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'Todas' || doc.specialty === selectedSpecialty;
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCity && matchesSpecialty && matchesSearch;
        });
    }, [doctors, step, selectedCity, selectedSpecialty, searchTerm]);

    const handleOpenModal = (doctor: Doctor | null) => {
        setSelectedDoctor(doctor);
        if (doctor) {
            setFormState({ ...doctor, whatsapp: doctor.whatsapp || '' });
        } else {
            setFormState({ name: '', specialty: '', address: '', city: '', phone: '', whatsapp: '' });
        }
        setSuggestion(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { /* ... unchanged ... */ };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... unchanged ... */ };
    const handleApplySuggestion = () => { /* ... unchanged ... */ };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit: any = { ...formState };
            if (!dataToSubmit.whatsapp) delete dataToSubmit.whatsapp;

            if (selectedDoctor) {
                await updateDoctor(selectedDoctor.id, { ...dataToSubmit, id: selectedDoctor.id });
            } else {
                await addDoctor(dataToSubmit);
            }
            onUpdate();
            handleCloseModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
            await deleteDoctor(id);
            onUpdate();
        }
    };

    const resetSearch = () => { /* ... unchanged ... */ };

    const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <>
            <Card title="Gerenciamento da Guia Médico">
                {/* ... (UI part is largely unchanged) ... */}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedDoctor ? 'Editar Profissional' : 'Adicionar Profissional'} size="xl">
                {/* ... (Modal UI is largely unchanged) ... */}
            </Modal>
        </>
    );
};

export default DoctorManagement;
