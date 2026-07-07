import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, ToggleLeft, ToggleRight, Edit, Users, Activity, X, ShieldAlert, Check, Search, Filter, BookOpen, Star, Flame, Trophy, Award, Landmark, Eye, Heart, Calendar, Compass, Clipboard, Key, CheckCircle, Clock } from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { MissionChallenge, UserProfileData } from '../types';
import AvatarOfProgress from './AvatarOfProgress';

interface AdminPanelProps {
  challenges: MissionChallenge[];
  userList: UserProfileData[];
  totalActivitiesCount: number;
  onCreateMission: (mission: Omit<MissionChallenge, 'completedCount'>) => void;
  onUpdateMission: (mission: MissionChallenge) => void;
  onModifyUserXp: (userId: string, xpChange: number) => void;
  onToggleUserAdminRole: (userId: string, newRole: 'admin' | 'user') => void;
}

export default function AdminPanel({
  challenges,
  userList,
  totalActivitiesCount,
  onCreateMission,
  onUpdateMission,
  onModifyUserXp,
  onToggleUserAdminRole,
}: AdminPanelProps) {
  // Set default tab to 'dashboard' as requested to show the graphical stats interface first
  const [adminTab, setAdminTab] = useState<'dashboard' | 'usuarios' | 'missoes' | 'convites'>('dashboard');

  // Invites states
  const [allInvites, setAllInvites] = useState<any[]>([]);
  const [inviteCodePrefix, setInviteCodePrefix] = useState('');
  const [inviteIsFixed, setInviteIsFixed] = useState(false); // false = unique, true = fixed (reusable)
  const [invitePreassignedName, setInvitePreassignedName] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Interactive District Dashboard States
  const [selectedDashboardChurch, setSelectedDashboardChurch] = useState<string>('Todas');

  // Supervisionar Fiei's states
  const [selectedChurchFilter, setSelectedChurchFilter] = useState<string>('Todas');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Create Mission form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionXp, setMissionXp] = useState(25);
  const [missionLevelReq, setMissionLevelReq] = useState(1);
  const [missionDifficulty, setMissionDifficulty] = useState<'fácil' | 'médio' | 'avançado'>('fácil');

  // Edit Mission states
  const [editingMission, setEditingMission] = useState<MissionChallenge | null>(null);

  // Selected member for detail panorama modal
  const [selectedMember, setSelectedMember] = useState<UserProfileData | null>(null);
  
  // Member detailed subcollections states
  const [selectedLessons, setSelectedLessons] = useState<any[]>([]);
  const [selectedBibleReadings, setSelectedBibleReadings] = useState<any[]>([]);
  const [selectedReflections, setSelectedReflections] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<any[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<any[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [currentSelectedTab, setCurrentSelectedTab] = useState<'lessons' | 'reflections' | 'missions' | 'bible' | 'logs' | 'assessments'>('lessons');

  // Pastor Feedback states
  const [pastorFeedbackText, setPastorFeedbackText] = useState('');
  const [pastorFeedbackLoading, setPastorFeedbackLoading] = useState(false);
  const [pastorFeedbackSuccess, setPastorFeedbackSuccess] = useState(false);

  // Sync pastor feedback field when member is selected
  useEffect(() => {
    if (selectedMember) {
      setPastorFeedbackText(selectedMember.pastorFeedback || '');
      setPastorFeedbackSuccess(false);
    }
  }, [selectedMember]);

  const handleSavePastorFeedback = async () => {
    if (!selectedMember) return;
    setPastorFeedbackLoading(true);
    setPastorFeedbackSuccess(false);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await setDoc(doc(db, 'users', selectedMember.id), {
        pastorFeedback: pastorFeedbackText,
        pastorFeedbackDate: todayStr
      }, { merge: true });
      
      // Update local modal state to reflect saved feedback immediately
      setSelectedMember(prev => prev ? { 
        ...prev, 
        pastorFeedback: pastorFeedbackText,
        pastorFeedbackDate: todayStr
      } : null);
      
      setPastorFeedbackSuccess(true);
    } catch (err) {
      console.error("Erro ao salvar feedback do pastor:", err);
    } finally {
      setPastorFeedbackLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedMember) {
      setSelectedLessons([]);
      setSelectedBibleReadings([]);
      setSelectedReflections([]);
      setSelectedMissions([]);
      setSelectedLogs([]);
      setSelectedAssessments([]);
      setDetailsError(null);
      return;
    }

    const fetchMemberSubcollections = async () => {
      setDetailsLoading(true);
      setDetailsError(null);
      const uid = selectedMember.id;

      try {
        const [lessonsSnap, bibleSnap, reflectionsSnap, missionsSnap, logsSnap, assessmentsSnap] = await Promise.all([
          getDocs(collection(db, 'users', uid, 'lessons')),
          getDocs(collection(db, 'users', uid, 'bible')),
          getDocs(collection(db, 'users', uid, 'reflections')),
          getDocs(collection(db, 'users', uid, 'completedMissions')),
          getDocs(collection(db, 'users', uid, 'logs')),
          getDocs(collection(db, 'users', uid, 'assessments')),
        ]);

        const lessonsList: any[] = [];
        lessonsSnap.forEach((docSnap) => {
          lessonsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSelectedLessons(lessonsList);

        const bibleList: any[] = [];
        bibleSnap.forEach((docSnap) => {
          bibleList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSelectedBibleReadings(bibleList);

        const reflectionsList: any[] = [];
        reflectionsSnap.forEach((docSnap) => {
          reflectionsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSelectedReflections(reflectionsList);

        const missionsList: any[] = [];
        missionsSnap.forEach((docSnap) => {
          missionsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSelectedMissions(missionsList);

        const logsList: any[] = [];
        logsSnap.forEach((docSnap) => {
          logsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        logsList.sort((a, b) => b.id.localeCompare(a.id));
        setSelectedLogs(logsList);

        const assessmentsList: any[] = [];
        assessmentsSnap.forEach((docSnap) => {
          assessmentsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        assessmentsList.sort((a, b) => b.date.localeCompare(a.date));
        setSelectedAssessments(assessmentsList);

        // Auto-heal mismatches in counter attributes to make sure the stats cards and list always match raw subcollections!
        const correctLessonsCount = lessonsList.length;
        const correctBibleCount = bibleList.length;
        const correctReflectionsCount = reflectionsList.length;
        const correctMissionsCount = missionsList.length;

        const needsHeal = 
          selectedMember.lessonsStudiedCount !== correctLessonsCount ||
          selectedMember.bibleReadingsCount !== correctBibleCount ||
          selectedMember.reflectionsCount !== correctReflectionsCount ||
          selectedMember.completedMissionsCount !== correctMissionsCount;

        if (needsHeal) {
          await setDoc(doc(db, 'users', uid), {
            lessonsStudiedCount: correctLessonsCount,
            bibleReadingsCount: correctBibleCount,
            reflectionsCount: correctReflectionsCount,
            completedMissionsCount: correctMissionsCount
          }, { merge: true });
        }

      } catch (e: any) {
        console.error("Erro ao carregar os dados detalhados do membro:", e);
        setDetailsError(e.message || String(e));
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchMemberSubcollections();
  }, [selectedMember]);

  // Realtime subscription to invites
  useEffect(() => {
    const qInvites = query(collection(db, 'invites'));
    const unsubscribe = onSnapshot(qInvites, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort: fixed first, then newest
      list.sort((a, b) => {
        if (a.isFixed && !b.isFixed) return -1;
        if (!a.isFixed && b.isFixed) return 1;
        const dateA = a.createdAt ? new Date(a.createdAt.split('/').reverse().join('-')).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt.split('/').reverse().join('-')).getTime() : 0;
        return dateB - dateA;
      });
      setAllInvites(list);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'invites');
      } catch (e) {
        console.error("Erro ao assinar convites:", e);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccessMsg('');
    setInviteLoading(true);

    const prefixClean = inviteCodePrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!prefixClean) {
      setInviteError('Por favor, informe um código ou iniciais para o convite (Ex: MARCOS ou COORDENADOR).');
      setInviteLoading(false);
      return;
    }

    let generatedCode = prefixClean;
    if (!inviteIsFixed) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      generatedCode = `${prefixClean}-${randomSuffix}`;
    }

    const pathForWrite = 'invites';
    try {
      const docRef = doc(db, 'invites', generatedCode);
      const newInvite = {
        id: generatedCode,
        code: generatedCode,
        preassignedName: invitePreassignedName.trim() || undefined,
        createdById: 'pastor-admin',
        createdByName: 'Pastor do Distrito',
        createdAt: new Date().toLocaleDateString('pt-BR'),
        status: 'pending',
        type: 'discipulador',
        isFixed: inviteIsFixed
      };

      await setDoc(docRef, newInvite);
      setInviteSuccessMsg(`✓ Código de Acesso ${inviteIsFixed ? 'Fixo' : 'Individual'} gerado: ${generatedCode}`);
      setInviteCodePrefix('');
      setInvitePreassignedName('');
    } catch (err) {
      console.error("Erro ao gerar convite:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, pathForWrite);
      } catch (formattedErr: any) {
        setInviteError('Erro ao registrar convite no banco de dados.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, 'invites', inviteId));
    } catch (err) {
      console.error("Erro ao deletar convite:", err);
    }
  };

  // Selected user to promote to pastor/admin
  const [userToPromoteId, setUserToPromoteId] = useState<string>('');

  const CHURCH_OPTIONS = [
    'Bonsucesso',
    'Baraúna',
    'Carambeí Central',
    'Jardim Eldorado',
    'Jardim Esplanada',
    'Jardim Planalto',
    'Los Angeles',
    'Tânia Mara',
    'Vila Borato',
    'Vila Romana'
  ];

  // Filter out the pastor and administrator accounts from general statistics and lists
  const cleanMembersList = userList.filter((u) => {
    const emailLower = u.email.toLowerCase();
    const nameLower = u.fullName.toLowerCase();
    return !(
      u.id === 'admin-user-id' ||
      emailLower === 'admin@discipulado.com' ||
      emailLower.includes('admin') ||
      emailLower.includes('pastor') ||
      nameLower.includes('pastor') ||
      nameLower.includes('diego') ||
      u.role === 'admin'
    );
  });

  // Calculate high-privilege administrators
  const districtAdministrators = userList.filter((u) => {
    const emailLower = u.email.toLowerCase();
    const nameLower = u.fullName.toLowerCase();
    return (
      u.id === 'admin-user-id' ||
      emailLower === 'admin@discipulado.com' ||
      u.role === 'admin' ||
      emailLower.includes('admin') ||
      emailLower.includes('pastor') ||
      nameLower.includes('pastor') ||
      nameLower.includes('diego')
    );
  });

  // Helper calculation function for Church Statistics
  const getChurchStats = () => {
    return CHURCH_OPTIONS.map((chName) => {
      const members = cleanMembersList.filter(u => u.church === chName);
      const totalXp = members.reduce((acc, u) => acc + u.xp, 0);
      const totalMissions = members.reduce((acc, u) => acc + u.completedMissionsCount, 0);
      const totalStreak = members.reduce((acc, u) => acc + u.streakDays, 0);
      const avgXp = members.length > 0 ? Math.round(totalXp / members.length) : 0;
      const avgStreak = members.length > 0 ? Math.round((totalStreak / members.length) * 10) / 10 : 0;
      
      return {
        name: chName,
        memberCount: members.length,
        totalXp,
        totalMissions,
        avgXp,
        avgStreak,
        members
      };
    }).sort((a, b) => b.totalXp - a.totalXp); // Sorted by total XP to rank leaderboards automatically
  };

  const churchStats = getChurchStats();
  const activeChurchesStats = churchStats.filter(c => c.memberCount > 0);

  // Global District Summary Stats
  const totalDistrictXP = cleanMembersList.reduce((acc, u) => acc + u.xp, 0);
  const avgDistrictStreak = cleanMembersList.length > 0 
    ? Math.round((cleanMembersList.reduce((acc, u) => acc + u.streakDays, 0) / cleanMembersList.length) * 10) / 10 
    : 0;
  const avgDistrictLevel = cleanMembersList.length > 0 
    ? Math.round((cleanMembersList.reduce((acc, u) => acc + u.level, 0) / cleanMembersList.length) * 10) / 10 
    : 1;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || !missionDesc.trim()) return;

    onCreateMission({
      id: `custom-mission-${Date.now()}`,
      title: missionTitle,
      description: missionDesc,
      xpReward: Number(missionXp),
      levelRequired: Number(missionLevelReq),
      isActive: true,
      difficulty: missionDifficulty,
    });

    // Reset fields
    setMissionTitle('');
    setMissionDesc('');
    setMissionXp(25);
    setMissionLevelReq(1);
    setMissionDifficulty('fácil');
    setShowCreateModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission || !editingMission.title.trim() || !editingMission.description.trim()) return;

    onUpdateMission(editingMission);
    setEditingMission(null);
  };

  const toggleChallengeActive = (mission: MissionChallenge) => {
    onUpdateMission({
      ...mission,
      isActive: !mission.isActive,
    });
  };

  // Filtered Users for supervision tab
  const filteredUsers = cleanMembersList.filter((usr) => {
    const matchesChurch = selectedChurchFilter === 'Todas' || usr.church === selectedChurchFilter;
    const matchesSearch = usr.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          usr.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesChurch && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Title Header area */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#0f2646] tracking-tight">Painel Pastoral e Administrativo</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Controle executivo do Distrito Esplanada e desempenho das igrejas locais</p>
          </div>
        </div>
        <span className="bg-rose-500/10 text-rose-700 border border-rose-500/20 text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full font-mono">
          Acesso Pr. Diego Prado
        </span>
      </div>

      {/* Numerical overview metrics widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl flex items-center gap-3 shadow-sm text-left">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block leading-none">Total Membros</span>
            <span id="admin-stat-users" className="text-lg font-black font-mono block text-[#0f2646] mt-1">{cleanMembersList.length} membros</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl flex items-center gap-3 shadow-sm text-left">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-700 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block leading-none">Ações Logadas</span>
            <span id="admin-stat-acts" className="text-lg font-black font-mono block text-[#0f2646] mt-1">{totalActivitiesCount} ações</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl flex items-center gap-3 shadow-sm text-left">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-700 shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block leading-none">Desafios</span>
            <span id="admin-stat-missions" className="text-lg font-black font-mono block text-[#0f2646] mt-1">{challenges.length} missões</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl flex items-center gap-3 shadow-sm text-left">
          <div className="bg-[#b48a30]/10 p-2.5 rounded-xl text-[#b48a30] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block leading-none">XP Total Distrito</span>
            <span id="admin-stat-total-xp" className="text-lg font-black font-mono block text-[#0f2646] mt-1">{totalDistrictXP} XP</span>
          </div>
        </div>
      </div>

      {/* Main Administrative Tabs Switching - Styled elegantly to look cohesive */}
      <div className="bg-[#FAF9F5] p-1.5 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-1.5 border border-[#e5e0d5]">
        <button
          id="admin-tab-btn-dashboard"
          onClick={() => setAdminTab('dashboard')}
          className={`py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            adminTab === 'dashboard' ? 'bg-[#004b87] text-white shadow-md' : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          📊 Dashboard Geral
        </button>
        <button
          id="admin-tab-btn-users"
          onClick={() => setAdminTab('usuarios')}
          className={`py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            adminTab === 'usuarios' ? 'bg-[#004b87] text-white shadow-md' : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          👥 Membros ({cleanMembersList.length})
        </button>
        <button
          id="admin-tab-btn-missions"
          onClick={() => setAdminTab('missoes')}
          className={`py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            adminTab === 'missoes' ? 'bg-[#004b87] text-white shadow-md' : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          🎯 Desafios ({challenges.length})
        </button>
        <button
          id="admin-tab-btn-invites"
          onClick={() => setAdminTab('convites')}
          className={`py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            adminTab === 'convites' ? 'bg-[#004b87] text-white shadow-md' : 'text-slate-500 hover:text-[#004b87]'
          }`}
        >
          🔑 Convites Discipulado
        </button>
      </div>

      {/* 📊 VIEW PANEL 1: DISTRICT & CHURCHES GRAPHICAL DASHBOARD */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6 text-left">
          {/* Quick Overview Section */}
          <div className="bg-gradient-to-r from-blue-50 to-[#004b87]/5 border border-[#004b87]/20 p-5 rounded-2xl text-left space-y-4">
            <h4 className="text-sm font-black text-[#0f2646] uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#004b87]" />
              Diagnóstico de Saúde Espiritual do Distrito Esplanada
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
              Este dashboard agrega dados em tempo real enviados de todas as 10 congregações do distrito. Acompanhe a média de constância, total de pontos (XP), e compare o engajamento coletivo para planejar intervenções e cultos integrados.
            </p>
            
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#e5e0d5] text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none">Média Constância</span>
                <span className="text-base font-black font-mono block text-orange-700 mt-1">🔥 {avgDistrictStreak} dias/fiél</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#e5e0d5] text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none">Nível Médio</span>
                <span className="text-base font-black font-mono block text-[#004b87] mt-1">⭐ Nível {avgDistrictLevel}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#e5e0d5] text-left">
                <span className="text-[10px] text-slate-500 block uppercase font-bold leading-none">Igrejas Ativas</span>
                <span className="text-base font-black font-mono block text-[#005c53] mt-1">🏫 {activeChurchesStats.length} de 10</span>
              </div>
            </div>
          </div>

          {/* Graphical Section: Raking de Igrejas */}
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#e5e0d5] pb-3">
              <div>
                <h4 className="text-sm font-black text-[#0f2646] uppercase tracking-wider">Engajamento Coletivo: Raking de Igrejas por Pontuação</h4>
                <p className="text-xs text-slate-500">Igrejas ordenadas pelo total de XP acumulado por seus membros cadastrados</p>
              </div>
              <span className="text-[9px] font-bold text-[#b48a30] bg-[#FAF9F5] border border-[#e5e0d5] px-2.5 py-1 rounded-full whitespace-nowrap">
                Ranking de Liderança
              </span>
            </div>

            {/* Custom Responsive SVG Horizontal Bar Chart */}
            <div className="space-y-4 pt-2">
              {activeChurchesStats.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF9F5] border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                  Nenhum membro registrado em igrejas no momento para gerar gráficos.
                </div>
              ) : (
                <div className="space-y-3">
                  {churchStats.slice(0, 5).map((church, idx) => {
                    const maxXPOfDist = Math.max(...churchStats.map(c => c.totalXp), 1);
                    const widthPercent = Math.min(100, Math.max(8, (church.totalXp / maxXPOfDist) * 100));
                    
                    return (
                      <div key={church.name} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-[#0f2646] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 leading-none">
                              {idx + 1}
                            </span>
                            {church.name}
                            <span className="text-[10px] font-mono text-slate-400 font-bold">({church.memberCount} {church.memberCount === 1 ? 'membro' : 'membros'})</span>
                          </span>
                          <span className="font-mono font-black text-[#005c53]">{church.totalXp} XP total</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-50 border border-slate-100 h-6 rounded-lg overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-[#004b87] to-[#005c53] rounded-lg transition-all duration-800"
                              style={{ width: `${widthPercent}%` }}
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600 drop-shadow-sm">
                              Média de {church.avgXp} XP/Membro
                            </span>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-[#b48a30] bg-orange-50 px-2 py-0.5 rounded border border-orange-100 whitespace-nowrap">
                            🔥 {church.avgStreak} méd
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Church Diagnostics Panel (Individual Church Evaluation) */}
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 space-y-5 shadow-sm">
            <div className="border-b border-[#e5e0d5] pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-black text-[#0f2646] uppercase tracking-wider">Acompanhamento e Prontuário Individual de Igrejas</h4>
                <p className="text-xs text-slate-500">Selecione uma igreja específica no distrito para ver relatórios, membros ativos e detalhamento</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#004b87]" />
                <select
                  value={selectedDashboardChurch}
                  onChange={(e) => setSelectedDashboardChurch(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3.5 py-1.5 text-xs text-[#0f2646] font-bold focus:border-[#004b87] outline-none cursor-pointer"
                >
                  <option value="Todas">Selecione uma Igreja...</option>
                  {CHURCH_OPTIONS.map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDashboardChurch === 'Todas' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {churchStats.slice(0, 4).map((ch) => (
                  <div key={ch.name} className="border border-slate-200 p-4 rounded-2xl space-y-3 shadow-inner bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <h5 className="font-extrabold text-sm text-[#0f2646]">{ch.name}</h5>
                      <button 
                        onClick={() => setSelectedDashboardChurch(ch.name)}
                        className="text-[10px] font-bold text-[#004b87] hover:underline"
                      >
                        Ver Ficha Completa →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-[#e5e0d5]">
                        <span className="text-[10px] text-slate-400 block font-bold leading-none">Membros</span>
                        <span className="text-sm font-extrabold text-[#004b87] font-mono block mt-1">{ch.memberCount} registrados</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#e5e0d5]">
                        <span className="text-[10px] text-slate-400 block font-bold leading-none font-mono">Média XP</span>
                        <span className="text-sm font-extrabold text-[#005c53] font-mono block mt-1">+{ch.avgXp} XP/membro</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const targetChurch = churchStats.find(c => c.name === selectedDashboardChurch);
                if (!targetChurch) return null;

                return (
                  <div className="space-y-4">
                    <div className="bg-[#FAF9F5] border border-[#e5e0d5] p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Status Igreja</span>
                        <span className="text-xs font-black text-[#b48a30] tracking-wide uppercase block">Ativa no Distrito</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-200 pl-4">
                        <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Membros Ativos</span>
                        <span className="text-sm font-black text-[#0f2646] font-mono block">{targetChurch.memberCount} membros cadastrados</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-200 pl-4">
                        <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Pontuação Total</span>
                        <span className="text-sm font-black text-[#005c53] font-mono block">{targetChurch.totalXp} XP acumulado</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-200 pl-4">
                        <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Constância Média</span>
                        <span className="text-sm font-black text-orange-700 font-mono block">🔥 {targetChurch.avgStreak} dias seguidos</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Lista de Membros da Congregação</h5>
                      
                      {targetChurch.members.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                          Nenhum membro registrado em {targetChurch.name} até o momento.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          {targetChurch.members.map(usr => (
                            <div key={usr.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-all text-xs">
                              <div className="text-left font-medium">
                                <p className="font-extrabold text-[#0f2646]">{usr.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{usr.email}</p>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div className="space-y-0.5">
                                  <span className="bg-[#004b87]/10 text-[#004b87] border border-[#004b87]/10 px-2 py-0.5 rounded text-[9px] font-black font-mono">
                                    NÍVEL {usr.level}
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-slate-500 block leading-none mt-1">{usr.xp} XP</span>
                                </div>
                                <div className="text-left hidden sm:block">
                                  <span className="text-orange-700 font-extrabold font-mono block">🔥 {usr.streakDays} d</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* 👥 VIEW PANEL 2: SYSTEMATIC USERS SUPERVISION & FILTERS */}
      {adminTab === 'usuarios' && (
        <div className="space-y-4">
          
          {/* Admin Management Section */}
          <div className="bg-white border border-[#e5e0d5] p-5 rounded-3xl space-y-4 text-left shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-[#b48a30] shrink-0" />
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-[#0f2646] font-sans">Gestão de Administradores</h4>
                <p className="text-[11px] text-slate-500 font-medium">Adicione novos administradores a partir dos membros já registrados ou remova privilégios administrativos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Form para adicionar administrador */}
              <div className="border border-[#e5e0d5] bg-[#FAF9F5] p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Adicionar Administrador</label>
                  <p className="text-[11px] text-slate-500">Escolha um dos membros cadastrados para lhe conceder permissões de administrador.</p>
                  <select
                    value={userToPromoteId}
                    onChange={(e) => setUserToPromoteId(e.target.value)}
                    className="w-full bg-white border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-semibold outline-none cursor-pointer focus:border-[#004b87]"
                  >
                    <option value="">Selecione um membro...</option>
                    {cleanMembersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.church || 'Sem Congregação'}) - {m.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!userToPromoteId}
                  onClick={() => {
                    if (userToPromoteId) {
                      onToggleUserAdminRole(userToPromoteId, 'admin');
                      setUserToPromoteId('');
                    }
                  }}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-extrabold cursor-pointer transition-all active:scale-97 flex items-center justify-center gap-1.5 ${
                    userToPromoteId
                      ? 'bg-[#004b87] text-white hover:bg-[#003c6b] shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Conceder Acesso de Administrador
                </button>
              </div>

              {/* Lista de Admins atuais */}
              <div className="border border-[#e5e0d5] p-4 rounded-2xl space-y-3">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Administradores Ativos ({districtAdministrators.length})</span>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                  {districtAdministrators.map((admin) => {
                    const isPrimary = admin.id === 'admin-user-id' || admin.email === 'admin@discipulado.com';
                    return (
                      <div key={admin.id} className="flex items-center justify-between bg-white border border-[#e5e0d5] p-2.5 rounded-xl gap-2 shadow-sm">
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-extrabold text-[#0f2646] truncate flex items-center gap-1.5">
                            {admin.fullName}
                            <span className="text-[9px] bg-amber-100 border border-amber-300 text-amber-800 font-extrabold font-mono px-1 rounded uppercase">
                              {isPrimary ? 'Principal' : 'Administrador'}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{admin.email}</p>
                        </div>
                        
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => onToggleUserAdminRole(admin.id, 'user')}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 hover:border-rose-400 px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer uppercase tracking-wider transition-all"
                            title="Remover privilégios administrativos deste usuário"
                          >
                            Remover
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium italic">Protegido</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-left px-1">Fidelidade, Prontuário e Detalhes de Membros</h4>
            
            {/* Action filters bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar membro por nome ou email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e5e0d5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1e293b] outline-none focus:border-[#004b87] shadow-sm font-medium"
                />
              </div>

              {/* Church Selector Filter dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#004b87] shrink-0" />
                <select
                  value={selectedChurchFilter}
                  onChange={(e) => setSelectedChurchFilter(e.target.value)}
                  className="w-full bg-white border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#1e293b] font-bold focus:border-[#004b87] outline-none cursor-pointer shadow-sm"
                >
                  <option value="Todas">Filtrar por Congregação (Todas)...</option>
                  {CHURCH_OPTIONS.map(chName => (
                    <option key={chName} value={chName}>{chName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e5e0d5] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#e5e0d5] text-slate-500 font-bold text-[10px] uppercase font-mono">
                    <th className="p-3.5">Nome / Identificação</th>
                    <th className="p-3.5">Nível / XP</th>
                    <th className="p-3.5">Sequência</th>
                    <th className="p-3.5 text-center">Atividades e Histórico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e0d5]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Nenhum membro atende à busca ou ao filtro de igreja selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id} id={`admin-user-row-${usr.id}`} className="hover:bg-slate-50 transition-all">
                        <td className="p-3.5 space-y-0.5 text-left max-w-[190px]">
                          <div className="flex items-center gap-1.5 group">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(usr)}
                              className="font-extrabold text-[#004b87] hover:text-[#002d54] text-xs md:text-sm hover:underline cursor-pointer text-left block focus:outline-none flex items-center gap-1.5"
                              title={`Ver panorama completo de ${usr.fullName}`}
                            >
                              <span className="truncate max-w-[130px] inline-block">{usr.fullName}</span>
                              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004b87] transition-colors shrink-0" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{usr.email}</p>
                          
                          {/* Display which church they are below the email */}
                          <p className="text-[10px] text-[#b48a30] font-bold flex items-center gap-1 mt-0.5 truncate">
                            🏫 {usr.church || 'Distrito Esplanada'}
                          </p>
                        </td>
                        <td className="p-3.5 text-left font-mono">
                          <span className="inline-block bg-[#004b87]/10 text-[#004b87] border border-[#004b87]/10 px-2.5 py-0.5 rounded-lg font-black text-[10px] mb-1">
                            NV {usr.level}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-bold">{usr.xp} XP acumulado</span>
                        </td>
                        <td className="p-3.5 text-left">
                          <span className="text-orange-700 font-extrabold font-mono block">🔥 {usr.streakDays} {usr.streakDays === 1 ? 'dia' : 'dias'}</span>
                        </td>
                        {/* Show MAXIMUM information about each member separated beautifully in a neat card-grid style */}
                        <td className="p-3.5 text-left min-w-[240px] max-w-[280px]">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50/70 text-blue-900 border border-blue-100 rounded-xl" title="Leituras Bíblicas">
                              <span className="text-[#004b87] font-semibold text-xs shrink-0">📖</span>
                              <div className="text-[9px] leading-tight">
                                <span className="block font-black text-[#004b87]">{usr.bibleReadingsCount || 0}</span>
                                <span className="text-[7.5px] text-blue-700/80 uppercase tracking-wider font-extrabold">Bíblia</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50/70 text-amber-900 border border-amber-100 rounded-xl" title="Reflexões registradas">
                              <span className="text-[#b48a30] font-semibold text-xs shrink-0">✍️</span>
                              <div className="text-[9px] leading-tight">
                                <span className="block font-black text-[#b48a30]">{usr.reflectionsCount || 0}</span>
                                <span className="text-[7.5px] text-amber-700/80 uppercase tracking-wider font-extrabold">Reflexões</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50/70 text-emerald-900 border border-emerald-100 rounded-xl" title="Missões Completadas">
                              <span className="text-[#005c53] font-semibold text-xs shrink-0">🤝</span>
                              <div className="text-[9px] leading-tight">
                                <span className="block font-black text-[#005c53]">{usr.completedMissionsCount || 0}</span>
                                <span className="text-[7.5px] text-emerald-700/80 uppercase tracking-wider font-extrabold">Missões</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50/70 text-indigo-900 border border-indigo-100 rounded-xl" title="Lições da Escola Sabatina">
                              <span className="text-indigo-800 font-semibold text-xs shrink-0">📚</span>
                              <div className="text-[9px] leading-tight">
                                <span className="block font-black text-indigo-900">{usr.lessonsStudiedCount || 0}</span>
                                <span className="text-[7.5px] text-indigo-700/80 uppercase tracking-wider font-extrabold">Lição</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PANEL 3: MISSIONS & CHALLENGES MANAGER */}
      {adminTab === 'missoes' && (
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-1">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Catálogo Geral de Desafios</h4>
            <button
              id="admin-btn-open-create"
              onClick={() => setShowCreateModal(true)}
              className="bg-white hover:bg-slate-50 border border-[#e5e0d5] text-[#004b87] text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#004b87]" />
              Criar Novo Desafio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((mission) => (
              <div
                key={mission.id}
                id={`admin-mission-card-${mission.id}`}
                className={`bg-white border rounded-3xl p-4.5 space-y-3 relative shadow-inner ${
                  mission.isActive ? 'border-[#e5e0d5]' : 'border-dashed border-red-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black border bg-[#FAF9F5] text-slate-500">
                        {mission.difficulty}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        Mínimo: Nível {mission.levelRequired}
                      </span>
                      <span className="text-[9px] font-mono text-[#005c53] font-bold">
                        +{mission.xpReward} XP
                      </span>
                    </div>
                    <h5 className="font-extrabold text-sm text-[#0f2646] mt-2">{mission.title}</h5>
                  </div>

                  {/* Quick Toggles */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`admin-btn-edit-mission-${mission.id}`}
                      onClick={() => setEditingMission(mission)}
                      className="text-slate-500 hover:text-black p-1 bg-white border border-[#e5e0d5] rounded-lg cursor-pointer"
                      title="Editar Desafio"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      id={`admin-btn-toggle-mission-${mission.id}`}
                      onClick={() => toggleChallengeActive(mission)}
                      className="p-1 cursor-pointer text-slate-500 hover:text-[#005c53]"
                      title={mission.isActive ? "Desativar" : "Ativar"}
                    >
                      {mission.isActive ? (
                        <ToggleRight className="w-7 h-7 text-[#005c53]" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mission.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔑 VIEW PANEL 4: INVITE CODES FOR DISCIPULADORES */}
      {adminTab === 'convites' && (
        <div className="space-y-6 text-left animate-fade-in">
          {/* Informational Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-500/5 border border-amber-500/25 p-5 rounded-3xl space-y-2">
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Gestão de Convites para Discipuladores
            </h4>
            <p className="text-xs text-amber-950/70 leading-relaxed max-w-3xl">
              Como pastor, você pode gerar códigos de acesso que permitem que novos discipuladores se cadastrem no sistema.
              Você tem duas opções: criar um <strong>Código Fixo (Reutilizável)</strong> para enviar a grupos ou manter como padrão, 
              ou gerar um <strong>Código Individual</strong> para cada novo líder, permitindo o rastreamento de quem utilizou o código.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Generator Card Form */}
            <div className="lg:col-span-5 bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-extrabold text-sm text-[#0f2646] uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-[#004b87]" />
                Gerar Novo Código
              </h3>

              {inviteSuccessMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-800 text-xs font-bold leading-relaxed flex items-start gap-2.5 animate-fade-in">
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{inviteSuccessMsg}</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        const codeOnly = inviteSuccessMsg.split(': ')[1] || '';
                        navigator.clipboard.writeText(codeOnly);
                      }}
                      className="text-[10px] text-emerald-700 underline hover:text-emerald-900 cursor-pointer flex items-center gap-1 font-mono uppercase"
                    >
                      <Clipboard className="w-3 h-3" /> Copiar Código
                    </button>
                  </div>
                </div>
              )}

              {inviteError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl text-red-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <form onSubmit={handleGenerateInvite} className="space-y-4">
                {/* Code Type selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tipo de Código de Acesso</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteIsFixed(false)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        !inviteIsFixed 
                          ? 'bg-[#004b87]/10 border-[#004b87] text-[#004b87]' 
                          : 'bg-[#FAF9F5] border-stone-200 text-slate-500 hover:border-stone-300'
                      }`}
                    >
                      👤 Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteIsFixed(true)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        inviteIsFixed 
                          ? 'bg-amber-500/10 border-[#b48a30] text-[#b48a30]' 
                          : 'bg-[#FAF9F5] border-stone-200 text-slate-500 hover:border-stone-300'
                      }`}
                    >
                      🔄 Fixo (Reutilizável)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {inviteIsFixed 
                      ? '✓ Código fixo permanente. Não expira após o uso e permite múltiplos cadastros.'
                      : '✓ Código único de uso exclusivo. Expira imediatamente assim que o primeiro discipulador se cadastrar.'
                    }
                  </p>
                </div>

                {/* Code Identifier / Prefix */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    {inviteIsFixed ? 'Identificador do Código Fixo' : 'Prefixo do Código'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder={inviteIsFixed ? 'Ex: LIDERANCA-VIVA' : 'Ex: COORD'}
                    value={inviteCodePrefix}
                    onChange={(e) => setInviteCodePrefix(e.target.value.toUpperCase())}
                    className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2.5 text-xs text-[#1e293b] outline-none focus:border-[#004b87]"
                  />
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Apenas letras e números. {inviteIsFixed ? 'O código final será exatamente este.' : 'Será adicionado um sufixo numérico aleatório (Ex: COORD-8392).'}
                  </p>
                </div>

                {/* Preassigned name (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nome do Discipulador Destinatário (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Pastor Auxiliar Roberto ou Diácono Marcos"
                    value={invitePreassignedName}
                    onChange={(e) => setInvitePreassignedName(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2.5 text-xs text-[#1e293b] outline-none focus:border-[#004b87]"
                  />
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Ajuda você a lembrar para quem enviou ou destinou este código de convite.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full bg-gradient-to-r from-[#004b87] to-blue-800 text-white font-black py-3 px-4 rounded-xl shadow-sm hover:shadow text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4.5 h-4.5 text-white" />
                  <span>{inviteLoading ? 'Criando Código...' : 'Gerar Código de Acesso'}</span>
                </button>
              </form>
            </div>

            {/* List of created invites */}
            <div className="lg:col-span-7 bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <h3 className="font-extrabold text-sm text-[#0f2646] uppercase tracking-wider flex items-center gap-2">
                  <Clipboard className="w-4.5 h-4.5 text-slate-500" />
                  Histórico de Códigos Criados ({allInvites.length})
                </h3>
              </div>

              {allInvites.length === 0 ? (
                <div className="text-center py-12 text-stone-400 font-medium text-xs space-y-2">
                  <p>Nenhum código de convite para discipulador criado até o momento.</p>
                  <p className="text-[10px] text-stone-400 leading-tight">Utilize o formulário ao lado para gerar o primeiro acesso permanente ou individual.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {allInvites.map((invite) => {
                    return (
                      <div 
                        key={invite.id} 
                        className={`border p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all ${
                          invite.isFixed 
                            ? 'bg-amber-500/5 border-amber-200/60 hover:bg-amber-500/10' 
                            : 'bg-stone-50 border-stone-150 hover:bg-stone-100/70'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-black bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-stone-800 shadow-sm">
                              {invite.code}
                            </span>
                            {invite.isFixed ? (
                              <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black bg-amber-600 text-white shadow-sm border border-amber-700">
                                Fixo / Reutilizável
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black bg-blue-600 text-white shadow-sm border border-blue-700">
                                Individual
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black bg-slate-100 border border-slate-200 text-slate-600">
                              Alvo: {invite.type === 'discipulador' ? 'Líder / Discipulador' : 'Discípulo'}
                            </span>
                          </div>

                          {invite.preassignedName && (
                            <p className="text-xs font-bold text-slate-700">
                              Destinatário: <span className="text-[#004b87]">{invite.preassignedName}</span>
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono flex-wrap">
                            <span>Criado por: {invite.createdByName || 'Sistema'}</span>
                            <span>•</span>
                            <span>Data: {invite.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-stone-200/50 pt-2 sm:pt-0">
                          {invite.isFixed ? (
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700">
                              <CheckCircle className="w-4 h-4 text-amber-600" />
                              <span>Permanente Ativo</span>
                            </div>
                          ) : invite.status === 'pending' ? (
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-sky-700">
                              <Clock className="w-4 h-4 text-sky-600 animate-pulse" />
                              <span>Aguardando Cadastro</span>
                            </div>
                          ) : (
                            <div className="space-y-0.5 text-right">
                              <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black bg-emerald-500 text-white border border-emerald-600 inline-block shadow-sm">
                                Utilizado
                              </span>
                              {invite.usedByEmail && (
                                <p className="text-[9px] text-slate-500 font-mono font-bold leading-none mt-1">
                                  {invite.usedByEmail}
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-red-500 hover:text-red-700 p-1 bg-white border border-red-100 hover:border-red-200 rounded-lg cursor-pointer transition-colors shadow-sm ml-auto sm:ml-0 flex items-center gap-1 text-[9px] font-bold"
                            title="Excluir Convite"
                          >
                            <X className="w-3.5 h-3.5" /> Revogar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHALLENGE CHASSIS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-5 max-w-md w-full space-y-4 text-left shadow-2xl"
          >
            <div className="flex justify-between items-center text-[#0f2646] border-b border-[#e5e0d5] pb-2.5">
              <span className="font-black text-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#004b87]" />
                Adicionar Desafio de Missão
              </span>
              <button
                type="button"
                id="admin-modal-close"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Título da Missão</label>
              <input
                id="admin-new-title"
                type="text"
                required
                placeholder="Ex: Doar Alimentos com literatura"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs md:text-sm text-[#1e293b] focus:border-[#004b87] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Orientação Prática</label>
              <textarea
                id="admin-new-desc"
                required
                placeholder="Oriente exatamente o passo-a-passo..."
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
                className="w-full h-20 bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl p-3 text-xs text-[#1e293b] focus:border-[#004b87] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">XP Recompensa</label>
                <input
                  id="admin-new-xp"
                  type="number"
                  required
                  min="5"
                  max="500"
                  value={missionXp}
                  onChange={(e) => setMissionXp(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#004b87] font-bold font-mono text-center outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nível Requerido</label>
                <input
                  id="admin-new-level"
                  type="number"
                  required
                  min="1"
                  max="6"
                  value={missionLevelReq}
                  onChange={(e) => setMissionLevelReq(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#004b87] font-bold font-mono text-center outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Dificuldade</label>
                <select
                  value={missionDifficulty}
                  onChange={(e) => setMissionDifficulty(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-2.5 py-2 text-xs text-[#004b87] outline-none"
                >
                  <option value="fácil">Fácil</option>
                  <option value="médio">Médio</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e0d5] flex gap-2 justify-end text-xs font-bold">
              <button
                type="button"
                id="admin-btn-create-cancel"
                onClick={() => setShowCreateModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="admin-btn-create-save"
                className="bg-[#004b87] hover:bg-[#003b6d] text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Salvar Desafio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT CHALLENGE MODAL */}
      {editingMission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white border border-[#e5e0d5] rounded-3xl p-5 max-w-md w-full space-y-4 text-left shadow-2xl"
          >
            <div className="flex justify-between items-center text-[#0f2646] border-b border-[#e5e0d5] pb-2.5">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#b48a30]" />
                Editar Desafio: {editingMission.title}
              </span>
              <button
                type="button"
                id="admin-edit-close"
                onClick={() => setEditingMission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Título do Desafio</label>
              <input
                id="admin-edit-title"
                type="text"
                required
                value={editingMission.title}
                onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs md:text-sm text-[#1e293b] focus:border-[#004b87] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Orientação Real</label>
              <textarea
                id="admin-edit-desc"
                required
                value={editingMission.description}
                onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                className="w-full h-20 bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl p-3 text-xs text-[#1e293b] focus:border-[#004b87] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">XP Recompensa</label>
                <input
                  id="admin-edit-xp"
                  type="number"
                  required
                  min="5"
                  value={editingMission.xpReward}
                  onChange={(e) => setEditingMission({ ...editingMission, xpReward: Number(e.target.value) })}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#004b87] font-bold font-mono text-center outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Nível Requerido</label>
                <input
                  id="admin-edit-level"
                  type="number"
                  required
                  min="1"
                  max="6"
                  value={editingMission.levelRequired}
                  onChange={(e) => setEditingMission({ ...editingMission, levelRequired: Number(e.target.value) })}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-3 py-2 text-xs text-[#004b87] font-bold font-mono text-center outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Dificuldade</label>
                <select
                  value={editingMission.difficulty}
                  onChange={(e) => setEditingMission({ ...editingMission, difficulty: e.target.value as any })}
                  className="w-full bg-[#FAF9F5] border border-[#e5e0d5] rounded-xl px-2.5 py-2 text-xs text-[#004b87] outline-none"
                >
                  <option value="fácil">Fácil</option>
                  <option value="médio">Médio</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e0d5] flex gap-2 justify-end text-xs font-bold">
              <button
                type="button"
                id="admin-btn-edit-cancel"
                onClick={() => setEditingMission(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="admin-btn-edit-save"
                className="bg-[#004b87] hover:bg-[#003b6d] text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Atualizar Desafio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MEMBER PANORAMA MODAL */}
      {selectedMember && (() => {
        const freshMember = userList.find(u => u.id === selectedMember.id) || selectedMember;
        const xpProgressPercentage = Math.min(
          100,
          Math.round((freshMember.xp / (freshMember.xpNeededForNextLevel || 100)) * 100)
        );

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-[#e5e0d5] rounded-3xl max-w-lg w-full text-left shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Banner Header */}
              <div className="bg-[#0f2646] p-4 text-white flex justify-between items-center shrink-0">
                <span className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#b48a30]" />
                  Panorama Geral do Membro
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-slate-300 hover:text-white p-1 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* 1. Header Profile Box */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="shrink-0 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                    <AvatarOfProgress
                      gender={freshMember.gender}
                      level={freshMember.level}
                      size="lg"
                      skinColor={freshMember.skinColor}
                      hairColor={freshMember.hairColor}
                      clothingColor={freshMember.clothingColor}
                      eyeStyle={freshMember.eyeStyle}
                      hairStyle={freshMember.hairStyle}
                      hasBeard={freshMember.hasBeard}
                      hasGlasses={freshMember.hasGlasses}
                    />
                  </div>
                  
                  <div className="text-center sm:text-left space-y-1.5 min-w-0 flex-1">
                    <h3 className="font-extrabold text-lg text-[#0f2646] tracking-tight truncate leading-none">
                      {freshMember.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono truncate">{freshMember.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                      <span className="bg-[#004b87] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-[#004b87]/15">
                        🏫 {freshMember.church || 'Distrito Esplanada'}
                      </span>
                      {freshMember.streakDays > 0 && (
                        <span className="bg-orange-50 text-orange-800 border border-orange-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          🔥 {freshMember.streakDays} {freshMember.streakDays === 1 ? 'Dia' : 'Dias'} Seguidos
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 👑 Role Manager & Discipleship link */}
                <div className="bg-[#FAF9F5] border border-[#e5e0d5] p-3 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cargo / Função Eclesiástica:</span>
                    <span className="font-extrabold uppercase text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                      {freshMember.role === 'pastor' ? 'Pastor' : freshMember.role === 'discipulador' ? 'Discipulador' : 'Discípulo'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await setDoc(doc(db, 'users', freshMember.id), { role: 'discípulo' }, { merge: true });
                        setSelectedMember({ ...freshMember, role: 'discípulo' });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                        freshMember.role === 'discípulo' || !freshMember.role
                          ? 'bg-[#004b87] text-white border-[#004b87]'
                          : 'bg-white text-slate-600 border-[#e5e0d5] hover:bg-slate-50'
                      }`}
                    >
                      Discípulo
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await setDoc(doc(db, 'users', freshMember.id), { role: 'discipulador' }, { merge: true });
                        setSelectedMember({ ...freshMember, role: 'discipulador' });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                        freshMember.role === 'discipulador'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-[#e5e0d5] hover:bg-slate-50'
                      }`}
                    >
                      Discipulador
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await setDoc(doc(db, 'users', freshMember.id), { role: 'pastor' }, { merge: true });
                        setSelectedMember({ ...freshMember, role: 'pastor' });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                        freshMember.role === 'pastor'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-[#e5e0d5] hover:bg-slate-50'
                      }`}
                    >
                      Pastor
                    </button>
                  </div>

                  {freshMember.role === 'discípulo' && (
                    <div className="pt-2 border-t border-dashed border-[#e5e0d5]">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1.5">Discipulador Vinculado:</span>
                      {freshMember.discipuladorName ? (
                        <div className="flex items-center justify-between bg-white border border-[#e5e0d5] p-2 rounded-xl">
                          <span className="font-extrabold text-[#0f2646]">{freshMember.discipuladorName}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              await setDoc(doc(db, 'users', freshMember.id), { 
                                discipuladorId: null,
                                discipuladorName: null 
                              }, { merge: true });
                              setSelectedMember({ 
                                ...freshMember, 
                                discipuladorId: undefined, 
                                discipuladorName: undefined 
                              });
                            }}
                            className="text-[9px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            Desvincular
                          </button>
                        </div>
                      ) : (
                        <div className="bg-amber-500/5 border border-dashed border-amber-300 p-2.5 rounded-xl text-[10px] text-amber-800 leading-normal">
                          ⚠️ Sem discipulador vinculado. Ele pode usar um Código de Convite de um discipulador ao se registrar para vincular-se automaticamente.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 🧭 Maturidade Espiritual scores */}
                {freshMember.lastAssessmentScores && (
                  <div className="bg-white border border-[#e5e0d5] p-4 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center border-b border-[#FAF9F5] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#004b87]" />
                        <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Maturidade Espiritual</h4>
                      </div>
                      <span className="text-[9px] font-bold font-mono text-[#b48a30]">
                        Avaliado em: {freshMember.lastAssessmentDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Comunhão</span>
                          <span className="font-mono text-[#004b87]">{freshMember.lastAssessmentScores.comunhao} / 5</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#004b87] h-full" style={{ width: `${(freshMember.lastAssessmentScores.comunhao / 5) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Relacionamento</span>
                          <span className="font-mono text-emerald-700">{freshMember.lastAssessmentScores.relacionamento} / 5</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${(freshMember.lastAssessmentScores.relacionamento / 5) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Fidelidade</span>
                          <span className="font-mono text-amber-700">{freshMember.lastAssessmentScores.fidelidade} / 5</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${(freshMember.lastAssessmentScores.fidelidade / 5) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Missão</span>
                          <span className="font-mono text-purple-700">{freshMember.lastAssessmentScores.missao} / 5</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full" style={{ width: `${(freshMember.lastAssessmentScores.missao / 5) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 💬 Discipulador Feedback Section */}
                <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Clipboard className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-[10px] uppercase font-black text-emerald-800 tracking-wider font-mono">Parecer do Discipulador</h4>
                  </div>
                  {freshMember.discipuladorFeedback ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-700 italic font-medium leading-relaxed bg-white p-3 rounded-xl border border-stone-150">
                        "{freshMember.discipuladorFeedback}"
                      </p>
                      {freshMember.discipuladorFeedbackDate && (
                        <p className="text-[9px] text-slate-400 font-mono text-right font-bold">
                          Registrado por {freshMember.discipuladorName || 'Discipulador'} em {freshMember.discipuladorFeedbackDate}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">O discipulador ainda não registrou nenhum parecer ou feedback sobre este membro.</p>
                  )}
                </div>

                {/* ⛪ Pastor's Feedback Form */}
                <div className="bg-[#0f2646]/5 border border-[#0f2646]/10 p-4 rounded-2xl text-left space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#004b87]">
                    <Landmark className="w-4.5 h-4.5 text-[#004b87]" />
                    <span>Seu Feedback e Parecer Pastoral</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Adicione suas orientações e acompanhamento do distrito para este membro.
                  </p>
                  
                  <textarea
                    rows={3}
                    placeholder="Escreva aqui suas considerações pastorais sobre a maturidade deste membro..."
                    value={pastorFeedbackText}
                    onChange={(e) => setPastorFeedbackText(e.target.value)}
                    className="w-full bg-white border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3 text-xs outline-none transition-all placeholder:text-stone-400 text-stone-850 font-medium shadow-inner resize-none focus:ring-4 focus:ring-[#004b87]/10"
                  />

                  {pastorFeedbackSuccess && (
                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      ✓ Feedback pastoral atualizado com sucesso no perfil!
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={pastorFeedbackLoading}
                    onClick={handleSavePastorFeedback}
                    className="bg-[#004b87] hover:bg-[#003763] text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {pastorFeedbackLoading ? 'Salvando...' : 'Salvar Feedback Pastoral'}
                  </button>
                </div>

                {/* 2. Discipulado Progress Level Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Nível de Discipulado</span>
                      <span className="text-sm font-black text-[#004b87] font-mono block">NÍVEL {freshMember.level}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">Progresso</span>
                      <span className="text-xs font-black text-slate-700 font-mono block">
                        {freshMember.xp} / {freshMember.xpNeededForNextLevel || 100} XP
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-3.5 rounded-full border border-slate-200 overflow-hidden relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#004b87] to-[#005c53] rounded-full transition-all duration-500"
                      style={{ width: `${xpProgressPercentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[8.5px] font-bold text-slate-700 drop-shadow-sm">
                      {xpProgressPercentage}% completado para o próximo nível
                    </span>
                  </div>
                </div>

                {/* 3. Detailed Stats breakdown (Separated elegantly) */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Histórico Geral de Ações Dedicadas</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Bíblias Read card */}
                    <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl hover:bg-blue-50 transition-colors">
                      <span className="text-2xl mt-0.5 shrink-0">📖</span>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800/80 leading-none block">Leituras da Bíblia</span>
                        <p className="text-sm font-black text-[#0f2646] font-mono">
                          {selectedBibleReadings.length} capítulos
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug font-medium">Lidos através do plano diário integrado do distrito.</p>
                      </div>
                    </div>

                    {/* Reflections card */}
                    <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl hover:bg-amber-50 transition-colors">
                      <span className="text-2xl mt-0.5 shrink-0">✍️</span>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800/80 leading-none block">Reflexões Altar</span>
                        <p className="text-sm font-black text-[#0f2646] font-mono">
                          {selectedReflections.length} meditações
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug font-medium">Anotadas no diário de oração pessoal do altar diário.</p>
                      </div>
                    </div>

                    {/* Sabbath school card */}
                    <div className="flex items-start gap-3 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-2xl hover:bg-indigo-50 transition-colors">
                      <span className="text-2xl mt-0.5 shrink-0">📚</span>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#004b87] leading-none block">Escola Sabatina</span>
                        <p className="text-sm font-black text-[#0f2646] font-mono">
                          {selectedLessons.length} lição
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug font-medium">Marcadas como lidas e devocional diário completados.</p>
                      </div>
                    </div>

                    {/* Missions card */}
                    <div className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl hover:bg-emerald-50 transition-colors">
                      <span className="text-2xl mt-0.5 shrink-0">🤝</span>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#005c53] leading-none block">Desafios Gerais</span>
                        <p className="text-sm font-black text-[#0f2646] font-mono">
                          {selectedMissions.length} cumpridos
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug font-medium">Missões comunitárias e práticas atestadas no distrito.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. Detailed list tabs and text content */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase font-black text-slate-505 tracking-wider font-mono">Conteúdos & Produção Escrita</h4>
                    {detailsLoading && (
                      <span className="text-[9px] font-mono font-black text-[#004b87] animate-pulse">CARREGANDO...</span>
                    )}
                  </div>

                  {detailsError && (
                    <div className="text-[10px] text-red-650 bg-red-50 p-2.5 rounded-xl font-bold font-mono">
                      Falha ao carregar registros: {detailsError}
                    </div>
                  )}

                  {!detailsLoading && !detailsError && (
                    <div className="space-y-3">
                      {/* Sub-tabs buttons inside selected member modal */}
                      <div className="bg-slate-105/80 p-0.5 rounded-xl flex flex-wrap gap-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('lessons')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'lessons'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Lição ({selectedLessons.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('reflections')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'reflections'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Diário ({selectedReflections.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('missions')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'missions'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Missões ({selectedMissions.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('bible')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'bible'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Bíblia ({selectedBibleReadings.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('logs')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'logs'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Histórico ({selectedLogs.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedTab('assessments')}
                          className={`flex-1 text-center py-1.5 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer select-none ${
                            currentSelectedTab === 'assessments'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-705'
                          }`}
                        >
                          Diagnóstico ({selectedAssessments.length})
                        </button>
                      </div>

                      {/* Content panel */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 max-h-[220px] overflow-y-auto">
                        
                        {currentSelectedTab === 'lessons' && (
                          selectedLessons.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhuma lição ou resposta registrada pelo membro.</p>
                          ) : (
                            <div className="space-y-2 text-left">
                              {selectedLessons.map(l => (
                                <div key={l.id} className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                                    <span className="text-[#004b87] font-extrabold">Lição: {l.id}</span>
                                    <span>{l.completedAt ? new Date(l.completedAt).toLocaleDateString('pt-BR') : ''}</span>
                                  </div>
                                  <p className="text-xs text-slate-700 italic font-semibold leading-relaxed">
                                    {l.answer ? `"${l.answer}"` : <span className="text-slate-400 font-normal">Estudada (sem anotações).</span>}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {currentSelectedTab === 'reflections' && (
                          selectedReflections.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhum registro para o diário espiritual ainda.</p>
                          ) : (
                            <div className="space-y-2 text-left">
                              {selectedReflections.map(r => (
                                <div key={r.id} className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                                  <div className="flex justify-between items-center text-[9px] font-mono">
                                    <span className="font-extrabold uppercase bg-amber-50 text-amber-850 border border-amber-200 px-1.5 py-0.5 rounded text-[8px]">
                                      {r.type || 'Reflexão'}
                                    </span>
                                    <span className="text-slate-400 font-bold">{r.date || ''}</span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    "{r.content}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {currentSelectedTab === 'missions' && (
                          selectedMissions.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhuma ação ou relato de missão enviado.</p>
                          ) : (
                            <div className="space-y-2 text-left">
                              {selectedMissions.map(m => (
                                <div key={m.id} className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="text-[11.5px] font-black text-[#0f2646] leading-tight">
                                      🤝 {m.missionTitle || 'Ação Concluída'}
                                    </span>
                                    <span className="text-[8.5px] text-slate-400 font-bold font-mono shrink-0">
                                      {m.completedAt ? new Date(m.completedAt).toLocaleDateString('pt-BR') : ''}
                                    </span>
                                  </div>
                                  {m.notes ? (
                                    <p className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs text-slate-750 font-medium leading-normal italic">
                                      "{m.notes}"
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Nenhum relato escrito fornecido.</p>
                                  )}
                                  <div className="text-[8.5px] font-black font-mono text-emerald-600 pt-0.5">
                                    + {m.xpEarned || 25} XP atestador
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {currentSelectedTab === 'bible' && (
                          selectedBibleReadings.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhuma leitura bíblica marcada pelo membro.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5 text-left">
                              {selectedBibleReadings.map(b => (
                                <div key={b.id} className="bg-white border border-slate-100 px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-[#004b87]">{b.id}</span>
                                  <span className="text-[8px] font-mono font-bold text-slate-400">
                                    {b.completedAt ? new Date(b.completedAt).toLocaleDateString('pt-BR') : 'Lido'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {currentSelectedTab === 'logs' && (
                          selectedLogs.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhuma atividade registrada no histórico de logs.</p>
                          ) : (
                            <div className="space-y-1.5 text-left">
                              {selectedLogs.map(l => (
                                <div key={l.id} className="bg-white border border-slate-100 p-2 rounded-xl text-left space-y-0.5">
                                  <div className="flex justify-between items-center text-[8.5px] font-mono font-bold">
                                    <span className="text-slate-400">{l.date}</span>
                                    <span className="text-emerald-600">+{l.xpReceived} XP</span>
                                  </div>
                                  <p className="text-xs font-extrabold text-slate-800 leading-tight">
                                    {l.type === 'bíblia' ? '📖' : l.type === 'lição' ? '📚' : l.type === 'reflexão' ? '✍️' : l.type === 'missão' ? '🤝' : '🎖️'} {l.title}
                                  </p>
                                  {l.observation && (
                                    <p className="text-[9.5px] text-slate-500 italic truncate">"{l.observation}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {currentSelectedTab === 'assessments' && (
                          selectedAssessments.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhum diagnóstico de maturidade espiritual realizado.</p>
                          ) : (
                            <div className="space-y-3 text-left">
                              {selectedAssessments.map(record => {
                                const avg = Math.round((record.scores.comunhao + record.scores.relacionamento + record.scores.fidelidade + record.scores.missao) / 4);
                                return (
                                  <div key={record.id} className="bg-white border border-slate-200 p-3 rounded-xl space-y-2.5">
                                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                                      <span className="text-[#004b87] font-extrabold bg-[#004b87]/5 px-2 py-0.5 rounded-md border border-[#004b87]/10">Diagnóstico: {record.date}</span>
                                      <span className="font-extrabold text-[#b48a30] bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">Média: {avg}%</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-[8px] text-slate-400 font-bold font-mono">Comunhão</span>
                                        <span className="font-mono text-xs font-black text-[#0f2646]">{record.scores.comunhao}%</span>
                                      </div>
                                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-[8px] text-slate-400 font-bold font-mono">Relacionamento</span>
                                        <span className="font-mono text-xs font-black text-slate-700">{record.scores.relacionamento}%</span>
                                      </div>
                                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-[8px] text-slate-400 font-bold font-mono">Fidelidade</span>
                                        <span className="font-mono text-xs font-black text-slate-700">{record.scores.fidelidade}%</span>
                                      </div>
                                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-[8px] text-slate-400 font-bold font-mono">Missão</span>
                                        <span className="font-mono text-xs font-black text-slate-700">{record.scores.missao}%</span>
                                      </div>
                                    </div>

                                    {/* Detailed answers */}
                                    <details className="group bg-slate-50 border border-stone-200 rounded-lg overflow-hidden">
                                      <summary className="flex items-center justify-between p-1.5 text-[10px] font-extrabold text-slate-500 bg-slate-100 cursor-pointer list-none select-none">
                                        <span>🔍 Ver Respostas</span>
                                        <span className="transition-transform group-open:rotate-180">▼</span>
                                      </summary>
                                      <div className="p-2 space-y-2 border-t border-stone-150 max-h-[140px] overflow-y-auto bg-white">
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
                                          return Object.entries(record.answers || {}).map(([qId, score]) => {
                                            const q = QUESTIONS_MAP[qId] || { label: qId, pillar: "Pilar" };
                                            const widthPct = Number(score);
                                            const barColor = q.pillar === "Comunhão" ? "bg-sky-500" : q.pillar === "Relacionamento" ? "bg-emerald-500" : q.pillar === "Fidelidade" ? "bg-amber-500" : "bg-rose-500";
                                            return (
                                              <div key={qId} className="space-y-0.5 text-[10px] text-left">
                                                <div className="flex justify-between items-start gap-1 font-bold">
                                                  <span className="text-slate-700 font-extrabold leading-tight">{q.label}</span>
                                                  <span className="text-stone-500 font-mono text-[9px] shrink-0 bg-stone-100 px-1 rounded">{score}%</span>
                                                </div>
                                                <div className="w-full bg-stone-200 rounded-full h-1">
                                                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${widthPct}%` }} />
                                                </div>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </details>

                                    {record.observation && (
                                      <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
                                        <span className="block text-[8px] uppercase font-mono font-black text-[#b48a30]">Observações do Discípulo</span>
                                        <p className="text-[11px] text-slate-600 italic mt-0.5">"{record.observation}"</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )
                        )}

                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-[#e5e0d5] flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Fechar Panorama
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
