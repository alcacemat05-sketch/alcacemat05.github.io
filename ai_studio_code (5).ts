import React, { useState, useRef } from 'react';
import { Camera, Mic, Send, X, Plus } from 'lucide-react';

export const BottomConsole: React.FC<{
  onSendMessage: (text: string, image?: any) => void;
  onOpenLiveVoice: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  onTriggerExamFromNotes: () => void;
}> = ({ onSendMessage, onOpenLiveVoice, isListening, onToggleListening, onTriggerExamFromNotes }) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => setAttachedImage({ data: e.target?.result as string, mimeType: file.type, name: file.name });
    r.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    onSendMessage(inputText.trim(), attachedImage);
    setInputText('');
    setAttachedImage(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-2 relative z-30">
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
      <div className="bg-[#1c1c20] border border-white/10 rounded-[28px] p-3 shadow-2xl">
        {attachedImage && (
          <div className="flex items-center justify-between p-2 mb-2 bg-[#121215] rounded-xl border border-blue-500/40 text-xs">
            <span className="truncate max-w-[200px]">{attachedImage.name} (Foto de tarea lista)</span>
            <button onClick={() => setAttachedImage(null)}><X className="w-4 h-4 text-rose-400" /></button>
          </div>
        )}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta, habla o envía una foto de tarea"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none mb-2 px-1"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onTriggerExamFromNotes} className="w-9 h-9 rounded-full bg-[#27272d] flex items-center justify-center text-slate-300">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {(inputText.trim() || attachedImage) && (
              <button onClick={handleSend} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            )}
            <button onClick={onToggleListening} className={`w-9 h-9 rounded-full flex items-center justify-center ${isListening ? 'bg-rose-600' : 'bg-[#27272d]'}`}>
              <Mic className="w-4 h-4 text-white" />
            </button>
            <button onClick={onOpenLiveVoice} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#27272d] text-white text-xs font-semibold">
              <span>Hablar</span>
              <div className="flex items-center gap-0.5">
                <span className="w-[2px] h-2.5 bg-white rounded-full" />
                <span className="w-[2px] h-4 bg-white rounded-full" />
                <span className="w-[2px] h-2 bg-white rounded-full" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};