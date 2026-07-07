import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Gift, Key, Clock, AlertTriangle, CheckCircle, Flame, 
  BookOpen, Compass, Search, Filter, RefreshCw, X, ChevronRight, Eye, ShieldAlert, Heart, Clipboard, Landmark, Award
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfileData } from '../types';
import AvatarOfProgress from './AvatarOfProgress';

interface DiscipuladorPanelProps {
  currentUserId: string;
  currentUserFullName: string;
}

interface Invite {
  id: string;
  code: string;
  type: 'discípulo';
  createdById: string;
  createdByName: string;
  createdAt: string;
  usedByEmail?: string;
  usedById?: string;
  usedAt?: string;
  status: 'pending' | 'used';
  preassignedName?: string;
}

export default function DiscipuladorPanel({ currentUserId, currentUserFullName }: DiscipuladorPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'disciples' | 'invites'>('dashboard');
  const [disciples, setDisciples] = useState<UserProfileData[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invite Generator Form State
  const [inviteCodePrefix, setInviteCodePrefix] = useState('');
  const [preassignedName, setPreassignedName] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Selected Disciple detail modal state
  const [selectedDisciple, setSelectedDisciple] = useState<UserProfileData | null>(null);
  const [discipleAssessments, setDiscipleAssessments] = useState<any[]>([]);
  const [discipleLogs, setDiscipleLogs] = useState<any[]>([]);
  const [discipleReflections, setDiscipleReflections] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Discipulador feedback states
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Sync feedback field when disciple is selected
  useEffect(() => {
    if (selectedDisciple) {
      setFeedbackText(selectedDisciple.discipuladorFeedback || '');
      setFeedbackSuccess(false);
    }
  }, [selectedDisciple]);

  const handleSaveFeedback = async () => {
    if (!selectedDisciple) return;
    setFeedbackLoading(true);
    setFeedbackSuccess(false);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await setDoc(doc(db, 'users', selectedDisciple.id), {
        discipuladorFeedback: feedbackText,
        discipuladorFeedbackDate: todayStr
      }, { merge: true });
      
      // Update local modal state to reflect saved feedback immediately
      setSelectedDisciple(prev => prev ? { 
        ...prev, 
        discipuladorFeedback: feedbackText,
        discipuladorFeedbackDate: todayStr
      } : null);
      
      setFeedbackSuccess(true);
    } catch (err) {
      console.error("Erro ao salvar feedback do discipulador:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch Disciples in real-time
    const qDisciples = query(collection(db, 'users'), where('discipuladorId', '==', currentUserId));
    const unsubscribeDisciples = onSnapshot(qDisciples, (snapshot) => {
      const list: UserProfileData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as UserProfileData);
      });
      setDisciples(list);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar discípulos em tempo real:", err);
      setLoading(false);
    });

    // 2. Fetch Invites in real-time
    const qInvites = query(collection(db, 'invites'), where('createdById', '==', currentUserId));
    const unsubscribeInvites = onSnapshot(qInvites, (snapshot) => {
      const list: Invite[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Invite);
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setInvites(list);
    }, (err) => {
      console.error("Erro ao carregar convites em tempo real:", err);
    });

    return () => {
      unsubscribeDisciples();
      unsubscribeInvites();
    };
  }, [currentUserId]);

  // Fetch individual disciple details when selected
  useEffect(() => {
    if (!selectedDisciple) {
      setDiscipleAssessments([]);
      setDiscipleLogs([]);
      setDiscipleReflections([]);
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const uid = selectedDisciple.id;
        const [assessSnap, logsSnap, reflectionsSnap] = await Promise.all([
          getDocs(collection(db, 'users', uid, 'assessments')),
          getDocs(collection(db, 'users', uid, 'logs')),
          getDocs(collection(db, 'users', uid, 'reflections'))
        ]);

        const assessments: any[] = [];
        assessSnap.forEach((docSnap) => {
          assessments.push({ id: docSnap.id, ...docSnap.data() });
        });
        assessments.sort((a, b) => b.date.localeCompare(a.date));
        setDiscipleAssessments(assessments);

        const logs: any[] = [];
        logsSnap.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...docSnap.data() });
        });
        logs.sort((a, b) => b.date.localeCompare(a.date));
        setDiscipleLogs(logs.slice(0, 20)); // show only last 20

        const reflections: any[] = [];
        reflectionsSnap.forEach((docSnap) => {
          reflections.push({ id: docSnap.id, ...docSnap.data() });
        });
        reflections.sort((a, b) => b.date.localeCompare(a.date));
        setDiscipleReflections(reflections);

      } catch (err) {
        console.error("Erro carregando detalhes do discípulo:", err);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedDisciple]);

  // Alert generation: Inactive for more than 3 days
  const getInactiveDisciples = () => {
    const today = new Date();
    return disciples.filter((d) => {
      if (!d.lastAccessDate) return true;
      const lastAccess = new Date(d.lastAccessDate);
      const diffTime = Math.abs(today.getTime() - lastAccess.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 3;
    });
  };

  // Generate Invite / Access code
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccessMsg('');
    setInviteLoading(true);

    const prefixClean = inviteCodePrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!prefixClean) {
      setInviteError('Por favor, informe um identificador ou iniciais para o convite (Ex: GUILHERME).');
      setInviteLoading(false);
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `${prefixClean}-${randomSuffix}`;

    const newInvite: Invite = {
      id: generatedCode,
      code: generatedCode,
      type: 'discípulo',
      createdById: currentUserId,
      createdByName: currentUserFullName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      preassignedName: preassignedName.trim() || undefined
    };

    try {
      await setDoc(doc(db, 'invites', generatedCode), newInvite);
      setInviteSuccessMsg(`✓ Código de Acesso gerado: ${generatedCode}`);
      setInviteCodePrefix('');
      setPreassignedName('');
    } catch (err: any) {
      console.error(err);
      setInviteError('Erro ao registrar convite no banco de dados.');
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredDisciples = disciples.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.fullName.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
  });

  const inactiveList = getInactiveDisciples();

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      
      {/* Title & Introduction header */}
      <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-left">
          <h3 className="text-lg font-black text-[#0f2646]">Painel do Discipulador</h3>
          <p className="text-xs text-slate-500">Supervisione e instrua os discípulos vinculados ao seu cuidado</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-mono text-xs font-black border border-emerald-500/20 uppercase">
          DISCIPULADOR
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-[#FAF9F5] p-1 rounded-2xl grid grid-cols-3 gap-1.5 border border-[#e5e0d5]">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`py-2.5 px-1 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Alertas</span>
        </button>
        <button
          onClick={() => setActiveSubTab('disciples')}
          className={`py-2.5 px-1 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'disciples'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Discípulos ({disciples.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('invites')}
          className={`py-2.5 px-1 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'invites'
              ? 'bg-[#004b87] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Convites</span>
        </button>
      </div>

      {/* TAB CONTENT: ALERTS & HUD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#e5e0d5] p-4 rounded-2xl text-left shadow-sm">
              <span className="text-[9px] uppercase font-mono font-black text-slate-400">Total de Discípulos</span>
              <p className="text-2xl font-black text-[#0f2646] mt-1">{disciples.length}</p>
              <span className="text-[10px] text-slate-500 leading-none">Vinculados permanentemente</span>
            </div>
            <div className="bg-white border border-[#e5e0d5] p-4 rounded-2xl text-left shadow-sm">
              <span className="text-[9px] uppercase font-mono font-black text-slate-400">Alertas de Inatividade</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{inactiveList.length}</p>
              <span className="text-[10px] text-slate-500 leading-none">Sem acesso por &gt;3 dias</span>
            </div>
          </div>

          {/* Inactivity Alert Panel */}
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-extrabold text-[#0f2646] text-sm">Alertas e Indicadores de Atenção</h4>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Discípulos necessitando de acompanhamento ativo</p>
              </div>
            </div>

            {inactiveList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1.5">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                <p className="text-xs font-bold text-slate-500">Excelente! Nenhum discípulo inativo no momento.</p>
                <p className="text-[10px] text-slate-400">Todos os seus discípulos acessaram recentemente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inactiveList.map((disc) => {
                  const daysInactive = disc.lastAccessDate
                    ? Math.ceil(Math.abs(new Date().getTime() - new Date(disc.lastAccessDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 'Nenhum';
                  return (
                    <div key={disc.id} className="border border-amber-200 bg-amber-50/45 p-3.5 rounded-2xl flex items-center justify-between text-left gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarOfProgress
                          gender={disc.gender || 'M'}
                          level={disc.level || 1}
                          size="md"
                          skinColor={disc.skinColor}
                          hairStyle={disc.hairStyle}
                          hairColor={disc.hairColor}
                          eyeStyle={disc.eyeStyle}
                          clothingColor={disc.clothingColor}
                          hasBeard={disc.hasBeard}
                          hasGlasses={disc.hasGlasses}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#0f2646] truncate">{disc.fullName}</p>
                          <p className="text-[10px] text-amber-800 font-medium">Inativo há {daysInactive} {daysInactive === 1 ? 'dia' : 'dias'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDisciple(disc)}
                        className="bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-900 font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer"
                      >
                        Acompanhar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick encouragement advice banner */}
          <div className="bg-[#FAF9F5] border border-[#e5e0d5] p-4 rounded-2xl text-left space-y-1">
            <span className="text-[9px] font-black text-[#b48a30] uppercase font-mono">Dica do Discipulador</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dentre as ações de Relacionamento, tire um momento hoje para enviar um versículo encorajador e perguntar se eles precisam de oração em algum assunto específico. O discipulado cresce na proximidade!
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DISCIPLES LIST */}
      {activeSubTab === 'disciples' && (
        <div className="space-y-4 text-left">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar discípulos por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e5e0d5] focus:border-[#004b87] focus:ring-4 focus:ring-[#004b87]/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder:text-stone-400 text-slate-800"
            />
          </div>

          {filteredDisciples.length === 0 ? (
            <div className="bg-white border border-[#e5e0d5] rounded-3xl p-8 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 text-[#e5e0d5] mx-auto" />
              <p className="text-xs font-bold">Nenhum discípulo encontrado.</p>
              <p className="text-[10px] text-slate-400">Gere códigos de acesso para convidar membros ou mude sua busca.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#e5e0d5] rounded-3xl p-1.5 shadow-sm divide-y divide-stone-100">
              {filteredDisciples.map((disc) => {
                const hasAssessment = disc.lastAssessmentScores !== undefined;
                const scores = disc.lastAssessmentScores as any;
                const avg = hasAssessment ? Math.round((scores.comunhao + scores.relacionamento + scores.fidelidade + scores.missao) / 4) : 0;
                
                return (
                  <div key={disc.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarOfProgress
                        gender={disc.gender || 'M'}
                        level={disc.level || 1}
                        size="md"
                        skinColor={disc.skinColor}
                        hairStyle={disc.hairStyle}
                        hairColor={disc.hairColor}
                        eyeStyle={disc.eyeStyle}
                        clothingColor={disc.clothingColor}
                        hasBeard={disc.hasBeard}
                        hasGlasses={disc.hasGlasses}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-[#0f2646] truncate">{disc.fullName}</p>
                          <span className="text-[8px] bg-[#004b87]/10 text-[#004b87] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0">
                            Nvl {disc.level}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono leading-none truncate mt-1">{disc.email}</p>
                        {hasAssessment ? (
                          <span className="inline-block text-[8px] bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold mt-1.5 font-mono">
                            Maturidade: {avg}%
                          </span>
                        ) : (
                          <span className="inline-block text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md font-bold mt-1.5 font-mono">
                            Sem avaliação
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDisciple(disc)}
                      className="p-2.5 bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-[#004b87] rounded-xl transition-all shrink-0 cursor-pointer"
                      title="Ver Diagnóstico do Discípulo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: INVITES GENERATOR */}
      {activeSubTab === 'invites' && (
        <div className="space-y-5 text-left">
          {/* Create Invite Code Form */}
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <UserPlus className="w-5 h-5 text-[#004b87] shrink-0" />
              <div>
                <h4 className="font-extrabold text-[#0f2646] text-sm">Gerar Novo Convite de Acesso</h4>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Permita que novos discípulos criem contas vinculadas a você</p>
              </div>
            </div>

            {inviteSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-emerald-800 text-xs font-bold font-mono flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            {inviteError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 text-red-800 text-xs font-bold font-mono flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Iniciais / Identificador</label>
                  <input
                    type="text"
                    placeholder="Ex: SILVA"
                    value={inviteCodePrefix}
                    required
                    onChange={(e) => setInviteCodePrefix(e.target.value.toUpperCase())}
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#004b87] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Nome do Discípulo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Guilherme"
                    value={preassignedName}
                    onChange={(e) => setPreassignedName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#004b87] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-[#004b87] hover:bg-[#003763] text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {inviteLoading ? 'Registrando...' : 'Gerar Código de Convite'}
              </button>
            </form>
          </div>

          {/* Invites History List */}
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Clipboard className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <h4 className="font-extrabold text-[#0f2646] text-sm">Convites Criados por Você</h4>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Histórico e status de resgate dos códigos de acesso</p>
              </div>
            </div>

            {invites.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-mono">Nenhum convite gerado.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {invites.map((invite) => (
                  <div key={invite.id} className="border border-stone-150 p-3.5 rounded-2xl bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#004b87] bg-white border border-stone-200 px-2.5 py-0.5 rounded-lg select-all">
                          {invite.code}
                        </span>
                        {invite.preassignedName && (
                          <span className="text-[9px] text-slate-500 font-bold bg-[#FAF9F5] border border-stone-200 px-1.5 py-0.5 rounded-md">
                            Para: {invite.preassignedName}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">Criado em {invite.createdAt}</p>
                    </div>

                    <div className="text-right shrink-0">
                      {invite.status === 'pending' ? (
                        <span className="inline-block text-[9px] font-black uppercase font-mono px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Pendente
                        </span>
                      ) : (
                        <div className="text-right leading-tight">
                          <span className="inline-block text-[9px] font-black uppercase font-mono px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Resgatado
                          </span>
                          {invite.usedByEmail && (
                            <p className="text-[9px] text-slate-400 font-mono mt-1">{invite.usedByEmail}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED MEMBER MODAL */}
      <AnimatePresence>
        {selectedDisciple && (
          <div className="fixed inset-0 bg-[#0f2646]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#e5e0d5] rounded-3xl p-6 text-center max-w-lg w-full space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDisciple(null)} 
                className="absolute top-4 right-4 p-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header profile info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-stone-100 pb-4 text-left">
                <AvatarOfProgress
                  gender={selectedDisciple.gender || 'M'}
                  level={selectedDisciple.level || 1}
                  size="md"
                  skinColor={selectedDisciple.skinColor}
                  hairStyle={selectedDisciple.hairStyle}
                  hairColor={selectedDisciple.hairColor}
                  eyeStyle={selectedDisciple.eyeStyle}
                  clothingColor={selectedDisciple.clothingColor}
                  hasBeard={selectedDisciple.hasBeard}
                  hasGlasses={selectedDisciple.hasGlasses}
                />
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-black text-[#0f2646] leading-snug">{selectedDisciple.fullName}</h4>
                  <p className="text-xs font-mono text-slate-400 leading-none mt-1">{selectedDisciple.email}</p>
                  
                  {/* General stats bar */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 font-mono text-[9px] font-black uppercase text-slate-500">
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      Streak: {selectedDisciple.streakDays}d
                    </span>
                    <span className="bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md">
                      Nível {selectedDisciple.level}
                    </span>
                    <span className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                      PONTOS: {selectedDisciple.totalPoints}
                    </span>
                  </div>
                </div>
              </div>

              {detailsLoading ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#004b87]" />
                  <p className="text-xs text-slate-400 mt-2 font-mono">Carregando dados detalhados...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 text-left">
                  
                  {/* Maturity Assessment Summary */}
                  {discipleAssessments.length > 0 ? (
                    <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#004b87]">
                        <Award className="w-4.5 h-4.5 text-amber-500 font-black animate-pulse" />
                        <span>Maturidade Espiritual • {discipleAssessments[0].date}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-stone-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Comunhão</span>
                          <span className="font-mono text-xs font-black text-slate-700">{discipleAssessments[0].scores.comunhao}%</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Relac.</span>
                          <span className="font-mono text-xs font-black text-slate-700">{discipleAssessments[0].scores.relacionamento}%</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Fidelidade</span>
                          <span className="font-mono text-xs font-black text-slate-700">{discipleAssessments[0].scores.fidelidade}%</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Missão</span>
                          <span className="font-mono text-xs font-black text-slate-700">{discipleAssessments[0].scores.missao}%</span>
                        </div>
                      </div>

                      {/* Detailed Question Answers (Collapsible) */}
                      <details className="group bg-white border border-stone-200 rounded-xl overflow-hidden mt-2">
                        <summary className="flex items-center justify-between p-2.5 text-xs font-extrabold text-slate-600 bg-stone-50 cursor-pointer list-none select-none">
                          <span>🔍 Ver Respostas Detalhadas</span>
                          <span className="transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <div className="p-3 space-y-3.5 border-t border-stone-150 max-h-[220px] overflow-y-auto bg-stone-50/20">
                          {(() => {
                            const QUESTIONS_MAP: Record<string, { label: string; pillar: string }> = {
                              comunhao_1: { label: "Estudo diário da Bíblia e Lição", pillar: "Comunhão" },
                              comunhao_2: { label: "Frequência e intimidade de Oração", pillar: "Comunhão" },
                              relacionamento_1: { label: "Culto familiar e comunhão no lar", pillar: "Relacionamento" },
                              relacionamento_2: { label: "Participação no Pequeno Grupo", pillar: "Relacionamento" },
                              fidelidade_1: { label: "Fidelidade nos dízimos e ofertas", pillar: "Fidelidade" },
                              fidelidade_2: { label: "Uso de dons espirituais no ministério", pillar: "Fidelidade" },
                              missao_1: { label: "Testemunho pessoal e evangelismo", pillar: "Missão" },
                              missao_2: { label: "Participação em projetos comunitários", pillar: "Missão" }
                            };
                            return Object.entries(discipleAssessments[0].answers || {}).map(([qId, score]) => {
                              const q = QUESTIONS_MAP[qId] || { label: qId, pillar: "Pilar" };
                              const widthPct = Number(score);
                              const barColor = q.pillar === "Comunhão" ? "bg-sky-500" : q.pillar === "Relacionamento" ? "bg-emerald-500" : q.pillar === "Fidelidade" ? "bg-amber-500" : "bg-rose-500";
                              return (
                                <div key={qId} className="space-y-1 text-xs text-left">
                                  <div className="flex justify-between items-start gap-1 font-bold">
                                    <span className="text-[#0f2646] font-extrabold leading-tight">{q.label}</span>
                                    <span className="text-stone-500 font-mono text-[10px] shrink-0 bg-stone-100 px-1.5 py-0.2 rounded font-extrabold">{score}%</span>
                                  </div>
                                  <div className="w-full bg-stone-200 rounded-full h-1.5">
                                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${widthPct}%` }} />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </details>

                      {/* Disciple's Personal Observation */}
                      {discipleAssessments[0].observation && (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl mt-2">
                          <span className="block text-[8.5px] uppercase font-mono font-black text-[#b48a30]">Observações do Discípulo</span>
                          <p className="text-xs text-slate-700 italic mt-1 leading-normal font-medium">"{discipleAssessments[0].observation}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-center text-xs text-slate-400">
                      Este discípulo ainda não realizou o Diagnóstico de Maturidade Espiritual.
                    </div>
                  )}

                  {/* Discipulador Diagnosis Feedback Input */}
                  <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl space-y-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#004b87]">
                      <Clipboard className="w-4.5 h-4.5 text-[#004b87]" />
                      <span>Seu Feedback e Parecer de Discipulado</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Escreva suas observações, conselhos espirituais e planos de oração para este discípulo. O pastor do distrito também visualizará este feedback.
                    </p>
                    
                    <textarea
                      rows={3}
                      placeholder="Ex: Conversamos sobre o plano de leitura diária e decidimos focar em ler 1 capítulo por dia logo de manhã. Ele demonstrou boa abertura..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-white border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3 text-xs outline-none transition-all placeholder:text-stone-400 text-stone-850 font-medium shadow-inner resize-none focus:ring-4 focus:ring-[#004b87]/10"
                    />

                    {feedbackSuccess && (
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                        ✓ Feedback atualizado e salvo com sucesso no perfil!
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={feedbackLoading}
                      onClick={handleSaveFeedback}
                      className="bg-[#004b87] hover:bg-[#003763] text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {feedbackLoading ? 'Salvando...' : 'Salvar Feedback de Discipulado'}
                    </button>
                  </div>

                  {/* Recent reflections / Diary entries */}
                  {discipleReflections.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Últimas Reflexões do Diário</h5>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {discipleReflections.map((ref) => (
                          <div key={ref.id} className="border border-stone-150 bg-white p-3 rounded-xl">
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1.5">
                              <span className="font-black uppercase text-[#004b87]">{ref.type}</span>
                              <span>{ref.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-normal italic font-serif">"{ref.content}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Devotional history logs list */}
                  {discipleLogs.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Últimas Atividades Sincronizadas</h5>
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                        {discipleLogs.map((log) => (
                          <div key={log.id} className="text-xs flex items-center justify-between border-b border-stone-50 py-1.5 font-sans">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-slate-400 text-[10px] shrink-0">{log.date.substring(5, 16)}</span>
                              <p className="font-bold text-slate-700 truncate">{log.title}</p>
                            </div>
                            <span className="text-emerald-600 font-mono font-bold shrink-0">+{log.xpReceived} XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              <button
                onClick={() => setSelectedDisciple(null)}
                className="w-full bg-[#004b87] hover:bg-[#003763] text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all"
              >
                Concluir Acompanhamento
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
