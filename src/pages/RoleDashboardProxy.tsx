import React from 'react';
import { useRole } from '../context/RoleContext';
import { CommandCenter } from './CommandCenter';
import { ResearcherDashboard } from './ResearcherDashboard';
import { DisasterDashboard } from './DisasterDashboard';
import { CoastalDashboard } from './CoastalDashboard';
import { OperatorDashboard } from './OperatorDashboard';
import { Navigate } from 'react-router-dom';

export const RoleDashboardProxy: React.FC = () => {
  const { role } = useRole();

  switch (role) {
    case 'Fisherman':
      return <CommandCenter />;
    case 'Marine Researcher':
      return <ResearcherDashboard />;
    case 'Disaster Management':
      return <DisasterDashboard />;
    case 'Coastal Authority':
      return <CoastalDashboard />;
    case 'Maritime Operator':
      return <OperatorDashboard />;
    default:
      return <Navigate to="/roles" replace />;
  }
};
