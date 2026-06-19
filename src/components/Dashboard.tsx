import React from 'react';
import { motion } from 'motion/react';
import { Flame, Star, BookOpen, PenTool, HeartHandshake, Compass, Award, CalendarCheck, HelpCircle, CheckCircle2, Globe, ExternalLink, ShieldAlert, User } from 'lucide-react';
import { UserProfileData } from '../types';
import AvatarOfProgress from './AvatarOfProgress';
import { LEVEL_STEPS } from '../initialData';

interface DashboardProps {
  user: UserProfileData;
  dailyStatus: {
    lessonCompleted: boolean;
    bibleCompleted: boolean;
    reflectionCompleted: boolean;
    missionCompleted: boolean;
  };
  onQuickAction: (action: 'licao' | 'bible' | 'reflection' | 'mission' | 'path' | 'medals' | 'admin') => void;
  isAdminUser?: boolean;
}

export default function Dashboard({ user, dailyStatus, onQuickAction, isAdminUser }: DashboardProps) {
  // Calculate daily progress percentage
  const completedCount = [
    dailyStatus.lessonCompleted,
    dailyStatus.bibleCompleted,
    dailyStatus.reflectionCompleted,
    dailyStatus.missionCompleted,
  ].filter(Boolean).length;

  const dailyPercentage = completedCount * 25;

  // Next level calculations
  const currentStep = LEVEL_STEPS.find(s => s.level === user.level) || { minXp: 0, title: 'Iniciante' };
  const nextStep = LEVEL_STEPS.find(s => s.level === user.level + 1) || { minXp: 12000 };
  
  const xpInCurrentLevel = Math.max(0, user.xp - currentStep.minXp);
  const xpNeededInCurrentLevel = Math.max(1, nextStep.minXp - currentStep.minXp);
  const xpProgressPercentage = Math.min(Math.max((xpInCurrentLevel / xpNeededInCurrentLevel) * 100, 0), 100);

  // Determine next milestone
  const getNextRewardText = () => {
    if (user.level < 2) return 'Ebook Devocional aos 500 XP';
    if (user.level < 3) return 'Selo de Praticante aos 1500 XP';
    if (user.level < 4) return 'Lembrança do Influenciador aos 3000 XP';
    if (user.level < 5) return 'Chaveiro do Pescador aos 5000 XP';
    return 'Bíblia de Estudos Especial aos 8000 XP';
  };

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* 👑 Highly Explicit Admin Panel Prompt/Banner at the Top */}
      {isAdminUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-500/10 via-rose-600/10 to-transparent border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-rose-800 uppercase tracking-wide">Controle Administrativo</h5>
              <p className="text-[11px] text-rose-700/90 leading-tight">
                Você possui permissões de Administrador neste distrito. Gerencie membros, trilhas e visualize estatísticas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onQuickAction('admin')}
            className="text-[10px] font-black uppercase text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Abrir Painel
          </button>
        </motion.div>
      )}

      {/* HUD Header Card */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#004b87]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Progress Avatar */}
          <div className="shrink-0 relative">
            <AvatarOfProgress 
              gender={user.gender} 
              level={user.level} 
              size="lg" 
              skinColor={user.skinColor}
              hairColor={user.hairColor}
              clothingColor={user.clothingColor}
              eyeStyle={user.eyeStyle}
              hairStyle={user.hairStyle}
              hasBeard={user.hasBeard}
              hasGlasses={user.hasGlasses}
            />
          </div>

          {/* User Status Details */}
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div>
              <span className="text-[9px] font-black text-[#b48a30] font-mono tracking-widest uppercase bg-[#FAF9F5] border border-[#e5e0d5] px-2.5 py-1 rounded-full">
                Discípulo Ativo • {user.church ? `${user.church} • Distrito Esplanada` : 'Distrito Esplanada'}
              </span>
              <h3 id="dash-greeting" className="text-xl font-extrabold text-[#0f2646] truncate mt-2">
                {user.fullName}
              </h3>
            </div>

            {/* Level & XP Gauge - Re-structured to never break of horizontal limits */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF9F5]/85 border border-[#e5e0d5] text-left">
              <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-700 gap-1">
                <span>Nível {user.level} • <span className="text-[#b48a30] font-extrabold">{currentStep.title}</span></span>
                <span className="text-[#004b87] font-extrabold">{user.xp} XP total</span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                <motion.div 
                  id="xp-progress-bar"
                  className="h-full bg-gradient-to-r from-[#004b87] to-[#005c53] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgressPercentage}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              
              <div className="flex flex-wrap justify-between text-[10px] text-slate-500 font-bold font-mono">
                <span>{xpInCurrentLevel} / {xpNeededInCurrentLevel} XP nesta classe</span>
                <span className="text-slate-600">Restam {Math.max(0, nextStep.minXp - user.xp)} XP para o Nível {user.level + 1}</span>
              </div>
            </div>

            {/* Micro Gamified stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#FAF9F5] border border-[#e5e0d5] px-3 py-2 rounded-xl flex items-center justify-center sm:justify-start gap-2">
                <Flame className="w-5 h-5 text-orange-600 fill-orange-500/10 animate-pulse" />
                <div className="text-left">
                  <span className="text-[9px] text-slate-500 uppercase font-black block leading-none">Acesso Diário</span>
                  <span id="streak-counter" className="text-xs font-extrabold text-orange-700 font-mono">
                    {user.streakDays} {user.streakDays === 1 ? 'Dia' : 'Dias'} Seguidos
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF9F5] border border-[#e5e0d5] px-3 py-2 rounded-xl flex items-center justify-center sm:justify-start gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                <div className="text-left">
                  <span className="text-[9px] text-slate-500 uppercase font-black block leading-none">Pontos Atuais</span>
                  <span id="points-counter" className="text-xs font-extrabold text-[#b48a30] font-mono">
                    {user.totalPoints} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Sabbath School Lesson CPB Integration Callout Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-[#004b87]/5 border border-[#004b87]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#004b87]/15 flex items-center justify-center text-[#004b87] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-xs font-extrabold text-[#0f2646] uppercase tracking-wide">Lição da Escola Sabatina</h5>
            <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
              Estude diariamente o conteúdo impresso ou digital completo da Lição dos Adultos acessando o site oficial Mais CPB.
            </p>
          </div>
        </div>
        <a
          href="https://mais.cpb.com.br/licao-adultos/"
          target="_blank"
          referrerPolicy="no-referrer"
          className="text-xs bg-[#004b87] text-white hover:bg-[#003b6d] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
        >
          <span>Acessar Lição Completa</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Daily Progress Ring Dial & Targets Checklist */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#FAF9F5] pb-3">
          <CalendarCheck className="w-4 h-4 text-[#004b87]" />
          Alvos Diários de Crescimento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radial Wheel Chart */}
          <div className="md:col-span-4 flex flex-col items-center justify-center py-2 border-r border-[#FAF9F5] pr-0 md:pr-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* SVG Radial Wheel */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-[#FAF9F5] fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-[#004b87] fill-none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="301.6"
                  initial={{ strokeDashoffset: 301.6 }}
                  animate={{ strokeDashoffset: 301.6 - (301.6 * dailyPercentage) / 100 }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              {/* Inner Circle Information */}
              <div className="absolute text-center">
                <span id="percentage-label" className="text-2xl font-black text-[#0f2646] font-mono">{dailyPercentage}%</span>
                <span className="text-[9px] text-[#b48a30] block uppercase font-bold tracking-tight">Concluído</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center font-medium">
              {completedCount === 4 
                ? '⭐ Perfeito! Comunhão e missão completas hoje!' 
                : `${completedCount} de 4 conquistas hoje.`}
            </p>
          </div>

          {/* Core Daily Targets Checklist */}
          <div className="md:col-span-8 space-y-2.5">
            <div className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
              dailyStatus.lessonCompleted 
                ? 'bg-emerald-50 bg-[#059669]/5 border-emerald-200 text-emerald-850' 
                : 'bg-[#FAF9F5] border-[#e5e0d5] text-slate-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${dailyStatus.lessonCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-350'}`} />
                <span className="text-xs font-bold font-sans">1. Lição da Escola Sabatina</span>
              </div>
              <button 
                id="btn-goto-lesson"
                onClick={() => onQuickAction('licao')}
                className="text-xs font-bold text-[#004b87] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e0d5] shadow-inner"
              >
                {dailyStatus.lessonCompleted ? 'Revisar' : 'Estudar'}
              </button>
            </div>

            <div className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
              dailyStatus.bibleCompleted 
                ? 'bg-emerald-50 bg-[#059669]/5 border-emerald-200 text-emerald-850' 
                : 'bg-[#FAF9F5] border-[#e5e0d5] text-slate-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${dailyStatus.bibleCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-350'}`} />
                <span className="text-xs font-bold font-sans">2. Ano Bíblico do Dia</span>
              </div>
              <button 
                id="btn-goto-bible"
                onClick={() => onQuickAction('bible')}
                className="text-xs font-bold text-[#004b87] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e0d5] shadow-inner"
              >
                {dailyStatus.bibleCompleted ? 'Visualizar' : 'Ler Bíblia'}
              </button>
            </div>

            <div className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
              dailyStatus.reflectionCompleted 
                ? 'bg-emerald-50 bg-[#059669]/5 border-emerald-200 text-emerald-850' 
                : 'bg-[#FAF9F5] border-[#e5e0d5] text-slate-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${dailyStatus.reflectionCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-350'}`} />
                <span className="text-xs font-bold font-sans">3. Registro de Diário e Oração</span>
              </div>
              <button 
                id="btn-goto-reflection"
                onClick={() => onQuickAction('reflection')}
                className="text-xs font-bold text-[#004b87] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e0d5] shadow-inner"
              >
                {dailyStatus.reflectionCompleted ? 'Ver Diário' : 'Anotar'}
              </button>
            </div>

            <div className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
              dailyStatus.missionCompleted 
                ? 'bg-emerald-50 bg-[#059669]/5 border-emerald-200 text-emerald-850' 
                : 'bg-[#FAF9F5] border-[#e5e0d5] text-slate-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${dailyStatus.missionCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-350'}`} />
                <span className="text-xs font-bold font-sans">4. Ações de Apoio / Visita Cristã</span>
              </div>
              <button 
                id="btn-goto-mission"
                onClick={() => onQuickAction('mission')}
                className="text-xs font-bold text-[#004b87] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e0d5] shadow-inner"
              >
                {dailyStatus.missionCompleted ? 'Ver Outros' : 'Fazer Missão'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Launcher Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Acesso Rápido às Sub-seções</h4>
          <div className="flex items-center gap-1.5 bg-[#FDF8EB] px-2.5 py-1 rounded-full text-[9px] font-bold text-[#b48a30] border border-[#f5ebcb]">
            <Gift className="w-3 h-3 text-[#b48a30]" />
            <span>Próximo Benefício: {getNextRewardText()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            id="qa-btn-lesson"
            onClick={() => onQuickAction('licao')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87] group-hover:bg-[#004b87] group-hover:text-white transition-all">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#b48a30] tracking-wider font-mono">Escola Sabatina</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#004b87] transition-colors">Estudar Escola Sabatina</p>
            </div>
          </button>

          <button
            id="qa-btn-bible"
            onClick={() => onQuickAction('bible')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87] group-hover:bg-[#004b87] group-hover:text-white transition-all">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#b48a30] tracking-wider font-mono">Ano Bíblico</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#004b87] transition-colors">Leitura Diária</p>
            </div>
          </button>

          <button
            id="qa-btn-reflection"
            onClick={() => onQuickAction('reflection')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#005c53]/10 flex items-center justify-center text-[#005c53] group-hover:bg-[#005c53] group-hover:text-white transition-all">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#b48a30] tracking-wider font-mono">Diário da Alma</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#005c53] transition-colors">Registrar Reflexão</p>
            </div>
          </button>

          <button
            id="qa-btn-mission"
            onClick={() => onQuickAction('mission')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#005c53]/10 flex items-center justify-center text-[#005c53] group-hover:bg-[#005c53] group-hover:text-white transition-all">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#b48a30] tracking-wider font-mono">Discipulado</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#005c53] transition-colors">Fazer Missão</p>
            </div>
          </button>

          <button
            id="qa-btn-path"
            onClick={() => onQuickAction('path')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87] group-hover:bg-[#004b87] group-hover:text-white transition-all">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#b48a30] tracking-wider font-mono">O Tabuleiro</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#004b87] transition-colors">Ver Trilha</p>
            </div>
          </button>

          <button
            id="qa-btn-medals"
            onClick={() => onQuickAction('medals')}
            className="bg-white hover:bg-[#FAF9F5] border border-[#e5e0d5] hover:border-[#004b87]/40 p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-28 group relative overflow-hidden shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#b48a30]/10 flex items-center justify-center text-[#b48a30] group-hover:bg-[#b48a30] group-hover:text-white transition-all">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Espaço do Membro</span>
              <p className="text-xs font-extrabold text-[#0f2646] mt-0.5 group-hover:text-[#b48a30] transition-colors">Visualizar Perfil</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick helper to fill missing "Gift" icon from lucide-react
function Gift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M12 8A3 3 0 0 1 12 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3Z" />
      <path d="M12 8A3 3 0 0 0 12 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3Z" />
    </svg>
  );
}
