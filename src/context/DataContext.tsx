import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { loadInitialData, MOCK_CLIENTS, MOCK_DOCTORS, MOCK_PAYMENTS, MOCK_REMINDERS } from '../services/mockData';
import type { Client, Doctor, Payment, Reminder } from '../types';

interface DataContextType {
  clients: Client[];
  doctors: Doctor[];
  payments: Payment[];
  reminders: Reminder[];
  isLoadingData: boolean;
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;
  reloadData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDirty, setDirty] = useState(false);

  const reloadData = useCallback(() => {
    // Reads from the global MOCK arrays into the context state
    setClients([...MOCK_CLIENTS]);
    setDoctors([...MOCK_DOCTORS]);
    setPayments([...MOCK_PAYMENTS]);
    setReminders([...MOCK_REMINDERS]);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoadingData(true);
      await loadInitialData(); // This function now handles local storage and Google Drive loading
      reloadData();
      setIsLoadingData(false);
    };
    initialize();
  }, [reloadData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        // Save to local storage before leaving
        const backupData = {
          clients: MOCK_CLIENTS,
          doctors: MOCK_DOCTORS,
          payments: MOCK_PAYMENTS,
        };
        // This key matches the one in mockData.ts
        localStorage.setItem('descontsaude_backup_data', JSON.stringify(backupData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <DataContext.Provider value={{ clients, doctors, payments, reminders, isLoadingData, isDirty, setDirty, reloadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
