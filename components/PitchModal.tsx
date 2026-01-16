
import React, { useState } from 'react';
import { Lead } from '../types';

interface PitchModalProps {
  lead: Lead;
  pitch: string;
  onClose: () => void;
}

const PitchModal: React.FC<PitchModalProps> = ({ lead, pitch, onClose }) => {
  const [editedPitch, setEditedPitch] = useState(pitch);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedPitch);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encodedPitch = encodeURIComponent(editedPitch);
    let phone = lead.phone?.replace(/\D/g, '') || '';
    
    // Ensure +91 prefix for Indian market if not present
    if (phone.length === 10) {
      phone = '91' + phone;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodedPitch}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Growth Strategy & Digital Audit for ${lead.business_name}`);
    const body = encodeURIComponent(editedPitch);
    const email = lead.email || '';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 bg-[#030712]/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6">
      <div className="bg-white rounded-[48px] max-w-2xl w-full p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Communication Bridge</span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-2 italic">Neural Outreach Node</h3>
            <p className="text-slate-500 font-bold mt-1">Targeting: <span className="text-slate-900">{lead.business_name}</span></p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Generated Payload</label>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{editedPitch.length} characters</span>
            </div>
            <textarea 
              value={editedPitch}
              onChange={(e) => setEditedPitch(e.target.value)}
              className="w-full h-64 bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-medium text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all resize-none custom-scrollbar shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleWhatsApp}
              className="bg-[#25D366] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Dispatch WA</span>
            </button>
            <button 
              onClick={handleEmail}
              className="bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>Send Email</span>
            </button>
            <button 
              onClick={handleCopy}
              className={`${isCopied ? 'bg-green-600' : 'bg-slate-900'} text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all`}
            >
              <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          
          <div className="flex justify-between items-center px-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Target Node: {lead.phone || lead.email || 'Manual Dispatch'}</p>
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest italic animate-pulse">Neural Path Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchModal;
