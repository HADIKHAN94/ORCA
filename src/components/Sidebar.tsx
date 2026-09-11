import React from 'react';
import { useRole } from '../context/RoleContext';
import { 
  Anchor,
  Map as MapIcon, 
  Ship, 
  Fish, 
  Activity, 
  AlertTriangle, 
  Microscope,
  FileText,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { role } = useRole();

  const getNavigation = () => {
    const baseNav = [
      { name: 'Command Center', icon: Anchor, path: '/dashboard' },
      { name: 'Live Map', icon: MapIcon, path: '/map' },
      { name: 'AI Marine Copilot', icon: Activity, path: '/copilot' },
    ];

    if (role === 'Fisherman') {
      baseNav.push(
        { name: 'Fishing Intelligence', icon: Fish, path: '/fishing' },
        { name: 'Risk & Alerts', icon: AlertTriangle, path: '/alerts' }
      );
    } else if (role === 'Marine Researcher') {
      baseNav.push(
        { name: 'Ocean Analytics', icon: Microscope, path: '/analytics' },
        { name: 'Research workspace', icon: FileText, path: '/research' }
      );
    } else if (role === 'Disaster Management') {
      baseNav.push(
        { name: 'Hazard Intelligence', icon: AlertTriangle, path: '/hazards' },
        { name: 'Reports', icon: FileText, path: '/reports' }
      );
    } else if (role === 'Coastal Authority') {
      baseNav.push(
        { name: 'Situational Awareness', icon: Activity, path: '/awareness' },
        { name: 'Restricted Zones', icon: AlertTriangle, path: '/zones' }
      );
    } else if (role === 'Maritime Operator') {
      baseNav.push(
        { name: 'Vessel Operations', icon: Ship, path: '/operations' },
        { name: 'Route Optimization', icon: MapIcon, path: '/routes' }
      );
    }

    baseNav.push({ name: 'Settings', icon: Settings, path: '/settings' });
    return baseNav;
  };

  const navItems = getNavigation();

  return (
    <div className="w-64 bg-marine-900 text-white h-screen flex flex-col border-r border-marine-800 flex-shrink-0">
      <div className="p-5 flex items-center space-x-3 border-b border-marine-800">
        <img src="/orca-logo.svg" alt="ORCA Logo" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-lg font-black tracking-widest text-white">ORCA</h1>
          <p className="text-[10px] text-marine-300 uppercase font-semibold tracking-wide">Marine Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-marine-800 text-marine-200'
                  : 'text-gray-300 hover:bg-marine-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-marine-800">
        <div className="bg-marine-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-300 mb-1">
            <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse"></div>
            <span>Sat-Link Online</span>
          </div>
          <p className="text-xs text-gray-400">Data updated 12 mins ago</p>
        </div>
      </div>
    </div>
  );
};
