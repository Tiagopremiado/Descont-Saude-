import React, { useState } from 'react';
import Modal from '../common/Modal';

interface SaveChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrive: () => Promise<void>;
  onSaveLocal: () => void;
  onExitWithoutSaving: () => void;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SaveChangesModal: React.FC<SaveChangesModalProps> = ({ isOpen, onClose, onSaveDrive, onSaveLocal, onExitWithoutSaving }) => {
  const [isSavingDrive, setIsSavingDrive] = useState(false);

  const handleSaveDriveClick = async () => {
    setIsSavingDrive(true);
    await onSaveDrive();
    // The parent component will handle closing and logging out
    setIsSavingDrive(false); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Salvar Alterações?">
      <div className="space-y-4">
        <p className="text-gray-700 text-center">
          Você tem alterações não salvas. Deseja salvá-las antes de sair?
        </p>
        <div className="flex flex-col space-y-3 pt-4">
          <button
            onClick={handleSaveDriveClick}
            disabled={isSavingDrive}
            className="flex w-full justify-center items-center bg-gray-700 text-white font-bold py-3 px-4 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-75"
          >
            {isSavingDrive ? <ButtonSpinner /> : 'Salvar no Google Drive'}
          </button>
          <button
            onClick={onSaveLocal}
            className="flex w-full justify-center items-center bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-colors"
          >
            Salvar Localmente
          </button>
           <button
            onClick={onExitWithoutSaving}
            className="flex w-full justify-center items-center bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors"
          >
            Sair sem Salvar
          </button>
        </div>
        <div className="text-center pt-2">
             <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:underline">
                Cancelar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveChangesModal;