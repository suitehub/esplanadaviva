import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, Flame, User, ArrowRight, ShieldCheck, Gamepad2, Compass, Gift, Trophy } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const skipToAuth = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#1e293b] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Decorative Warm Accent Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-[#004b87]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-[#b48a30]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center z-10 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-[#004b87] p-1.5 rounded-lg text-white">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wide text-[#004b87] text-sm leading-none">ESPLANADA VIVA</span>
            <span className="text-[7.5px] text-[#b48a30] font-black uppercase tracking-wider block mt-0.5 font-mono">Igreja Adventista do Sétimo Dia</span>
          </div>
        </div>
        {step < 4 && (
          <button 
            id="btn-skip-onboarding"
            onClick={skipToAuth} 
            className="text-xs text-slate-550 hover:text-[#004b87] transition-all bg-[#e9e5d9] px-3 py-1.5 rounded-full font-bold"
          >
            Pular
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center my-6 z-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-center md:text-left"
            >
              <div className="mx-auto md:mx-0 w-20 h-20 bg-[#004b87]/10 rounded-2xl flex items-center justify-center border border-[#004b87]/20">
                <Compass className="w-10 h-10 text-[#004b87]" />
              </div>
              <div className="space-y-3">
                <h1 id="title-step1" className="text-2xl md:text-3xl font-black tracking-tight text-[#0f2646] leading-tight">
                  Fortaleça Sua Fé, Viva a Missão
                </h1>
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed">
                  Bem-vindo ao <span className="font-extrabold text-[#004b87]">Esplanada Viva</span>. O ambiente oficial de crescimento espiritual e discipulado integrado estruturado para os membros e amigos do Distrito Esplanada.
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2.5 bg-[#FAF9F5] border border-[#e5e0d5] px-4 py-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#b48a30] shrink-0" />
                <span className="text-xs text-slate-600 text-left">
                  Mantenha a comunhão viva com o estudo da Bíblia e lição da Escola Sabatina de forma diária e metrificada.
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-center md:text-left"
            >
              <div className="mx-auto md:mx-0 w-20 h-20 bg-[#005c53]/10 rounded-2xl flex items-center justify-center border border-[#005c53]/20">
                <Gamepad2 className="w-10 h-10 text-[#005c53]" />
              </div>
              <div className="space-y-3">
                <h2 id="title-step2" className="text-2xl md:text-3xl font-black text-[#0f2646] leading-tight">
                  Constância com Progresso
                </h2>
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed">
                  Todo hábito de oração e leitura conta. Conclua os alvos diários de comunhão para acumular pontos de Experiência (XP) e elevar o nível e visual do seu avatar devocional.
                </p>
              </div>

              {/* Mini Interactive Demo/Preview of Levels */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#e5e0d5]">
                <div className="text-center p-2 rounded bg-white border border-[#e5e0d5]">
                  <span className="text-[9px] text-[#004b87] block uppercase font-bold">Nível 1</span>
                  <div className="text-[10px] text-slate-600 font-semibold">Buscador</div>
                  <User className="w-4 h-4 text-[#004b87] mx-auto mt-1" />
                </div>
                <div className="text-center p-2 rounded bg-[#059669]/5 border border-[#34d399]/40">
                  <span className="text-[9px] text-emerald-700 block uppercase font-bold">Nível 3</span>
                  <div className="text-[10px] text-emerald-800 font-bold">Discípulo</div>
                  <User className="w-4 h-4 text-emerald-600 mx-auto mt-1 fill-emerald-600/20" />
                </div>
                <div className="text-center p-2 rounded bg-white border border-[#e5e0d5]">
                  <span className="text-[9px] text-[#b48a30] block uppercase font-bold">Nível 5</span>
                  <div className="text-[10px] text-amber-700 font-bold">Missionário</div>
                  <User className="w-4 h-4 text-[#b48a30] mx-auto mt-1 fill-amber-500/20 animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-center md:text-left"
            >
              <div className="mx-auto md:mx-0 w-20 h-20 bg-emerald-50 text-emerald-750 rounded-2xl flex items-center justify-center border border-emerald-100/80">
                <Gift className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h2 id="title-step3" className="text-2xl md:text-3xl font-black text-[#0f2646] leading-tight">
                  Ganhe Presentes & Premiações
                </h2>
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed">
                  Sua constância e participação ativa valem presentes especiais! De acordo com a sua frequência diária e conquistas concluídas no distrito, você garante livros físicos, presentes e premiações incríveis de reconhecimento.
                </p>
              </div>

              {/* Showcase items */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-[#FAF9F5] px-3 py-2 rounded-xl border border-[#e5e0d5]">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500/10" />
                  <span className="text-[10px] text-[#0f2646] font-bold font-sans">Prêmios de Constância</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF9F5] px-3 py-2 rounded-xl border border-[#e5e0d5]">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[10px] text-[#0f2646] font-bold font-sans">Presentes de Missões</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-center md:text-left"
            >
              <div className="mx-auto md:mx-0 w-20 h-20 bg-[#b48a30]/10 rounded-2xl flex items-center justify-center border border-[#b48a30]/20">
                <Award className="w-10 h-10 text-[#b48a30]" />
              </div>
              <div className="space-y-3">
                <h3 id="title-step4" className="text-2xl md:text-3xl font-black text-[#0f2646] leading-tight">
                  Cofre de Conquistas
                </h3>
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed">
                  Desbloqueie medalhas exclusivas mantendo sequências de acesso diário (streaks) ou saindo a campo para missões práticas de discipulado e compartilhamento de literatura da esperança.
                </p>
              </div>

              {/* Medals Showcase */}
              <div className="flex justify-center md:justify-start gap-3">
                <div className="flex items-center gap-2 bg-[#FAF9F5] px-3 py-2 rounded-lg border border-[#e5e0d5]">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0 fill-orange-500/10" />
                  <span className="text-[10px] text-slate-700 font-bold font-mono">Streak de 7 Dias</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF9F5] px-3 py-2 rounded-lg border border-[#e5e0d5]">
                  <Award className="w-4 h-4 text-[#b48a30] shrink-0 fill-[#b48a30]/10" />
                  <span className="text-[10px] text-slate-700 font-bold font-mono">Sentinela Firme</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 z-10 max-w-md mx-auto w-full">
        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-[#004b87]' : 'w-2 bg-[#e5e0d5]'
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-onboarding-next"
          onClick={nextStep}
          className="w-full bg-gradient-to-r from-[#004b87] to-[#005c53] hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-sans"
        >
          {step === 4 ? (
            <>
              Iniciar essa jornada
              <ArrowRight className="w-5 h-5 font-bold" />
            </>
          ) : (
            <>
              {step === 1 ? 'Começar Caminhada' : 'Avançar na Jornada'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
