import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Lock, ShieldAlert, Sparkles, AlertCircle, RefreshCw, 
  Trophy, BookOpen, Target, Flame, ChevronRight, Award, Smile, CheckCircle, Zap, Compass
} from 'lucide-react';
import { Gender, UserProfileData } from '../types';
import logoImg from './logo.png';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfileData) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [registerRole, setRegisterRole] = useState<'discípulo' | 'discipulador'>('discípulo');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('masculino');
  const [error, setError] = useState('');
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [church, setChurch] = useState('Bonsucesso');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const CHURCHES = [
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Por favor, digite seu e-mail.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter ao menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError('O campo Nome Completo é obrigatório.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        const profileDoc = await getDoc(doc(db, 'users', uid));
        if (profileDoc.exists()) {
          onAuthSuccess(profileDoc.data() as UserProfileData);
        } else {
          const fallbackUser: UserProfileData = {
            id: uid,
            fullName: email.split('@')[0],
            email: email.toLowerCase(),
            gender: gender,
            avatarUrl: gender === 'masculino' ? 'male' : 'female',
            level: 1,
            xp: 0,
            xpNeededForNextLevel: 500,
            totalPoints: 0,
            streakDays: 1,
            lastAccessDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString().split('T')[0],
            bibleReadingsCount: 0,
            completedMissionsCount: 0,
            reflectionsCount: 0,
            lessonsStudiedCount: 0,
            church: church,
            role: (email.toLowerCase() === 'rickyjorgecastro@gmail.com') ? 'admin' : 'user',
          };
          await setDoc(doc(db, 'users', uid), fallbackUser);
          onAuthSuccess(fallbackUser);
        }
      } else {
        const emailLower = email.trim().toLowerCase();
        const isPastorEmail = emailLower === 'rickyjorgecastro@gmail.com' || emailLower === 'pastor@esplanadaviva.com' || emailLower === 'pastor@discipulado.com';
        
        let roleGranted: 'pastor' | 'discipulador' | 'discípulo' | 'admin' = 'discípulo';
        let discipuladorId: string | undefined = undefined;
        let discipuladorName: string | undefined = undefined;

        if (isPastorEmail) {
          roleGranted = 'pastor';
        } else {
          if (!inviteCode) {
            setError('Código de Convite é obrigatório para registrar-se no Distrito.');
            setLoading(false);
            return;
          }
          const inviteDocRef = doc(db, 'invites', inviteCode.trim().toUpperCase());
          const inviteDocSnap = await getDoc(inviteDocRef);
          if (!inviteDocSnap.exists()) {
            setError('Código de Convite inválido ou inexistente.');
            setLoading(false);
            return;
          }
          const inviteData = inviteDocSnap.data();
          if (inviteData.status !== 'pending' && !inviteData.isFixed) {
            setError('Este Código de Convite já foi utilizado.');
            setLoading(false);
            return;
          }

          roleGranted = inviteData.type;
          
          if (registerRole === 'discípulo' && roleGranted !== 'discípulo') {
            setError('Este código de convite é de Discipulador. Se deseja registrar-se como Discipulador, selecione a opção "Registro de Discipulador" acima.');
            setLoading(false);
            return;
          }
          if (registerRole === 'discipulador' && roleGranted !== 'discipulador') {
            setError('Este código de convite é de Discípulo. Se deseja registrar-se como Discípulo, selecione a opção "Registro de Discípulo" acima.');
            setLoading(false);
            return;
          }

          if (roleGranted === 'discípulo') {
            discipuladorId = inviteData.createdById;
            discipuladorName = inviteData.createdByName;
          }
        }

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        
        const initialUser: UserProfileData = {
          id: uid,
          fullName: fullName,
          email: emailLower,
          gender: gender,
          avatarUrl: gender === 'masculino' ? 'male' : 'female',
          level: 1,
          xp: 0,
          xpNeededForNextLevel: 500,
          totalPoints: 0,
          streakDays: 1,
          lastAccessDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          bibleReadingsCount: 0,
          completedMissionsCount: 0,
          reflectionsCount: 0,
          lessonsStudiedCount: 0,
          church: church,
          skinColor: '#FED7AA',
          hairStyle: gender === 'masculino' ? 'short' : 'long',
          hairColor: gender === 'masculino' ? '#111827' : '#5C3D2E',
          eyeStyle: 'calm',
          clothingColor: '#004b87',
          hasBeard: false,
          hasGlasses: false,
          role: roleGranted,
          discipuladorId,
          discipuladorName,
        };

        await setDoc(doc(db, 'users', uid), initialUser);

        if (!isPastorEmail && inviteCode) {
          const inviteDocRef = doc(db, 'invites', inviteCode.trim().toUpperCase());
          const inviteDocSnap = await getDoc(inviteDocRef);
          const inviteData = inviteDocSnap.exists() ? inviteDocSnap.data() : null;
          if (inviteData && !inviteData.isFixed) {
            await setDoc(inviteDocRef, {
              status: 'used',
              usedByEmail: emailLower,
              usedById: uid,
              usedAt: new Date().toISOString()
            }, { merge: true });
          }
        }

        onAuthSuccess(initialUser);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está sendo utilizado.');
      } else {
        setError(err.message || 'Erro ao realizar autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCred = await signInWithPopup(auth, provider);
      const uid = userCred.user.uid;
      const emailVal = userCred.user.email || '';
      const nameVal = userCred.user.displayName || emailVal.split('@')[0];
      
      const profileDoc = await getDoc(doc(db, 'users', uid));
      if (profileDoc.exists()) {
        onAuthSuccess(profileDoc.data() as UserProfileData);
      } else {
        const emailLower = emailVal.toLowerCase();
        const isPastorEmail = emailLower === 'rickyjorgecastro@gmail.com' || emailLower === 'pastor@esplanadaviva.com' || emailLower === 'pastor@discipulado.com';
        
        if (isPastorEmail) {
          const initialUser: UserProfileData = {
            id: uid,
            fullName: nameVal,
            email: emailLower,
            gender: 'masculino',
            avatarUrl: 'male',
            level: 1,
            xp: 0,
            xpNeededForNextLevel: 500,
            totalPoints: 0,
            streakDays: 1,
            lastAccessDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString().split('T')[0],
            bibleReadingsCount: 0,
            completedMissionsCount: 0,
            reflectionsCount: 0,
            lessonsStudiedCount: 0,
            church: church,
            skinColor: '#FED7AA',
            hairStyle: 'short',
            hairColor: '#111827',
            eyeStyle: 'open',
            clothingColor: '#004b87',
            role: 'pastor',
          };
          await setDoc(doc(db, 'users', uid), initialUser);
          onAuthSuccess(initialUser);
        } else {
          setError('Seu e-mail não possui cadastro no distrito. Registre-se usando o formulário de cadastro com o seu Código de Convite.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao realizar login com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail) return;
    try {
      await sendPasswordResetEmail(auth, recoverEmail);
      setRecoverSuccess(true);
      setTimeout(() => {
        setRecoverSuccess(false);
        setShowRecoverModal(false);
        setRecoverEmail('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2620] flex flex-col justify-center items-center p-4 relative font-sans overflow-hidden">
      
      {/* Dynamic Keyframes for our creative caminhar com Jesus animation */}
      <style>{`
        @keyframes walkBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }eg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes walkJesusBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-0.5deg); }
        }
        @keyframes glowingHalo {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.6)) blur(1px); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)) blur(2px); }
        }
        @keyframes floatStar {
          0% { transform: translateY(10px) scale(0.8); opacity: 0.3; }
          50% { transform: translateY(-10px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(10px) scale(0.8); opacity: 0.3; }
        }
        @keyframes climbCloudHeaven {
          0% { transform: translate(0px, 0px) scale(0.95); opacity: 0; }
          10% { opacity: 0.55; }
          90% { opacity: 0.55; }
          100% { transform: translate(145px, -115px) scale(0.45); opacity: 0; }
        }
        @keyframes heavenlyPulse {
          0%, 100% { opacity: 0.25; transform: scale(1); filter: blur(20px); }
          50% { opacity: 0.5; transform: scale(1.1); filter: blur(30px); }
        }
        @keyframes beamLight {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(12px); }
        }
        
        /* New Custom Looping Game Background layers */
        @keyframes scrollMountains {
          0% { background-position-x: 0px; }
          100% { background-position-x: -800px; }
        }
        @keyframes scrollHills {
          0% { background-position-x: 0px; }
          100% { background-position-x: -1200px; }
        }
        @keyframes scrollGround {
          0% { background-position-x: 0px; }
          100% { background-position-x: -1600px; }
        }

        /* Chibi and Jesus detailed movement keyframes */
        @keyframes swingL {
          0%, 100% { transform: rotate(-18deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes swingR {
          0%, 100% { transform: rotate(18deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes swingArmL {
          0%, 100% { transform: rotate(14deg); }
          50% { transform: rotate(-14deg); }
        }
        @keyframes swingArmR {
          0%, 100% { transform: rotate(-14deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes headBob {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes backpackShake {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-1.5px) rotate(2deg); }
        }

        .animate-walk {
          animation: walkBob 1.2s infinite ease-in-out;
        }
        .animate-walk-jesus {
          animation: walkJesusBob 1.3s infinite ease-in-out;
        }
        .animate-climb {
          animation: climbCloudHeaven 14s infinite linear;
        }
        .animate-heaven-glow {
          animation: heavenlyPulse 6s infinite ease-in-out;
        }
        
        .mountains-layer {
          background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='240' viewBox='0 0 800 240'%3E%3Cpath d='M0 240 L160 80 L320 180 L500 50 L640 160 L800 100 L800 240 Z' fill='%232D3728' opacity='0.2'/%3E%3Cpath d='M80 240 L260 90 L440 190 L580 70 L720 170 L800 120 L800 240 Z' fill='%231E2A18' opacity='0.33'/%3E%3C/svg%3E");
          animation: scrollMountains 40s linear infinite;
        }
        .hills-layer {
          background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='180' viewBox='0 0 1200 180'%3E%3Cpath d='M0 120 Q180 80 360 120 T720 120 T1080 120 T1200 120 L1200 180 L0 180 Z' fill='%23193014' opacity='0.5'/%3E%3Ccircle cx='100' cy='105' r='14' fill='%2310230C'/%3E%3Crect x='97' y='112' width='6' height='15' fill='%233A2518'/%3E%3Ccircle cx='420' cy='110' r='12' fill='%2310230C'/%3E%3Crect x='417' y='118' width='6' height='15' fill='%233A2518'/%3E%3Ccircle cx='850' cy='100' r='13' fill='%2310230C'/%3E%3Crect x='847' y='108' width='6' height='15' fill='%233A2518'/%3E%3Cpath d='M250 85 L265 120 L235 120 Z' fill='%230D1F09'/%3E%3Crect x='247' y='115' width='6' height='15' fill='%233A2518'/%3E%3Cpath d='M650 90 L665 125 L635 125 Z' fill='%230D1F09'/%3E%3Crect x='647' y='120' width='6' height='15' fill='%233A2518'/%3E%3C/svg%3E");
          animation: scrollHills 22s linear infinite;
        }
        .ground-layer {
          background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='140' viewBox='0 0 1600 140'%3E%3Crect width='1600' height='140' fill='%2313270E'/%3E%3Cpath d='M0 40 Q400 20 800 40 T1600 40 L1600 140 L0 140 Z' fill='%235A4328'/%3E%3Cpath d='M0 25 Q400 10 800 25 T1600 25 L1600 40 L0 40 Z' fill='%231C3814'/%3E%3Ccircle cx='120' cy='65' r='2' fill='%23ffffff'/%3E%3Ccircle cx='350' cy='85' r='3' fill='%23fcd34d'/%3E%3Ccircle cx='680' cy='55' r='2' fill='%23ea580c'/%3E%3Ccircle cx='920' cy='75' r='3.5' fill='%23ffffff'/%3E%20%3Ccircle cx='1240' cy='50' r='2' fill='%23fcd34d'/%3E%3C/svg%3E");
          animation: scrollGround 9s linear infinite;
        }
      `}</style>

      {/* Dynamic Animated Particles / Spiritual Aura */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1], 
            opacity: [0.2, 0.35, 0.2] 
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#b48a30]/10 blur-[150px]"
        />

        {/* Floating particles (Holy sparks) */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * 800 + 100, 
              opacity: Math.random() * 0.4 + 0.1, 
              scale: Math.random() * 0.7 + 0.3 
            }}
            animate={{ 
              y: [0, -120 - Math.random() * 150], 
              opacity: [0, 0.9, 0] 
            }}
            transition={{ 
              duration: 6 + Math.random() * 6, 
              repeat: Infinity, 
              delay: Math.random() * 2 
            }}
            className="absolute text-amber-500/80 font-mono text-[9px] pointer-events-none flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100 fill-amber-400" />
            <span className="font-bold text-amber-800">+{8 + i * 4} XP</span>
          </motion.div>
        ))}
      </div>

      {/* Main Split Screen Form container (Premium Off-White Theme) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white/90 rounded-[40px] border border-[#e8dfd3] overflow-hidden shadow-[0_24px_60px_rgba(44,38,32,0.08)] relative z-10 grid grid-cols-1 md:grid-cols-12 backdrop-blur-xl"
      >
           {/* Left Rich Editorial & Game Art panel - visible on md+ screen */}
        <div className="hidden md:flex md:col-span-6 text-white p-7 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#111A0D] to-[#1B2A16] border-r border-[#e8dfd3]">
          
          {/* Deep Parallax Nature Landscape Scenery Background */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            
            {/* Sky backdrop with sun and light rays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#83b6f2] via-[#aed2fc] to-[#e8f3fe]" />
            <div className="absolute top-[10%] right-[10%] w-60 h-60 rounded-full bg-amber-250/35 blur-3xl" />
            
            {/* Divine God-rays filtering through */}
            <svg className="absolute inset-0 w-full h-full opacity-40 animate-pulse" viewBox="0 0 400 400" fill="none">
              <path d="M 400 0 L 100 400 M 400 40 L 160 400 M 350 -10 L 40 400" stroke="#fcd34d" strokeWidth="6" opacity="0.45" />
            </svg>

            {/* Cloud vectors drifting */}
            <div className="absolute top-[12%] left-[8%] w-24 h-7 bg-white/70 rounded-full blur-[2px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-[25%] right-[15%] w-32 h-9 bg-white/65 rounded-full blur-[3px] animate-pulse" style={{ animationDuration: '12s' }} />

            {/* Layer 1: Mountains (Parallax Far Background) */}
            <div className="absolute inset-0 mountains-layer bg-repeat-x opacity-40 select-none pointer-events-none scale-105" style={{ backgroundSize: '800px 240px', backgroundPosition: 'bottom' }} />

            {/* Layer 2: Hills (Parallax Mid Background with small trees) */}
            <div className="absolute inset-0 hills-layer bg-repeat-x opacity-75 select-none pointer-events-none scale-105" style={{ backgroundSize: '1200px 180px', backgroundPosition: 'bottom' }} />

            {/* Layer 3: Ground path (Parallax Foreground) */}
            <div className="absolute inset-x-0 bottom-0 ground-layer bg-repeat-x h-28 pointer-events-none" style={{ backgroundSize: '1600px 140px', backgroundPosition: 'bottom' }} />

            {/* Luminous floating holy sparks */}
            <div className="absolute bottom-24 left-[20%] text-amber-200/50 text-[10px] animate-bounce" style={{ animationDuration: '4s' }}>✦</div>
            <div className="absolute bottom-32 left-[50%] text-amber-250/40 text-[12px] animate-bounce" style={{ animationDuration: '3s' }}>✦</div>
            <div className="absolute bottom-20 right-[25%] text-amber-200/35 text-[9px] animate-bounce" style={{ animationDuration: '5s' }}>✦</div>

            {/* WALKING CHARACTERS (Really Big & Premium Hand-Rendered) */}
            <div className="absolute bottom-2 right-0 left-0 h-44 flex items-end justify-center gap-14 select-none pointer-events-none z-10">
              
              {/* 1. JESUS COMPANION (Waving, sandaled walking) */}
              <div className="relative animate-walk-jesus pb-3">
                <svg className="w-28 h-44 drop-shadow-[0_8px_16px_rgba(30,41,59,0.25)]" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Glowing halo */}
                  <circle cx="50" cy="30" r="18" fill="#fbbf24" fillOpacity="0.25" style={{ animation: 'glowingHalo 3s infinite ease-in-out' }} />

                  {/* Left Leg (Sandal & Foot - Rear) */}
                  <g style={{ transformOrigin: '36px 135px', animation: 'swingL 1.3s infinite ease-in-out' }}>
                    <rect x="32" y="135" width="8" height="15" fill="#fed7aa" stroke="#1c1917" strokeWidth="2.2" />
                    <rect x="28" y="148" width="15" height="5" rx="1.5" fill="#78350f" stroke="#1c1917" strokeWidth="2" />
                    <path d="M29 148 L35 142 M39 148 L35 142" stroke="#1c1917" strokeWidth="2" />
                  </g>

                  {/* Right Leg (Sandal & Foot - Front) */}
                  <g style={{ transformOrigin: '64px 135px', animation: 'swingR 1.3s infinite ease-in-out' }}>
                    <rect x="60" y="135" width="8" height="15" fill="#fed7aa" stroke="#1c1917" strokeWidth="2.2" />
                    <rect x="56" y="148" width="15" height="5" rx="1.5" fill="#78350f" stroke="#1c1917" strokeWidth="2" />
                    <path d="M57 148 L63 142 M67 148 L63 142" stroke="#1c1917" strokeWidth="2" />
                  </g>

                  {/* Flowing White Robe / Tunic */}
                  <path d="M26 50 C36 50, 64 50, 74 50 L78 138 C70 142, 30 142, 22 138 Z" fill="#fafaf9" stroke="#1c1917" strokeWidth="2.5" />
                  {/* Folds of Tunic */}
                  <path d="M 36 50 L 32 138 M 50 50 L 50 140 M 64 50 L 68 138" stroke="#e5e5e5" strokeWidth="2" fill="none" />

                  {/* Belt sash */}
                  <rect x="28" y="82" width="44" height="8" rx="2.5" fill="#7c2d12" stroke="#1c1917" strokeWidth="2" />

                  {/* Earthy Golden Brown Mantle / Outer Cloak draped beautifully */}
                  <path d="M 28 50 C 20 62, 21 112, 28 132 L 22 132 C 16 112, 16 72, 22 50" fill="#a16207" stroke="#1c1917" strokeWidth="2.2" />
                  <path d="M 72 50 C 80 62, 79 112, 72 132 L 78 132 C 84 112, 84 72, 78 50" fill="#a16207" stroke="#1c1917" strokeWidth="2.2" />

                  {/* Left Arm (Raised High in Friendly/Divine Greeting & Waving) */}
                  <g style={{ transformOrigin: '16px 50px', animation: 'swingArmL 1.8s infinite ease-in-out' }}>
                    {/* Sleeve */}
                    <path d="M 26 52 C 16 40, 6 34, 10 28" stroke="#fafaf9" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 28 50 C 18 38, 8 32, 12 26" stroke="#a16207" strokeWidth="2.2" fill="none" />
                    {/* Hand (Blessing / Hello wave) */}
                    <path d="M 10 28 C 12 24, 8 10, 4 12" stroke="#1c1917" strokeWidth="2.2" fill="#fed7aa" />
                    {/* Detailed warm hand fingers waving */}
                    <path d="M 4 12 L 2 6 M 6 10 L 4 4 M 8 11 L 7 5 M 10 13 L 10 7" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Right Arm (Resting on side / swinging slightly) */}
                  <g style={{ transformOrigin: '74px 52px', animation: 'swingArmR 1.3s infinite ease-in-out' }}>
                    <path d="M 72 52 C 81 66, 89 83, 85 91" stroke="#fafaf9" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="85" cy="92" r="5" fill="#fed7aa" stroke="#1c1917" strokeWidth="2" />
                  </g>

                  {/* Head (Smiling warm Face and Hair with Beard) */}
                  <g style={{ transformOrigin: '50px 45px', animation: 'headBob 1.3s infinite ease-in-out' }}>
                    {/* Cozy skin tone */}
                    <path d="M34 35 C34 19, 66 19, 66 35 C66 50, 34 50, 34 35 Z" fill="#fed7aa" stroke="#1c1917" strokeWidth="2.5" />
                    
                    {/* Brown twinkly eyes */}
                    <ellipse cx="44" cy="32" rx="4" ry="5" fill="#1c1917" />
                    <circle cx="45" cy="30.5" r="1.3" fill="#ffffff" />
                    <ellipse cx="56" cy="32" rx="4" ry="5" fill="#1c1917" />
                    <circle cx="57" cy="30.5" r="1.3" fill="#ffffff" />

                    {/* Beard & Mustache */}
                    <path d="M 33 37 C 33 48, 67 48, 67 37 C 67 53, 33 53, 33 37" fill="#5c3d2e" stroke="#1c1917" strokeWidth="2" />
                    <path d="M 41 39 Q 50 41 59 39" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />

                    <path d="M 45 42 Q 50 46 55 42" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />

                    {/* Flown Wavy Brown Hair */}
                    <path d="M 32 28 C 24 22, 20 12, 28 4 C 34 -4, 66 -4, 72 4 C 80 12, 76 22, 68 28 C 72 34, 70 42, 64 46 C 50 48, 42 46, 32 28 Z" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" fillRule="evenodd" />
                  </g>
                </svg>
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] bg-amber-500 text-stone-904 font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md select-none border border-amber-300/30">Mestre</span>
              </div>
              
              {/* 2. CHIBI PILGRIM BOY COMPANION (With Terracotta Backpack, Green Plaid Shirt) */}
              <div className="relative animate-walk pb-1">
                <svg className="w-24 h-40 drop-shadow-[0_8px_16px_rgba(30,41,59,0.25)]" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    {/* Backpack on his back, layered in depth */}
                    <g style={{ transformOrigin: '28px 75px', animation: 'backpackShake 1.2s infinite ease-in-out' }}>
                      {/* Terracotta body */}
                      <rect x="15" y="60" width="24" height="42" rx="7" fill="#b45309" stroke="#1c1917" strokeWidth="2.5" />
                      {/* Outer pocket */}
                      <rect x="12" y="70" width="6" height="24" rx="2" fill="#9a3412" stroke="#1c1917" strokeWidth="2" />
                      <rect x="18" y="67" width="18" height="12" rx="3" fill="#9a3412" stroke="#1c1917" strokeWidth="2" />
                      <rect x="18" y="83" width="18" height="14" rx="3" fill="#9a3412" stroke="#1c1917" strokeWidth="2" />
                      {/* Small design stripes */}
                      <line x1="21" y1="73" x2="33" y2="73" stroke="#fcd34d" strokeWidth="1.5" />
                      <line x1="21" y1="90" x2="33" y2="90" stroke="#fcd34d" strokeWidth="1.5" />
                    </g>

                    {/* Back Arm (Sleeve & Hand - Green Plaid) */}
                    <g style={{ transformOrigin: '32px 64px', animation: 'swingArmL 1.2s infinite ease-in-out' }}>
                      <path d="M30 64 C20 76, 12 86, 16 93" stroke="#047857" strokeWidth="9" strokeLinecap="round" />
                      <circle cx="15" cy="94" r="5" fill="#fed7aa" stroke="#1c1917" strokeWidth="2" />
                    </g>

                    {/* Torso & Green Checked Shirt */}
                    <path d="M28 58 L72 58 L75 115 L25 115 Z" fill="#047857" stroke="#1c1917" strokeWidth="2.5" />
                    {/* Plaid Shirt Strips (High quality checkered details) */}
                    <path d="M36 58 L33 115 M46 58 L46 115 M56 58 L58 115 M66 58 L68 115" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.7" />
                    <path d="M26 70 L74 70 M25 85 L75 85 M24 100 L76 100" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.7" />
                    
                    {/* Backpack Straps over shoulder */}
                    <path d="M36 60 C42 60, 48 72, 42 90 C36 102, 30 92, 30 84" stroke="#78350f" strokeWidth="3" fill="none" />

                    {/* Left Leg (Rear - Blue Jeans with Cuff) */}
                    <g style={{ transformOrigin: '40px 115px', animation: 'swingL 1.2s infinite ease-in-out' }}>
                      <rect x="35" y="115" width="11" height="28" rx="4" fill="#1e3a8a" stroke="#1c1917" strokeWidth="2.5" />
                      <rect x="33" y="139" width="15" height="6" rx="2" fill="#93c5fd" stroke="#1c1917" strokeWidth="2" />
                      <path d="M33 145 L45 145 C48 145, 50 151, 46 153 L31 153 Z" fill="#1c1917" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" />
                      <rect x="31" y="152" width="15" height="3" fill="#ffffff" />
                    </g>

                    {/* Right Leg (Front - Blue Jeans with Cuff) */}
                    <g style={{ transformOrigin: '60px 115px', animation: 'swingR 1.2s infinite ease-in-out' }}>
                      <rect x="54" y="115" width="11" height="28" rx="4" fill="#1e3a8a" stroke="#1c1917" strokeWidth="2.5" />
                      <rect x="52" y="139" width="15" height="6" rx="2" fill="#93c5fd" stroke="#1c1917" strokeWidth="2" />
                      <path d="M52 145 L64 145 C67 145, 69 151, 65 153 L50 153 Z" fill="#1c1917" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" />
                      <rect x="50" y="152" width="15" height="3" fill="#ffffff" />
                    </g>

                    {/* Front Arm (Sleeve & Hand - Green Plaid) */}
                    <g style={{ transformOrigin: '68px 64px', animation: 'swingArmR 1.2s infinite ease-in-out' }}>
                      <path d="M68 64 C76 76, 84 86, 80 93" stroke="#047857" strokeWidth="9.5" strokeLinecap="round" />
                      <circle cx="81" cy="94" r="5" fill="#fed7aa" stroke="#1c1917" strokeWidth="2" />
                    </g>

                    {/* Head (Chibi Face & Hair looking up) */}
                    <g style={{ transformOrigin: '50px 48px', animation: 'headBob 1.2s infinite ease-in-out' }}>
                      {/* Face skin */}
                      <path d="M32 38 C32 22, 68 22, 68 38 C68 53, 32 53, 32 38 Z" fill="#fed7aa" stroke="#1c1917" strokeWidth="2.5" />
                      
                      {/* Rosy cheeks */}
                      <ellipse cx="37" cy="40" rx="3.5" ry="2" fill="#f43f5e" fillOpacity="0.4" />
                      <ellipse cx="63" cy="40" rx="3.5" ry="2" fill="#f43f5e" fillOpacity="0.4" />

                      {/* Nose and mouth looking up */}
                      <path d="M49 40 Q51 40 50 42" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M45 43 Q51 45 56 41" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />

                      {/* Cute Chibi Eyes with White reflections looking right & up */}
                      <ellipse cx="43" cy="35" rx="4.5" ry="5.5" fill="#1c1917" />
                      <circle cx="45" cy="33.2" r="1.5" fill="#ffffff" />
                      <ellipse cx="57" cy="35" rx="4.5" ry="5.5" fill="#1c1917" />
                      <circle cx="59" cy="33.2" r="1.5" fill="#ffffff" />

                      {/* Big Fluffy/Spiky Black Hair */}
                      <path d="M 32 34 C 20 28, 22 10, 36 8 C 42 2, 58 2, 64 8 C 74 6, 78 18, 70 28 C 74 32, 70 42, 64 42 C 60 43, 40 43, 32 34 Z" fill="#1e2937" stroke="#1c1917" strokeWidth="2.5" />
                      {/* Spikes highlights */}
                      <path d="M34 14 Q28 8 32 4" stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <path d="M48 8 Q44 2 46 1" stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <path d="M60 10 Q64 4 61 2" stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                    </g>
                  </g>
                </svg>
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] bg-[#34d399] text-stone-900 font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md select-none border border-emerald-300/30">Membro</span>
              </div>

            </div>

          </div>
          
          {/* CONTENT FOREGROUND: Glassmorphism layout of brand and stats */}
          <div className="space-y-4 z-20">
            
            {/* Seventh-day Adventist Church Logo Glass Box */}
            <div className="flex items-center gap-3.5 bg-[#090f05]/45 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center shrink-0"
              >
                <img src={logoImg} alt="Logo Igreja Adventista" referrerPolicy="no-referrer" className="h-14 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.25)]" />
              </motion.div>
              <div className="leading-tight">
                <span className="block text-[8px] tracking-widest uppercase font-black text-[#e4bd68] font-mono leading-none">Igreja Adventista</span>
                <span className="block text-[10px] tracking-wider uppercase font-bold text-stone-200 leading-none mt-0.5">do Sétimo Dia</span>
              </div>
            </div>

            {/* App Brand Glass Box with badges */}
            <div className="space-y-1.5 p-4 bg-[#090f05]/45 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 id="auth-main-brand" className="text-3xl font-extrabold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-[#f5cfa4]">
                  Esplanada Viva
                </h1>
                <span className="px-1.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full font-mono text-[7px] font-black uppercase tracking-wider animate-pulse shrink-0">
                  v2.8 PILGRIM
                </span>
              </div>
              <p className="text-[9px] text-[#e4bd68] font-black font-mono uppercase tracking-widest leading-none pt-0.5">
                Distrito da Esplanada • Jornada Cristã Gamificada
              </p>
              <p className="text-[11px] text-stone-250 font-medium leading-relaxed pt-1.5 opacity-95">
                Desenvolva seu discipulado, registre hábitos espirituais diários, interaja com missões locais e caminhe diariamente ao lado do Mestre em direção ao Lar.
              </p>
            </div>
            
            {/* Quick stats Glass HUD panel */}
            <div className="p-3.5 bg-[#090f05]/45 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/15 rounded-xl text-amber-400 shrink-0 border border-amber-500/35">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white uppercase tracking-wider">Ofensiva de Missão</span>
                  <span className="block text-[9px] text-stone-400 leading-none">Hábitos diários consecutivos</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-stone-400 font-mono text-[8px] uppercase font-black tracking-widest leading-none mb-0.5">Sua Ofensiva</span>
                <span className="block text-md font-black text-amber-400">45 DIAS</span>
              </div>
            </div>

          </div>

          {/* Inspirational Bible Quote Glass Block */}
          <div className="mt-6 space-y-1 p-3.5 bg-[#090f05]/55 backdrop-blur-md rounded-2xl border border-white/10 z-20 shadow-lg">
            <p className="text-[10.5px] italic text-stone-200 leading-relaxed font-serif relative">
              "Ensina-me o teu caminho, Senhor, e guia-me por uma vereda plana."
            </p>
            <p className="text-[8px] font-black tracking-widest uppercase text-[#e4bd68] font-mono select-none">
              — Salmos 27:11
            </p>
          </div>

        </div>

        {/* Right Interactive Form panel (Gorgeous Crisp Off-White Light palette) */}
        <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-[#FDFBF9] relative overflow-hidden">
          
          {/* Animated Background: Pilgrim walking to Heaven (very elegant and subtle, z-0) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            
            {/* Glowing Golden Heaven / Gate of Light in the top right corner */}
            <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-br from-amber-400 via-amber-250 to-transparent opacity-30 blur-2xl animate-heaven-glow" />
            
            {/* Rays of divine light descending from top right to bottom left */}
            <svg className="absolute top-0 right-0 w-full h-full opacity-45" viewBox="0 0 400 600" fill="none">
              <path d="M400 0 L150 600 M400 50 L200 600 M350 0 L100 600 M420 100 L250 600" stroke="url(#divineLight)" strokeWidth="4" opacity="0.35" />
              <defs>
                <linearGradient id="divineLight" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Clouds framing the Gateway */}
            <div className="absolute -top-4 right-10 w-44 h-16 bg-[#faf6eb]/80 rounded-full blur-md opacity-70" />
            <div className="absolute top-10 -right-6 w-36 h-12 bg-[#faf6eb]/60 rounded-full blur-md opacity-60" />

            {/* Glowing path of spiritual steps / stairs using an elegant SVG path */}
            <svg className="absolute bottom-6 left-6 w-[85%] h-[80%] opacity-40" viewBox="0 0 300 400" fill="none">
              <path 
                d="M15 365 Q110 305, 175 200 T285 30" 
                stroke="#b48a30" 
                strokeWidth="3.5" 
                strokeDasharray="8 10" 
                opacity="0.65" 
              />
              <circle cx="21" cy="360" r="3.5" fill="#d97706" />
              <circle cx="115" cy="295" r="3.5" fill="#d97706" />
              <circle cx="178" cy="195" r="3" fill="#d97706" />
              <circle cx="236" cy="110" r="2.5" fill="#d97706" />
              <circle cx="282" cy="35" r="2" fill="#d97706" />
            </svg>

            {/* The Climbing Character walking element */}
            <div className="absolute bottom-[2%] left-[5%] w-10 h-16 animate-climb opacity-55">
              <div className="animate-walk">
                <svg className="w-10 h-16" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="32" r="14" fill="#8a6820" />
                  <path d="M38 28 C38 20, 62 20, 62 28 Z" fill="#292524" />
                  <rect x="22" y="52" width="20" height="36" rx="6" fill="#065f46" />
                  <rect x="20" y="58" width="6" height="24" rx="2" fill="#047857" />
                  <path d="M35 48 C42 48, 58 48, 65 48 L68 130 C60 132, 40 132, 32 130 Z" fill="#c2410c" />
                  <rect x="36" y="128" width="8" height="20" rx="3" fill="#1c1917" />
                  <rect x="54" y="126" width="8" height="20" rx="3" fill="#1c1917" />
                </svg>
              </div>
            </div>
            
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div>
            <div className="text-center md:text-left mb-6 relative">
              {/* Logo/Icon view only on mobile and small layouts */}
              <div className="md:hidden flex justify-center mb-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center shrink-0 bg-[#eddcc6]/30 p-2.5 rounded-3xl border border-[#b48a30]/20"
                >
                  <img src={logoImg} alt="Logo Igreja Adventista" referrerPolicy="no-referrer" className="h-28 w-auto object-contain filter drop-shadow-md" />
                </motion.div>
              </div>

              <span className="md:hidden block text-center text-[10px] text-[#b48a30] font-black uppercase tracking-widest font-mono mb-1">
                Distrito da Esplanada • Crescimento em Cristo
              </span>
              
              {/* Gamified Segment Tab Switcher and Level Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 id="auth-title" className="text-2xl font-extrabold text-[#2C2620] leading-tight tracking-tight">
                    {isLogin ? 'Bem-vindo de Volta!' : 'Começar Nova Jornada'}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 font-medium">
                    {isLogin ? 'Conecte seu perfil para coletar conquistas do dia.' : 'Monte seu avatar espiritual e registre-se no distrito.'}
                  </p>
                </div>

                {/* Switcher Tab Button with Framer Layout Anim */}
                <div className="bg-[#FAF5EE] p-1 rounded-2xl border border-[#eadaaf]/60 flex self-center sm:self-auto gap-0.5 shadow-sm">
                  <button
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all relative shrink-0 cursor-pointer ${
                      isLogin ? 'text-white' : 'text-stone-500'
                    }`}
                  >
                    {isLogin && (
                      <motion.div 
                        layoutId="activeTabBgLight" 
                        className="absolute inset-0 bg-gradient-to-r from-[#b48a30] to-amber-600 rounded-xl z-0 shadow-md"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10">Entrar</span>
                  </button>
                  <button
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all relative shrink-0 cursor-pointer ${
                      !isLogin ? 'text-white' : 'text-stone-500'
                    }`}
                  >
                    {!isLogin && (
                      <motion.div 
                        layoutId="activeTabBgLight" 
                        className="absolute inset-0 bg-gradient-to-r from-[#b48a30] to-amber-600 rounded-xl z-0 shadow-md"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10">Registrar</span>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-550/20 rounded-2xl p-3.5 text-red-800 text-xs flex items-center gap-3.5 mb-5 text-left"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 animate-bounce" />
                <span className="font-bold leading-normal">{error}</span>
              </motion.div>
            )}

            {/* Form Fields Wrapper with off-white inputs */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login-fields' : 'signup-fields'}
                  initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <>
                      {/* Segmented control to choose between Discípulo and Discipulador registration */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-stone-100/80 p-1 rounded-2xl grid grid-cols-2 gap-1 border border-stone-200/60 mb-4"
                      >
                        <button
                          id="btn-register-role-discipulo"
                          type="button"
                          onClick={() => setRegisterRole('discípulo')}
                          className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            registerRole === 'discípulo'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-stone-500 hover:text-[#004b87]'
                          }`}
                        >
                          📖 Discípulo
                        </button>
                        <button
                          id="btn-register-role-discipulador"
                          type="button"
                          onClick={() => setRegisterRole('discipulador')}
                          className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            registerRole === 'discipulador'
                              ? 'bg-[#004b87] text-white shadow-sm'
                              : 'text-stone-500 hover:text-[#004b87]'
                          }`}
                        >
                          👥 Discipulador
                        </button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <label id="lbl-fullname" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Nome Completo</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                          <input
                            id="inp-fullname"
                            type="text"
                            placeholder="Ex: Guilherme Augusto"
                            value={fullName}
                            required
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-stone-250/70 focus:border-[#b48a30] focus:ring-4 focus:ring-[#b48a30]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-semibold shadow-inner"
                          />
                        </div>
                      </motion.div>
                    </>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label id="lbl-email" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Endereço de E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <input
                        id="inp-email"
                        type="email"
                        required
                        placeholder="Ex: seu-email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-250/70 focus:border-[#b48a30] focus:ring-4 focus:ring-[#b48a30]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-semibold shadow-inner"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label id="lbl-password" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Senha Secreta</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <input
                        id="inp-password"
                        type="password"
                        required
                        placeholder="Autenticação espiritual (mín. 6 dig)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-stone-250/70 focus:border-[#b48a30] focus:ring-4 focus:ring-[#b48a30]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-semibold shadow-inner"
                      />
                    </div>
                  </motion.div>

                  {!isLogin && (
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div>
                        <label id="lbl-confirm-password" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Confirmar Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                          <input
                            id="inp-confirm-password"
                            type="password"
                            required
                            placeholder="Repita a senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-stone-250/70 focus:border-[#b48a30] focus:ring-4 focus:ring-[#b48a30]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-semibold shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label id="lbl-church-selector" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Sua Igreja Local</label>
                        <select
                          id="inp-church-selector"
                          value={church}
                          onChange={(e) => setChurch(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-stone-250/70 focus:border-[#b48a30]/80 rounded-2xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-all text-stone-800 font-extrabold cursor-pointer h-[42px] shadow-sm"
                        >
                          {CHURCHES.map((ch) => (
                            <option key={ch} value={ch} className="bg-white text-stone-800 py-2">{ch}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label id="lbl-invite-code" className="block text-[10px] font-bold text-[#b48a30] uppercase tracking-widest mb-1.5 font-mono">
                          {registerRole === 'discípulo' ? 'Código de Convite do Discípulo' : 'Código de Convite do Discipulador'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                          <input
                            id="inp-invite-code"
                            type="text"
                            required
                            placeholder={registerRole === 'discípulo' ? 'Ex: SILVA-1234 (Solicite ao seu discipulador)' : 'Ex: PASTOR-1234 (Solicite ao seu pastor)'}
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="w-full bg-[#FAF8F5] border border-[#b48a30]/40 focus:border-[#b48a30] focus:ring-4 focus:ring-[#b48a30]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400 text-stone-850 font-semibold shadow-inner"
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 leading-normal block mt-1">
                          {registerRole === 'discípulo' 
                            ? 'O discipulado é um ambiente de crescimento espiritual. Solicite seu convite de discípulo ao seu discipulador.' 
                            : 'O papel de discipulador requer um convite de discipulador gerado pelo pastor no painel administrativo.'}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {!isLogin && (
                    <motion.div 
                      key="gender-selector-group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label id="lbl-gender" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">Tipo do Avatar Inicial</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          id="btn-gender-male"
                          type="button"
                          onClick={() => setGender('masculino')}
                          className={`py-2 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gender === 'masculino'
                              ? 'bg-[#b48a30]/10 border-[#b48a30] text-[#8a6820]'
                              : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <Smile className="w-4.5 h-4.5 text-[#b48a30]" />
                          <span>Masculino</span>
                        </button>
                        <button
                          id="btn-gender-female"
                          type="button"
                          onClick={() => setGender('feminino')}
                          className={`py-2 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gender === 'feminino'
                              ? 'bg-[#b48a30]/10 border-[#b48a30] text-[#8a6820]'
                              : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <Smile className="w-4.5 h-4.5 text-[#b48a30]" />
                          <span>Feminino</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {isLogin && (
                <div className="text-right">
                  <button
                    id="btn-recover-trigger"
                    type="button"
                    onClick={() => setShowRecoverModal(true)}
                    className="text-xs text-[#b48a30] hover:text-amber-800 font-extrabold cursor-pointer transition-colors"
                  >
                    Esqueceu seu acesso?
                  </button>
                </div>
              )}

              {/* Enter Button with premium hover and game particle trigger animation */}
              <motion.button
                id="btn-submit-auth"
                type="submit"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full bg-gradient-to-r from-amber-600 via-[#b48a30] to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-xs uppercase tracking-widest cursor-pointer mt-3 flex items-center justify-center gap-2 border border-[#b48a30]/10"
              >
                <Zap className="w-4.5 h-4.5 fill-white text-white" />
                <span>{isLogin ? 'Iniciar Sessão Espiritual' : 'Iniciar Missão no Distrito'}</span>
              </motion.button>
            </form>

            <div className="relative my-5 flex items-center justify-center text-[9px] text-stone-400 uppercase tracking-widest font-black font-mono">
              <div className="absolute w-full border-t border-stone-200"></div>
              <span className="relative bg-[#FAF8F5] px-3.5 border border-stone-150 text-stone-500 rounded-full">Ou entre utilizando</span>
            </div>

            {/* Google Authentication */}
            <motion.button
              id="btn-google-login"
              onClick={handleGoogleLogin}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#FAF8F5] border border-stone-200 hover:border-stone-300 text-stone-700 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm font-semibold"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285v4.115h6.887c-.648 2.41-2.519 4.148-5.187 4.148-3.418 0-6.19-2.772-6.19-6.19 0-3.418 2.772-6.19 6.19-6.19 1.483 0 2.844.525 3.923 1.398l3.14-3.14C18.91 1.93 15.76 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c5.8 0 10.8-4.22 10.8-11.24 0-.668-.08-1.32-.23-1.955H12.24z"
                />
              </svg>
              Conectar com a conta Google
            </motion.button>


          </div>

          <div className="text-center mt-6">
            <button
              id="btn-toggle-auth-mode"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
              className="text-xs text-stone-500 hover:text-stone-800 transition-all underline font-bold"
            >
              {isLogin ? 'Não possui login de membro? Cadastre sua jornada' : 'Já possui cadastro? Conectar minha conta'}
            </button>
          </div>

          {/* Quick Testing Evaluation HUD Drawer removed for Official Launch */}
          </div>
        </div>
      </motion.div>

      {/* Recover Password Modal (Styled beautifully) */}
      {showRecoverModal && (
        <div className="fixed inset-0 bg-[#2C2620]/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white border border-[#e8dfd3] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center gap-3 text-amber-700 border-b border-[#e8dfd3] pb-3">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              <h4 className="font-extrabold text-lg text-[#2C2620]">Recuperar Credenciais</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Faremos o envio de instruções para recuperação da senha provisória de acesso para o e-mail cadastrado em nossa secretaria.
            </p>
            {recoverSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-emerald-800 text-xs font-bold font-mono flex items-center gap-2"
              >
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>✓ Enviado! Verifique sua caixa de entrada e spam.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleRecoverPassword} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-mono">E-mail Cadastrado</label>
                  <input
                    id="inp-recover-email"
                    type="email"
                    required
                    placeholder="Seu e-mail cadastrado"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs focus:border-[#b48a30] outline-none text-stone-800 font-semibold"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs font-black pt-2">
                  <button
                    id="btn-recover-cancel"
                    type="button"
                    onClick={() => setShowRecoverModal(false)}
                    className="bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 px-3 py-2 rounded-xl text-stone-500 transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    id="btn-recover-send"
                    type="submit"
                    className="bg-gradient-to-r from-amber-600 to-[#b48a30] text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
