
import React from 'react';
import { Project } from '../types';

interface ProjectsListViewProps {
  projects: Project[];
}

const ProjectsListView: React.FC<ProjectsListViewProps> = ({ projects }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Infrastructure Projects</h2>
          <p className="text-slate-500 mt-1 font-medium">Tracking the deployment of your business systems.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">+ Request Module</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-center gap-10 group hover:border-blue-200 transition-colors">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M12 10h.01"/></svg>
            </div>
            
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h3 className="text-2xl font-black text-slate-900">{project.name}</h3>
                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Implementation of {project.type} systems for your organization.</p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">Next: <span className="text-slate-900 font-bold">{project.nextMilestone}</span></p>
            </div>

            <div className="shrink-0 flex gap-2">
              <button className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button className="px-6 py-4 bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-100 transition-colors">Timeline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsListView;
