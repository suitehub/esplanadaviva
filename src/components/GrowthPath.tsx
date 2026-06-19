import React, { useState } from 'react';
import { Compass, Gift, Award, Check, Play, User } from 'lucide-react';
import { UserProfileData, Milestone } from '../types';
import { INITIAL_MILESTONES } from '../initialData';

interface GrowthPathProps {
  user: UserProfileData;
}

export default function GrowthPath({ user }: GrowthPathProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(INITIAL_MILESTONES[0]);

  // Determine current active milestone index based on user's accumulated XP
  const getCurrentMilestoneIndex = () => {
    let activeIdx = -1;
    for (let i = 0; i < INITIAL_MILESTONES.length; i++) {
      if (user.xp >= INITIAL_MILESTONES[i].xpRequired) {
        activeIdx = i;
      }
    }
    return activeIdx;
  };

  const activeIndex = getCurrentMilestoneIndex();
  const nextMilestone = INITIAL_MILESTONES.find((m) => user.xp < m.xpRequired) || null;
  const remainingXp = nextMilestone ? nextMilestone.xpRequired - user.xp : 0;

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Title block */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Trilha de Evolução</h3>
          <p className="text-xs text-slate-500">Sua jornada espiritual representada passo a passo</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87]">
          <Compass className="w-5 h-5" />
        </div>
      </div>

      {/* Dynamic Status Counter Box */}
      <div className="bg-[#FAF9F5] border border-[#e5e0d5] p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block font-mono">Próxima Parada</span>
          <p className="text-xs font-bold text-slate-700 mt-1">
            {nextMilestone 
              ? `Faltam ${remainingXp} XP para alcançar o nível "${nextMilestone.title}"`
              : '🎉 Excelente! Você completou toda a trilha espiritual!'}
          </p>
        </div>
        {nextMilestone && (
          <div className="bg-[#005c53]/10 text-[#005c53] text-xs font-black font-mono px-3 py-1.5 rounded-lg border border-[#005c53]/25 shrink-0">
            {Math.round((user.xp / nextMilestone.xpRequired) * 100)}% Completos
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Game Trail winding display on left (7 cols) */}
        <div className="md:col-span-7 bg-white border border-[#e5e0d5] rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-sm">
          
          {/* Timeline track illustration */}
          <div className="absolute w-1 bg-slate-100 left-1/2 top-4 bottom-4 -translate-x-1/2 z-0 pointer-events-none" />

          {/* Glowing Trail highlights */}
          {activeIndex >= 0 && (
            <div 
              className="absolute w-1 bg-[#004b87] left-1/2 top-4 z-0 pointer-events-none transition-all duration-1000" 
              style={{ height: `${((activeIndex + 1) / INITIAL_MILESTONES.length) * 85}%` }}
            />
          )}

          {/* Interactive Checkpoints */}
          <div className="w-full space-y-14 relative z-10 py-6">
            {INITIAL_MILESTONES.map((milestone, index) => {
              const isPassed = user.xp >= milestone.xpRequired;
              const isCurrent = index === activeIndex + 1;
              const isSelected = selectedMilestone?.id === milestone.id;

              // Positioning offset to create visual winding effect (zigzag)
              const aligns = ['self-start pl-8 mr-auto sm:mr-28', 'self-end pr-8 ml-auto sm:ml-28', 'self-start pl-8 mr-auto sm:mr-28', 'self-end pr-8 ml-auto sm:ml-28'];
              const alignClass = aligns[index % 4];

              return (
                <div 
                  key={milestone.id} 
                  id={`milestone-node-${milestone.id}`}
                  className={`flex flex-col items-center w-max ${alignClass} hover:scale-105 transition-transform`}
                >
                  <button
                    onClick={() => setSelectedMilestone(milestone)}
                    id={`btn-milestone-node-${milestone.id}`}
                    className={`w-14 h-14 rounded-full border-4 flex items-center justify-center relative cursor-pointer shadow-sm group transition-all duration-300 ${
                      isSelected
                        ? 'border-[#b48a30] bg-white text-[#b48a30]'
                        : isPassed
                        ? 'border-[#004b87]/30 bg-[#004b87] text-white shadow-[#004b87]/20'
                        : 'border-[#e5e0d5] bg-[#FAF9F5] text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {/* Visual status indicators inside trail node */}
                    {isPassed ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#004b87] opacity-30"></span>
                        <Play className="w-4 h-4 text-[#004b87] fill-[#004b87] rotate-90" />
                      </div>
                    ) : (
                      <span className="text-xs font-black font-mono text-slate-400 group-hover:text-slate-600 select-none">
                        {milestone.months}M
                      </span>
                    )}

                    {/* Miniature Floating Avatar Position if they are standing on this gate index */}
                    {((isPassed && !INITIAL_MILESTONES[index+1]) || (isCurrent && index === 0) || (isCurrent && activeIndex === index-1)) && (
                      <div className="absolute -top-7 -right-2 z-20 bg-[#004b87] text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-bounce flex items-center gap-1 shadow-md">
                        <User className="w-2.5 h-2.5" />
                        VOCÊ
                      </div>
                    )}
                  </button>

                  <span className={`text-[11px] font-extrabold mt-2 tracking-wide font-mono ${
                    isSelected ? 'text-[#b48a30]' : isPassed ? 'text-slate-800 font-bold' : 'text-slate-400'
                  }`}>
                    {milestone.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Context Information panel on right (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-[#FAF9F5] pb-2">
              <Award className="w-4 h-4 text-[#004b87]" />
              Detalhes do Marco
            </h4>

            {selectedMilestone ? (
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#004b87] uppercase font-mono font-black">Meta de {selectedMilestone.months} {selectedMilestone.months === 1 ? 'Mês' : 'Meses'}</span>
                  <p id="milestone-detail-title" className="text-base font-black text-[#0f2646]">{selectedMilestone.title}</p>
                </div>

                <p className="text-xs text-slate-650 leading-relaxed font-sans font-medium">
                  {selectedMilestone.description}
                </p>

                <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#e5e0d5] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#b48a30] font-black">
                    <Gift className="w-4 h-4 shrink-0" />
                    <span>Benefícios de Evolução:</span>
                  </div>
                  <p className="text-slate-750 pl-6 leading-relaxed font-mono text-[11px]">
                    {selectedMilestone.rewardText}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <span>Requisitos:</span>
                  <span className="font-mono font-black text-[#004b87]">{selectedMilestone.xpRequired} XP</span>
                </div>

                {user.xp >= selectedMilestone.xpRequired ? (
                  <div className="bg-emerald-55 bg-[#059669]/5 border border-emerald-250 text-emerald-800 py-2.5 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                    ✓ Conquistado e Liberado
                  </div>
                ) : (
                  <div className="bg-[#FAF9F5] border border-[#e5e0d5] text-slate-400 py-2.5 px-3 rounded-xl text-xs font-semibold text-center leading-normal">
                    Falta {selectedMilestone.xpRequired - user.xp} XP para obter
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Selecione um marco ao lado para visualizar os prêmios e certificados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
