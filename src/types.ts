export type Gender = 'masculino' | 'feminino';

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  gender: Gender;
  avatarUrl: string;
  level: number;
  xp: number;
  xpNeededForNextLevel: number;
  totalPoints: number;
  streakDays: number;
  lastAccessDate: string; // 'YYYY-MM-DD'
  createdAt: string;
  bibleReadingsCount: number; // For achievements
  completedMissionsCount: number; // For achievements
  reflectionsCount: number; // For achievements
  lessonsStudiedCount: number; // For achievements
  church?: string; // Church selected during login/registration
  role?: 'pastor' | 'discipulador' | 'discípulo' | 'admin' | 'user';
  discipuladorId?: string;
  discipuladorName?: string;
  lastAssessmentDate?: string;
  lastAssessmentScores?: {
    comunhao: number;
    relacionamento: number;
    fidelidade: number;
    missao: number;
  };
  dailyStatus?: {
    lessonCompleted: boolean;
    bibleCompleted: boolean;
    reflectionCompleted: boolean;
    missionCompleted: boolean;
    lastResetDate: string;
  };
  
  // Notification Sync properties
  remindLesson?: boolean;
  remindStreak?: boolean;
  remindProgression?: boolean;
  lessonTime?: string;
  
  // Customization Options
  skinColor?: string;
  hairColor?: string;
  clothingColor?: string;
  eyeStyle?: 'calm' | 'open' | 'happy';
  hairStyle?: 'short' | 'long' | 'curly' | 'bald' | 'braids';
  hasBeard?: boolean;
  hasGlasses?: boolean;
}

export interface SabbathLesson {
  id: string;
  date: string;
  title: string;
  verse: string;
  content: string;
  question: string;
  answer?: string;
  completed: boolean;
  completedAt?: string;
}

export interface BibleReading {
  id: string;
  day: number;
  passage: string;
  completed: boolean;
  completedAt?: string;
}

export interface SpiritualReflection {
  id: string;
  date: string;
  content: string;
  type: 'oração' | 'aprendizado' | 'gratidão' | 'reflexão';
}

export interface MissionChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  levelRequired: number;
  completedCount: number;
  isActive: boolean;
  difficulty: 'fácil' | 'médio' | 'avançado';
}

export interface CompletedMissionLog {
  id: string;
  missionId: string;
  missionTitle: string;
  completedAt: string;
  notes?: string;
  xpEarned: number;
}

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string; // Name of Lucide icon
  unlockedAt?: string; // Date of string when unlocked, or null
  conditionType: 'streak' | 'lessons' | 'readings' | 'reflections' | 'missions' | 'custom';
  conditionValue: number;
}

export interface ActivityHistory {
  id: string;
  date: string; // YYYY-MM-DD HH:MM
  type: 'lição' | 'bíblia' | 'reflexão' | 'missão' | 'streak_bônus' | 'nível_up';
  title: string;
  xpReceived: number;
  observation?: string;
}

export interface NotificationSettingsData {
  remindLesson: boolean;
  remindStreak: boolean;
  remindProgression: boolean;
  lessonTime: string; // HH:MM
}

export interface Milestone {
  id: string;
  months: number;
  title: string;
  description: string;
  rewardText: string;
  xpRequired: number;
  medalId: string;
}
