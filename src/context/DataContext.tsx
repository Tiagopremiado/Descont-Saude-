import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DataContextType {
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDirty, setDirty] = useState(false);

  return (
    <DataContext.Provider value={{ isDirty, setDirty }}>
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
