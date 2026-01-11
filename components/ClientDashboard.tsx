
import React, { useState } from 'react';
import { Project, Notification } from '../types';
import { ICONS } from '../constants';

interface ClientDashboardProps {
  projects: Project[];
  leadStats: { score: number; rank: string };
  activityLogs: { msg: string; time: string }[];
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, leadStats, activityLogs }) => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  const handleDownload = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'automation',
      title: 'Report Compiled',
      message: 'Your system performance intelligence has been generated successfully.',
      timestamp: 'Just now',
      isRead: false
    };
    setLocalNotifications([newNotification, ...localNotifications]);
    alert('System Intelligence Compilation Started. Check notifications for your link.');
  };

  const handleSupportTicket = () => {
    const issue = window.prompt("Briefly describe the automation gap or system issue:");
    if (issue) {
      alert("System ID #FG-9021 Created. A Digitex Studio engineer will reach out within 4 hours.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Growth Command</h2>
          <p className="text-slate-500 mt-1 font-medium">Real-time oversight of your Flowgent™ automation stack.</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button 
            onClick={handleSupportTicket}
            className="flex-1 lg:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            Open Support Ticket
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 lg:flex-none px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            Download Intelligence
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'System Health', value: `${leadStats.score}%`, color: 'text-blue-600', bg: 'bg-blue-50', icon: <ICONS.Audit /> },
          { label: 'Capture Nodes', value: 'Live', color: 'text-green-600', bg: 'bg-green-50', icon: <ICONS.Leads /> },
          { label: 'Global Rank', value: leadStats.rank, color: 'text-orange-600', bg: 'bg-orange-50', icon: <ICONS.CRM /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex items-center gap-8 group hover:border-blue-200 transition-all">
            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className={`text-4xl font-black text-slate-900 tracking-tighter`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[56px] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
            <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Active Infrastructure Projects</h3>
            <div className="space-y-10">
              {projects.map((p) => (
                <div key={p.id} className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-8 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-2xl tracking-tight">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{p.type}</p>
                    </div>
                    <span className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl border-2 ${p.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-slate-400">Implementation Pulse</span>
                      <span className="text-slate-900">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border border-white">
                      <div className="bg-blue-600 h-full transition-all duration-1000 shadow-lg shadow-blue-500/20" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-slate-600 font-medium">Next Milestone: <span className="font-black text-slate-900">{p.nextMilestone}</span></p>
                    <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition-all group-hover:translate-x-1 duration-300">Detailed Roadmap →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-[#0f172a] rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Node</p>
                  <h4 className="text-3xl font-black mt-2 tracking-tighter">Flowgent <br/>Growth Stack</h4>
                </div>
                <span className="bg-blue-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-xl shadow-blue-500/30">Active Retainer</span>
              </div>
              <div className="mt-12 space-y-8">
                <div className="flex justify-between items-end border-b border-white/10 pb-8">
                  <p className="text-sm text-slate-400 font-medium">Monthly AMC</p>
                  <p className="text-4xl font-black tracking-tighter">₹8,000</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400 font-medium">Next Invoicing</p>
                  <p className="text-xs font-black uppercase tracking-widest">12 Dec 2026</p>
                </div>
              </div>
              <button onClick={() => alert("Connecting to Digitex Studio Billing System...")} className="w-full bg-white text-slate-900 font-black py-6 rounded-2xl mt-12 text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all shadow-xl shadow-white/5">Manage Billing</button>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-200 p-10 shadow-sm">
            <h3 className="font-black text-xl text-slate-900 mb-10 tracking-tight">Infrastructure Logs</h3>
            <div className="space-y-8">
              {[
                { msg: "AI Lead Capture Node synchronized", time: "2m ago", status: "ok" },
                { msg: "CRM pipeline updated via n8n", time: "1h ago", status: "ok" },
                { msg: "New strategy meeting recorded", time: "4h ago", status: "pending" },
                { msg: "System backup to GitHub: Success", time: "6h ago", status: "ok" }
              ].map((log, i) => (
                <div key={i} className="flex gap-5 items-start p-2 group cursor-default">
                  <div className={`w-12 h-12 ${log.status === 'ok' ? 'bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500' : 'bg-orange-50 text-orange-500 animate-pulse'} rounded-2xl flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-snug">{log.msg}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 border-2 border-slate-100 rounded-3xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">View All Orchestrator Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
