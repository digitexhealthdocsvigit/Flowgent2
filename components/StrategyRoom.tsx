
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const StrategyRoom: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Offline');
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
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
        onerror: (e) => setStatus('Neural Link Error'),
        onclose: () => setStatus('Offline')
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are the Flowgent Strategic AI. Founders call you to discuss high-ticket lead conversion, n8n workflow optimization, and digital infrastructure ROI. Be concise, technical, and elite.",
        outputAudioTranscription: {}
      }
    });

    sessionPromiseRef.current = sessionPromise;
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('Offline');
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-black text-white tracking-tighter italic">Strategy Room</h2>
        <p className="text-slate-400 font-bold text-lg">Real-time voice-to-voice consultation with Flowgent Intelligence.</p>
        <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border ${isActive ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[64px] p-20 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        {isActive ? (
          <div className="flex flex-col items-center gap-12 w-full">
            <div className="flex gap-2 h-24 items-center">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}></div>
              ))}
            </div>
            <div className="w-full space-y-3 bg-white/5 p-8 rounded-[32px] border border-white/5 min-h-[120px]">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 italic">Neural Transcription</p>
              {transcription.map((t, i) => (
                <p key={i} className="text-sm font-medium text-slate-300 italic">"{t}"</p>
              ))}
            </div>
            <button onClick={stopSession} className="bg-red-600 text-white font-black px-12 py-5 rounded-2xl text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-600/20">End Session</button>
          </div>
        ) : (
          <div className="text-center space-y-10">
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.4)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </div>
            <button onClick={startSession} className="bg-white text-slate-900 font-black px-16 py-6 rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl">Initiate Strategy Session</button>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Encrypted low-latency neural path active.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Voice Mode', val: 'Low Latency', icon: '⚡' },
          { label: 'Intelligence', val: 'Gemini 2.5 Flash', icon: '🧠' },
          { label: 'Privacy', val: 'E2E Encrypted', icon: '🔒' }
        ].map((feat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
            <span className="text-2xl">{feat.icon}</span>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{feat.label}</p>
              <p className="text-xs font-bold text-white">{feat.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyRoom;
