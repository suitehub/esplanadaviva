import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { UserProfileData, Medal } from '../types';
import AvatarOfProgress from './AvatarOfProgress';

interface UserProfileProps {
  user: UserProfileData;
  medals: Medal[];
  bibleProgressPercent: number;
  totalActivitiesCount: number;
  onUpdateUserProfile?: (updatedUser: UserProfileData) => void;
  onDeleteAccount?: () => Promise<void>;
}

export default function UserProfile({
  user,
  medals,
  bibleProgressPercent,
  totalActivitiesCount,
  onUpdateUserProfile,
  onDeleteAccount,
}: UserProfileProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Customizer state preset with current user customizations or defaults
  const [customUser, setCustomUser] = useState<UserProfileData>({ ...user });

  // Safe icon lookup helper
  const renderMedalIcon = (iconName: string, unlocked: boolean) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Award;
    return (
      <IconComponent 
        className={`w-7 h-7 ${unlocked ? 'text-[#b48a30]' : 'text-slate-350'}`} 
      />
    );
  };

  // Format entry date
  const formatEntryDate = (dateStr: string) => {
    try {
      const p = dateStr.split('-');
      if (p.length === 3) {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${p[2]} de ${months[parseInt(p[1]) - 1]} de ${p[0]}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const handleOpenCustomizer = () => {
    setCustomUser({ ...user }); // Sync from parent
    setShowCustomizer(true);
  };

  const handleSaveCustomizer = () => {
    const finalName = customUser.fullName && customUser.fullName.trim() ? customUser.fullName.trim() : user.fullName;
    const finalUser = { ...customUser, fullName: finalName };
    if (onUpdateUserProfile) {
      onUpdateUserProfile(finalUser);
    }
    setShowCustomizer(false);
  };

  // Color Swatch Options
  const skinTones = [
    { value: '#FED7AA', label: 'Clara' },
    { value: '#E29930', label: 'Parda' },
    { value: '#6D3A1A', label: 'Negra' },
    { value: '#3C1E09', label: 'Escura' },
  ];

  const hairColors = [
    { value: '#111827', label: 'Preto' },
    { value: '#5C3D2E', label: 'Castanho' },
    { value: '#F59E0B', label: 'Loiro' },
    { value: '#CBD5E1', label: 'Grisalho' },
  ];

  const clothingColors = [
    { value: '#111827', label: 'Preto' },
    { value: '#004b87', label: 'Azul Esplanada' },
    { value: '#059669', label: 'Verde Esplanada' },
    { value: '#B59410', label: 'Ouro da Fé' },
    { value: '#991B1B', label: 'Vinho' },
    { value: '#7C3AED', label: 'Púrpura' },
  ];

  return (
    <div className="space-y-6 pb-20 text-[#1e293b]">
      {/* Top Profile Card containing Avatar of Progress */}
      <div className="bg-white border border-[#e5e0d5] rounded-3xl p-6 text-center shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#c29f5f]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center space-y-3">
          <AvatarOfProgress 
            gender={user.gender} 
            level={user.level} 
            size="xl"
            skinColor={user.skinColor}
            hairColor={user.hairColor}
            clothingColor={user.clothingColor}
            eyeStyle={user.eyeStyle}
            hairStyle={user.hairStyle}
            hasBeard={user.hasBeard}
            hasGlasses={user.hasGlasses}
          />
          
          <div className="space-y-1.5 pt-4">
            <h3 id="profile-fullname" className="text-xl font-extrabold text-[#0f2646] tracking-tight">{user.fullName}</h3>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#FAF9F5] border border-[#e5e0d5] px-3.5 py-1 rounded-full text-xs text-[#b48a30] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            {user.church ? `${user.church} • Distrito Esplanada` : 'Distrito Esplanada'} • Ativo desde {formatEntryDate(user.createdAt)}
          </div>

          {/* Trigger Character Customization Button */}
          <button
            id="profile-btn-customize"
            onClick={handleOpenCustomizer}
            className="mt-3 bg-gradient-to-r from-[#004b87] to-[#005c53] text-white hover:opacity-90 text-xs font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Icons.User className="w-4 h-4" />
            Personalizar Personagem
          </button>
        </div>
      </div>

      {/* Numerical Stats & Metrics Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Métricas Globais de Devoção</h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl text-center shadow-sm">
            <span className="text-[20px] font-black text-orange-600 font-mono block">🔥 {user.streakDays}</span>
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-tight block mt-1 leading-none">Dias Seguidos</span>
          </div>

          <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl text-center shadow-sm">
            <span id="stat-bible-percent" className="text-[20px] font-black text-[#005c53] font-mono block">📖 {bibleProgressPercent}%</span>
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-tight block mt-1 leading-none">Leitura Bíblica</span>
          </div>

          <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl text-center shadow-sm">
            <span className="text-[20px] font-black text-[#004b87] font-mono block">🤝 {user.completedMissionsCount}</span>
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-tight block mt-1 leading-none">Missões Efetuadas</span>
          </div>

          <div className="bg-white border border-[#e5e0d5] p-3.5 rounded-2xl text-center shadow-sm">
            <span className="text-[20px] font-black text-[#b48a30] font-mono block">✍️ {user.reflectionsCount}</span>
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-tight block mt-1 leading-none">Anotações Diário</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3 rounded-2xl border border-[#e5e0d5] flex justify-between items-center text-xs shadow-sm">
            <span className="text-slate-600 font-semibold">Estudos realizados da Escola Sabatina:</span>
            <span className="font-extrabold text-[#004b87] font-mono bg-[#FAF9F5] px-2.5 py-0.5 rounded-lg border border-[#e5e0d5]">{user.lessonsStudiedCount} lição</span>
          </div>
          
          <div className="bg-white p-3 rounded-2xl border border-[#e5e0d5] flex justify-between items-center text-xs shadow-sm">
            <span className="text-slate-600 font-semibold">Estatísticas gerais de atividades registradas:</span>
            <span className="font-extrabold text-[#005c53] font-mono bg-[#FAF9F5] px-2.5 py-0.5 rounded-lg border border-[#e5e0d5]">{totalActivitiesCount} ações</span>
          </div>
        </div>
      </div>

      {/* Configurações da Conta Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Configurações do Membro</h4>
        
        <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3 text-[#0f2646]">
            <Icons.Settings className="w-5 h-5 text-[#b48a30]" />
            <span className="font-extrabold text-sm sm:text-base">Ajustes de Conta e Privacidade</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
            <div className="space-y-1">
              <h5 className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5 leading-none">
                <Icons.Trash2 className="w-4 h-4 text-rose-600" />
                Excluir Conta Permanentemente
              </h5>
              <p className="text-[11px] text-stone-550 leading-relaxed font-medium max-w-lg">
                Seu progresso espiritual, nível, lições, e avatar Chibi serão apagados de nossos servidores permanentemente, em conformidade com as diretrizes da LGPD brasileira.
              </p>
            </div>
            
            <button
              id="btn-delete-account-trigger"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm text-center shrink-0"
            >
              Excluir Conta
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#2C2620]/65 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#e8dfd3] rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3 text-rose-600 border-b border-stone-100 pb-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="font-extrabold text-base text-[#2C2620] leading-none">Excluir Conta Permanentemente?</h4>
                <span className="text-[10px] font-mono text-rose-500 font-bold block mt-1">ESTA AÇÃO É IRREVERSÍVEL</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Ao confirmar a exclusão, todos os seus dados espirituais associados ao seu e-mail <strong>({user.email})</strong> serão excluídos permanentemente de nossos servidores no Firestore, incluindo:
            </p>

            <ul className="list-disc list-inside text-[11px] text-stone-500 space-y-1 pl-1 font-medium">
              <li>Seu avatar de crescimento Chibi personalizado</li>
              <li>Sua pontuação total acumulada de <strong>{user.xp} XP</strong></li>
              <li>Histórico de <strong>{user.streakDays} dias</strong> de streak diário</li>
              <li>Respostas escritas e lições de Escola Sabatina</li>
              <li>Todas as anotações do seu Diário Espiritual</li>
            </ul>

            <div className="space-y-2">
              <label htmlFor="delete-confirm-input" className="text-[11px] font-black text-stone-700 block leading-relaxed">
                Para confirmar a exclusão definitiva, digite a palavra <strong className="text-rose-600 select-all">EXCLUIR</strong> no campo abaixo:
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                placeholder='Escreva "EXCLUIR"'
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black outline-none transition-all placeholder:text-stone-300 text-rose-700 tracking-wider text-center"
              />
            </div>

            <div className="flex gap-2.5 justify-end text-xs font-bold pt-1 border-t border-stone-100">
              <button
                type="button"
                id="btn-delete-cancel"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput('');
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-delete-confirm"
                disabled={deleteConfirmInput !== 'EXCLUIR' || isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  if (onDeleteAccount) {
                    await onDeleteAccount();
                  }
                  setIsDeleting(false);
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput('');
                }}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Icons.Trash2 className="w-4 h-4" />
                    Excluir Minha Conta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* CHARACTER CUSTOMIZATION MODAL Overlay */}
      {showCustomizer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#e5e0d5] rounded-3xl p-5 max-w-md w-full space-y-4 text-left shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-center text-[#0f2646] border-b border-[#e5e0d5] pb-3">
              <span className="font-extrabold text-base flex items-center gap-2">
                <Icons.User className="w-5 h-5 text-[#b48a30]" />
                Personalizar Meu Membro
              </span>
              <button
                type="button"
                id="btn-customizer-close"
                onClick={() => setShowCustomizer(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Mirror Preview Widget */}
            <div className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono mb-2">Visualização em Tempo Real</span>
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-full border border-[#e5e0d5] p-2 relative shadow-inner">
                <AvatarOfProgress 
                  gender={customUser.gender} 
                  level={customUser.level} 
                  size="lg"
                  skinColor={customUser.skinColor}
                  hairColor={customUser.hairColor}
                  clothingColor={customUser.clothingColor}
                  eyeStyle={customUser.eyeStyle}
                  hairStyle={customUser.hairStyle}
                  hasBeard={customUser.hasBeard}
                  hasGlasses={customUser.hasGlasses}
                />
              </div>
              <span className="text-xs text-slate-600 font-bold mt-2 font-mono">Membro: {customUser.fullName}</span>
            </div>

            {/* Customization Options form */}
            <div className="space-y-4 text-xs">

              {/* Option: Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                <div className="relative">
                  <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={customUser.fullName || ''}
                    onChange={(e) => setCustomUser({ ...customUser, fullName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#e5e0d5] focus:border-[#004b87] focus:ring-4 focus:ring-[#004b87]/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 font-semibold"
                  />
                </div>
              </div>
              
              {/* Option: Gênero */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Gênero Base</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomUser({ ...customUser, gender: 'masculino' })}
                    className={`py-2 px-3 rounded-lg border text-center font-bold ${
                      customUser.gender === 'masculino'
                        ? 'bg-[#004b87] text-white border-[#004b87]'
                        : 'bg-white border-[#e5e0d5] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomUser({ ...customUser, gender: 'feminino' })}
                    className={`py-2 px-3 rounded-lg border text-center font-bold ${
                      customUser.gender === 'feminino'
                        ? 'bg-[#004b87] text-white border-[#004b87]'
                        : 'bg-white border-[#e5e0d5] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Feminino
                  </button>
                </div>
              </div>

              {/* Option: Cor da Pele */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Tom de Pele</label>
                <div className="flex gap-2">
                  {skinTones.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setCustomUser({ ...customUser, skinColor: t.value })}
                      className={`w-8 h-8 rounded-full border-2 relative flex items-center justify-center ${
                        customUser.skinColor === t.value ? 'border-[#004b87] scale-110 shadow' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: t.value }}
                      title={t.label}
                    >
                      {customUser.skinColor === t.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#004b87]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Estilo do Cabelo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Estilo do Cabelo</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'short', label: 'Curto' },
                    { value: 'long', label: 'Longo' },
                    { value: 'curly', label: 'Crespo' },
                    { value: 'bald', label: 'Careca' },
                  ].map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => setCustomUser({ ...customUser, hairStyle: h.value as any })}
                      className={`px-3 py-1.5 rounded-lg border font-bold ${
                        (customUser.hairStyle || (customUser.gender === 'masculino' ? 'short' : 'long')) === h.value
                          ? 'bg-[#005c53] text-white border-[#005c53]'
                          : 'bg-white border-[#e5e0d5] text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Cor do Cabelo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Cor do Cabelo</label>
                <div className="flex gap-2.5 items-center">
                  {hairColors.map((hc) => (
                    <button
                      key={hc.value}
                      type="button"
                      onClick={() => setCustomUser({ ...customUser, hairColor: hc.value })}
                      className={`w-7 h-7 rounded-full border-2 relative flex items-center justify-center ${
                        customUser.hairColor === hc.value ? 'border-[#004b87] scale-110' : 'border-[#e5e0d5]'
                      }`}
                      style={{ backgroundColor: hc.value }}
                      title={hc.label}
                    >
                      {customUser.hairColor === hc.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Cor das Vestes (Vestimentas) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Cor dás Vestes de Progresso</label>
                <div className="flex gap-2.5 items-center">
                  {clothingColors.map((cc) => (
                    <button
                      key={cc.value}
                      type="button"
                      onClick={() => setCustomUser({ ...customUser, clothingColor: cc.value })}
                      className={`w-7 h-7 rounded-full border border-[#cbd5e1] relative flex items-center justify-center ${
                        customUser.clothingColor === cc.value ? 'ring-2 ring-emerald-500 ring-offset-2 scale-115' : ''
                      }`}
                      style={{ backgroundColor: cc.value }}
                      title={cc.label}
                    >
                      {customUser.clothingColor === cc.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Accessories: Glasses & Beard */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Acessórios Extras</label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setCustomUser({ ...customUser, hasGlasses: !customUser.hasGlasses })}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-2 ${
                      customUser.hasGlasses
                        ? 'bg-emerald-500/10 border-emerald-550 text-emerald-700 font-extrabold'
                        : 'bg-white border-[#e5e0d5] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>👓 Óculos Escritos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomUser({ ...customUser, hasBeard: !customUser.hasBeard })}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-2 ${
                      customUser.hasBeard
                        ? 'bg-emerald-500/10 border-emerald-555 text-emerald-700 font-extrabold'
                        : 'bg-white border-[#e5e0d5] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🧔 Barba / Cuidado</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Form Actions */}
            <div className="pt-3 border-t border-[#e5e0d5] flex gap-2 justify-end text-xs font-bold">
              <button
                type="button"
                id="btn-customizer-cancel"
                onClick={() => setShowCustomizer(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                id="btn-customizer-save"
                onClick={handleSaveCustomizer}
                className="bg-[#004b87] hover:bg-[#003b6d] text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Salvar Customização
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
