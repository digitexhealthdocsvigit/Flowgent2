
import React, { useState } from 'react';

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(24);
  const meetings = [
    { id: 1, time: '10:00 AM', company: 'TechNova Solutions', type: 'Discovery Call', status: 'confirmed', score: 85 },
    { id: 2, time: '11:30 AM', company: 'GreenLeaf Realty', type: 'Demo Session', status: 'confirmed', score: 72 },
    { id: 3, time: '02:00 PM', company: 'Elite Motors', type: 'Proposal Review', status: 'pending', score: 92 },
    { id: 4, time: '04:30 PM', company: 'Royal Spices', type: 'Technical Audit', status: 'confirmed', score: 45 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Meeting Intelligence</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Synced with Cal.com | Showing automated strategy slots.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Calendar Settings</button>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20">Sync External Calendar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-900">November 2023</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 p-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2;
              const isToday = dayNum === 24;
              const isSelected = selectedDate === dayNum;
              const hasMeeting = [22, 24, 25, 27].includes(dayNum);
              
              return (
                <div 
                  key={i} 
                  onClick={() => dayNum > 0 && dayNum <= 30 && setSelectedDate(dayNum)}
                  className={`bg-white h-32 p-4 relative border border-slate-50 transition-all cursor-pointer group ${
                    isSelected ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-500 z-10 shadow-lg' : 'hover:bg-slate-50/50'
                  } ${dayNum < 1 || dayNum > 30 ? 'opacity-20 cursor-default pointer-events-none' : ''}`}
                >
                  {dayNum > 0 && dayNum <= 30 && (
                    <>
                      <span className={`text-sm font-black ${
                        isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-lg shadow-blue-600/30' : 'text-slate-400'
                      }`}>
                        {dayNum}
                      </span>
                      {hasMeeting && (
                        <div className="mt-3 space-y-1">
                          <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md truncate ${
                            dayNum % 2 === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {dayNum % 2 === 0 ? 'Hot Lead' : 'Warm Followup'}
                          </div>
                          {dayNum === 24 && <div className="bg-green-600 text-[8px] font-black text-white px-2 py-1 rounded-md truncate">Demo Ready</div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold leading-tight">Lead Qualification <br/>Gate Active</h4>
              <p className="text-slate-400 text-xs mt-3 leading-relaxed font-medium">System is prioritizing slots for Leads with Digital Health &gt; 75%.</p>
              <div className="mt-6 flex gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Live Slots</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">Schedule for Nov {selectedDate}</h3>
            {meetings.map((meet) => (
              <div key={meet.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all flex gap-5 group">
                <div className="flex flex-col items-center justify-center shrink-0 border-r border-slate-100 pr-5">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{meet.time.split(' ')[1]}</p>
                  <p className="text-xl font-black text-slate-900 leading-none mt-1">{meet.time.split(' ')[0]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{meet.company}</h4>
                    <span className={`w-2 h-2 rounded-full mt-1 ${meet.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{meet.type}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${meet.score}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score: {meet.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-5 bg-slate-50 text-slate-400 border border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors">
            View All Pending Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
