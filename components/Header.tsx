import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { QuantroLogo } from './icons/QuantroLogo';

// Mock icons for the nav group
const NavIconWrapper: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <button
    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${active ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200'
      }`}
  >
    {children}
  </button>
);

// Simple SVG shapes for the nav icons to match design perfectly
const IconPie = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconFile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconColumns = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path></svg>;

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between w-full py-4 px-6 gap-4 md:gap-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <QuantroLogo className="text-textPrimary w-6 h-6" />
        <span className="font-semibold text-lg tracking-tight">Quantro</span>
      </div>

      {/* Nav Icons Group */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-100/50">
        <NavIconWrapper active><IconPie /></NavIconWrapper>
        <NavIconWrapper><IconFolder /></NavIconWrapper>
        <NavIconWrapper><IconFile /></NavIconWrapper>
        <NavIconWrapper><IconUser /></NavIconWrapper>
        <NavIconWrapper><IconGrid /></NavIconWrapper>
        <NavIconWrapper><IconColumns /></NavIconWrapper>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-600" />
          <input
            type="text"
            placeholder="Search Dashboard"
            className="pl-9 pr-4 py-2 bg-white rounded-lg text-sm text-gray-700 w-64 shadow-sm border border-transparent focus:border-gray-200 focus:outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <button className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200/50">
          <div className="relative">
            <img src="https://picsum.photos/64/64" alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden sm:flex flex-col text-xs">
            <span className="font-semibold text-gray-900">Omari Omari</span>
            <span className="text-gray-400">Manager</span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};