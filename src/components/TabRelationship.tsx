import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  HeartHandshake, 
  Trash2, 
  Search,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfileData } from '../types';

export default function TabRelationship({ user }: { user: UserProfileData | null }) {
  const [publicPrayers, setPublicPrayers] = useState<any[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
  const [prayerAuthor, setPrayerAuthor] = useState('');
  const [prayerContent, setPrayerContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [prayerSuccess, setPrayerSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Set default author name based on logged user
  useEffect(() => {
    if (user && user.fullName) {
      setPrayerAuthor(user.fullName);
    }
  }, [user]);

  // Clean up previous "demonstration" prayers ONCE when loading is active and they exist
  useEffect(() => {
    const isCleared = localStorage.getItem('discipulado_demo_prayers_cleared_v1');
    if (!isCleared && publicPrayers.length > 0) {
      const runCleanup = async () => {
        try {
          console.log("Iniciando limpeza programmaticamente de demonstrações antigas...");
          // We can delete all prayers that are current in the DB as they are all demonstrations
          const deletePromises = publicPrayers.map((p) => deleteDoc(doc(db, 'prayers', p.id)));
          await Promise.all(deletePromises);
          
          localStorage.setItem('discipulado_demo_prayers_cleared_v1', 'true');
          setPublicPrayers([]); // Empty the local list too safely
          console.log("Pedidos de demonstração deletados com sucesso!");
        } catch (e) {
          console.error("Erro na limpeza de demonstrações:", e);
        }
      };
      runCleanup();
    }
  }, [publicPrayers]);

  // Subscribe to real-time prayer requests from Firestore
  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    // Secure listener with error catch that prevents endless loading
    const unsubscribe = onSnapshot(
      collection(db, 'prayers'), 
      (snapshot) => {
        const docs: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({
            id: docSnap.id,
            ...data
          });
        });

        // Sort by creation time desc (newest first)
        docs.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setPublicPrayers(docs);
        setLoading(false);
        setErrorMsg(null);
      }, 
      (error) => {
        console.error("Erro ao escutar mural de orações:", error);
        setErrorMsg(`Não foi possível conectar com o mural de orações: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handlePublishPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerContent.trim()) return;
    if (!user) {
      setErrorMsg('Você precisa estar logado para publicar um pedido.');
      return;
    }

    setPublishing(true);
    setPrayerSuccess('');
    setErrorMsg(null);

    const authorLabel = prayerAuthor.trim() ? prayerAuthor.trim() : user.fullName || 'Irmão(ã) Anônimo(a)';
    const prayerId = `prayer-${Date.now()}`;
    const newPrayer = {
      id: prayerId,
      userId: user.id,
      author: authorLabel,
      content: prayerContent.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString(),
      prayinCount: 1,
      prayingUsers: [user.id]
    };

    try {
      await setDoc(doc(db, 'prayers', prayerId), newPrayer);
      
      setPrayerContent('');
      setPrayerSuccess('✓ Seu pedido de oração foi publicado com sucesso no mural!');
      setTimeout(() => setPrayerSuccess(''), 5000);
    } catch (e: any) {
      console.error("Erro ao salvar pedido no Firestore:", e);
      setErrorMsg(`Falha ao publicar pedido: ${e.message || String(e)}`);
    } finally {
      setPublishing(false);
    }
  };

  const handlePrayReact = async (id: string) => {
    if (!user) return;
    const target = publicPrayers.find(p => p.id === id);
    if (!target) return;

    let prayingUsers = target.prayingUsers || [];
    let prayinCount = target.prayinCount || 0;
    const userReacted = prayingUsers.includes(user.id);

    if (userReacted) {
      prayingUsers = prayingUsers.filter((uid: string) => uid !== user.id);
      prayinCount = Math.max(0, prayinCount - 1);
    } else {
      prayingUsers = [...prayingUsers, user.id];
      prayinCount = prayinCount + 1;
    }

    try {
      await setDoc(doc(db, 'prayers', id), {
        ...target,
        prayingUsers,
        prayinCount
      });
    } catch (e: any) {
      console.error("Erro ao interceder:", e);
      setErrorMsg(`Erro ao registrar intercessão: ${e.message || String(e)}`);
    }
  };

  const handleRemoveOwn = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prayers', id));
      setPrayerSuccess('✓ Pedido de oração removido com sucesso!');
      setDeletingId(null);
      setTimeout(() => setPrayerSuccess(''), 4000);
    } catch (e: any) {
      console.error("Erro ao apagar pedido:", e);
      setErrorMsg(`Erro ao remover pedido: ${e.message || String(e)}`);
      setDeletingId(null);
    }
  };

  // Filter prayers based on Search and Tab selection ("all" vs "mine")
  const filteredPrayers = publicPrayers.filter((p) => {
    const matchesSearch = p.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = filterMode === 'all' || (user && p.userId === user.id);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/10 rounded-full blur-3xl" />
        <div className="relative space-y-2">
          <span className="text-[9px] font-black tracking-widest text-[#b48a30] uppercase bg-[#FDF8EB] px-2.5 py-1 rounded-md border border-[#f5ebcb] inline-block font-mono">
            Comunidade Ativa
          </span>
          <h3 id="relationship-title" className="text-xl font-black text-[#0f2646] leading-tight flex items-center gap-2">
            <HeartHandshake className="text-[#004b87] w-6 h-6 shrink-0" />
            Mural de Oração & Intercessão
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-sans pr-4">
            Aqui cultivamos a comunhão uns com os outros. Compartilhe pedidos de oração, acompanhe as necessidades dos irmãos e interceda em unidade de fé.
          </p>
        </div>
      </div>

      {/* Compartilhar Pedido Form */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm">
        <form onSubmit={handlePublishPrayer} className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#FAF9F5]">
            <div className="w-1.5 h-4 rounded-full bg-[#004b87]" />
            <h4 className="text-sm font-black text-[#0f2646] uppercase font-mono tracking-wider">Novo Pedido de Oração</h4>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Seu Nome / Identificação:</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="inp-prayer-author"
                type="text"
                value={prayerAuthor}
                onChange={(e) => setPrayerAuthor(e.target.value)}
                placeholder="Ex: Ir. João, Irmã Cláudia, ou deixe em branco para Anônimo..."
                className="w-full bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl pl-10 pr-3.5 py-2 text-xs md:text-sm text-[#1e293b] placeholder:text-slate-400 font-sans outline-none font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Detalhes do Pedido:</label>
            <textarea
              id="txt-prayer-content"
              value={prayerContent}
              onChange={(e) => setPrayerContent(e.target.value)}
              placeholder="Escreva aqui os detalhes da sua oração. Peça por saúde, decisões, proteção, família ou expresse um agradecimento sincero..."
              className="w-full h-24 bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl p-3.5 text-xs md:text-sm text-[#1e293b] placeholder:text-slate-400 font-sans outline-none resize-none shadow-inner font-medium"
              required
            />
          </div>

          {prayerSuccess && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{prayerSuccess}</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-red-700 font-bold bg-red-50 px-4 py-3 rounded-2xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-black">Ocorreu um erro:</p>
                <p className="font-medium text-slate-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <button
            id="btn-publish-prayer"
            type="submit"
            disabled={!prayerContent.trim() || publishing}
            className="w-full bg-[#004b87] hover:bg-[#003b6d] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm transition-all"
          >
            {publishing ? (
              <>
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                Publicando no mural...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 shrink-0" />
                Publicar no Mural da Igreja
              </>
            )}
          </button>
        </form>
      </div>

      {/* Segment / View Toggle ("Todos os Pedidos" vs "Meus Pedidos") */}
      <div className="flex bg-[#e5e0d5]/40 p-1 rounded-2xl border border-[#e5e0d5] max-w-sm">
        <button
          onClick={() => setFilterMode('all')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterMode === 'all' 
              ? 'bg-[#004b87] text-white shadow-sm' 
              : 'text-[#0f2646] hover:bg-slate-200/50'
          }`}
        >
          Mural Geral
        </button>
        <button
          onClick={() => setFilterMode('mine')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterMode === 'mine' 
              ? 'bg-[#004b87] text-white shadow-sm' 
              : 'text-[#0f2646] hover:bg-slate-200/50'
          }`}
        >
          Meus Pedidos {user && publicPrayers.filter(p => p.userId === user.id).length > 0 && `(${publicPrayers.filter(p => p.userId === user.id).length})`}
        </button>
      </div>

      {/* Mural List and Filters */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FAF9F5]">
          <h4 className="text-sm font-black text-[#0f2646] uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#004b87]" />
            {filterMode === 'all' ? 'Mural da Igreja' : 'Meus Pedidos Publicados'} ({filteredPrayers.length})
          </h4>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pedidos..."
              className="pl-8 pr-3 py-1.5 bg-[#FAF9F5] border border-[#e5e0d5] focus:border-[#004b87] rounded-xl text-xs text-slate-700 font-sans outline-none max-w-[170px] font-semibold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#b48a30] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">Carregando mural...</p>
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="bg-[#FAF9F5] p-10 rounded-2xl border border-dashed border-[#e5e0d5] text-center text-slate-400 text-xs">
            {filterMode === 'all' 
              ? 'Nenhum pedido de oração encontrado no mural.' 
              : 'Você ainda não publicou nenhum pedido de oração.'}
            <br />
            Seja o primeiro a publicar um pedido no formulário acima!
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredPrayers.map((prayer) => {
              const userReacted = user && prayer.prayingUsers && prayer.prayingUsers.includes(user.id);
              const isCreatorOrAdmin = user && (prayer.userId === user.id || user.role === 'admin');

              return (
                <div
                  key={prayer.id}
                  className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-2xl p-4 space-y-3.5 shadow-sm hover:border-slate-350 transition-all text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-[#0f2646] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {prayer.author}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold block ml-3">{prayer.date}</span>
                    </div>

                    {isCreatorOrAdmin && (
                      <div className="shrink-0 flex items-center justify-end">
                        {deletingId === prayer.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold animate-fade-in shrink-0">
                            <span className="text-red-700 font-black">Apagar?</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOwn(prayer.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-lg font-black text-[10px] cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(prayer.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-all cursor-pointer"
                            title="Remover meu pedido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-sans break-words bg-white border border-slate-200/40 p-3 rounded-xl font-medium">
                    "{prayer.content}"
                  </p>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/20">
                    <span className="text-[10px] text-slate-500 font-bold font-sans italic flex items-center gap-1">
                      <span>🙏</span> 
                      {prayer.prayinCount || 0} {prayer.prayinCount === 1 ? 'irmão está orando' : 'irmãos estão orando'}
                    </span>

                    <button
                      onClick={() => handlePrayReact(prayer.id)}
                      disabled={!user}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                        userReacted
                          ? 'bg-[#b48a30]/10 text-[#b48a30] border border-[#b48a30]/30 scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-[#e5e0d5]'
                      }`}
                    >
                      <span className="text-xs">🙏</span>
                      <span>{userReacted ? 'Orando! (Retirar)' : 'Orar Junto'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
