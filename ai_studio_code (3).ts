import React, { useState } from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';

export const ExamsDashboard: React.FC<{ onOpenNewExamModal: () => void; onOpenPreset: (id: string) => void }> = ({
  onOpenNewExamModal,
  onOpenPreset,
}) => {
  const [preparations] = useState([
    { id: '1', title: 'Competencias comunicativas y códigos', progress: 3, time: 'hace 2 días', topics: '0 de 5 temas', preset: 'historia_rev_francesa' },
    { id: '2', title: 'Célula Vegetal, Orgánulos Y Funciones', progress: 12, time: 'hace 4 días', topics: '1 de 6 temas', preset: 'bio_celular' },
  ]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c22] text-xs font-semibold text-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Buscar</span>
        </button>
        <button onClick={onOpenNewExamModal} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1c22] text-xs font-semibold text-slate-200">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo examen</span>
        </button>
      </div>

      <div className="flex items-center gap-1 text-lg font-bold mb-4">
        <span>Mis preparaciones de examen</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-3.5 mb-8">
        {preparations.map((prep) => (
          <div key={prep.id} className="bg-[#18181d] border border-white/5 rounded-3xl p-5 shadow-xl">
            <h3 className="text-base font-bold mb-3">{prep.title}</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1.5 bg-[#25252d] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${prep.progress}%` }} />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{prep.progress}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{prep.time} &bull; {prep.topics}</span>
              <button onClick={() => onOpenPreset(prep.preset)} className="px-5 py-2 rounded-full bg-[#2563eb] text-white font-bold text-xs">
                Continuar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};