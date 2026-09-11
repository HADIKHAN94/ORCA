import React from 'react';
import { Search, Bell, Globe, User } from 'lucide-react';
import { useRole } from '../context/RoleContext';

export const Topbar: React.FC = () => {
  const { role } = useRole();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Ask ORCA anything about the ocean..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marine-300 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>English</span>
        </div>
        
        <button className="relative text-gray-500 hover:text-marine-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-risk-high rounded-full border border-white"></span>
        </button>

        <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-marine-100 flex items-center justify-center text-marine-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Captain Arjun</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
