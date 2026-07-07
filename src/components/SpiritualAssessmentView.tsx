import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, BookOpen, Compass, CheckCircle, Shield, AlertCircle, RefreshCw, Calendar, Sparkles, ChevronRight, HelpCircle, Heart, Star, Landmark } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

interface SpiritualAssessmentViewProps {
  userId: string;
  userEmail: string;
  userFullName: string;
  onCompleted?: () => void;
  onAwardXp?: (xp: number, type: any, title: string, obs?: string) => void;
}

export interface AssessmentRecord {
  id: string;
  date: string;
  scores: {
    comunhao: number;
    relacionamento: number;
    fidelidade: number;
    missao: number;
  };
  answers: Record<string, number>;
}

const PILLARS = {
  comunhao: { label: 'Comunhão', color: 'text-sky-600 bg-sky-50 border-sky-200', icon: BookOpen },
  relacionamento: { label: 'Relacionamento', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Heart },
  fidelidade: { label: 'Fidelidade', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Landmark },
  missao: { label: 'Missão', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: Compass }
};

export const QUESTIONS = [
  // Comunhão
  {
    id: 'comunhao_1',
    pillar: 'comunhao',
    text: 'Com que frequência você realiza o estudo diário da Bíblia e da Lição da Escola Sabatina?',
    options: [
      { text: 'Nunca ou raramente estudo.', score: 20 },
      { text: 'Estudo 1 ou 2 vezes na semana.', score: 40 },
      { text: 'Estudo cerca de metade dos dias.', score: 60 },
      { text: 'Estudo quase todos os dias.', score: 80 },
      { text: 'Dedico tempo para o estudo diário rigorosamente.', score: 100 }
    ]
  },
  {
    id: 'comunhao_2',
    pillar: 'comunhao',
    text: 'Como é a regularidade e profundidade dos seus momentos de oração individual?',
    options: [
      { text: 'Não costumo orar individualmente.', score: 20 },
      { text: 'Oro apenas em refeições ou momentos de crise.', score: 40 },
      { text: 'Oro de forma mecânica algumas vezes na semana.', score: 60 },
      { text: 'Oro regularmente todos os dias.', score: 80 },
      { text: 'Mantenho uma profunda vida diária de oração e vigília.', score: 100 }
    ]
  },
  // Relacionamento
  {
    id: 'relacionamento_1',
    pillar: 'relacionamento',
    text: 'Como é sua participação e engajamento em Pequenos Grupos ou Unidades de Ação semanalmente?',
    options: [
      { text: 'Não participo nem tenho interesse no momento.', score: 20 },
      { text: 'Raramente frequento e não interajo.', score: 40 },
      { text: 'Frequento ocasionalmente para ouvir.', score: 60 },
      { text: 'Frequento regularmente e interajo ativamente.', score: 80 },
      { text: 'Lidero, hospedo ou acolho pessoas ativamente.', score: 100 }
    ]
  },
  {
    id: 'relacionamento_2',
    pillar: 'relacionamento',
    text: 'Como você avalia sua postura de amor prático, perdão e comunhão com seus irmãos na fé?',
    options: [
      { text: 'Tenho mágoas profundas e prefiro o isolamento.', score: 20 },
      { text: 'Tento ignorar desavenças, mas evito intimidade.', score: 40 },
      { text: 'Demonstro respeito mútuo, mas sem compromisso profundo.', score: 60 },
      { text: 'Pratico o perdão e sirvo aos irmãos com amor prático.', score: 80 },
      { text: 'Sou um pacificador ativo e busco unir a igreja com altruísmo.', score: 100 }
    ]
  },
  // Fidelidade
  {
    id: 'fidelidade_1',
    pillar: 'fidelidade',
    text: 'De que maneira você consagra seus dízimos e ofertas voluntárias ao Senhor?',
    options: [
      { text: 'Não realizo devolução de dízimos ou ofertas.', score: 20 },
      { text: 'Faço apenas ocasionalmente quando sobra recurso.', score: 40 },
      { text: 'Devolvo dízimos, mas sou irregular em ofertas voluntárias.', score: 60 },
      { text: 'Devolvo dízimo fielmente e adoto um pacto regular de ofertas.', score: 80 },
      { text: 'Sou totalmente fiel e alegre na mordomia de tudo que recebo.', score: 100 }
    ]
  },
  {
    id: 'fidelidade_2',
    pillar: 'fidelidade',
    text: 'Como você gerencia seu tempo livre e suas habilidades para o serviço de Deus?',
    options: [
      { text: 'Uso meu tempo apenas para lazer e projetos pessoais.', score: 20 },
      { text: 'Raramente dedico meus talentos ao Reino.', score: 40 },
      { text: 'Ajudo quando sou solicitado formalmente.', score: 60 },
      { text: 'Dedico parte do meu tempo e talentos regularmente.', score: 80 },
      { text: 'Meus talentos e tempo estão totalmente consagrados e prontos para o Reino.', score: 100 }
    ]
  },
  // Missão
  {
    id: 'missao_1',
    pillar: 'missao',
    text: 'Com que frequência você testemunha da sua fé ou ministra estudos bíblicos?',
    options: [
      { text: 'Nunca testemunhei ou compartilhei minha fé.', score: 20 },
      { text: 'Já fiz isso no passado, mas estou inativo.', score: 40 },
      { text: 'Falo do amor de Jesus ocasionalmente quando surge oportunidade.', score: 60 },
      { text: 'Testemunho com frequência e distribuo materiais bíblicos.', score: 80 },
      { text: 'Ministro estudos bíblicos ativos e conduzo interessados ao batismo.', score: 100 }
    ]
  },
  {
    id: 'missao_2',
    pillar: 'missao',
    text: 'Como é seu envolvimento em atividades de assistência social ou evangelismo promovidos pela igreja?',
    options: [
      { text: 'Não participo de nenhuma atividade missionária.', score: 20 },
      { text: 'Apenas assisto aos cultos de evangelismo passivamente.', score: 40 },
      { text: 'Colaboro pontualmente uma ou duas vezes ao ano.', score: 60 },
      { text: 'Participo ativamente dos projetos sociais e de impacto da igreja.', score: 80 },
      { text: 'Ajudo a coordenar e motivar outros membros na atividade missionária.', score: 100 }
    ]
  }
];

export default function SpiritualAssessmentView({ userId, userEmail, userFullName, onCompleted, onAwardXp }: SpiritualAssessmentViewProps) {
  const [step, setStep] = useState<'welcome' | 'questions' | 'note' | 'results' | 'history'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null);
  const [personalNote, setPersonalNote] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'assessments'));
      const list: AssessmentRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AssessmentRecord);
      });
      // Sort newest first
      list.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(list);
      if (list.length > 0) {
        setLatestAssessment(list[0]);
      }
    } catch (e) {
      console.error("Erro carregando histórico de avaliações", e);
    } finally {
      setLoading(false);
    }
  };

  const startNewAssessment = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPersonalNote('');
    setStep('questions');
  };

  const handleSelectOption = (questionId: string, score: number) => {
    const updated = { ...answers, [questionId]: score };
    setAnswers(updated);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Direct to personal observations/notes before saving
      setStep('note');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateAndSaveResult = async (completedAnswers: Record<string, number>) => {
    setLoading(true);

    // Filter questions per pillar and average
    const pillars = ['comunhao', 'relacionamento', 'fidelidade', 'missao'] as const;
    const scores: Record<string, number> = {};

    pillars.forEach((p) => {
      const pillarQuestions = QUESTIONS.filter((q) => q.pillar === p);
      const totalScore = pillarQuestions.reduce((sum, q) => sum + (completedAnswers[q.id] || 0), 0);
      scores[p] = Math.round(totalScore / pillarQuestions.length);
    });

    const assessmentId = `assess-${Date.now()}`;
    const newRecord: AssessmentRecord & { observation: string } = {
      id: assessmentId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      scores: {
        comunhao: scores.comunhao,
        relacionamento: scores.relacionamento,
        fidelidade: scores.fidelidade,
        missao: scores.missao
      },
      answers: completedAnswers,
      observation: personalNote.trim() || ''
    };

    try {
      // Save under user subcollection
      await setDoc(doc(db, 'users', userId, 'assessments', assessmentId), newRecord);
      
      // Update user with last assessment date/scores for quick access
      await setDoc(doc(db, 'users', userId), {
        lastAssessmentDate: newRecord.date,
        lastAssessmentScores: newRecord.scores
      }, { merge: true });

      // Award 500 XP for completing the spiritual assessment
      if (onAwardXp) {
        await onAwardXp(500, 'reflexão', 'Auto-avaliação de Maturidade Espiritual', 'Maturidade espiritual calculada nos 4 pilares.');
      }

      await fetchHistory();
      setLatestAssessment(newRecord);
      setStep('results');
      if (onCompleted) onCompleted();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/assessments/${assessmentId}`);
    } finally {
      setLoading(false);
    }
  };

  const getMaturityLevel = (avg: number) => {
    if (avg < 40) return { title: 'Discípulo Iniciante', desc: 'Iniciando os primeiros passos na caminhada cristã diária. Foco na consistência da Comunhão.', color: 'text-stone-650 bg-stone-50 border-stone-200' };
    if (avg < 70) return { title: 'Discípulo em Crescimento', desc: 'Bons hábitos espirituais estabelecidos. Desejo sincero de servir e crescer no Relacionamento e na Fidelidade.', color: 'text-[#004b87] bg-blue-50 border-blue-200' };
    if (avg < 90) return { title: 'Discípulo Maduro', desc: 'Vida de constante comunhão íntima e serviço ativo na Missão. Pronto para discipular outros.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { title: 'Discípulo Formador / Discipulador', desc: 'Espiritualmente maduro, focado na multiplicação de discípulos e na condução comunitária.', color: 'text-amber-700 bg-amber-50 border-amber-200 font-black' };
  };

  const getRecommendations = (scores: Record<string, number>) => {
    const recs: string[] = [];
    if (scores.comunhao < 60) {
      recs.push('Comunhão: Tente definir um horário fixo de oração de manhã cedo de pelo menos 10 minutos e mantenha a sua Escola Sabatina sempre em dia!');
    } else if (scores.comunhao >= 80) {
      recs.push('Comunhão: Excelente consistência! Compartilhe o método que usa para estudar a lição e as passagens bíblicas com um irmão mais novo.');
    }

    if (scores.relacionamento < 60) {
      recs.push('Relacionamento: Procure frequentar um Pequeno Grupo ou Unidade de Ação regularmente para criar laços genuínos de amor cristão.');
    }

    if (scores.fidelidade < 60) {
      recs.push('Fidelidade: Estude mais sobre os princípios de mordomia bíblica. Tente consagrar suas finanças e seu tempo livre prioritariamente para o Senhor.');
    }

    if (scores.missao < 60) {
      recs.push('Missão: Comece pequeno. Ore diariamente por um amigo não adventista, envie um verso encorajador ou ofereça um folheto missionário.');
    } else if (scores.missao >= 80) {
      recs.push('Missão: Você possui um coração missionário ardente! Ofereça-se ao seu pastor ou discipulador para liderar uma dupla missionária ou dar classe de estudos bíblicos.');
    }

    return recs;
  };

  if (loading && step === 'welcome') {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#004b87]" />
        <p className="text-xs text-slate-500 mt-2 font-mono">Carregando diagnósticos de maturidade...</p>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round((currentQuestionIndex / QUESTIONS.length) * 100);

  // Check if locked (only 1 assessment per week allowed)
  let isLocked = false;
  let countdownString = '';
  if (latestAssessment) {
    const lastDate = new Date(latestAssessment.date.replace(' ', 'T'));
    const nextAvailableDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now < nextAvailableDate) {
      isLocked = true;
      const diffMs = nextAvailableDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      countdownString = diffDays > 0 
        ? `${diffDays}d e ${diffHours}h`
        : `${diffHours}h e ${diffMinutes}m`;
    }
  }

  return (
    <div className="space-y-6 pb-12 text-[#1e293b] text-left">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-[#0f2646] to-[#004b87] text-white rounded-3xl p-5 shadow-md flex items-center justify-between border border-[#0a1a30]">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 font-mono">Avaliação Periódica</span>
          <h2 className="text-xl font-black tracking-tight mt-0.5">Maturidade Espiritual</h2>
          <p className="text-xs text-stone-200 mt-1 opacity-90">Autoavaliação baseada nos 4 pilares essenciais do discipulado</p>
        </div>
        <div className="bg-white/10 p-2 rounded-2xl border border-white/10">
          <Award className="w-8 h-8 text-amber-300" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: WELCOME AND HISTORY */}
        {step === 'welcome' && (
          <motion.div
            key="step-welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {latestAssessment ? (
              <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">Último Diagnóstico</span>
                    <p className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {latestAssessment.date}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('history')}
                    className="text-xs text-[#004b87] hover:underline font-bold"
                  >
                    Ver Histórico
                  </button>
                </div>

                {/* Score Summary */}
                {(() => {
                  const avg = Math.round((latestAssessment.scores.comunhao + latestAssessment.scores.relacionamento + latestAssessment.scores.fidelidade + latestAssessment.scores.missao) / 4);
                  const lvl = getMaturityLevel(avg);
                  return (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-2xl border ${lvl.color} space-y-1.5`}>
                        <span className="text-[10px] uppercase font-mono font-black tracking-wider opacity-80">Nível de Maturidade Espiritual</span>
                        <h3 className="text-lg font-black">{lvl.title}</h3>
                        <p className="text-xs leading-relaxed opacity-95">{lvl.desc}</p>
                      </div>

                      {/* Visual Progress Bars */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {Object.entries(latestAssessment.scores).map(([key, value]) => {
                          const p = PILLARS[key as keyof typeof PILLARS];
                          const Icon = p.icon;
                          return (
                            <div key={key} className="bg-stone-50 border border-stone-200/50 rounded-2xl p-3 flex flex-col justify-between">
                              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs mb-2">
                                <Icon className="w-4 h-4 text-slate-500" />
                                <span>{p.label}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-end justify-between font-mono text-[10px]">
                                  <span className="text-slate-400">Progresso:</span>
                                  <span className="font-extrabold text-slate-700">{value}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="h-full bg-[#004b87] rounded-full transition-all" 
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action plan */}
                      <div className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-2xl p-4 space-y-2 text-left">
                        <span className="text-[9px] font-black tracking-widest text-[#b48a30] uppercase font-mono">Plano de Crescimento Sugerido</span>
                        <ul className="space-y-2.5">
                          {getRecommendations(latestAssessment.scores).map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                              <span className="text-amber-500 mt-1">✦</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                {isLocked ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-left">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider font-mono">Diagnóstico Semanal Concluido</h4>
                      <p className="text-[11px] text-stone-600 leading-normal mt-1">
                        Seu diagnóstico semanal de maturidade já foi realizado! Está disponível para responder 1 vez por semana.
                      </p>
                      <span className="inline-block bg-amber-500 text-white font-extrabold text-[10px] uppercase font-mono px-2.5 py-1 rounded-full mt-2.5 shadow-sm">
                        Próxima liberação em: {countdownString}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Recompensa de conclusão: <strong>+500 XP de Maturidade</strong></span>
                    </div>
                    <button
                      onClick={startNewAssessment}
                      className="w-full bg-[#004b87] hover:bg-[#003763] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Fazer Novo Diagnóstico</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#e5e0d5] rounded-3xl p-6 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 bg-[#004b87]/5 rounded-full flex items-center justify-center mx-auto border border-[#004b87]/10">
                  <Compass className="w-8 h-8 text-[#004b87]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#0f2646]">Descubra seu Nível Espiritual</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Responda a perguntas sinceras sobre Comunhão, Relacionamento, Fidelidade e Missão para mapear seu crescimento e receber um plano de ação personalizado.
                  </p>
                </div>

                <div className="space-y-4 w-full">
                  <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/25 text-amber-900 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 max-w-sm mx-auto">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Você receberá <strong>+500 Pontos de XP</strong> ao concluir!</span>
                  </div>
                  
                  <button
                    onClick={startNewAssessment}
                    className="w-full bg-[#004b87] hover:bg-[#003763] text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Iniciar Avaliação de Maturidade</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: QUESTIONS PANEL */}
        {step === 'questions' && currentQuestion && (
          <motion.div
            key="step-questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-5"
          >
            {/* Header progress info */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold font-mono">
              <span>QUESTÃO {currentQuestionIndex + 1} DE {QUESTIONS.length}</span>
              <span>{progressPercent}% CONCLUÍDO</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#004b87] h-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border shrink-0 ${PILLARS[currentQuestion.pillar as keyof typeof PILLARS].color}`}>
                  {(() => {
                    const Icon = PILLARS[currentQuestion.pillar as keyof typeof PILLARS].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400">
                    Pilar {PILLARS[currentQuestion.pillar as keyof typeof PILLARS].label}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800 leading-snug mt-1 text-left">
                    {currentQuestion.text}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQuestion.id, option.score)}
                    className="w-full bg-stone-50 hover:bg-[#004b87]/5 border border-stone-200/80 hover:border-[#004b87]/50 p-3.5 rounded-2xl text-xs text-left font-bold transition-all flex items-start gap-3 text-slate-700 cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200/70 border border-slate-300 flex items-center justify-center text-[10px] shrink-0 font-mono text-slate-500">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 mt-0.5">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back Button */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevQuestion}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors cursor-pointer block text-left"
              >
                ← Voltar para a pergunta anterior
              </button>
            )}
          </motion.div>
        )}

        {/* STEP: PERSONAL NOTE INPUT */}
        {step === 'note' && (
          <motion.div
            key="step-note"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-6 shadow-sm space-y-5 text-left"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#b48a30] tracking-widest font-mono uppercase">Passo Final</span>
              <h3 className="text-lg font-black text-[#0f2646]">📝 Observações & Pedidos de Oração</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compartilhe com seu discipulador e pastor suas reflexões, dificuldades espirituais ou pedidos de oração. Esse conteúdo é confidencial e os ajudará a te dar suporte pastoral.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Suas observações (Opcional)</label>
              <textarea
                rows={4}
                placeholder="Ex: Tenho tido dificuldades de manter o hábito de leitura pela manhã, gostaria de apoio em oração e ideias para reestruturar meu devocional..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#e5e0d5] focus:border-[#b48a30] rounded-2xl p-4 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-medium shadow-inner resize-none focus:ring-4 focus:ring-[#b48a30]/10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('questions');
                  setCurrentQuestionIndex(QUESTIONS.length - 1);
                }}
                className="w-full sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider cursor-pointer text-center transition-all"
              >
                ← Voltar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => calculateAndSaveResult(answers)}
                className="w-full sm:w-2/3 bg-gradient-to-r from-[#004b87] to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>Concluir Diagnóstico</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: RESULTS ANIMATED PANEL */}
        {step === 'results' && latestAssessment && (
          <motion.div
            key="step-results"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm text-center space-y-5"
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-150 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-600 tracking-widest font-mono uppercase">Sucesso</span>
              <h3 className="text-lg font-black text-[#0f2646]">Maturidade Espiritual Avaliada!</h3>
              <p className="text-xs text-slate-500">Seu diagnóstico foi computado e sincronizado com a secretaria espiritual.</p>
            </div>

            {(() => {
              const avg = Math.round((latestAssessment.scores.comunhao + latestAssessment.scores.relacionamento + latestAssessment.scores.fidelidade + latestAssessment.scores.missao) / 4);
              const lvl = getMaturityLevel(avg);
              return (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${lvl.color} space-y-1`}>
                    <span className="text-[9px] uppercase font-mono font-black tracking-wider opacity-80">Nível Atribuído</span>
                    <h4 className="text-md font-black">{lvl.title}</h4>
                    <p className="text-[11px] leading-relaxed opacity-95">{lvl.desc}</p>
                  </div>

                  {/* High quality customized visual presentation of assessment */}
                  <div className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-2xl p-4 text-left space-y-3">
                    <span className="text-[9px] font-black tracking-widest text-[#b48a30] uppercase font-mono block">Progresso Detalhado</span>
                    <div className="space-y-2.5">
                      {Object.entries(latestAssessment.scores).map(([key, val]) => {
                        const p = PILLARS[key as keyof typeof PILLARS];
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>{p.label}</span>
                              <span className="font-mono text-[11px]">{val}%</span>
                            </div>
                            <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-[#004b87] rounded-full" 
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Voltar ao Painel
              </button>
              <button
                onClick={startNewAssessment}
                className="flex-1 bg-[#004b87] hover:bg-[#003763] text-white py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Refazer Teste
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: HISTORY VIEW */}
        {step === 'history' && (
          <motion.div
            key="step-history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">Histórico de Diagnósticos</h3>
              <button
                onClick={() => setStep('welcome')}
                className="text-xs text-[#004b87] hover:underline font-bold"
              >
                Voltar
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {history.map((record) => {
                const avg = Math.round((record.scores.comunhao + record.scores.relacionamento + record.scores.fidelidade + record.scores.missao) / 4);
                const lvl = getMaturityLevel(avg);
                return (
                  <div key={record.id} className="border border-stone-200/75 p-3.5 rounded-2xl space-y-2 text-left bg-stone-50">
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span className="font-bold text-slate-500">{record.date}</span>
                      <span className="font-extrabold text-[#004b87] bg-blue-50 px-1.5 py-0.5 rounded-md">Média: {avg}%</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#0f2646]">{lvl.title}</p>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px] text-slate-500">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wide opacity-80 text-slate-400">Com.</span>
                        <span className="font-bold text-slate-700">{record.scores.comunhao}%</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wide opacity-80 text-slate-400">Rel.</span>
                        <span className="font-bold text-slate-700">{record.scores.relacionamento}%</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wide opacity-80 text-slate-400">Fid.</span>
                        <span className="font-bold text-slate-700">{record.scores.fidelidade}%</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wide opacity-80 text-slate-400">Miss.</span>
                        <span className="font-bold text-slate-700">{record.scores.missao}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
