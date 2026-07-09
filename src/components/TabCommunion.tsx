import React, { useState, useEffect } from 'react';
import { BookOpen, Compass, PenTool, CheckCircle, Sparkles, BookOpenCheck, HelpCircle, Save, Star, Trash2, Globe, ExternalLink, Bookmark } from 'lucide-react';
import { SabbathLesson, BibleReading, SpiritualReflection, BookChapter } from '../types';
import { BOOK_CHAPTERS_CONTENT } from '../data/bookChaptersText';
import { AudioRecorder, AudioPlayer } from './AudioSystem';

interface TabCommunionProps {
  lessons: SabbathLesson[];
  bibleReadings: BibleReading[];
  reflections: SpiritualReflection[];
  bookChapters: BookChapter[];
  bibleProgressPercent: number;
  initialSubTab?: 'lesson' | 'bible' | 'book' | 'reflection';
  streakDays?: number;
  onCompleteLesson: (lessonId: string, answer: string, audioUrl?: string) => void;
  onCompleteBibleReading: (readingId: string) => void;
  onCompleteBookChapter: (chapterId: string, answer: string, audioUrl?: string) => void;
  onSaveReflection: (content: string, type: 'oração' | 'aprendizado' | 'gratidão' | 'reflexão', audioUrl?: string) => void;
  onDeleteReflection: (id: string) => void;
}

type SubTab = 'lesson' | 'bible' | 'book' | 'reflection';

export default function TabCommunion({
  lessons,
  bibleReadings,
  reflections,
  bookChapters = [],
  bibleProgressPercent,
  initialSubTab,
  streakDays = 1,
  onCompleteLesson,
  onCompleteBibleReading,
  onCompleteBookChapter,
  onSaveReflection,
  onDeleteReflection
}: TabCommunionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab || 'lesson');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  
  // Lesson state
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonAnswer, setLessonAnswer] = useState('');
  const [lessonAudioUrl, setLessonAudioUrl] = useState<string | null>(null);
  const [lessonSuccessMsg, setLessonSuccessMsg] = useState('');

  // Book Chapter state
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [bookAnswer, setBookAnswer] = useState('');
  const [bookAudioUrl, setBookAudioUrl] = useState<string | null>(null);
  const [bookSuccessMsg, setBookSuccessMsg] = useState('');

  // Reflection state
  const [reflectionContent, setReflectionContent] = useState('');
  const [reflectionAudioUrl, setReflectionAudioUrl] = useState<string | null>(null);
  const [reflectionType, setReflectionType] = useState<'oração' | 'aprendizado' | 'gratidão' | 'reflexão'>('reflexão');
  const [reflectionSuccessMsg, setReflectionSuccessMsg] = useState('');

  // Reset audio on tab/selection changes
  useEffect(() => {
    setLessonAudioUrl(null);
  }, [currentLessonIndex]);

  useEffect(() => {
    setBookAudioUrl(null);
  }, [currentChapterIndex]);

  useEffect(() => {
    setReflectionAudioUrl(null);
  }, [activeSubTab]);

  const currentLesson = lessons[currentLessonIndex] || lessons[0];

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonAnswer.trim() && !lessonAudioUrl) return;

    const finalAnswer = lessonAnswer.trim() || 'Estudo registrado em áudio';
    onCompleteLesson(currentLesson.id, finalAnswer, lessonAudioUrl || undefined);
    setLessonAudioUrl(null);
    setLessonSuccessMsg('✓ Resposta registrada! Adicionou +25 XP (Comunhão Ativa).');
    setTimeout(() => setLessonSuccessMsg(''), 4000);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentChapter = bookChapters[currentChapterIndex];
    if (!currentChapter || (!bookAnswer.trim() && !bookAudioUrl)) return;

    const finalAnswer = bookAnswer.trim() || 'Leitura registrada em áudio';
    onCompleteBookChapter(currentChapter.id, finalAnswer, bookAudioUrl || undefined);
    setBookAudioUrl(null);
    setBookSuccessMsg('✓ Resposta registrada! Adicionou +30 XP (Leitura Concluída).');
    setTimeout(() => setBookSuccessMsg(''), 4000);
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionContent.trim() && !reflectionAudioUrl) return;

    const finalContent = reflectionContent.trim() || 'Diário registrado em áudio';
    onSaveReflection(finalContent, reflectionType, reflectionAudioUrl || undefined);
    setReflectionContent('');
    setReflectionAudioUrl(null);
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
      <div className="bg-[#FAF9F5] p-1 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-1.5 border border-[#e5e0d5]">
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
          id="subtab-btn-book"
          onClick={() => {
            setActiveSubTab('book');
            const cur = bookChapters[currentChapterIndex];
            if (cur) {
              setBookAnswer(cur.answer || '');
            }
          }}
          className={`py-2.5 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            activeSubTab === 'book'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0 text-current" />
          <span className="truncate">Espírito de Profecia</span>
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
                    const todayDay = new Date().getDay();
                    const todayIndex = todayDay === 6 ? 0 : todayDay + 1;
                    const isFuture = index > todayIndex;
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
                            : isFuture
                            ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                            : 'bg-white hover:bg-slate-50 text-slate-500 border-[#e5e0d5]'
                        }`}
                      >
                        <span className="uppercase tracking-widest text-[8px] font-bold opacity-90 leading-none">
                          {isFuture ? `🔒 ${dateInfo.label}` : dateInfo.label}
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
                  {(() => {
                    const todayDay = new Date().getDay();
                    const todayIndex = todayDay === 6 ? 0 : todayDay + 1;
                    const isFutureLesson = currentLessonIndex > todayIndex;

                    if (isFutureLesson) {
                      return (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
                          <span className="text-xl shrink-0">🔒</span>
                          <div className="space-y-1">
                            <p className="font-extrabold text-sm text-[#854d0e]">Estudo de Dia Futuro Bloqueado</p>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              Este estudo pertence a um dia futuro da semana ({currentDayInfo.label}). Você pode ler e estudar adiantado se desejar, mas registrar sua resposta e acumular seus +25 XP só estará disponível quando este dia chegar!
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (currentLesson.completed) {
                      return (
                        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
                          <BookOpenCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                          <div className="space-y-1 w-full">
                            <p className="font-extrabold text-sm">Lição respondida e concluída! (+25 XP)</p>
                            <p className="opacity-95 text-slate-650 italic font-medium bg-white p-2.5 rounded-lg border border-emerald-100 mt-1">O que você aprendeu: "{currentLesson.answer}"</p>
                            {currentLesson.audioUrl && (
                              <div className="mt-3">
                                <span className="text-[10px] text-slate-400 font-bold block mb-1">Anotação em Áudio:</span>
                                <AudioPlayer audioUrl={currentLesson.audioUrl} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
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

                        {/* Audio recording option */}
                        <div className="py-1">
                          <AudioRecorder
                            onAudioReady={(base64) => setLessonAudioUrl(base64)}
                            onClear={() => setLessonAudioUrl(null)}
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
                          disabled={!lessonAnswer.trim() && !lessonAudioUrl}
                          className="w-full bg-[#004b87] hover:bg-[#003b6d] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Responder e Computar XP (+25 XP)
                        </button>
                      </form>
                    );
                  })()}
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
                {bibleReadings.map((reading) => {
                  const isFutureReading = reading.day > streakDays;
                  return (
                    <div
                      key={reading.id}
                      id={`bible-row-${reading.id}`}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        reading.completed
                          ? 'bg-[#059669]/5 border-emerald-250 text-slate-600'
                          : isFutureReading
                          ? 'bg-slate-50 border-slate-200/60 opacity-60'
                          : 'bg-[#FAF9F5] border-[#e5e0d5]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2.5 text-left flex-1 min-w-0">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 text-xs font-bold leading-none ${
                            reading.completed
                              ? 'bg-[#059669] border-[#059669] text-white'
                              : isFutureReading
                              ? 'border-slate-300 bg-slate-100 text-slate-400'
                              : 'border-[#cbd5e1] bg-white text-transparent'
                          }`}>
                            {isFutureReading ? '🔒' : '✓'}
                          </div>
                          <div className="space-y-0.5 flex-1 pr-1">
                            <span className="text-[9px] font-black text-slate-400 font-mono block">
                              Dia {reading.day} {isFutureReading && '• 🔒 Bloqueado (Dia Futuro)'}
                            </span>
                            <p className={`text-xs md:text-sm font-bold leading-normal break-words ${
                              reading.completed 
                                ? 'line-through text-slate-400 font-medium' 
                                : isFutureReading
                                ? 'text-slate-400 font-medium font-bold'
                                : 'text-[#0f2646]'
                            }`}>
                              {reading.passage}
                            </p>
                          </div>
                        </div>

                        {!reading.completed && (
                          isFutureReading ? (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold shrink-0 self-start sm:self-center">
                              Disponível no Dia {reading.day}
                            </span>
                          ) : (
                            <button
                              id={`btn-complete-bible-${reading.id}`}
                              onClick={() => onCompleteBibleReading(reading.id)}
                              className="bg-[#005c53] hover:bg-[#00423c] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm w-full sm:w-auto text-center"
                            >
                              Concluído (+10 XP)
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: EVENTOS FINAIS BOOK STUDY */}
        {activeSubTab === 'book' && (() => {
          const completedChaptersCount = bookChapters.filter(c => c.completed).length;
          const bookProgressPercent = Math.round((completedChaptersCount / (bookChapters.length || 20)) * 100) || 0;
          const currentChapter = bookChapters[currentChapterIndex] || bookChapters[0];
          const chapterText = BOOK_CHAPTERS_CONTENT[currentChapter?.id] || BOOK_CHAPTERS_CONTENT[`chapter-${currentChapter?.chapterNumber}`] || currentChapter?.summary || '';

          return (
            <div className="space-y-6 text-left">
              {/* Progress Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF9F5] p-4 rounded-2xl border border-[#e5e0d5]">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-black font-mono tracking-widest pl-0.5">Espírito de Profecia</span>
                  <p className="text-base font-black text-[#004b87] font-mono mt-0.5">
                    {completedChaptersCount} de {bookChapters.length} capítulos concluídos ({bookProgressPercent}%)
                  </p>
                </div>
                <div className="w-full sm:w-40 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-[#e5e0d5] shrink-0">
                  <div className="h-full bg-[#004b87] transition-all duration-500" style={{ width: `${bookProgressPercent}%` }} />
                </div>
              </div>

              {/* Chapter Selector Grid */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#e5e0d5] space-y-2.5">
                <span className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider pl-0.5">
                  Selecione um Capítulo para Leitura:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
                  {bookChapters.map((ch, idx) => {
                    const isFutureChapter = ch.chapterNumber > streakDays;
                    return (
                      <button
                        key={ch.id}
                        id={`btn-chapter-${idx}`}
                        type="button"
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setBookAnswer(ch.answer || '');
                        }}
                        className={`py-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                          currentChapterIndex === idx
                            ? 'bg-[#004b87] text-white border-[#004b87] shadow-sm scale-105'
                            : ch.completed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                            : isFutureChapter
                            ? 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
                            : 'bg-white hover:bg-slate-50 text-slate-650 border-[#e5e0d5]'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-widest opacity-80 leading-none">
                          {isFutureChapter ? '🔒' : 'Cap'}
                        </span>
                        <span className="text-xs font-mono font-black leading-none mt-0.5">{ch.chapterNumber}</span>
                        {ch.completed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Chapter Details */}
              {currentChapter && (
                <div className="space-y-4">
                  {/* Title & Page Header */}
                  <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#e5e0d5] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e0d5] pb-3">
                      <h4 className="text-lg font-black text-[#0f2646] font-sans">
                        Capítulo {currentChapter.chapterNumber}: {currentChapter.title}
                      </h4>
                      <span className="text-[10px] font-bold text-[#b48a30] bg-[#FDF8EB] border border-[#f5ebcb] px-2.5 py-1 rounded-lg shrink-0 font-mono tracking-wide">
                        Páginas {currentChapter.pages}
                      </span>
                    </div>

                    {/* FULL TEXT SCROLLABLE CONTAINER */}
                    <div className="bg-white rounded-xl border border-stone-150 p-4 sm:p-6 text-sm text-slate-700 leading-relaxed font-sans shadow-inner max-h-[500px] overflow-y-auto space-y-4 scrollbar-thin">
                      {chapterText.split('\n').map((line, lIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;

                        if (trimmed.startsWith('### ')) {
                          return (
                            <h3 key={lIdx} className="text-lg font-black text-[#0f2646] pt-4 pb-1 border-b border-[#e5e0d5] font-sans">
                              {trimmed.substring(4)}
                            </h3>
                          );
                        }
                        if (trimmed.startsWith('#### ')) {
                          return (
                            <h4 key={lIdx} className="text-sm font-black text-[#004b87] pt-3 font-sans uppercase tracking-wide">
                              {trimmed.substring(5)}
                            </h4>
                          );
                        }
                        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                          return (
                            <p key={lIdx} className="text-[11px] font-mono font-medium text-amber-800 bg-[#FDF8EB] border-l-2 border-[#b48a30] p-2 rounded-r-lg italic pl-3 my-1">
                              {trimmed}
                            </p>
                          );
                        }
                        return (
                          <p key={lIdx} className="text-slate-700 leading-relaxed text-justify text-xs md:text-sm">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submission and Validation */}
                  <div className="space-y-3">
                    {(() => {
                      const isFutureChapter = currentChapter.chapterNumber > streakDays;

                      if (isFutureChapter) {
                        return (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
                            <span className="text-xl shrink-0">🔒</span>
                            <div className="space-y-1">
                              <p className="font-extrabold text-sm text-[#854d0e]">Leitura Bloqueada para Validação</p>
                              <p className="text-slate-650 leading-relaxed font-medium">
                                Este capítulo pertence ao dia {currentChapter.chapterNumber} da sua jornada espiritual. Você pode ler e estudar o capítulo adiantado se desejar, mas registrar suas reflexões e acumular seus +30 XP só estará disponível quando sua jornada chegar ao dia do capítulo!
                              </p>
                            </div>
                          </div>
                        );
                      }

                      if (currentChapter.completed) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs">
                            <BookOpenCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                            <div className="space-y-1 w-full">
                              <p className="font-extrabold text-sm text-emerald-800">Leitura concluída e validada! (+30 XP)</p>
                              <p className="text-[10px] text-slate-400 font-mono">Resumo registrado em seu diário profético</p>
                              <p className="opacity-95 text-slate-650 italic font-medium bg-white p-3 rounded-xl border border-emerald-100 mt-2 font-sans break-words shadow-inner">
                                "{currentChapter.answer}"
                              </p>
                              {currentChapter.audioUrl && (
                                <div className="mt-3">
                                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Reflexão em Áudio:</span>
                                  <AudioPlayer audioUrl={currentChapter.audioUrl} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <form onSubmit={handleBookSubmit} className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-[#0f2646] flex items-center gap-1.5 font-sans leading-none">
                              <HelpCircle className="w-4 h-4 shrink-0 text-[#b48a30]" />
                              O que você aprendeu com esta leitura hoje? (Mínimo de reflexão para validar)
                            </label>
                            <p className="text-[11px] text-slate-500 font-medium">Escreva em suas próprias palavras um breve aprendizado ou resumo prático do capítulo para validar e somar pontos de crescimento espiritual.</p>
                            <textarea
                              id="book-chapter-answer"
                              value={bookAnswer}
                              onChange={(e) => setBookAnswer(e.target.value)}
                              placeholder="Escreva aqui suas reflexões, aprendizados e insights sobre os eventos finais descritos neste capítulo..."
                              className="w-full h-28 bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3.5 text-xs md:text-sm text-[#1e293b] placeholder:text-slate-400 font-sans outline-none resize-none shadow-inner"
                            />
                          </div>

                          {/* Audio recording option */}
                          <div className="py-1">
                            <AudioRecorder
                              onAudioReady={(base64) => setBookAudioUrl(base64)}
                              onClear={() => setBookAudioUrl(null)}
                            />
                          </div>

                          {bookSuccessMsg && (
                            <div className="text-xs text-emerald-700 font-mono text-center font-bold">
                              {bookSuccessMsg}
                            </div>
                          )}

                          <button
                            id="btn-complete-book-chapter"
                            type="submit"
                            disabled={!bookAnswer.trim() && !bookAudioUrl}
                            className="w-full bg-[#004b87] hover:bg-[#003b6d] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirmar Leitura e Ganhar XP (+30 XP)
                          </button>
                        </form>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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

              {/* Audio recording option */}
              <div className="py-1">
                <AudioRecorder
                  onAudioReady={(base64) => setReflectionAudioUrl(base64)}
                  onClear={() => setReflectionAudioUrl(null)}
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
                disabled={!reflectionContent.trim() && !reflectionAudioUrl}
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
                      {ref.audioUrl && (
                        <div className="mt-2 pt-1">
                          <AudioPlayer audioUrl={ref.audioUrl} />
                        </div>
                      )}
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
