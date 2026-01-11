
import React from 'react';
import { Notification } from '../types';
import { ICONS } from '../constants';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead, onClose }) => {
  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'lead': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><ICONS.Leads /></div>;
      case 'meeting': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><ICONS.Calendar /></div>;
      case 'deal': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><ICONS.Check /></div>;
      case 'automation': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><ICONS.Alert /></div>;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-200">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-slate-900 text-lg tracking-tight">Notifications</h3>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-900 p-1 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      <div className="max-h-[480px] overflow-y-auto bg-white">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 font-bold">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                onClick={() => onMarkAsRead(n.id)}
              >
                {!n.isRead && <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>}
                {getIcon(n.type)}
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-sm leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-2">{n.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">View All Activity</button>
      </div>
    </div>
  );
};

export default NotificationCenter;
