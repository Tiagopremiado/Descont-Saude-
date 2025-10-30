import React, { useState, useEffect, useMemo } from 'react';
import type { Doctor } from '../../types';
import { getDoctors, addDoctor, updateDoctor, deleteDoctor } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formState, setFormState] = useState<Omit<Doctor, 'id'>>({ name: '', specialty: '', address: '', city: '', phone: '', whatsapp: '' });
    const [suggestion, setSuggestion] = useState<Doctor | null>(null);

    // Step-by-step search states
    const [step, setStep] = useState<'city' | 'specialty' | 'list'>('city');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDoctors = async () => {
        setIsLoading(true);
        const data = await getDoctors();
        setDoctors(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const allSpecialties = useMemo(() => {
        return [...new Set(doctors.map(doc => doc.specialty))].sort();
    }, [doctors]);

    const recentDoctors = useMemo(() => {
        return doctors.slice(-5).reverse();
    }, [doctors]);
    
    const cities = useMemo(() => {
        return [...new Set(doctors.map(doc => doc.city))].sort();
    }, [doctors]);

    const specialtiesInCity = useMemo(() => {
        if (!selectedCity) return allSpecialties;
        const specs = doctors
            .filter(doc => doc.city === selectedCity)
            .map(doc => doc.specialty);
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
        setFormState({ name: '', specialty: '', address: '', city: '', phone: '', whatsapp: '' });
        setSuggestion(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));

        if (name === 'name' && value.length > 3) {
            const found = doctors.find(doc => doc.name.toLowerCase().includes(value.toLowerCase()) && doc.name.toLowerCase() !== value.toLowerCase());
            setSuggestion(found || null);
        } else if (name === 'name') {
            setSuggestion(null);
        }
    };

    const handleApplySuggestion = () => {
        if (suggestion) {
            setFormState({
                name: suggestion.name,
                specialty: suggestion.specialty,
                address: suggestion.address,
                city: suggestion.city,
                phone: suggestion.phone,
                whatsapp: suggestion.whatsapp || ''
            });
            setSuggestion(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit: any = { ...formState };
            if (!dataToSubmit.whatsapp) {
                delete dataToSubmit.whatsapp;
            }

            if (selectedDoctor) {
                await updateDoctor(selectedDoctor.id, { ...dataToSubmit, id: selectedDoctor.id });
            } else {
                await addDoctor(dataToSubmit);
            }
            
            await fetchDoctors();
            handleCloseModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
            await deleteDoctor(id);
            await fetchDoctors();
        }
    };

    const resetSearch = () => {
        setStep('city');
        setSelectedCity(null);
        setSelectedSpecialty(null);
        setSearchTerm('');
    };

    const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <>
            <Card title="Gerenciamento da Guia Médico">
                <div className="flex justify-end mb-4">
                     <button
                        onClick={() => handleOpenModal(null)}
                        className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors"
                    >
                        Adicionar Médico
                    </button>
                </div>

                {step === 'city' && (
                    <div className="space-y-12">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Selecione a cidade</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {cities.map(city => (
                                    <button key={city} onClick={() => { setSelectedCity(city); setStep('specialty'); }} className="px-6 py-3 bg-white text-ds-vinho border border-ds-vinho rounded-lg shadow-sm hover:bg-ds-vinho hover:text-white transition-all duration-200 font-semibold">
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                             <h3 className="text-xl font-semibold text-gray-800 mb-4">Ou busque por especialidade</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                               {allSpecialties.map(spec => (
                                    <button key={spec} onClick={() => { setSelectedSpecialty(spec); setSelectedCity(null); setStep('list'); }} className="px-4 py-1 bg-gray-200 text-gray-800 rounded-full hover:bg-ds-dourado hover:text-ds-vinho transition-colors text-sm font-medium">
                                        {spec}
                                    </button>
                               ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Credenciados Recentemente</h3>
                             <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentDoctors.map((doctor) => (
                                            <tr key={doctor.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{doctor.city}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'specialty' && (
                     <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">Especialidades em <span className="text-ds-vinho">{selectedCity}</span></h3>
                        <button onClick={() => setStep('city')} className="text-sm text-blue-600 hover:underline mb-4">Trocar cidade</button>
                        <div className="flex flex-wrap justify-center gap-3">
                           {specialtiesInCity.map(spec => (
                                <button key={spec} onClick={() => { setSelectedSpecialty(spec); setStep('list'); }} className="px-5 py-2 bg-white text-ds-vinho border border-ds-dourado rounded-full hover:bg-ds-dourado hover:text-ds-vinho transition-all duration-200 font-medium">
                                    {spec}
                                </button>
                           ))}
                        </div>
                    </div>
                )}
                
                {step === 'list' && (
                    <>
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                             <p className="text-sm">Buscando por: 
                                <span className="font-bold text-ds-vinho">
                                    {selectedCity ? ` ${selectedCity} > ` : ' Todas as cidades > '}
                                    {selectedSpecialty === 'Todas' ? 'Todas as especialidades' : selectedSpecialty}
                                </span>
                            </p>
                            <button onClick={resetSearch} className="text-sm text-blue-600 hover:underline">Fazer Nova Busca</button>
                            <input
                                type="text"
                                placeholder="Refine a busca pelo nome do profissional..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                            />
                        </div>
                        {isLoading ? <Spinner /> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredDoctors.map((doctor) => (
                                            <tr key={doctor.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                    <button onClick={() => handleOpenModal(doctor)} className="text-ds-vinho hover:text-ds-dourado">Editar</button>
                                                    <button onClick={() => handleDelete(doctor.id)} className="text-red-600 hover:text-red-800">Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredDoctors.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum profissional encontrado.</p>}
                            </div>
                        )}
                    </>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedDoctor ? 'Editar Profissional' : 'Adicionar Profissional'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={isSaving}>
                        <div>
                            <label htmlFor="name" className={labelClass}>Nome</label>
                            <input type="text" id="name" name="name" value={formState.name} onChange={handleChange} required className={inputClass} autoComplete="off" />
                             {suggestion && (
                                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md text-sm flex justify-between items-center">
                                    <span>Sugestão: <strong>{suggestion.name}</strong></span>
                                    <button type="button" onClick={handleApplySuggestion} className="ml-2 text-blue-600 font-semibold hover:underline text-xs bg-white px-2 py-1 rounded">Usar</button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="specialty" className={labelClass}>Especialidade</label>
                            <input list="specialties-list" type="text" id="specialty" name="specialty" value={formState.specialty} onChange={handleChange} required className={inputClass} />
                            <datalist id="specialties-list">
                                {allSpecialties.map(spec => <option key={spec} value={spec} />)}
                            </datalist>
                        </div>
                        <div>
                            <label htmlFor="address" className={labelClass}>Endereço (Rua, Nº)</label>
                            <input type="text" id="address" name="address" value={formState.address} onChange={handleChange} required className={inputClass} placeholder="Ex: Rua das Flores, 123" />
                        </div>
                         <div>
                            <label htmlFor="city" className={labelClass}>Cidade</label>
                            <input list="cities-list" type="text" id="city" name="city" value={formState.city} onChange={handleChange} required className={inputClass} />
                             <datalist id="cities-list">
                                {cities.map(city => <option key={city} value={city} />)}
                            </datalist>
                        </div>
                        <div>
                            <label htmlFor="phone" className={labelClass}>Telefone</label>
                            <input type="text" id="phone" name="phone" value={formState.phone} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="whatsapp" className={labelClass}>WhatsApp (Opcional)</label>
                            <input type="text" id="whatsapp" name="whatsapp" value={formState.whatsapp || ''} onChange={handleChange} className={inputClass} />
                        </div>
                    </fieldset>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75 disabled:cursor-not-allowed" disabled={isSaving}>
                           {isSaving && <ButtonSpinner />}
                           {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default DoctorManagement;