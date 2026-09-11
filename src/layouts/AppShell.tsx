import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useRole } from '../context/RoleContext';

export const AppShell: React.FC = () => {
  const { role } = useRole();

  if (!role) {
    return <Navigate to="/roles" replace />;
  }

  return (
    <div className="flex h-screen bg-marine-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
