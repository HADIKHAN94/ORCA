// src/context/RoleContext.tsx — extended with location state
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { type Location, INDIAN_COASTAL_CITIES } from "../hooks/useLocation";

export type UserRole =
  | "Fisherman"
  | "Marine Researcher"
  | "Coastal Authority"
  | "Disaster Management"
  | "Maritime Operator"
  | null;

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  location: Location;
  setLocation: (loc: Location) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<UserRole>(null);
  const [location, setLocation] = useState<Location>(INDIAN_COASTAL_CITIES[0]);

  return (
    <RoleContext.Provider value={{ role, setRole, location, setLocation }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined)
    throw new Error("useRole must be used within a RoleProvider");
  return context;
};
