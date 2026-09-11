import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 
  | 'Fisherman' 
  | 'Marine Researcher' 
  | 'Coastal Authority' 
  | 'Disaster Management' 
  | 'Maritime Operator'
  | null;

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
