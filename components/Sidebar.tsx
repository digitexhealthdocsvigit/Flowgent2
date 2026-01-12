
import React from 'react';
import { ICONS, COLORS } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, userRole }) => {
  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'scraper', label: 'Discovery', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
    )},
    { id: 'hot_opps', label: 'Hot Opps', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    )},
    { id: 'leads', label: 'Lead Engine', icon: ICONS.Leads },
    { id: 'funnel', label: 'Funnel View', icon: ICONS.Audit },
    { id: 'calendar', label: 'Meetings', icon: ICONS.Calendar },
    { id: 'crm', label: 'Deal Pipeline', icon: ICONS.CRM },
    { id: 'automations', label: 'Workflows', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect width="18" height="12" x="3" y="11" rx="2"/><circle cx="12" cy="16" r="1"/></svg>
    )},
    { id: 'billing', label: 'Revenue/AMC', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    )},
    { id: 'settings', label: 'Settings', icon: ICONS.Settings },
  ];

  const clientItems = [
    { id: 'client_dashboard', label: 'My Dashboard', icon: ICONS.Dashboard },
    { id: 'projects', label: 'Projects', icon: ICONS.Project },
    { id: 'reports', label: 'Reports', icon: ICONS.Audit },
    { id: 'settings', label: 'Account', icon: ICONS.Settings },
  ];

  const menuItems = userRole === 'client' ? clientItems : adminItems;

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 shrink-0 shadow-sm z-50">
      <button 
        onClick={() => onTabChange(userRole === 'client' ? 'client_dashboard' : 'dashboard')}
        className="p-6 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors group text-left w-full"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">F</div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight">Flowgent™</h1>
          <p className="text-[10px] text-slate-800 font-black uppercase tracking-wider">A Digitex Studio Brand</p>
        </div>
      </button>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
              currentTab === item.id 
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
              : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Role</p>
          <p className="text-sm font-black mt-1 capitalize tracking-tight">{userRole.replace('_', ' ')}</p>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full shadow-lg ${userRole === 'client' ? 'bg-orange-500 w-[40%]' : 'bg-blue-500 w-[85%]'}`}></div>
          </div>
          <p className="text-[9px] text-slate-400 mt-3 font-black uppercase tracking-tighter">{userRole === 'client' ? 'Tier: Enterprise' : 'Infrastructure Utilization: 85%'}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
