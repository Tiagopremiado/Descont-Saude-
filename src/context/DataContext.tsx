
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { loadInitialData, loadLocalData, MOCK_CLIENTS, MOCK_DOCTORS, MOCK_PAYMENTS, MOCK_REMINDERS, MOCK_UPDATE_REQUESTS, MOCK_PLAN_CONFIG, DEFAULT_PLAN_CONFIG } from '../services/mockData';
import type { Client, Doctor, Payment, Reminder, UpdateApprovalRequest, PlanConfig } from '../types';

interface SyncStatus {
    message: string;
    type: 'success' | 'info' | 'error';
}

interface DataContextType {
  clients: Client[];
  doctors: Doctor[];
  payments: Payment[];
  reminders: Reminder[];
  updateRequests: UpdateApprovalRequest[];
  planConfig: PlanConfig;
  isLoadingData: boolean;
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;
  reloadData: () => void;
  syncStatus: SyncStatus | null;
  setSyncStatus: (status: SyncStatus | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [updateRequests, setUpdateRequests] = useState<UpdateApprovalRequest[]>([]);
  const [planConfig, setPlanConfig] = useState<PlanConfig>(DEFAULT_PLAN_CONFIG);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDirty, setDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const reloadData = useCallback(() => {
    // Reads from the global MOCK arrays into the context state
    setClients([...MOCK_CLIENTS]);
    setDoctors([...MOCK_DOCTORS]);
    setPayments([...MOCK_PAYMENTS]);
    setReminders([...MOCK_REMINDERS]);
    setUpdateRequests([...MOCK_UPDATE_REQUESTS]);
    setPlanConfig({...MOCK_PLAN_CONFIG});
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoadingData(true);
      
      // 1. Load Local Data Immediately (Synchronous/Fast)
      // This ensures the user sees the app immediately, even if the network is slow or google script fails
      loadLocalData();
      reloadData();
      setIsLoadingData(false); // Unblock UI

      // 2. Try to sync with Google Drive in the background
      try {
        const status = await loadInitialData(); 
        if (status) {
          setSyncStatus(status);
          reloadData(); // Reload if data was updated from cloud
        }
      } catch (e) {
        console.warn("Background sync failed or skipped:", e);
      }
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
          reminders: MOCK_REMINDERS,
          updateRequests: MOCK_UPDATE_REQUESTS,
          planConfig: MOCK_PLAN_CONFIG,
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
    <DataContext.Provider value={{ clients, doctors, payments, reminders, updateRequests, planConfig, isLoadingData, isDirty, setDirty, reloadData, syncStatus, setSyncStatus }}>
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
