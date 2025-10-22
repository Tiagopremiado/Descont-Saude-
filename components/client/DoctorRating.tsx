
import React, { useState, useEffect } from 'react';
import type { Doctor, Rating } from '../../types';
import { getDoctors, getRatingsByClientId } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

interface DoctorRatingProps {
  clientId: string;
}

const StarRating: React.FC<{ rating: number; setRating?: (rating: number) => void }> = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => setRating && setRating(star)}
          className={`h-6 w-6 ${rating >= star ? 'text-ds-dourado' : 'text-gray-300'} ${setRating ? 'cursor-pointer' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const DoctorRating: React.FC<DoctorRatingProps> = ({ clientId }) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [currentRating, setCurrentRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [doctorsData, ratingsData] = await Promise.all([getDoctors(), getRatingsByClientId(clientId)]);
            setDoctors(doctorsData);
            setRatings(ratingsData);
            if (doctorsData.length > 0) {
              setSelectedDoctorId(doctorsData[0].id)
            }
            setLoading(false);
        };
        fetchData();
    }, [clientId]);
    
    const canRate = (doctorId: string) => {
        const lastRating = ratings.find(r => r.doctorId === doctorId);
        // This is a simplified check. A real app would check if the rating date is within the last month.
        return !lastRating;
    }

    if (loading) return <Spinner />;

    return (
        <Card title="Avaliar Atendimento">
            <div className="space-y-4">
                <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Selecione o profissional</label>
                    <select
                        id="doctor"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado sm:text-sm rounded-md"
                    >
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                        ))}
                    </select>
                </div>
                {selectedDoctorId && (
                     canRate(selectedDoctorId) ? (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Sua avaliação (1 a 5 estrelas)</p>
                            <StarRating rating={currentRating} setRating={setCurrentRating} />
                            <textarea
                                className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                                rows={3}
                                placeholder="Deixe um comentário (opcional)..."
                            ></textarea>
                            <button className="mt-2 bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Enviar Avaliação</button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-md">Você já avaliou este profissional este mês. Agradecemos seu feedback!</p>
                    )
                )}
            </div>
        </Card>
    );
};

export default DoctorRating;
