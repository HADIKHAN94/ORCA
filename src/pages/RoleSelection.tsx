import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import type { UserRole } from '../context/RoleContext';
import { AlertTriangle, Ship, Microscope, Fish, Anchor } from 'lucide-react';

export const RoleSelection: React.FC = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Fisherman' as UserRole,
      icon: Fish,
      title: 'Fisherman',
      description: 'Find fishing zones, check conditions, navigate safely and get alerts.',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      id: 'Marine Researcher' as UserRole,
      icon: Microscope,
      title: 'Marine Researcher',
      description: 'Analyze ocean data, study trends and generate scientific insights.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      id: 'Coastal Authority' as UserRole,
      icon: Anchor,
      title: 'Coastal Authority',
      description: 'Monitor marine activity, manage resources and ensure coastal safety.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      id: 'Disaster Management' as UserRole,
      icon: AlertTriangle,
      title: 'Disaster Manager',
      description: 'Track hazards, assess risks and make faster decisions to save lives.',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      id: 'Maritime Operator' as UserRole,
      icon: Ship,
      title: 'Maritime Operator',
      description: 'Plan routes, optimize operations and reduce risk & fuel usage.',
      color: 'text-teal-500',
      bg: 'bg-teal-50'
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    navigate('/dashboard');
  };

  const RoleCard = ({ r }: { r: (typeof roles)[0] }) => (
    <button
      onClick={() => handleSelectRole(r.id)}
      className="bg-white rounded-2xl p-8 text-left transition-all duration-200 
        border-2 border-transparent hover:border-marine-300 hover:shadow-lg 
        focus:outline-none focus:ring-4 focus:ring-marine-100 group w-full"
    >
      <div className={`${r.bg} ${r.color} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
        <r.icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{r.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{r.description}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-marine-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-5">
            <img src="/orca-logo.svg" alt="ORCA" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ORCA</h2>
          <p className="text-base text-gray-500">How will you use ORCA today?</p>
        </div>

        {/* Row 1 — 3 equal cards */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {roles.slice(0, 3).map(r => <RoleCard key={r.id as string} r={r} />)}
        </div>

        {/* Row 2 — 2 cards centered using offset */}
        <div className="flex justify-center gap-5">
          {roles.slice(3).map(r => (
            <div key={r.id as string} className="w-full" style={{ maxWidth: 'calc((100% - 10px) / 3)' }}>
              <RoleCard r={r} />
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          You can switch roles anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};
