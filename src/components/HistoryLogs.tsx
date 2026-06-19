import React, { useState } from 'react';
import { History, Search, Star, BookOpen, Compass, PenTool, HeartHandshake } from 'lucide-react';
import { ActivityHistory } from '../types';

interface HistoryLogsProps {
  logs: ActivityHistory[];
}

type FilterPeriod = 'hoje' | 'semana' | 'mês' | 'ano' | 'tudo';

export default function HistoryLogs({ logs }: HistoryLogsProps) {
  const [filter, setFilter] = useState<FilterPeriod>('tudo');
  const [searchQuery, setSearchQuery] = useState('');

  const getActivityIcon = (type: ActivityHistory['type']) => {
    switch (type) {
      case 'lição':
        return <BookOpen className="w-4 h-4 text-[#004b87]" />;
      case 'bíblia':
        return <Compass className="w-4 h-4 text-[#005c53]" />;
      case 'reflexão':
        return <PenTool className="w-4 h-4 text-[#b48a30]" />;
      case 'missão':
        return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'streak_bônus':
        return <Star className="w-4 h-4 text-orange-650" />;
      case 'nível_up':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-300" />;
    }
  };

  const matchesPeriod = (logDateStr: string, period: FilterPeriod) => {
    if (period === 'tudo') return true;

    try {
      const logDate = new Date(logDateStr.replace(' ', 'T'));
      const now = new Date();
      const logTime = logDate.getTime();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      switch (period) {
        case 'hoje':
          return logTime >= todayStart;
        case 'semana':
          return logTime >= todayStart - 7 * 24 * 60 * 60 * 1000;
        case 'mês':
          return logTime >= todayStart - 30 * 24 * 60 * 60 * 1000;
        case 'ano':
          return logTime >= todayStart - 365 * 24 * 60 * 60 * 1000;
      }
    } catch (e) {}
    return true;
  };

  const filteredLogs = logs
    .filter((log) => matchesPeriod(log.date, filter))
    .filter((log) => {
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(term) ||
        (log.observation && log.observation.toLowerCase().includes(term))
      );
    });

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Title */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Livro de Crônicas</h3>
          <p className="text-xs text-slate-500">Histórico de comunhão, relatórios entregues e amadurecimento</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87]">
          <History className="w-5 h-5" />
        </div>
      </div>

      {/* Filter and Search HUD */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-4 space-y-4 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Pesquisar por lição, oração, missão ou data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm outline-none text-[#1e293b] placeholder:text-slate-400"
          />
        </div>

        {/* Period Chips */}
        <div className="flex flex-wrap gap-1.5 justify-start">
          {[
            { id: 'tudo', label: 'Tudo' },
            { id: 'hoje', label: 'Hoje' },
            { id: 'semana', label: 'Semana' },
            { id: 'mês', label: 'Este Mês' },
            { id: 'ano', label: 'Este Ano' },
          ].map((period) => (
            <button
              key={period.id}
              id={`history-filter-btn-${period.id}`}
              onClick={() => setFilter(period.id as any)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                filter === period.id
                  ? 'bg-[#004b87] border-[#004b87] text-white shadow-sm'
                  : 'bg-[#FAF9F5] border-[#e5e0d5] text-slate-500 hover:text-[#004b87]'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline entries list */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-[#FAF9F5] border border-dashed border-[#e5e0d5] p-8 rounded-3xl text-center text-slate-400 text-xs">
            Nenhum registro encontrado para a busca ou filtro selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                id={`history-item-${log.id}`}
                className="bg-white border border-[#e5e0d5] p-4 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#cbd5e1] transition-all"
              >
                {/* Micro Visual Symbol Indicator */}
                <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#e5e0d5] shrink-0 flex items-center justify-center">
                  {getActivityIcon(log.type)}
                </div>

                {/* Meta details */}
                <div className="flex-1 space-y-1 text-left min-w-0">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">{log.date}</span>
                    <span className="text-emerald-700 text-xs font-black font-mono">
                      +{log.xpReceived} XP
                    </span>
                  </div>

                  <p className="text-xs md:text-sm font-extrabold text-[#0f2646] truncate">
                    {log.title}
                  </p>

                  {/* Optional observation detail */}
                  {log.observation && (
                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#e5e0d5] text-xs text-slate-650 italic mt-1.5 break-words">
                      "{log.observation}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
