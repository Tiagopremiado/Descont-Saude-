import React from 'react';
import type { Client } from '../../types';
import Card from '../common/Card';

interface ProfileProps {
    client: Client;
}

const Profile: React.FC<ProfileProps> = ({ client }) => {
    return (
        <Card title="Meus Dados Cadastrais">
            <div className="space-y-3">
                <div>
                    <h4 className="font-semibold text-gray-600">Nome Completo</h4>
                    <p>{client.name}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600">CPF</h4>
                    <p>{client.cpf}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600">Contato</h4>
                    <p>{client.phone} | {client.email}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600">Endereço</h4>
                    <p>{client.address}</p>
                </div>
                 <hr className="my-4"/>
                 <div>
                    <h4 className="font-semibold text-gray-600">Plano Contratado</h4>
                    <p>{client.plan} - R$ {client.monthlyFee.toFixed(2)} / mês</p>
                </div>
            </div>
        </Card>
    );
};

export default Profile;