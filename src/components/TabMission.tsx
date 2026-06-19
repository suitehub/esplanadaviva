import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, Lock, Medal, MessageSquare, AlertTriangle, Plus, Sparkles } from 'lucide-react';
import { MissionChallenge } from '../types';

interface TabMissionProps {
  missions: MissionChallenge[];
  userLevel: number;
  onCompleteMission: (missionId: string, notes: string) => void;
}

export default function TabMission({ missions, userLevel, onCompleteMission }: TabMissionProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [missionNotes, setMissionNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'disponiveis' | 'bloqueadas'>('disponiveis');
  const [successId, setSuccessId] = useState<string | null>(null);

  const availableMissions = missions.filter(m => m.isActive && userLevel >= m.levelRequired);
  const lockedMissions = missions.filter(m => m.isActive && userLevel < m.levelRequired);

  const handleSubmitCompletion = (missionId: string) => {
    onCompleteMission(missionId, missionNotes);
    setSuccessId(missionId);
    setSelectedMissionId(null);
    setMissionNotes('');
    setTimeout(() => {
      setSuccessId(null);
    }, 4000);
  };

  const getDifficultyColor = (diff: 'fácil' | 'médio' | 'avançado') => {
    switch (diff) {
      case 'fácil': return 'bg-sky-50 text-sky-700 border-sky-250';
      case 'médio': return 'bg-amber-50 text-amber-700 border-amber-250';
      case 'avançado': return 'bg-rose-50 text-rose-700 border-rose-250';
    }
  };

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Upper header */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Segunda Aba: Missão e Discipulado</h3>
          <p className="text-xs text-slate-500">Leve a Mensagem de Esperança através de atos práticos de serviço</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-[#005c53]/10 text-[#005c53] font-mono text-xs font-black border border-[#005c53]/20 uppercase">
          MISSÃO
        </div>
      </div>

      {/* Local view selectors */}
      <div className="bg-[#FAF9F5] p-1 rounded-2xl grid grid-cols-2 gap-1 border border-[#e5e0d5]">
        <button
          id="btn-missions-available"
          onClick={() => setActiveTab('disponiveis')}
          className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'disponiveis' ? 'bg-[#005c53] text-white shadow-sm' : 'text-slate-500 hover:text-[#005c53]'
          }`}
        >
          Trabalho Ativo ({availableMissions.length})
        </button>
        <button
          id="btn-missions-locked"
          onClick={() => setActiveTab('bloqueadas')}
          className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'bloqueadas' ? 'bg-[#005c53] text-white shadow-sm' : 'text-slate-500 hover:text-[#005c53]'
          }`}
        >
          Desbloqueia Próximo Nível ({lockedMissions.length})
        </button>
      </div>

      {/* MAIN MISSION GRID */}
      <div className="space-y-4">
        {activeTab === 'disponiveis' ? (
          availableMissions.length === 0 ? (
            <div className="bg-white border border-[#e5e0d5] p-8 rounded-3xl text-center text-slate-450 text-sm shadow-sm">
              Nenhum desafio ativo para o seu nível atual. Estude a lição e leia a Bíblia para subir de nível!
            </div>
          ) : (
            availableMissions.map((mission) => {
              const isSelected = selectedMissionId === mission.id;
              const hasFinished = successId === mission.id;

              return (
                <div
                  key={mission.id}
                  id={`mission-card-${mission.id}`}
                  className={`bg-white border rounded-3xl p-5 transition-all duration-300 relative overflow-hidden shadow-sm text-left ${
                    isSelected ? 'border-[#005c53] shadow-md' : 'border-[#e5e0d5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 my-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                        <span className="bg-[#FAF9F5] text-[#b48a30] border border-[#e5e0d5] px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
                          +{mission.xpReward} XP Recompensa
                        </span>
                        <span className="text-[10px] text-slate-450 font-mono font-bold">Realizada {mission.completedCount}x</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#0f2646] mt-2 leading-tight">{mission.title}</h4>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#005c53]/10 border border-[#005c53]/20 flex items-center justify-center text-[#005c53] shrink-0">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {mission.description}
                  </p>

                  {/* Completion box */}
                  <div className="mt-4 pt-4 border-t border-[#FAF9F5]">
                    {hasFinished ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold text-center">
                        🎉 Relatório entregue! Recebeu +{mission.xpReward} XP pela missão!
                      </div>
                    ) : isSelected ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label id={`lbl-notes-${mission.id}`} className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Diário de Campo (Como foi realizar essa missão?)</label>
                          <textarea
                            id={`notes-input-${mission.id}`}
                            value={missionNotes}
                            onChange={(e) => setMissionNotes(e.target.value)}
                            placeholder="Anote nomes de pessoas assistidas, orações partilhadas ou frutos vistos..."
                            className="w-full h-20 bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 font-sans outline-none resize-none focus:border-[#005c53] shadow-inner"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            id={`btn-cancel-mission-${mission.id}`}
                            onClick={() => {
                              setSelectedMissionId(null);
                              setMissionNotes('');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            id={`btn-submit-mission-${mission.id}`}
                            onClick={() => handleSubmitCompletion(mission.id)}
                            className="flex-1 bg-[#005c53] hover:opacity-90 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Registrar Relatório
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`btn-open-completion-${mission.id}`}
                        onClick={() => setSelectedMissionId(mission.id)}
                        className="w-full bg-[#FAF9F5] hover:bg-slate-50 text-[#005c53] border border-[#e5e0d5] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:border-[#005c53]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Completar Desafio (+{mission.xpReward} XP)
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          lockedMissions.length === 0 ? (
            <div className="bg-white border border-[#e5e0d5] p-8 rounded-3xl text-center text-slate-400 text-sm shadow-sm">
              Você já está capacitado para desempenhar todas as missões conhecidas no catálogo!
            </div>
          ) : (
            lockedMissions.map((mission) => (
              <div
                key={mission.id}
                id={`mission-locked-${mission.id}`}
                className="bg-white border border-[#e5e0d5] rounded-3xl p-5 opacity-60 relative overflow-hidden text-left"
              >
                {/* Padlock Icon Background decoration */}
                <div className="absolute right-4 top-4 text-slate-300">
                  <Lock className="w-10 h-10 stroke-[1.5]" />
                </div>

                <div className="space-y-1 z-10 relative">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black uppercase text-[8px] bg-slate-100 border border-slate-200 text-slate-500 font-mono">
                      Bloqueado
                    </span>
                    <span className="text-[10px] text-[#b48a30] font-bold font-mono">
                      Desbloqueia no Nível {mission.levelRequired}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-400 mt-2 leading-tight">{mission.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">
                    {mission.description}
                  </p>
                  <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Recompensa: +{mission.xpReward} XP</span>
                    <span>Dificuldade: {mission.difficulty}</span>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
