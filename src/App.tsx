import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  Home, 
  BookOpen, 
  HeartHandshake, 
  Award, 
  Compass, 
  History, 
  Bell, 
  User, 
  ShieldAlert, 
  Sparkles, 
  LogOut, 
  Sliders, 
  ChevronRight, 
  ListRestart, 
  X,
  MessageSquare,
  Gift,
  Users
} from 'lucide-react';

// Import Types
import { 
  UserProfileData, 
  SabbathLesson, 
  BibleReading, 
  SpiritualReflection, 
  MissionChallenge, 
  Medal, 
  ActivityHistory, 
  NotificationSettingsData,
  BookChapter
} from './types';

// Import Initial Datasets & Helpers
import { 
  LEVEL_STEPS, 
  INITIAL_LESSONS, 
  INITIAL_BIBLE_READINGS, 
  INITIAL_MISSIONS, 
  INITIAL_MEDALS, 
  INITIAL_MILESTONES,
  INITIAL_BOOK_CHAPTERS
} from './initialData';

// Import Views
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import logoImg from './components/logo.png';
import Dashboard from './components/Dashboard';
import TabCommunion from './components/TabCommunion';
import TabMission from './components/TabMission';
import UserProfile from './components/UserProfile';
import GrowthPath from './components/GrowthPath';
import HistoryLogs from './components/HistoryLogs';
import NotificationSettings from './components/NotificationSettings';
import AdminPanel from './components/AdminPanel';
import TabRelationship from './components/TabRelationship';
import DiscipuladorPanel from './components/DiscipuladorPanel';
import SpiritualAssessmentView from './components/SpiritualAssessmentView';

export default function App() {
  // Navigation & Screen Control state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'communion' | 'mission' | 'path' | 'relationship' | 'medals' | 'history' | 'notifications' | 'admin' | 'discipulador' | 'assessment'>('dashboard');
  const [activeCommunionSubTab, setActiveCommunionSubTab] = useState<'lesson' | 'bible' | 'book' | 'reflection'>('lesson');
  const [firebaseReady, setFirebaseReady] = useState(false);
  
  // Core DB states
  const [lessons, setLessons] = useState<SabbathLesson[]>(INITIAL_LESSONS);
  const [bibleReadings, setBibleReadings] = useState<BibleReading[]>(INITIAL_BIBLE_READINGS);
  const [bookChapters, setBookChapters] = useState<BookChapter[]>(INITIAL_BOOK_CHAPTERS);
  const [reflections, setReflections] = useState<SpiritualReflection[]>([]);
  const [missions, setMissions] = useState<MissionChallenge[]>(INITIAL_MISSIONS);
  const [medals, setMedals] = useState<Medal[]>(INITIAL_MEDALS);
  const [activityLogs, setActivityLogs] = useState<ActivityHistory[]>([]);
  const [notificationConfig, setNotificationConfig] = useState<NotificationSettingsData>({
    remindLesson: true,
    remindStreak: true,
    remindProgression: true,
    lessonTime: '07:30',
  });

  // Daily target completion flags (resets on Simulate New Day)
  const [dailyStatus, setDailyStatus] = useState({
    lessonCompleted: false,
    bibleCompleted: false,
    bookChapterCompleted: false,
    reflectionCompleted: false,
    missionCompleted: false,
  });

  // Global Mock Roster for Admin panel (populated dynamically from Firestore if admin)
  const [mockUserRoster, setMockUserRoster] = useState<UserProfileData[]>([]);

  // In-app Notification / Toast Banner State
  const [activeToast, setActiveToast] = useState<string | null>(null);
  
  // Level Up Modal Celebration State
  const [celebrateLevelUp, setCelebrateLevelUp] = useState<{ oldLvl: number; newLvl: number; title: string } | null>(null);

  // 1. Initial State Hydration on Mount (Real Firebase Sync)
  useEffect(() => {
    // Soft validation call to check connection
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const uid = firebaseUser.uid;
          
          // 1. Fetch User Profile
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let profile: UserProfileData;
          const todayStr = new Date().toISOString().split('T')[0];

          if (userDocSnap.exists()) {
            profile = userDocSnap.data() as UserProfileData;
            if (profile.email && profile.email.toLowerCase() === 'rickyjorgecastro@gmail.com' && profile.role !== 'admin') {
              profile.role = 'admin';
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            }

            // --- DAILY STATUS & STREAK SYNC ---
            let status = profile.dailyStatus;
            let nextStreak = profile.streakDays || 1;

            if (!status) {
              status = {
                lessonCompleted: false,
                bibleCompleted: false,
                bookChapterCompleted: false,
                reflectionCompleted: false,
                missionCompleted: false,
                lastResetDate: todayStr
              };
              profile.dailyStatus = status;
              profile.lastAccessDate = todayStr;
              await setDoc(userDocRef, profile);
            } else if (status.lastResetDate !== todayStr) {
              // It is a new day! Calculate streak increment or reset
              const didAnything = status.lessonCompleted || status.bibleCompleted || status.bookChapterCompleted || status.reflectionCompleted || status.missionCompleted;
              if (didAnything) {
                nextStreak += 1;
              } else {
                nextStreak = 1; // reset streak if missed a day
              }
              
              status = {
                lessonCompleted: false,
                bibleCompleted: false,
                bookChapterCompleted: false,
                reflectionCompleted: false,
                missionCompleted: false,
                lastResetDate: todayStr
              };
              profile.streakDays = nextStreak;
              profile.dailyStatus = status;
              profile.lastAccessDate = todayStr;
              await setDoc(userDocRef, profile);
            }

            setDailyStatus({
              lessonCompleted: status.lessonCompleted,
              bibleCompleted: status.bibleCompleted,
              bookChapterCompleted: status.bookChapterCompleted || false,
              reflectionCompleted: status.reflectionCompleted,
              missionCompleted: status.missionCompleted,
            });

          } else {
            profile = {
              id: uid,
              fullName: firebaseUser.displayName || 'Henrique Castro',
              email: firebaseUser.email || 'rickyjorgecastro@gmail.com',
              gender: 'masculino',
              avatarUrl: 'male',
              level: 1,
              xp: 0,
              xpNeededForNextLevel: 500,
              totalPoints: 0,
              streakDays: 1,
              lastAccessDate: todayStr,
              createdAt: todayStr,
              bibleReadingsCount: 0,
              completedMissionsCount: 0,
              reflectionsCount: 0,
              lessonsStudiedCount: 0,
              church: 'Bonsucesso',
              role: (firebaseUser.email && firebaseUser.email.toLowerCase() === 'rickyjorgecastro@gmail.com') ? 'admin' : 'user',
              dailyStatus: {
                lessonCompleted: false,
                bibleCompleted: false,
                bookChapterCompleted: false,
                reflectionCompleted: false,
                missionCompleted: false,
                lastResetDate: todayStr
              }
            };
            await setDoc(userDocRef, profile);
            setDailyStatus({
              lessonCompleted: false,
              bibleCompleted: false,
              bookChapterCompleted: false,
              reflectionCompleted: false,
              missionCompleted: false,
            });
          }
          setUser(profile);
          setIsOnboarded(true);

          // Populate Notification Config if present in user properties
          if (profile.remindLesson !== undefined) {
            setNotificationConfig({
              remindLesson: !!profile.remindLesson,
              remindStreak: !!profile.remindStreak,
              remindProgression: !!profile.remindProgression,
              lessonTime: profile.lessonTime || '07:30',
            });
          }

          // 2. Fetch completed lessons
          try {
            const lessonsSnap = await getDocs(collection(db, 'users', uid, 'lessons'));
            const completedLessonsMap: Record<string, any> = {};
            lessonsSnap.forEach((docSnap) => {
              completedLessonsMap[docSnap.id] = docSnap.data();
            });
            setLessons((prev) => 
              prev.map((l) => completedLessonsMap[l.id] ? { ...l, ...completedLessonsMap[l.id] } : l)
            );
          } catch (e) {
            console.error("Erro ao carregar lições", e);
            handleFirestoreError(e, OperationType.GET, `users/${uid}/lessons`);
          }

          // 3. Fetch completed bible readings
          try {
            const bibleSnap = await getDocs(collection(db, 'users', uid, 'bible'));
            const completedBibleMap: Record<string, any> = {};
            bibleSnap.forEach((docSnap) => {
              completedBibleMap[docSnap.id] = docSnap.data();
            });
            setBibleReadings((prev) => 
              prev.map((r) => completedBibleMap[r.id] ? { ...r, ...completedBibleMap[r.id] } : r)
            );
          } catch (e) {
            console.error("Erro ao carregar passagens da bíblia", e);
            handleFirestoreError(e, OperationType.GET, `users/${uid}/bible`);
          }

          // 3b. Fetch completed book chapters
          try {
            const chaptersSnap = await getDocs(collection(db, 'users', uid, 'bookChapters'));
            const completedChaptersMap: Record<string, any> = {};
            chaptersSnap.forEach((docSnap) => {
              completedChaptersMap[docSnap.id] = docSnap.data();
            });
            setBookChapters((prev) => 
              prev.map((c) => completedChaptersMap[c.id] ? { ...c, ...completedChaptersMap[c.id] } : c)
            );
          } catch (e) {
            console.error("Erro ao carregar capítulos do livro", e);
            handleFirestoreError(e, OperationType.GET, `users/${uid}/bookChapters`);
          }

          // 4. Fetch private reflections list
          try {
            const reflectionsSnap = await getDocs(collection(db, 'users', uid, 'reflections'));
            const list: SpiritualReflection[] = [];
            reflectionsSnap.forEach((docSnap) => {
              list.push(docSnap.data() as SpiritualReflection);
            });
            setReflections(list);
          } catch (e) {
            console.error("Erro ao carregar diário espiritual", e);
          }

          // 5. Fetch acquired medals list
          try {
            const medalsSnap = await getDocs(collection(db, 'users', uid, 'medals'));
            const medalsMap: Record<string, any> = {};
            medalsSnap.forEach((docSnap) => {
              medalsMap[docSnap.id] = docSnap.data();
            });
            setMedals((prev) => 
              prev.map((m) => medalsMap[m.id] ? { ...m, ...medalsMap[m.id] } : m)
            );
          } catch (e) {
            console.error("Erro ao carregar medalhas", e);
          }

          // 6. Fetch logs
          try {
            const logsSnap = await getDocs(collection(db, 'users', uid, 'logs'));
            const logsList: ActivityHistory[] = [];
            logsSnap.forEach((docSnap) => {
              logsList.push(docSnap.data() as ActivityHistory);
            });
            logsList.sort((a, b) => b.date.localeCompare(a.date));
            setActivityLogs(logsList);
          } catch (e) {
            console.error("Erro ao carregar logs", e);
          }

          // 7. Load global challenges
          try {
            const challengesSnap = await getDocs(collection(db, 'challenges'));
            if (challengesSnap.empty) {
              if (profile.role === 'admin') {
                for (const mission of INITIAL_MISSIONS) {
                  try {
                    await setDoc(doc(db, 'challenges', mission.id), mission);
                  } catch (err) {
                    console.error("Erro ao salvar desafio inicial no Firestore:", err);
                  }
                }
              }
              setMissions(INITIAL_MISSIONS);
            } else {
              const list: MissionChallenge[] = [];
              challengesSnap.forEach((docSnap) => {
                list.push(docSnap.data() as MissionChallenge);
              });
              setMissions(list);
            }
          } catch (e) {
            console.error("Erro ao carregar missões globais", e);
            setMissions(INITIAL_MISSIONS);
          }

          // 8. If logged in user is admin, fetch other user directories
          if (profile.role === 'admin') {
            try {
              const usersSnap = await getDocs(collection(db, 'users'));
              const roster: UserProfileData[] = [];
              usersSnap.forEach((docSnap) => {
                if (docSnap.id !== uid) {
                  roster.push(docSnap.data() as UserProfileData);
                }
              });
              setMockUserRoster(roster);
            } catch (e) {
              console.error("Erro ao carregar roster de usuários", e);
            }
          }

          setFirebaseReady(true);
        } else {
          setUser(null);
          setLessons(INITIAL_LESSONS);
          setBibleReadings(INITIAL_BIBLE_READINGS);
          setBookChapters(INITIAL_BOOK_CHAPTERS);
          setReflections([]);
          setMedals(INITIAL_MEDALS);
          setActivityLogs([]);
          setMockUserRoster([]);
          setFirebaseReady(true);
        }
      } catch (err) {
        console.error("Erro na inicialização do Firebase Auth", err);
        setFirebaseReady(true);
      }
    });

    return () => unsubscribe();
  }, [bibleReadings.length]);

  // Real-time synchronization of the users roster for Admin users
  useEffect(() => {
    if (!user) {
      setMockUserRoster([]);
      return;
    }
    
    // Check if current user is an admin
    const isAdmin = user.email === 'admin@discipulado.com' || user.id === 'admin-user-id' || user.role === 'admin' || user.email?.toLowerCase() === 'rickyjorgecastro@gmail.com';
    
    if (!isAdmin) {
      setMockUserRoster([]);
      return;
    }

    try {
      // Subscribe to real-time changes in the 'users' collection
      const unsubscribeRoster = onSnapshot(collection(db, 'users'), (snapshot) => {
        const roster: UserProfileData[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id !== user.id) {
            roster.push(docSnap.data() as UserProfileData);
          }
        });
        setMockUserRoster(roster);
      }, (error) => {
        console.error("Erro ao escutar em tempo real a coleção de usuários:", error);
      });

      return () => {
        unsubscribeRoster();
      };
    } catch (e) {
      console.error("Erro ao configurar ouvinte de roster:", e);
    }
  }, [user?.id, user?.role, user?.email]);

  // Hook safeguard helper
  const saveToStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Trigger temporary floating Toast
  const triggerToast = (text: string) => {
    setActiveToast(text);
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  };

  // Helper dynamic Level Up Calculator
  const checkLevelUp = (totalXp: number, oldLevel: number) => {
    let nextLvl = 1;
    let title = 'Novo na Jornada';
    let nextThreshold = 500;

    for (const step of LEVEL_STEPS) {
      if (totalXp >= step.minXp) {
        nextLvl = step.level;
        title = step.title;
        const nextStep = LEVEL_STEPS.find(s => s.level === step.level + 1);
        nextThreshold = nextStep ? nextStep.minXp : 12000;
      }
    }

    return { level: nextLvl, title, nextThreshold };
  };

  // CORE REWARD FUNCTION: Updates User details, logs activity, checks Level Up and evaluates Medals
  const handleAwardXp = async (
    xpAmount: number, 
    activityType: ActivityHistory['type'], 
    title: string, 
    observation?: string,
    updatedDailyStatus?: UserProfileData['dailyStatus']
  ) => {
    if (!user) return;

    // Calculate new status locally first
    const updatedTotalPoints = user.totalPoints + xpAmount;
    const updatedXp = user.xp + xpAmount;
    const { level: computedLevel, title: levelTitle, nextThreshold } = checkLevelUp(updatedTotalPoints, user.level);

    if (computedLevel > user.level) {
      setCelebrateLevelUp({
        oldLvl: user.level,
        newLvl: computedLevel,
        title: levelTitle
      });

      appendActivityLog('nível_up', `Parabéns! Subiu de Nível para ${computedLevel} - ${levelTitle}!`, 50);
      triggerToast(`🎉 Subiu de Nível! Você agora é um ${levelTitle}!`);
    }

    let updatedBibleReadingsCount = user.bibleReadingsCount;
    let updatedCompletedMissionsCount = user.completedMissionsCount;
    let updatedReflectionsCount = user.reflectionsCount;
    let updatedLessonsStudiedCount = user.lessonsStudiedCount;
    let updatedBookChaptersCount = user.bookChaptersCount || 0;

    if (activityType === 'bíblia') updatedBibleReadingsCount += 1;
    if (activityType === 'missão') updatedCompletedMissionsCount += 1;
    if (activityType === 'reflexão') updatedReflectionsCount += 1;
    if (activityType === 'lição') updatedLessonsStudiedCount += 1;
    if (activityType === 'profecia') updatedBookChaptersCount += 1;

    const newUserState: UserProfileData = {
      ...user,
      totalPoints: updatedTotalPoints,
      xp: updatedXp,
      level: computedLevel,
      xpNeededForNextLevel: nextThreshold,
      bibleReadingsCount: updatedBibleReadingsCount,
      completedMissionsCount: updatedCompletedMissionsCount,
      reflectionsCount: updatedReflectionsCount,
      lessonsStudiedCount: updatedLessonsStudiedCount,
      bookChaptersCount: updatedBookChaptersCount,
      dailyStatus: updatedDailyStatus || user.dailyStatus || {
        lessonCompleted: dailyStatus.lessonCompleted,
        bibleCompleted: dailyStatus.bibleCompleted,
        bookChapterCompleted: dailyStatus.bookChapterCompleted || false,
        reflectionCompleted: dailyStatus.reflectionCompleted,
        missionCompleted: dailyStatus.missionCompleted,
        lastResetDate: new Date().toISOString().split('T')[0]
      }
    };

    // Auto-examine and unlock medals
    checkMedalUnlocks(newUserState);

    setUser(newUserState);

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'users', user.id), newUserState);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }

    // Append to chronological history
    appendActivityLog(activityType, title, xpAmount, observation);
  };

  // CORE MULTIPLE REWARD FUNCTION: Updates User details, logs activities, checks Level Up and evaluates Medals in a single transaction/batch
  const handleAwardMultipleXp = async (
    rewards: {
      xpAmount: number;
      activityType: ActivityHistory['type'];
      title: string;
      observation?: string;
    }[],
    updatedDailyStatus?: UserProfileData['dailyStatus']
  ) => {
    if (!user || rewards.length === 0) return;

    let currentLvl = user.level;
    let accumulatedXp = user.xp;
    let accumulatedTotalPoints = user.totalPoints;
    let currentBibleReadingsCount = user.bibleReadingsCount;
    let currentCompletedMissionsCount = user.completedMissionsCount;
    let currentReflectionsCount = user.reflectionsCount;
    let currentLessonsStudiedCount = user.lessonsStudiedCount;
    let currentBookChaptersCount = user.bookChaptersCount || 0;
    let nextThreshold = user.xpNeededForNextLevel;

    const logsToAppend: {
      type: ActivityHistory['type'];
      title: string;
      xp: number;
      obs?: string;
    }[] = [];

    let leveledUp = false;
    let latestLevelTitle = '';

    for (const reward of rewards) {
      accumulatedTotalPoints += reward.xpAmount;
      accumulatedXp += reward.xpAmount;
      
      const check = checkLevelUp(accumulatedTotalPoints, currentLvl);
      if (check.level > currentLvl) {
        leveledUp = true;
        currentLvl = check.level;
        latestLevelTitle = check.title;
        
        logsToAppend.push({
          type: 'nível_up',
          title: `Parabéns! Subiu de Nível para ${check.level} - ${check.title}!`,
          xp: 50
        });
      }
      nextThreshold = check.nextThreshold;

      if (reward.activityType === 'bíblia') currentBibleReadingsCount += 1;
      if (reward.activityType === 'missão') currentCompletedMissionsCount += 1;
      if (reward.activityType === 'reflexão') currentReflectionsCount += 1;
      if (reward.activityType === 'lição') currentLessonsStudiedCount += 1;
      if (reward.activityType === 'profecia') currentBookChaptersCount += 1;

      logsToAppend.push({
        type: reward.activityType,
        title: reward.title,
        xp: reward.xpAmount,
        obs: reward.observation
      });
    }

    if (leveledUp) {
      setCelebrateLevelUp({
        oldLvl: user.level,
        newLvl: currentLvl,
        title: latestLevelTitle
      });
      triggerToast(`🎉 Subiu de Nível! Você agora é um ${latestLevelTitle}!`);
    }

    const newUserState: UserProfileData = {
      ...user,
      totalPoints: accumulatedTotalPoints,
      xp: accumulatedXp,
      level: currentLvl,
      xpNeededForNextLevel: nextThreshold,
      bibleReadingsCount: currentBibleReadingsCount,
      completedMissionsCount: currentCompletedMissionsCount,
      reflectionsCount: currentReflectionsCount,
      lessonsStudiedCount: currentLessonsStudiedCount,
      bookChaptersCount: currentBookChaptersCount,
      dailyStatus: updatedDailyStatus || user.dailyStatus || {
        lessonCompleted: dailyStatus.lessonCompleted,
        bibleCompleted: dailyStatus.bibleCompleted,
        bookChapterCompleted: dailyStatus.bookChapterCompleted || false,
        reflectionCompleted: dailyStatus.reflectionCompleted,
        missionCompleted: dailyStatus.missionCompleted,
        lastResetDate: new Date().toISOString().split('T')[0]
      }
    };

    // Auto-examine and unlock medals
    checkMedalUnlocks(newUserState);

    setUser(newUserState);

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'users', user.id), newUserState);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }

    // Append to chronological history in state & Firebase
    const logsCreated: ActivityHistory[] = [];
    const timestamp = Date.now();
    for (let i = 0; i < logsToAppend.length; i++) {
      const log = logsToAppend[i];
      const newLog: ActivityHistory = {
        id: `log-${timestamp}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: log.type,
        title: log.title,
        xpReceived: log.xp,
        observation: log.obs
      };
      
      logsCreated.push(newLog);
      
      try {
        await setDoc(doc(db, 'users', user.id, 'logs', newLog.id), newLog);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/logs/${newLog.id}`);
      }
    }

    if (logsCreated.length > 0) {
      setActivityLogs((prev) => [...[...logsCreated].reverse(), ...prev]);
    }
  };

  const appendActivityLog = async (
    type: ActivityHistory['type'], 
    title: string, 
    xp: number, 
    obs?: string
  ) => {
    if (!user) return;
    const newLog: ActivityHistory = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      title,
      xpReceived: xp,
      observation: obs
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'users', user.id, 'logs', newLog.id), newLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/logs/${newLog.id}`);
    }
  };

  // Scans requirements to unlock medals
  const checkMedalUnlocks = (currentUserState: UserProfileData) => {
    if (!user) return;
    setMedals((prevMedals) => {
      const updated = prevMedals.map((medal) => {
        if (medal.unlockedAt) return medal;

        let satisfies = false;
        if (medal.conditionType === 'streak' && currentUserState.streakDays >= medal.conditionValue) satisfies = true;
        if (medal.conditionType === 'lessons' && currentUserState.lessonsStudiedCount >= medal.conditionValue) satisfies = true;
        if (medal.conditionType === 'reflections' && currentUserState.reflectionsCount >= medal.conditionValue) satisfies = true;
        if (medal.conditionType === 'missions' && currentUserState.completedMissionsCount >= medal.conditionValue) satisfies = true;
        if (medal.conditionType === 'readings') {
          if (medal.conditionValue === 100) {
            const currentPercent = Math.round((currentUserState.bibleReadingsCount / bibleReadings.length) * 100);
            if (currentPercent >= 100) satisfies = true;
          } else if (currentUserState.bibleReadingsCount >= medal.conditionValue) {
            satisfies = true;
          }
        }

        if (satisfies) {
          const unlockedMedal = {
            ...medal,
            unlockedAt: new Date().toLocaleDateString('pt-BR')
          };

          // Save unlocked medal status
          setDoc(doc(db, 'users', user.id, 'medals', medal.id), unlockedMedal).catch(e => {
            console.error("Erro salvando medalha ganha", e);
          });

          triggerToast(`🏆 Nova conquista desbloqueada: ${medal.name}!`);
          return unlockedMedal;
        }
        return medal;
      });

      return updated;
    });
  };

  // 3. ACTIONS HANDLERS FROM DOCK OR SUB-PAGES
  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    localStorage.setItem('discipulado_onboarded', 'true');
  };

  const handleAuthSuccess = async (loggedUser: UserProfileData) => {
    let resolvedUser = { ...loggedUser };
    if (resolvedUser.email && resolvedUser.email.toLowerCase() === 'rickyjorgecastro@gmail.com' && resolvedUser.role !== 'admin') {
      resolvedUser.role = 'admin';
      try {
        await setDoc(doc(db, 'users', resolvedUser.id), { role: 'admin' }, { merge: true });
      } catch (e) {
        console.error("Erro ao definir papel de admin no firebase:", e);
      }
    }
    setUser(resolvedUser);
    setIsOnboarded(true);

    // Initial log sync
    try {
      const logsSnap = await getDocs(collection(db, 'users', resolvedUser.id, 'logs'));
      if (logsSnap.empty) {
        const joinLog: ActivityHistory = {
          id: `log-joined`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'streak_bônus',
          title: 'Ingressou na Aliança Espiritual',
          xpReceived: resolvedUser.xp || 15,
          observation: 'Inicio da caminhada de discipulado diário.'
        };
        await setDoc(doc(db, 'users', resolvedUser.id, 'logs', 'log-joined'), joinLog);
        setActivityLogs([joinLog]);
      }
    } catch (e) {
      console.error(e);
    }

    if (resolvedUser.role === 'admin') {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const roster: UserProfileData[] = [];
        usersSnap.forEach((docSnap) => {
          if (docSnap.id !== loggedUser.id) {
            roster.push(docSnap.data() as UserProfileData);
          }
        });
        setMockUserRoster(roster);
      } catch (e) {
        console.error(e);
      }
    }

    triggerToast(`Olá, ${loggedUser.fullName}! Bons estudos espirituais hoje.`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab('dashboard');
      triggerToast('Desconectado com sucesso.');
    } catch (e) {
      console.error("Erro ao desconectar", e);
    }
  };

  // Handle communion actions
  const handleCompleteLesson = async (lessonId: string, answer: string) => {
    if (!user) return;

    // Guard: Prevent completing future lesson days
    const lessonIndex = parseInt(lessonId.replace('lesson-', ''), 10) - 1;
    const todayDay = new Date().getDay();
    const todayIndex = todayDay === 6 ? 0 : todayDay + 1;
    if (lessonIndex > todayIndex) {
      triggerToast('🚫 Não é permitido responder lições de dias futuros!');
      return;
    }

    setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, completed: true, answer } : l));

    const updatedStatus = {
      ...dailyStatus,
      lessonCompleted: true,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setDailyStatus(updatedStatus);

    try {
      await setDoc(doc(db, 'users', user.id, 'lessons', lessonId), {
        id: lessonId,
        completed: true,
        answer,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/lessons/${lessonId}`);
    }

    await handleAwardMultipleXp([
      { xpAmount: 10, activityType: 'lição', title: 'Estudo de Lição Sabatina', observation: 'Marcar estudo como lido.' },
      { xpAmount: 15, activityType: 'reflexão', title: 'Anotação de Aprendizado', observation: `Resposta: "${answer.slice(0, 50)}..."` }
    ], updatedStatus);
  };

  const handleCompleteBibleReading = async (readingId: string) => {
    if (!user) return;

    // Guard: Prevent completing future Bible readings
    const dayNum = parseInt(readingId.replace('bible-', ''), 10);
    if (dayNum > user.streakDays) {
      triggerToast('🚫 Não é permitido marcar leituras bíblicas de dias futuros!');
      return;
    }

    setBibleReadings((prev) => prev.map((r) => r.id === readingId ? { ...r, completed: true } : r));

    const updatedStatus = {
      ...dailyStatus,
      bibleCompleted: true,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setDailyStatus(updatedStatus);

    try {
      await setDoc(doc(db, 'users', user.id, 'bible', readingId), {
        id: readingId,
        completed: true,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/bible/${readingId}`);
    }

    const passage = bibleReadings.find(r => r.id === readingId)?.passage || 'Passagem da Bíblia';
    await handleAwardXp(10, 'bíblia', `Leitura Bíblica: ${passage}`, undefined, updatedStatus);
  };

  const handleCompleteBookChapter = async (chapterId: string, answer: string) => {
    if (!user) return;

    // Guard: Prevent completing future book chapters
    const chapterNum = parseInt(chapterId.replace('chapter-', ''), 10);
    if (chapterNum > user.streakDays) {
      triggerToast('🚫 Não é permitido marcar capítulos de dias futuros!');
      return;
    }

    setBookChapters((prev) => prev.map((c) => c.id === chapterId ? { ...c, completed: true, answer } : c));

    const updatedStatus = {
      ...dailyStatus,
      bookChapterCompleted: true,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setDailyStatus(updatedStatus);

    try {
      await setDoc(doc(db, 'users', user.id, 'bookChapters', chapterId), {
        id: chapterId,
        completed: true,
        answer,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/bookChapters/${chapterId}`);
    }

    const chTitle = bookChapters.find(c => c.id === chapterId)?.title || 'Capítulo';
    await handleAwardMultipleXp([
      { xpAmount: 30, activityType: 'profecia', title: `Leitura: Espírito de Profecia - ${chTitle}`, observation: answer ? `O que aprendi: "${answer.slice(0, 100)}..."` : undefined }
    ], updatedStatus);
  };

  const handleSaveReflection = async (content: string, type: 'oração' | 'aprendizado' | 'gratidão' | 'reflexão') => {
    if (!user) return;
    const newRef: SpiritualReflection = {
      id: `ref-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      content,
      type
    };

    setReflections((prev) => [newRef, ...prev]);
    const updatedStatus = {
      ...dailyStatus,
      reflectionCompleted: true,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setDailyStatus(updatedStatus);

    try {
      await setDoc(doc(db, 'users', user.id, 'reflections', newRef.id), newRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/reflections/${newRef.id}`);
    }

    await handleAwardXp(15, 'reflexão', `Reflexão do Diário: ${type.toUpperCase()}`, content, updatedStatus);
  };

  const handleDeleteReflection = async (id: string) => {
    if (!user) return;
    setReflections((prev) => prev.filter(r => r.id !== id));
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'reflections', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.id}/reflections/${id}`);
    }
    triggerToast('Reflexão removida do diário.');
  };

  // Handle mission completion
  const handleCompleteMission = async (missionId: string, notes: string) => {
    if (!user) return;
    const targetMission = missions.find(m => m.id === missionId);
    if (!targetMission) return;

    setMissions((prev) => prev.map((m) => m.id === missionId ? { ...m, completedCount: m.completedCount + 1 } : m));
    const updatedStatus = {
      ...dailyStatus,
      missionCompleted: true,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setDailyStatus(updatedStatus);

    const logId = `mission-log-${Date.now()}`;
    const missionLog = {
      id: logId,
      missionId,
      missionTitle: targetMission.title,
      completedAt: new Date().toISOString(),
      notes,
      xpEarned: targetMission.xpReward
    };

    try {
      await setDoc(doc(db, 'users', user.id, 'completedMissions', logId), missionLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/completedMissions/${logId}`);
    }

    await handleAwardXp(
      targetMission.xpReward, 
      'missão', 
      `Ação Missionária: ${targetMission.title}`, 
      notes || 'Concluído sem observações',
      updatedStatus
    );
  };

  // Administration interactions
  const handleCreateMissionAdmin = async (newMission: Omit<MissionChallenge, 'completedCount'>) => {
    if (!user) return;
    const payload: MissionChallenge = {
      ...newMission,
      completedCount: 0
    };
    setMissions((prev) => [...prev, payload]);
    
    try {
      await setDoc(doc(db, 'challenges', payload.id), payload);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `challenges/${payload.id}`);
    }
    triggerToast(`Desafio "${payload.title}" criado com sucesso.`);
  };

  const handleUpdateMissionAdmin = async (updated: MissionChallenge) => {
    if (!user) return;
    setMissions((prev) => prev.map((m) => m.id === updated.id ? updated : m));

    try {
      await setDoc(doc(db, 'challenges', updated.id), updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `challenges/${updated.id}`);
    }
    triggerToast(`Desafio editado.`);
  };

  const handleModifyUserXpAdmin = async (userId: string, xpChange: number) => {
    if (!user) return;

    if (user.id === userId) {
      await handleAwardXp(xpChange, 'streak_bônus', 'Ajuste manual pela administração', 'Alterado pelo God mode');
      return;
    }

    const targetUser = mockUserRoster.find((u) => u.id === userId);
    if (!targetUser) return;

    const newTotalPoints = Math.max(targetUser.totalPoints + xpChange, 0);
    const { level: computedLevel, title: levelTitle, nextThreshold } = checkLevelUp(newTotalPoints, targetUser.level);
    
    const updatedUser = {
      ...targetUser,
      totalPoints: newTotalPoints,
      xp: newTotalPoints,
      level: computedLevel,
      xpNeededForNextLevel: nextThreshold
    };

    setMockUserRoster((prev) => prev.map((u) => u.id === userId ? updatedUser : u));

    try {
      await setDoc(doc(db, 'users', userId), updatedUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
    }
    triggerToast(`XP de usuário alterado para fins de validação.`);
  };

  const handleToggleUserAdminRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!user) return;

    if (user.id === userId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      try {
        await setDoc(doc(db, 'users', userId), updatedUser);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
      }
    } else {
      const targetUser = mockUserRoster.find((u) => u.id === userId);
      if (targetUser) {
        const updatedUser = { ...targetUser, role: newRole };
        setMockUserRoster((prev) => prev.map((u) => u.id === userId ? updatedUser : u));
        try {
          await setDoc(doc(db, 'users', userId), updatedUser);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
        }
      }
    }
    
    const searchList = [user, ...mockUserRoster];
    const userName = searchList.find(u => u.id === userId)?.fullName || 'Membro';
    const roleTxt = newRole === 'admin' ? 'definido como Administrador' : 'removido do cargo de Administrador';
    triggerToast(`${userName} foi ${roleTxt}.`);
  };

  const handleSaveNotifications = async (updated: NotificationSettingsData) => {
    if (!user) return;
    setNotificationConfig(updated);
    
    const updatedUser = {
      ...user,
      remindLesson: updated.remindLesson,
      remindStreak: updated.remindStreak,
      remindProgression: updated.remindProgression,
      lessonTime: updated.lessonTime
    };
    setUser(updatedUser);

    try {
      await setDoc(doc(db, 'users', user.id), updatedUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }
  };

  // SIMULATOR TRIGGER: "Avançar Próximo Dia"
  const handleSimulateNewDay = async () => {
    if (!user) return;
    const didAnything = dailyStatus.lessonCompleted || dailyStatus.bibleCompleted || dailyStatus.bookChapterCompleted || dailyStatus.reflectionCompleted || dailyStatus.missionCompleted;
    
    let nextStreak = user.streakDays;
    if (didAnything) {
      nextStreak += 1;
      triggerToast(`🔥 Ótimo! Sequência de dias mantida! Você agora está em ${nextStreak} dias consecutivos.`);
      setTimeout(() => {
        handleAwardXp(5, 'streak_bônus', `Bônus Diário de Sequência (${nextStreak} dias)`, `Streak ativado!`);
      }, 1000);
    } else {
      nextStreak = 1;
      triggerToast('⚠️ Nenhuma atividade foi feita hoje. Sua sequência foi resetada para 1 dia.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const clearedStatus = {
      lessonCompleted: false,
      bibleCompleted: false,
      bookChapterCompleted: false,
      reflectionCompleted: false,
      missionCompleted: false,
      lastResetDate: todayStr
    };

    const updatedUser: UserProfileData = {
      ...user,
      streakDays: nextStreak,
      lastAccessDate: todayStr,
      dailyStatus: clearedStatus
    };

    setUser(updatedUser);
    try {
      await setDoc(doc(db, 'users', user.id), updatedUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }

    // Reset daily status
    setDailyStatus({
      lessonCompleted: false,
      bibleCompleted: false,
      bookChapterCompleted: false,
      reflectionCompleted: false,
      missionCompleted: false,
    });
  };

  // Helper calculation for overall Bible progress
  const bibleCompletedCount = bibleReadings.filter(r => r.completed).length;
  const biblePercent = bibleReadings.length > 0 
    ? Math.round((bibleCompletedCount / bibleReadings.length) * 100) 
    : 0;

  // Render core views
  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            dailyStatus={dailyStatus}
            onQuickAction={(action) => {
              if (action === 'licao') {
                setActiveCommunionSubTab('lesson');
                setActiveTab('communion');
              }
              if (action === 'bible') {
                setActiveCommunionSubTab('bible');
                setActiveTab('communion');
              }
              if (action === 'bookChapter') {
                setActiveCommunionSubTab('book');
                setActiveTab('communion');
              }
              if (action === 'reflection') {
                setActiveCommunionSubTab('reflection');
                setActiveTab('communion');
              }
              if (action === 'mission') setActiveTab('mission');
              if (action === 'path') setActiveTab('path');
              if (action === 'medals') setActiveTab('medals');
              if (action === 'admin') setActiveTab('admin');
              if (action === 'assessment') setActiveTab('assessment');
            }}
            isAdminUser={isAdminUser}
          />
        );
      case 'communion':
        return (
          <TabCommunion
            lessons={lessons}
            bibleReadings={bibleReadings}
            reflections={reflections}
            bookChapters={bookChapters}
            bibleProgressPercent={biblePercent}
            initialSubTab={activeCommunionSubTab}
            streakDays={user ? user.streakDays : 1}
            onCompleteLesson={handleCompleteLesson}
            onCompleteBibleReading={handleCompleteBibleReading}
            onCompleteBookChapter={handleCompleteBookChapter}
            onSaveReflection={handleSaveReflection}
            onDeleteReflection={handleDeleteReflection}
          />
        );
      case 'mission':
        return (
          <TabMission
            missions={missions}
            userLevel={user.level}
            onCompleteMission={handleCompleteMission}
          />
        );
      case 'path':
        return <GrowthPath user={user} />;
      case 'relationship':
        return <TabRelationship user={user} />;
      case 'medals':
        return (
          <UserProfile
            user={user}
            medals={medals}
            bibleProgressPercent={biblePercent}
            totalActivitiesCount={activityLogs.length}
            onUpdateUserProfile={async (newUser) => {
              setUser(newUser);
              saveToStorage('discipulado_active_user', newUser);
              try {
                await setDoc(doc(db, 'users', newUser.id), newUser);
                triggerToast('Perfil e Nome atualizados no canal oficial!');
              } catch (e) {
                console.error("Erro ao salvar perfil no Firestore", e);
                handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
              }
            }}
          />
        );
      case 'history':
        return <HistoryLogs logs={activityLogs} />;
      case 'notifications':
        return (
          <NotificationSettings
            initialConfig={notificationConfig}
            onSaveConfig={handleSaveNotifications}
            triggerMockNotification={(txt) => triggerToast(txt)}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            challenges={missions}
            userList={[user, ...mockUserRoster]}
            totalActivitiesCount={activityLogs.length}
            onCreateMission={handleCreateMissionAdmin}
            onUpdateMission={handleUpdateMissionAdmin}
            onModifyUserXp={handleModifyUserXpAdmin}
            onToggleUserAdminRole={handleToggleUserAdminRole}
          />
        );
      case 'discipulador':
        return (
          <DiscipuladorPanel
            currentUserId={user.id}
            currentUserFullName={user.fullName}
          />
        );
      case 'assessment':
        return (
          <SpiritualAssessmentView
            userId={user.id}
            userEmail={user.email}
            userFullName={user.fullName}
            onAwardXp={handleAwardXp}
            onCompleted={() => {
              getDoc(doc(db, 'users', user.id)).then((docSnap) => {
                if (docSnap.exists()) {
                  setUser(docSnap.data() as UserProfileData);
                }
              });
            }}
          />
        );
      default:
        return <Dashboard user={user} dailyStatus={dailyStatus} onQuickAction={() => {}} />;
    }
  };

  // If firebase auth has not processed yet, show background spinner
  if (!firebaseReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2C2620] flex flex-col justify-center items-center font-sans">
        <Sparkles className="w-10 h-10 text-[#b48a30] animate-spin mb-4" />
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Acessando canal oficial...</p>
      </div>
    );
  }

  // If not onboarded, display onboarding steps
  if (!isOnboarded) {
    return <WelcomeScreen onComplete={handleOnboardingComplete} />;
  }

  // If onboarded but not authenticated
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const isAdminUser = user.email === 'admin@discipulado.com' || user.id === 'admin-user-id' || user.role === 'admin' || user.email?.toLowerCase() === 'rickyjorgecastro@gmail.com';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans flex flex-col justify-between relative transition-colors duration-400">
      
      {/* Dynamic Floating Toast Alerts */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-white border-2 border-[#004b87] rounded-2xl p-4 z-50 shadow-2xl flex items-start gap-3"
          >
            <div className="bg-[#004b87] p-1.5 rounded-lg text-white mt-0.5 shrink-0">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#004b87] block">Aviso da Igreja</span>
              <p className="text-xs text-slate-700 mt-1 leading-normal break-words">
                {activeToast}
              </p>
            </div>
            <button 
              onClick={() => setActiveToast(null)} 
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Celebration Celebration Modal */}
      <AnimatePresence>
        {celebrateLevelUp && (
          <div className="fixed inset-0 bg-[#0f2646]/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-[#b48a30] rounded-3xl p-6 text-center max-w-sm w-full space-y-5 shadow-2xl"
            >
              <span className="text-[10px] font-black tracking-widest text-[#b48a30] uppercase block">Crescimento Espiritual</span>
              
              <div className="relative mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center border border-[#b48a30]/20">
                <Sparkles className="w-12 h-12 text-[#b48a30] animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-[#0f2646]">SUBIU DE NÍVEL!</h3>
                <p className="text-xs text-slate-600">
                  Sua constância e devoção renderam amadurecimento visível. Você agora é considerado:
                </p>
                <span className="inline-block text-[#b48a30] font-black tracking-wide text-lg bg-[#FAF9F5] px-4 py-1.5 rounded-full border border-[#b48a30]/30">
                  Nível {celebrateLevelUp.newLvl} - {celebrateLevelUp.title}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 italic pb-2">
                "Antes crescei na graça e conhecimento de nosso Senhor..."
              </p>

              <button
                id="btn-level-congratulations-close"
                onClick={() => setCelebrateLevelUp(null)}
                className="w-full bg-[#004b87] hover:bg-[#003763] text-white font-bold py-3 rounded-xl transition-all font-sans text-xs cursor-pointer shadow-md"
              >
                Glorificar e Avançar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Wrapper Mimics Premium Smartphone Chassis Centered */}
      <div className="w-full max-w-lg mx-auto bg-[#F5F3EC] min-h-screen flex flex-col justify-between border-x border-[#cbd5e1] shadow-2xl relative">
        
        {/* Dynamic App Shell Header */}
        <header className="bg-[#0f2646] text-white border-b border-[#0a1a30] p-4 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center shrink-0">
              <img src={logoImg} alt="SDA Logo" referrerPolicy="no-referrer" className="h-16 w-auto max-w-[160px] object-contain" />
            </div>
            <div className="text-left leading-none">
              <span id="app-brand" className="font-extrabold text-sm tracking-wide text-white">Esplanada Viva</span>
              <span className="text-[8px] text-[#b48a30] block font-black tracking-widest uppercase mt-1">DISTRITO ESPLANADA</span>
            </div>
          </div>

          {/* Upper actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick Admin shortcut if logged/flag is true */}
            {isAdminUser && (
              <button
                id="header-btn-admin"
                onClick={() => setActiveTab(activeTab === 'admin' ? 'dashboard' : 'admin')}
                className={`p-2 rounded-xl transition-all border cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-[#0a1a30] text-slate-350 border-[#1a2d44] hover:text-rose-400'
                }`}
                title="Ir p/ Painel de Admin"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {user && (user.role === 'discipulador' || user.role === 'pastor') && (
              <button
                id="header-btn-discipulador"
                onClick={() => setActiveTab(activeTab === 'discipulador' ? 'dashboard' : 'discipulador')}
                className={`p-2 rounded-xl transition-all border cursor-pointer ${
                  activeTab === 'discipulador'
                    ? 'bg-emerald-500/15 text-emerald-350 border-emerald-500/30'
                    : 'bg-[#0a1a30] text-slate-350 border-[#1a2d44] hover:text-emerald-400'
                }`}
                title="Ir p/ Painel do Discipulador"
              >
                <Users className="w-4 h-4" />
              </button>
            )}

            {/* Log out */}
            <button
              id="header-btn-logout"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#0a1a30] text-slate-350 hover:text-white border border-[#1a2d44] transition-all font-sans cursor-pointer"
              title="Sair do Perfil"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Screen Content Wrapper Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 relative">
          
          {renderTabContent()}
        </main>

        {/* Global Bottom Navigation Tab Bar */}
        <nav className="bg-white border-t border-[#e5e0d5] py-2.5 px-1.5 flex items-center justify-around sticky bottom-0 z-40 rounded-t-2xl shadow-xl w-full max-w-full overflow-hidden">
          <button
            id="nav-btn-home"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Início</span>
          </button>

          <button
            id="nav-btn-communion"
            onClick={() => setActiveTab('communion')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'communion' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Comunhão</span>
          </button>

          <button
            id="nav-btn-mission"
            onClick={() => setActiveTab('mission')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'mission' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Missão</span>
          </button>

          <button
            id="nav-btn-path"
            onClick={() => setActiveTab('path')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'path' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Trilha</span>
          </button>

          <button
            id="nav-btn-relationship"
            onClick={() => setActiveTab('relationship')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'relationship' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Oração</span>
          </button>

          <button
            id="nav-btn-medals"
            onClick={() => setActiveTab('medals')}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'medals' ? 'text-[#004b87] font-extrabold scale-105' : 'text-slate-400 hover:text-[#004b87]'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[9px] font-extrabold font-mono">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
