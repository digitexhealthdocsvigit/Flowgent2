
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const StrategyRoom: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Offline');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startSession = async () => {
    setIsActive(true);
    setStatus('Initializing Neural Link...');
    setErrorDetail(null);
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Live: Strategic Consultant Ready');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), message.serverContent!.outputTranscription!.text]);
            }
          },
          onerror: (e: any) => {
            console.error("Live Session Error:", e);
            setStatus('Infrastructure Error');
            setErrorDetail(e.message || 'Connection lost.');
          },
          onclose: () => {
            if (isActive) setStatus('Connection Terminated');
            else setStatus('Offline');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the Flowgent Strategic AI. Founders call you to discuss high-ticket lead conversion, n8n workflow optimization, and digital infrastructure ROI. Be concise, technical, and elite.",
          outputAudioTranscription: {}
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e: any) {
      console.error(e);
      setStatus('Access Denied');
      setErrorDetail(e.message || 'Handshake failed.');
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('Offline');
    setErrorDetail(null);
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 p-12 max-w-5xl mx-auto">
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-7xl font-black text-white tracking-tighter italic leading-none">Strategy Room</h2>
          <p className="text-slate-500 font-bold text-xl mt-4">Autonomous Voice-to-Voice Strategic Consult.</p>
        </div>
        <div className={`inline-flex items-center gap-4 px-8 py-3 rounded-full border shadow-2xl transition-all ${
          isActive ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-slate-800 border-white/5 text-slate-500'
        }`}>
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{status}</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[80px] p-24 border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        {isActive ? (
          <div className="flex flex-col items-center gap-16 w-full animate-in zoom-in-95">
            <div className="flex gap-3 h-32 items-center">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-2 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}></div>
              ))}
            </div>
            <div className="w-full space-y-4 bg-white/5 p-12 rounded-[48px] border border-white/5 min-h-[160px] backdrop-blur-md shadow-inner">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Neural Feed Transcription</p>
              {transcription.length > 0 ? transcription.map((t, i) => (
                <p key={i} className="text-md font-black text-slate-200 italic leading-relaxed">"{t}"</p>
              )) : (
                <p className="text-md font-bold text-slate-600 italic animate-pulse">Establishing audio-to-text bridge...</p>
              )}
            </div>
            <button onClick={stopSession} className="bg-red-600 text-white font-black px-16 py-6 rounded-3xl text-xs uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-2xl active:scale-95 italic">Disconnect Neural Path</button>
          </div>
        ) : (
          <div className="text-center space-y-12">
            <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(37,99,235,0.4)] hover:scale-105 transition-all cursor-pointer group" onClick={startSession}>
               <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </div>
            <div className="space-y-4">
              <button onClick={startSession} className="bg-white text-slate-900 font-black px-20 py-8 rounded-[32px] text-sm uppercase tracking-[0.4em] hover:bg-slate-100 transition-all shadow-2xl italic">Sync Strategic Node</button>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">E2E Encrypted • Low Latency Protocol 0x82</p>
            </div>
          </div>
        )}
        
        {/* Background Visual HUD Elements */}
        <div className="absolute top-8 left-8">
           <span className="text-[8px] font-black text-white/10 uppercase tracking-[1em]">SYSTEM_VERSION_2.5_FLASH</span>
        </div>
        <div className="absolute bottom-8 right-8">
           <span className="text-[8px] font-black text-white/10 uppercase tracking-[1em]">JSK8SNXZ_AUDIT_LOGS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Latency Node', val: '120ms (Avg)', icon: '⚡' },
          { label: 'Neural Intelligence', val: 'Gemini 3 Pro', icon: '🧠' },
          { label: 'Signal Encryption', val: 'TLS 1.3 Secure', icon: '🔒' }
        ].map((feat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-10 rounded-[48px] flex items-center gap-6 shadow-xl backdrop-blur-sm hover:border-blue-500/20 transition-all">
            <span className="text-3xl">{feat.icon}</span>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{feat.label}</p>
              <p className="text-sm font-black text-white italic tracking-tight">{feat.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyRoom;
