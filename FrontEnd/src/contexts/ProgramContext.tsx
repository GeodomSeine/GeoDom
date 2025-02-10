import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Program } from '../services/api';

interface ProgramContextType {
  program: Program | null;
  setProgram: (program: Program) => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const ProgramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [program, setProgram] = useState<Program | null>(null);

  return (
    <ProgramContext.Provider value={{ program, setProgram }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }
  return context;
};
