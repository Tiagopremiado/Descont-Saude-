
import React from 'react';
import type { Client, Dependent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';

interface ProfileProps {
    client: Client;
}

const Profile: React.FC<ProfileProps> = ({ client }) => {
    const { user } = useAuth();
    const isDependent = user?.role === 'dependent';
    
    // Determine whose data to show
    let displayData: { name: string; cpf: string; phone?: string; email?: string } = client;
    let subtitle = "Dados do Titular";

    if (isDependent && user?.dependentId) {
        const dependent = client.dependents.find(d => d.id === user.dependentId);
        if (dependent) {
            displayData = {
                name: dependent.name,
                cpf: dependent.cpf,
                // Dependents usually share contact info with titular, but display what is available
                phone: client.phone,
                email: client.email
            };
            subtitle = "Meus Dados (Dependente)";
        }
    }

    return (
        <Card title="Meus Dados Cadastrais">
            <p className="text-sm font-bold text-ds-vinho uppercase mb-4 tracking-wide">{subtitle}</p>
            <div className="space-y-3">
                <div>
                    <h4 className="font-semibold text-gray-600">Nome Completo</h4>
                    <p>{displayData.name}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600">CPF</h4>
                    <p>{displayData.cpf}</p>
                </div>
                 {/* Only show contact info if it makes sense contextually, usually shared */}
                 <div>
                    <h4 className="font-semibold text-gray-600">Contato (Vinculado)</h4>
                    <p>{displayData.phone} {displayData.email ? `| ${displayData.email}` : ''}</p>
                </div>
                 
                 {isDependent && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-bold text-gray-700">Dados do Plano (Titular)</h4>
                        <p className="text-sm mt-1"><strong>Titular:</strong> {client.name}</p>
                        <p className="text-sm"><strong>Plano:</strong> {client.plan}</p>
                    </div>
                 )}

                 {!isDependent && (
                    <>
                        <div>
                            <h4 className="font-semibold text-gray-600">Endereço</h4>
                            <p>{client.address}, {client.addressNumber} - {client.neighborhood}</p>
                            <p>{client.city}</p>
                        </div>
                        <hr className="my-4"/>
                        <div>
                            <h4 className="font-semibold text-gray-600">Plano Contratado</h4>
                            <p>{client.plan} - R$ {client.monthlyFee.toFixed(2)} / mês</p>
                        </div>
                    </>
                 )}
            </div>
        </Card>
    );
};

export default Profile;
