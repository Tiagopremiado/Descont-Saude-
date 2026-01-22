
import React, { useState } from 'react';
import type { Dependent, Client } from '../../types';
import Modal from '../common/Modal';

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDependent: (dependent: Omit<Dependent, 'id'>) => Promise<void>;
  client: Client; // Adicionado para saber para quem enviar o zap
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241zM12 6.422c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm-.001 4.29c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm0 2.894c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56z"/>
    </svg>
);

const AddDependentModal: React.FC<AddDependentModalProps> = ({ isOpen, onClose, onAddDependent, client }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive'>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [lastAdded, setLastAdded] = useState<{name: string, cpf: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && relationship && cpf && birthDate) {
      setIsSaving(true);
      try {
        const depData = {
          name,
          relationship,
          status,
          cpf,
          birthDate,
          registrationDate: new Date().toISOString(),
        };
        await onAddDependent(depData);
        setLastAdded({ name, cpf });
        // Não fechamos o modal imediatamente para mostrar o botão de WhatsApp
      } catch (error) {
        console.error("Error adding dependent", error);
        alert("Erro ao adicionar dependente.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSendWhatsApp = () => {
    if (!lastAdded) return;
    
    const firstNameTitular = client.name.split(' ')[0];
    const depCpfClean = lastAdded.cpf.replace(/\D/g, '');
    const pass = depCpfClean.length >= 4 ? depCpfClean.slice(-4) : '0000';
    
    const message = `Olá, ${firstNameTitular}! 👋\n\nAcabamos de cadastrar o dependente *${lastAdded.name}* no seu plano Descont'Saúde. ✅\n\nAgora ele(a) já pode acessar o portal para visualizar o cartão digital e a rede credenciada.\n\n🌐 *Link de Acesso:* https://descont-saude-pedro-osorio.vercel.app/\n👤 *Login (CPF):* ${lastAdded.cpf}\n🔑 *Senha:* ${pass} (4 últimos dígitos do CPF)\n\nQualquer dúvida, estamos à disposição!`;
    
    const phone = (client.whatsapp || client.phone).replace(/\D/g, '');
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    handleClose(); // Fecha após enviar
  };
  
  const handleClose = () => {
      setName('');
      setRelationship('');
      setCpf('');
      setBirthDate('');
      setStatus('pending');
      setLastAdded(null);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={lastAdded ? "Dependente Adicionado!" : "Adicionar Novo Dependente"}>
      {!lastAdded ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isSaving}>
              <div>
                <label htmlFor="dep-name-admin" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input
                  type="text"
                  id="dep-name-admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
                />
              </div>
              <div>
                <label htmlFor="dep-relationship-admin" className="block text-sm font-medium text-gray-700">Parentesco</label>
                <input
                  type="text"
                  id="dep-relationship-admin"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                  placeholder="Ex: Cônjuge, Filho(a)"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
                />
              </div>
              <div>
                <label htmlFor="dep-cpf-admin" className="block text-sm font-medium text-gray-700">CPF</label>
                <input
                  type="text"
                  id="dep-cpf-admin"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
                />
              </div>
              <div>
                <label htmlFor="dep-birthdate-admin" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <input
                  type="date"
                  id="dep-birthdate-admin"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado"
                />
              </div>
              <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'pending' | 'inactive')} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-ds-dourado focus:border-ds-dourado">
                      <option value="pending">Pendente</option>
                      <option value="active">Ativo</option>
                  </select>
              </div>
          </fieldset>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
            <button type="submit" className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75" disabled={isSaving}>
              {isSaving && <ButtonSpinner />}
              {isSaving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">{lastAdded.name} foi cadastrado!</h3>
                <p className="text-gray-600 mt-2">Deseja avisar o titular e enviar as instruções de acesso agora?</p>
            </div>
            
            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSendWhatsApp}
                    className="w-full bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#20bd5a] shadow-lg flex items-center justify-center transition-transform transform hover:scale-105"
                >
                    <WhatsAppIcon />
                    Enviar Acesso via WhatsApp
                </button>
                <button 
                    onClick={handleClose}
                    className="w-full text-gray-500 font-semibold py-2 hover:underline"
                >
                    Fechar sem avisar
                </button>
            </div>
        </div>
      )}
    </Modal>
  );
};

export default AddDependentModal;
