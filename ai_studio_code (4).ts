import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  '“El éxito es la suma de pequeños esfuerzos repetidos día tras día.” 🚀',
  '“Estás a un paso de dominar esta materia. ¡Confía en tu capacidad!” 💡',
  '“Cada concepto que aprendes hoy es tu ventaja en el examen de mañana.” ✨',
];

export const ModernExamLoader: React.FC<{ subject: string }> = ({ subject }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(14);

  useEffect(() => {
    const q = setInterval(() => setQuoteIndex((p) => (p + 1) % MOTIVATIONAL_QUOTES.length), 3000);
    const pr = setInterval(() => setProgress((p) => (p >= 96 ? 96 : p + 4)), 400);
    return () => { clearInterval(q); clearInterval(pr); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d10]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-8 text-white">
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>Creando examen de {subject || 'Estudio'}</span>
      </div>
      <div className="my-auto flex flex-col items-center text-center max-w-md w-full">
        <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)]">
            <div className="w-full h-full rounded-full bg-[#121217] flex items-center justify-center text-3xl font-extrabold font-mono">
              {progress}%
            </div>
          </div>
        </div>
        <div className="w-full p-4 rounded-2xl bg-[#181820] border border-white/10">
          <p className="text-xs text-amber-400 font-bold mb-1 uppercase">⚡ Motivación</p>
          <p className="text-sm italic text-slate-200">{MOTIVATIONAL_QUOTES[quoteIndex]}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">Preparando examen oral y test escrito</p>
    </div>
  );
};