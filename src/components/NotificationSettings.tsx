import React, { useState } from 'react';
import { Bell, Clock, Volume2, Shield } from 'lucide-react';
import { NotificationSettingsData } from '../types';

interface NotificationProps {
  initialConfig: NotificationSettingsData;
  onSaveConfig: (updated: NotificationSettingsData) => void;
  triggerMockNotification: (text: string) => void;
}

export default function NotificationSettings({ 
  initialConfig, 
  onSaveConfig, 
  triggerMockNotification 
}: NotificationProps) {
  const [remindLesson, setRemindLesson] = useState(initialConfig.remindLesson);
  const [remindStreak, setRemindStreak] = useState(initialConfig.remindStreak);
  const [remindProgression, setRemindProgression] = useState(initialConfig.remindProgression);
  const [lessonTime, setLessonTime] = useState(initialConfig.lessonTime);
  const [useSound, setUseSound] = useState(true);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      remindLesson,
      remindStreak,
      remindProgression,
      lessonTime
    });
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 3000);
  };

  const handleTriggerTest = (sampleText: string) => {
    triggerMockNotification(sampleText);
  };

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Title */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Configurar Alertas</h3>
          <p className="text-xs text-slate-500">Ajuste os lembretes diários para manter firme sua devoção</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87]">
          <Bell className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-5">
        <h4 className="text-xs font-black text-slate-550 uppercase tracking-widest block border-b border-[#FAF9F5] pb-2">Alvos de Lembrete Diário</h4>

        <div className="space-y-4">
          
          {/* Rule 1 */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-[#FAF9F5] border border-transparent hover:border-[#cbd5e1] transition-all">
            <div className="text-left">
              <span className="text-sm font-extrabold text-[#0f2646] block">Estudo da Escola Sabatina</span>
              <p className="text-xs text-slate-500 mt-1 leading-normal">"Você já estudou sua lição da Escola Sabatina hoje?"</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-remind-lesson"
                type="checkbox"
                checked={remindLesson}
                onChange={(e) => setRemindLesson(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:dark:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004b87]"></div>
            </label>
          </div>

          {/* Time Selector for Daily Lesson */}
          {remindLesson && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-[#e5e0d5] flex items-center justify-between ml-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold text-left">
                <Clock className="w-4 h-4 text-[#004b87]" />
                <span>Horário agendado do lembrete:</span>
              </div>
              <input
                id="input-lesson-time"
                type="time"
                value={lessonTime}
                onChange={(e) => setLessonTime(e.target.value)}
                className="bg-white border border-[#e5e0d5] rounded-xl px-2.5 py-1 text-xs text-[#004b87] font-extrabold font-mono outline-none focus:border-[#004b87]"
              />
            </div>
          )}

          {/* Rule 2 */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-[#FAF9F5] border border-transparent hover:border-[#cbd5e1] transition-all">
            <div className="text-left">
              <span className="text-sm font-extrabold text-[#0f2646] block">Sequência Diária (Contador de dias)</span>
              <p className="text-xs text-slate-500 mt-1 leading-normal">"Seu streak espiritual está em risco de expirar!"</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-remind-streak"
                type="checkbox"
                checked={remindStreak}
                onChange={(e) => setRemindStreak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004b87]"></div>
            </label>
          </div>

          {/* Rule 3 */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-[#FAF9F5] border border-transparent hover:border-[#cbd5e1] transition-all">
            <div className="text-left">
              <span className="text-sm font-extrabold text-[#0f2646] block">Nível & Medalhas (Meta de Progresso)</span>
              <p className="text-xs text-slate-500 mt-1 leading-normal">"Faltam poucos pontos de XP para seu novo posto!"</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-remind-progression"
                type="checkbox"
                checked={remindProgression}
                onChange={(e) => setRemindProgression(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004b87]"></div>
            </label>
          </div>

          {/* Optional Audio alerts toggle */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-[#FAF9F5] border border-transparent hover:border-[#cbd5e1] transition-all">
            <div className="text-left">
              <span className="text-sm font-extrabold text-[#0f2646] block">Sons de Sino Devocional</span>
              <p className="text-xs text-slate-500 mt-1 leading-normal">Tocar som instrumental suave ao receber avisos no painel.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-use-sound"
                type="checkbox"
                checked={useSound}
                onChange={(e) => setUseSound(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004b87]"></div>
            </label>
          </div>

        </div>

        {showSavedMsg && (
          <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3 text-emerald-800 text-xs font-bold text-center">
            ✓ Preferências de lembretes salvas no Esplanada Viva!
          </div>
        )}

        <button
          id="btn-save-notif-config"
          type="submit"
          className="w-full bg-[#004b87] hover:bg-[#003a6b] text-white font-[#b48a30] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <img src="" alt="" className="hidden" />
          <Shield className="w-4 h-4 text-white" />
          Salvar Mapeamento de Lembretes
        </button>
      </form>

      {/* Immediate Notification Testing Suite */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4 text-left">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest block flex items-center gap-2 border-b border-[#FAF9F5] pb-2">
          <Volume2 className="w-4 h-4 text-[#b48a30]" />
          Disparador de Pistas Instântaneo
        </h4>
        <p className="text-xs text-slate-500 leading-normal">
          Clique em qualquer botão abaixo para acionar e simular imediatamente os alertas no topo da tela:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            id="btn-test-notif-lesson"
            onClick={() => handleTriggerTest('Você já estudou sua lição da Escola Sabatina hoje? Complete-a para manter seu streak!')}
            className="bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87] p-3 rounded-2xl text-xs text-slate-700 hover:text-[#004b87] text-left cursor-pointer transition-all flex flex-col justify-between"
          >
            <span className="text-[9px] text-[#004b87] font-black uppercase font-mono mb-1 leading-none">Escola Sabatina</span>
            <span className="font-extrabold line-clamp-1 mt-1">"Você já estudou sua lição?"</span>
          </button>

          <button
            id="btn-test-notif-streak"
            onClick={() => handleTriggerTest('Alerta crítico: sua sequência de dias espirituais consecutivos está em risco de expirar!')}
            className="bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87] p-3 rounded-2xl text-xs text-slate-700 hover:text-[#004b87] text-left cursor-pointer transition-all flex flex-col justify-between"
          >
            <span className="text-[9px] text-orange-600 font-black uppercase font-mono mb-1 leading-none">Streak em Risco</span>
            <span className="font-extrabold line-clamp-1 mt-1">"Sua sequência está em risco..."</span>
          </button>

          <button
            id="btn-test-notif-progression"
            onClick={() => handleTriggerTest('Faltam apenas 85 pontos de XP para você elevar ao Nível de Discípulo!')}
            className="bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87] p-3 rounded-2xl text-xs text-slate-700 hover:text-[#004b87] text-left cursor-pointer transition-all flex flex-col justify-between"
          >
            <span className="text-[9px] text-[#005c53] font-black uppercase font-mono mb-1 leading-none">Posto Superior</span>
            <span className="font-extrabold line-clamp-1 mt-1">"Faltam poucos pontos de XP..."</span>
          </button>

          <button
            id="btn-test-notif-encourage"
            onClick={() => handleTriggerTest('Não desista! "O Senhor te guiará continuamente". Siga avançando nos estudos bíblicos hoje!')}
            className="bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87] p-3 rounded-2xl text-xs text-slate-700 hover:text-[#004b87] text-left cursor-pointer transition-all flex flex-col justify-between"
          >
            <span className="text-[9px] text-[#b48a30] font-black uppercase font-mono mb-1 leading-none">Verso de Encorajamento</span>
            <span className="font-extrabold line-clamp-1 mt-1">"Continue avançando na jornada..."</span>
          </button>
        </div>
      </div>
    </div>
  );
}
