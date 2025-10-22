import React, { useState, useEffect, useMemo } from 'react';
import type { Doctor } from '../../types';
import { getDoctors } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const DoctorList: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Step-by-step search states
    const [step, setStep] = useState<'city' | 'specialty' | 'list'>('city');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            const data = await getDoctors();
            setDoctors(data);
            setIsLoading(false);
        };
        fetchDoctors();
    }, []);

    const cities = useMemo(() => {
        return [...new Set(doctors.map(doc => doc.city))].sort();
    }, [doctors]);
    
    const allSpecialties = useMemo(() => {
        return [...new Set(doctors.map(doc => doc.specialty))].sort();
    }, [doctors]);

    const recentDoctors = useMemo(() => {
        return doctors.slice(-5).reverse();
    }, [doctors]);


    const specialtiesInCity = useMemo(() => {
        if (!selectedCity) return [];
        const specs = doctors
            .filter(doc => doc.city === selectedCity)
            .map(doc => doc.specialty);
        return ['Todas', ...Array.from(new Set(specs)).sort()];
    }, [doctors, selectedCity]);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc => {
            const matchesCity = !selectedCity || doc.city === selectedCity;
            const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'Todas' || doc.specialty === selectedSpecialty;
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCity && matchesSpecialty && matchesSearch;
        });
    }, [doctors, selectedCity, selectedSpecialty, searchTerm]);
    
    const resetSearch = () => {
        setStep('city');
        setSelectedCity(null);
        setSelectedSpecialty(null);
        setSearchTerm('');
    };

    const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/></svg>;

    const DoctorCard: React.FC<{doctor: Doctor}> = ({ doctor }) => (
         <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg text-ds-vinho">{doctor.name}</h3>
            <p className="font-semibold text-gray-700">{doctor.specialty}</p>
            <p className="text-sm text-gray-600 mt-1">{`${doctor.address} - ${doctor.city}`}</p>
            <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1">
                <a href={`tel:${doctor.phone.replace(/\D/g, '')}`} className="flex items-center gap-1.5 text-sm text-gray-800 hover:text-blue-600 transition-colors">
                    <PhoneIcon />
                    <span className="font-medium">{doctor.phone}</span>
                </a>
                {doctor.whatsapp && (
                     <a href={`https://wa.me/55${doctor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-800 hover:text-green-600 transition-colors">
                        <WhatsAppIcon />
                        <span className="font-medium">{doctor.whatsapp}</span>
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <Card title="Guia Médico - Rede Credenciada">
            {isLoading ? <Spinner /> : (
                <>
                    {step === 'city' && (
                       <div className="space-y-12">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Selecione a sua cidade</h3>
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
                                <div className="space-y-4">
                                    {recentDoctors.map(doctor => (
                                       <DoctorCard key={doctor.id} doctor={doctor} />
                                    ))}
                                </div>
                            </div>
                       </div>
                    )}

                    {step === 'specialty' && selectedCity && (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">Agora, a especialidade em <span className="text-ds-vinho">{selectedCity}</span></h3>
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
                        <div>
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
                                    placeholder="Refine a busca pelo nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                                />
                            </div>
                            <div className="space-y-4">
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map(doctor => (
                                       <DoctorCard key={doctor.id} doctor={doctor} />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">Nenhum profissional encontrado com os filtros aplicados.</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

export default DoctorList;