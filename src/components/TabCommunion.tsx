import React, { useState } from 'react';
import { BookOpen, Compass, PenTool, CheckCircle, Sparkles, BookOpenCheck, HelpCircle, Save, Star, Trash2, Globe, ExternalLink } from 'lucide-react';
import { SabbathLesson, BibleReading, SpiritualReflection } from '../types';

interface TabCommunionProps {
  lessons: SabbathLesson[];
  bibleReadings: BibleReading[];
  reflections: SpiritualReflection[];
  bibleProgressPercent: number;
  onCompleteLesson: (lessonId: string, answer: string) => void;
  onCompleteBibleReading: (readingId: string) => void;
  onSaveReflection: (content: string, type: 'oração' | 'aprendizado' | 'gratidão' | 'reflexão') => void;
  onDeleteReflection: (id: string) => void;
}

type SubTab = 'lesson' | 'bible' | 'reflection';

export default function TabCommunion({
  lessons,
  bibleReadings,
  reflections,
  bibleProgressPercent,
  onCompleteLesson,
  onCompleteBibleReading,
  onSaveReflection,
  onDeleteReflection
}: TabCommunionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('lesson');
  
  // Lesson state
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonAnswer, setLessonAnswer] = useState('');
  const [lessonSuccessMsg, setLessonSuccessMsg] = useState('');

  // Reflection state
  const [reflectionContent, setReflectionContent] = useState('');
  const [reflectionType, setReflectionType] = useState<'oração' | 'aprendizado' | 'gratidão' | 'reflexão'>('reflexão');
  const [reflectionSuccessMsg, setReflectionSuccessMsg] = useState('');

  const currentLesson = lessons[currentLessonIndex] || lessons[0];

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonAnswer.trim()) return;

    onCompleteLesson(currentLesson.id, lessonAnswer);
    setLessonSuccessMsg('✓ Resposta registrada! Adicionou +25 XP (Comunhão Ativa).');
    setTimeout(() => setLessonSuccessMsg(''), 4000);
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionContent.trim()) return;

    onSaveReflection(reflectionContent, reflectionType);
    setReflectionContent('');
    setReflectionSuccessMsg('✓ Registro arquivado em seu Diário Espiritual. Recebeu +15 XP.');
    setTimeout(() => setReflectionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Title & Introduction header */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Primeira Aba: Comunhão Íntima</h3>
          <p className="text-xs text-slate-500">Desenvolva uma vida espiritual regular e forte na Palavra</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-[#004b87]/10 text-[#004b87] font-mono text-xs font-black border border-[#004b87]/20 uppercase">
          COMUNHÃO
        </div>
      </div>

      {/* Sub-Tabs / Switch buttons */}
      <div className="bg-[#FAF9F5] p-1 rounded-2xl grid grid-cols-3 gap-1.5 border border-[#e5e0d5]">
        <button
          id="subtab-btn-lesson"
          onClick={() => setActiveSubTab('lesson')}
          className={`py-2.5 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            activeSubTab === 'lesson'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0 text-current" />
          <span className="truncate">Escola Sabatina</span>
        </button>

        <button
          id="subtab-btn-bible"
          onClick={() => setActiveSubTab('bible')}
          className={`py-2.5 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            activeSubTab === 'bible'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0 text-current" />
          <span className="truncate">Ano Bíblico</span>
        </button>

        <button
          id="subtab-btn-reflection"
          onClick={() => setActiveSubTab('reflection')}
          className={`py-2.5 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            activeSubTab === 'reflection'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <PenTool className="w-4 h-4 shrink-0 text-current" />
          <span className="truncate">Meu Diário</span>
        </button>
      </div>

      {/* MAIN CONTAINER PANELS */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm">
        
        {/* SUBTAB 1: SCHOOL SABBATH LESSON (ESCOLA SABATINA) */}
        {activeSubTab === 'lesson' && currentLesson && (() => {
          // Helper to calculate the 7-day Adventist Sabbath School week dates dynamically
          // Saturday is day 0 of the Adventist study week, finishing on Friday.
          const getSabbathWeekDates = () => {
            const today = new Date();
            const currentDay = today.getDay(); // 0 is Sunday, 6 is Saturday
            const diffToSaturday = currentDay === 6 ? 0 : -(currentDay + 1);
            
            const saturday = new Date(today);
            saturday.setDate(today.getDate() + diffToSaturday);
            
            const weekdayLabels = [
              'sábado',
              'domingo',
              'segunda',
              'terça',
              'quarta',
              'quinta',
              'sexta'
            ];
            
            return Array.from({ length: 7 }, (_, i) => {
              const d = new Date(saturday);
              d.setDate(saturday.getDate() + i);
              
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = String(d.getFullYear()).slice(-2);
              
              return {
                label: weekdayLabels[i],
                formattedDate: `${weekdayLabels[i]} (${day}/${month}/${year})`
              };
            });
          };

          const weekDates = getSabbathWeekDates();
          const currentDayInfo = weekDates[currentLessonIndex] || { label: 'Estudo', formattedDate: `Dia ${currentLessonIndex + 1}` };

          return (
            <div className="space-y-5">
              {/* 7 Days of Sabbath School Selector */}
              <div className="flex flex-col bg-[#FAF9F5] p-3.5 rounded-2xl gap-3 border border-[#e5e0d5]">
                <span className="text-[10px] text-slate-500 font-black uppercase font-mono text-left">
                  Ciclo de 7 Dias da Escola Sabatina:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {lessons.map((l, index) => {
                    const dateInfo = weekDates[index] || { label: 'Dia', formattedDate: `Dia ${index+1}` };
                    const isToday = new Date().getDay() === (index === 0 ? 6 : index - 1);
                    return (
                      <button
                        key={l.id}
                        id={`btn-lesson-index-${index}`}
                        onClick={() => {
                          setCurrentLessonIndex(index);
                          setLessonAnswer(l.answer || '');
                        }}
                        className={`px-2 py-2.5 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                          currentLessonIndex === index
                            ? 'bg-[#004b87] text-white border-[#004b87] shadow-sm scale-[1.02]'
                            : l.completed
                            ? 'bg-emerald-50/70 text-emerald-700 border-emerald-250 hover:bg-emerald-50'
                            : isToday
                            ? 'bg-[#b48a30]/15 text-[#b48a30] border-[#b48a30] font-black'
                            : 'bg-white hover:bg-slate-50 text-slate-500 border-[#e5e0d5]'
                        }`}
                      >
                        <span className="uppercase tracking-widest text-[8px] font-bold opacity-90 leading-none">
                          {dateInfo.label}
                        </span>
                        <span className="text-[10px] font-mono leading-none font-bold mt-1">
                          {dateInfo.formattedDate.substring(dateInfo.formattedDate.indexOf('('))}
                        </span>
                        {l.completed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                        )}
                        {isToday && !l.completed && (
                          <span className="text-[7px] font-mono bg-[#b48a30]/20 text-[#b48a30] px-1 rounded-sm mt-0.5 scale-90">Hoje</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lesson Card */}
              <div className="space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F5] p-3 rounded-2xl border border-[#e5e0d5]">
                  <div>
                    <span className="text-[10px] font-black text-[#b48a30] font-mono tracking-widest uppercase bg-[#FDF8EB] px-2.5 py-1.5 rounded-lg border border-[#f5ebcb] inline-block">
                      {currentDayInfo.formattedDate}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 font-bold">Estudo de hoje da Escola Sabatina</p>
                  </div>
                  
                  {/* Mais CPB Premium External Link Button - Highly Visibile */}
                  <a
                    href="https://mais.cpb.com.br/licao-adultos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="bg-[#004b87] hover:bg-[#003b6d] text-white font-extrabold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0 cursor-pointer text-xs shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <span>Estudar no Mais CPB</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                {/* Status and Completion Form */}
                <div className="pt-2">
                  {currentLesson.completed ? (
                    <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
                      <BookOpenCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                      <div className="space-y-1">
                        <p className="font-extrabold text-sm">Lição respondida e concluída! (+25 XP)</p>
                        <p className="opacity-95 text-slate-650 italic font-medium bg-white p-2.5 rounded-lg border border-emerald-100 mt-1">O que você aprendeu: "{currentLesson.answer}"</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLessonSubmit} className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-[#0f2646] flex items-center gap-1.5 leading-none">
                          <HelpCircle className="w-4.5 h-4.5 shrink-0 text-[#b48a30]" />
                          O que você aprendeu na lição de hoje?
                        </label>
                        <p className="text-xs text-slate-500 font-medium">Escreva uma frase ou parágrafo com as principais lições ou reflexões práticas do estudo de hoje para registrar seu progresso.</p>
                        <textarea
                          id="lesson-text-answer"
                          value={lessonAnswer}
                          onChange={(e) => setLessonAnswer(e.target.value)}
                          placeholder="Anote aqui as principais lições aprendidas, insights ou reflexões práticas de hoje..."
                          className="w-full h-24 bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3.5 text-xs md:text-sm text-[#1e293b] placeholder:text-slate-400 font-sans outline-none resize-none shadow-inner"
                        />
                      </div>

                      {lessonSuccessMsg && (
                        <div className="text-xs text-emerald-700 font-mono text-center font-bold">
                          {lessonSuccessMsg}
                        </div>
                      )}

                      <button
                        id="btn-lesson-complete"
                        type="submit"
                        disabled={!lessonAnswer.trim()}
                        className="w-full bg-[#004b87] hover:bg-[#003b6d] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Responder e Computar XP (+25 XP)
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* SUBTAB 2: YEAR BIBLE (ANO BÍBLICO) */}
        {activeSubTab === 'bible' && (
          <div className="space-y-5 text-left">
            <div className="flex justify-between items-center bg-[#FAF9F5] p-4 rounded-2xl border border-[#e5e0d5]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black font-mono">Trilha do Ano Bíblico</span>
                <p className="text-lg font-black text-[#005c53] font-mono mt-0.5">{bibleProgressPercent}% Concluído</p>
              </div>
              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden border border-[#e5e0d5]">
                <div className="h-full bg-[#005c53]" style={{ width: `${bibleProgressPercent}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block font-mono pl-0.5">Leituras Registradas</span>
              
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 select-none">
                {bibleReadings.map((reading) => (
                  <div
                    key={reading.id}
                    id={`bible-row-${reading.id}`}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      reading.completed
                        ? 'bg-[#059669]/5 border-emerald-250 text-slate-600'
                        : 'bg-[#FAF9F5] border-[#e5e0d5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2.5 text-left flex-1 min-w-0">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 text-xs font-bold leading-none ${
                          reading.completed
                            ? 'bg-[#059669] border-[#059669] text-white'
                            : 'border-[#cbd5e1] bg-white text-transparent'
                        }`}>
                          ✓
                        </div>
                        <div className="space-y-0.5 flex-1 pr-1">
                          <span className="text-[9px] font-black text-slate-400 font-mono block">Dia {reading.day}</span>
                          <p className={`text-xs md:text-sm font-bold leading-normal break-words ${reading.completed ? 'line-through text-slate-400 font-medium' : 'text-[#0f2646]'}`}>
                            {reading.passage}
                          </p>
                        </div>
                      </div>

                      {!reading.completed && (
                        <button
                          id={`btn-complete-bible-${reading.id}`}
                          onClick={() => onCompleteBibleReading(reading.id)}
                          className="bg-[#005c53] hover:bg-[#00423c] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm w-full sm:w-auto text-center"
                        >
                          Concluído (+10 XP)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: SPIRITUAL REFLECTION JOURNAL */}
        {activeSubTab === 'reflection' && (
          <div className="space-y-6 text-left">
            <form onSubmit={handleReflectionSubmit} className="space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase block font-mono pl-0.5">Tipo de Registro no Diário</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['oração', 'aprendizado', 'gratidão', 'reflexão'] as const).map((type) => (
                    <button
                      key={type}
                      id={`btn-reftype-${type}`}
                      type="button"
                      onClick={() => setReflectionType(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-black capitalize transition-all cursor-pointer ${
                        reflectionType === type
                          ? 'bg-[#004b87] border-[#004b87] text-white font-extrabold shadow-sm'
                          : 'bg-[#FAF9F5] border-[#e5e0d5] text-[#1e293b] hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Escreva suas preces particulares, lições ou motivos de ações de graças:</label>
                <textarea
                  id="inp-reflection-content"
                  value={reflectionContent}
                  onChange={(e) => setReflectionContent(e.target.value)}
                  placeholder="Ex: Sou grato hoje pela saúde da minha família... Minhas intercessões são por... O Senhor falou ao meu coração..."
                  className="w-full h-28 bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3.5 text-xs md:text-sm text-[#1e293b] placeholder:text-slate-400 font-sans outline-none resize-none shadow-inner"
                />
              </div>

              {reflectionSuccessMsg && (
                <div className="text-xs text-emerald-700 font-mono text-center font-bold">
                  {reflectionSuccessMsg}
                </div>
              )}

              <button
                id="btn-save-reflection"
                type="submit"
                disabled={!reflectionContent.trim()}
                className="w-full bg-[#004b87] hover:bg-[#003b6d] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                Gravar no Diário de Devoção (+15 XP)
              </button>
            </form>

            <div className="pt-5 border-t border-[#FAF9F5]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 pl-0.5">Meu Espaço Íntimo ({reflections.length} registros)</span>
              
              {reflections.length === 0 ? (
                <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-dashed border-[#e5e0d5] text-center text-slate-400 text-xs">
                  Nenhum registro devocional salvo ainda. Escreva sua primeira oração acima!
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {reflections.map((ref) => (
                    <div key={ref.id} id={`ref-card-${ref.id}`} className="bg-[#FAF9F5] border border-[#e5e0d5] p-3.5 rounded-2xl space-y-2 relative shadow-inner">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#004b87]/10 text-[#004b87] px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider font-mono">
                            {ref.type}
                          </span>
                          <span className="text-[9px] text-[#b48a30] font-mono font-bold">{ref.date}</span>
                        </div>
                        <button
                          id={`btn-delete-ref-${ref.id}`}
                          onClick={() => onDeleteReflection(ref.id)}
                          className="text-slate-400 hover:text-red-500 transition-all p-1 cursor-pointer"
                          title="Apagar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium break-words">
                        "{ref.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
