
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const StrategyRoom: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Fix: Manual implementation of base64 decoding following coding guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Fix: Manual implementation of audio decoding following coding guidelines
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

  // Fix: Manual implementation of base64 encoding following coding guidelines
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
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Fix: Use process.env.API_KEY exclusively for GoogleGenAI initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
              
              // Fix: Use sessionPromise.then to avoid race conditions when sending input
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(new Uint8Array(int16.buffer)),
                    // Fix: Use correct MIME type for raw PCM audio
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
              
              // Fix: Add ended listener for source cleanup
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Fix: Handle interruption messages to stop stale audio playback
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), message.serverContent!.outputTranscription!.text]);
            }
          },
          onerror: () => setStatus('Infrastructure Delay'),
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: "You are the Flowgent Strategic AI Agent. You consult founders on high-ticket lead conversion and n8n workflow optimization. Be concise and technical.",
          outputAudioTranscription: {}
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e: any) {
      console.error(e);
      setStatus('Access Denied');
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('Standby');
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    // Fix: Clear session promise reference
    sessionPromiseRef.current = null;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 p-12 max-w-5xl mx-auto">
      <div className="text-center space-y-8">
        <h2 className="text-7xl font-black text-white tracking-tighter italic leading-none">Strategy Room</h2>
        <div className={`inline-flex items-center gap-4 px-8 py-3 rounded-full border shadow-2xl transition-all ${isActive ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{status}</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[80px] p-24 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        {isActive ? (
          <div className="flex flex-col items-center gap-16 w-full">
            <div className="flex gap-3 h-32 items-center">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-2 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}></div>
              ))}
            </div>
            <div className="w-full bg-white/5 p-12 rounded-[48px] border border-white/10 min-h-[160px] backdrop-blur-md">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Neural Feed</p>
              {transcription.length > 0 ? transcription.map((t, i) => (
                <p key={i} className="text-md font-black text-slate-200 italic leading-relaxed">"{t}"</p>
              )) : <p className="text-slate-600 italic">Listening for strategic instructions...</p>}
            </div>
            <button onClick={stopSession} className="bg-red-600 text-white font-black px-16 py-6 rounded-3xl text-xs uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-2xl italic">Disconnect Path</button>
          </div>
        ) : (
          <div className="text-center space-y-12">
            <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(37,99,235,0.4)] hover:scale-105 transition-all cursor-pointer group" onClick={startSession}>
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </div>
            <button onClick={startSession} className="bg-white text-slate-900 font-black px-20 py-8 rounded-[32px] text-sm uppercase tracking-[0.4em] hover:bg-slate-100 shadow-2xl italic">Sync Strategic Node</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyRoom;
