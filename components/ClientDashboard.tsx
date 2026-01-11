
import React from 'react';
import { Project, Lead } from '../types';
import { ICONS } from '../constants';

interface ClientDashboardProps {
  projects: Project[];
  leadStats: { score: number; rank: string };
  activityLogs: { msg: string; time: string }[];
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, leadStats, activityLogs }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Project Dashboard</h2>
          <p className="text-slate-500 mt-1 font-medium">Real-time status of your business automation systems.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50">Open Support Ticket</button>
          <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><ICONS.Audit /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Digital Health</p>
            <h3 className="text-2xl font-black text-slate-900">{leadStats.score}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><ICONS.Leads /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Leads Captured</p>
            <h3 className="text-2xl font-black text-slate-900">242</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><ICONS.CRM /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Market Rank</p>
            <h3 className="text-2xl font-black text-slate-900">{leadStats.rank}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="font-bold text-xl text-slate-800 mb-6">Active Infrastructure Projects</h3>
          <div className="space-y-6">
            {projects.map((p) => (
              <div key={p.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{p.type}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Implementation Progress</span>
                    <span className="text-slate-900">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-slate-500">Next Milestone: <span className="font-bold text-slate-800">{p.nextMilestone}</span></p>
                  <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View Roadmap</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Plan</p>
                <h4 className="text-xl font-bold mt-1">Growth Automation Pro</h4>
              </div>
              <span className="bg-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">Active</span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <p className="text-sm text-slate-400 font-medium">Monthly AMC</p>
                <p className="text-2xl font-black">₹8,000</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400 font-medium">Next Invoice</p>
                <p className="text-xs font-bold">12 Dec 2023</p>
              </div>
            </div>
            <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl mt-8 text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Manage Billing</button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-bold text-xl text-slate-800 mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {activityLogs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start p-4 hover:bg-slate-50 transition-colors rounded-2xl group">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 leading-snug">{log.msg}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">View All History</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
