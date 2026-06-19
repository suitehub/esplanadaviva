import { SabbathLesson, BibleReading, MissionChallenge, Medal, Milestone } from './types';

// Levels according to specification
export const LEVEL_STEPS = [
  { level: 1, minXp: 0, title: 'Novo na Jornada', label: 'Iniciante' },
  { level: 2, minXp: 500, title: 'Aprendiz', label: 'Buscador' },
  { level: 3, minXp: 1500, title: 'Discípulo', label: 'Praticante' },
  { level: 4, minXp: 3000, title: 'Influenciador', label: 'Exemplo' },
  { level: 5, minXp: 5000, title: 'Missionário', label: 'Semeador' },
  { level: 6, minXp: 8000, title: 'Discipulador', label: 'Guia Espiritual' },
];

export const INITIAL_LESSONS: SabbathLesson[] = [
  {
    id: 'lesson-1',
    date: 'day-0', // will map dynamically
    title: 'Sábado: Introdução - O Fundamento da Comunhão',
    verse: 'Clame a mim e eu responderei e lhe direi coisas grandiosas e insondáveis que você não conhece. - Jeremias 33:3',
    content: 'A verdadeira força espiritual provém de uma comunhão sincera e constante com o Criador. Quando dedicamos os primeiros minutos do nosso dia para ouvi-Lo, preparamos nossa alma para as lutas invisíveis do dia a dia.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-2',
    date: 'day-1',
    title: 'Domingo: A Revelação e a Palavra de Vida',
    verse: 'Lâmpada para os meus pés é tua palavra e luz, para o meu caminho. - Salmos 119:105',
    content: 'Em tempos de incerteza, a Bíblia não é apenas um manual histórico, mas a revelação viva do amor divino orientando nossos passos práticos.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-3',
    date: 'day-2',
    title: 'Segunda-feira: O Poder da Oração Sincera',
    verse: 'A oração de um justo é poderosa e eficaz. - Tiago 5:16',
    content: 'Orar não é apresentar uma lista de compras a Deus, mas sintonizar nossa vontade frágil com o propósito eterno dAquele que tudo sabe.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-4',
    date: 'day-3',
    title: 'Terça-feira: Discipulado Vivido na Prática',
    verse: 'Nisto todos conhecerão que sois meus discípulos, se vos amardes uns aos outros. - João 13:35',
    content: 'O cristianismo de gabinete perde sua força nas ruas. O verdadeiro discípulo é reconhecido pelo transbordar de empatia e socorro prático.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-5',
    date: 'day-4',
    title: 'Quarta-feira: A Lei e a Graça em Harmonia',
    verse: 'Pois vocês são salvos pela graça, por meio da fé; e isto não vem de vocês, é dom de Deus. - Efésios 2:8',
    content: 'A lei nos aponta o caminho e revela o caráter do Criador, enquanto a maravilhosa graça de Jesus nos resgata, restaura e nos capacita a viver em obediência de amor.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-6',
    date: 'day-5',
    title: 'Quinta-feira: O Testemunho e a Missão Ativa',
    verse: 'Mas receberão poder quando o Espírito Santo descer sobre vocês; e serão minhas testemunhas... - Atos 1:8',
    content: 'Compartilhar o evangelho da graça não é uma obrigação fria, mas uma resposta natural de quem encontrou a fonte de água viva e deseja saciar a sede do próximo.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  },
  {
    id: 'lesson-7',
    date: 'day-6',
    title: 'Sexta-feira: A Esperança da Volta de Cristo',
    verse: 'Não se turbe o vosso coração; credes em Deus, crede também em mim. Na casa de meu Pai há muitas moradas. - João 14:1,2',
    content: 'O estudo diário nos une ao Senhor e nos prepara para o glorioso dia de Sua manifestação. O final de toda a nossa dedicação é passarmos a eternidade ao Seu lado.',
    question: 'O que você aprendeu na lição de hoje?',
    completed: false
  }
];

export const generateBiblePlan = (): BibleReading[] => {
  const plan: BibleReading[] = [];
  const books = [
    { name: 'Gênesis', chapters: 50 },
    { name: 'Êxodo', chapters: 40 },
    { name: 'Levítico', chapters: 27 },
    { name: 'Números', chapters: 36 },
    { name: 'Deuteronômio', chapters: 34 },
    { name: 'Josué', chapters: 24 },
    { name: 'Juízes', chapters: 21 },
    { name: 'Rute', chapters: 4 },
    { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 },
    { name: '1 Reis', chapters: 22 },
    { name: '2 Reis', chapters: 25 },
    { name: '1 Crônicas', chapters: 29 },
    { name: '2 Crônicas', chapters: 36 },
    { name: 'Esdras', chapters: 10 },
    { name: 'Neemias', chapters: 13 },
    { name: 'Ester', chapters: 10 },
    { name: 'Jó', chapters: 42 },
    { name: 'Salmos', chapters: 150 },
    { name: 'Provérbios', chapters: 31 },
    { name: 'Eclesiastes', chapters: 12 },
    { name: 'Cânticos', chapters: 8 },
    { name: 'Isaías', chapters: 66 },
    { name: 'Jeremias', chapters: 52 },
    { name: 'Lamentações', chapters: 5 },
    { name: 'Ezequiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 },
    { name: 'Oseias', chapters: 14 },
    { name: 'Joel', chapters: 3 },
    { name: 'Amós', chapters: 9 },
    { name: 'Obadias', chapters: 1 },
    { name: 'Jonas', chapters: 4 },
    { name: 'Miqueias', chapters: 7 },
    { name: 'Naum', chapters: 3 },
    { name: 'Habacuque', chapters: 3 },
    { name: 'Sofonias', chapters: 3 },
    { name: 'Ageu', chapters: 2 },
    { name: 'Zacarias', chapters: 14 },
    { name: 'Malaquias', chapters: 4 },
    { name: 'Mateus', chapters: 28 },
    { name: 'Marcos', chapters: 16 },
    { name: 'Lucas', chapters: 24 },
    { name: 'João', chapters: 21 },
    { name: 'Atos', chapters: 28 },
    { name: 'Romanos', chapters: 16 },
    { name: '1 Coríntios', chapters: 16 },
    { name: '2 Coríntios', chapters: 13 },
    { name: 'Gálatas', chapters: 6 },
    { name: 'Efésios', chapters: 6 },
    { name: 'Filipenses', chapters: 4 },
    { name: 'Colossenses', chapters: 4 },
    { name: '1 Tessalonicenses', chapters: 5 },
    { name: '2 Tessalonicenses', chapters: 3 },
    { name: '1 Timóteo', chapters: 6 },
    { name: '2 Timóteo', chapters: 4 },
    { name: 'Tito', chapters: 3 },
    { name: 'Filemom', chapters: 1 },
    { name: 'Hebreus', chapters: 13 },
    { name: 'Tiago', chapters: 5 },
    { name: '1 Pedro', chapters: 5 },
    { name: '2 Pedro', chapters: 3 },
    { name: '1 João', chapters: 5 },
    { name: '2 João', chapters: 1 },
    { name: '3 João', chapters: 1 },
    { name: 'Judas', chapters: 1 },
    { name: 'Apocalipse', chapters: 22 }
  ];

  let currentBookIndex = 0;
  let currentChapter = 1;

  for (let day = 1; day <= 365; day++) {
    const chaptersToRead = (day % 4 === 0) ? 4 : 3;
    const readings: string[] = [];
    let chaptersAccumulated = 0;

    while (chaptersAccumulated < chaptersToRead && currentBookIndex < books.length) {
      const book = books[currentBookIndex];
      const remainingInBook = book.chapters - currentChapter + 1;
      const needed = chaptersToRead - chaptersAccumulated;

      if (remainingInBook <= needed) {
        readings.push(`${book.name} ${currentChapter === book.chapters ? currentChapter : `${currentChapter}-${book.chapters}`}`);
        chaptersAccumulated += remainingInBook;
        currentBookIndex++;
        currentChapter = 1;
      } else {
        const endChapter = currentChapter + needed - 1;
        readings.push(`${book.name} ${currentChapter === endChapter ? currentChapter : `${currentChapter}-${endChapter}`}`);
        chaptersAccumulated += needed;
        currentChapter = endChapter + 1;
      }
    }

    // fallback in case we finished all books early
    if (readings.length === 0) {
      readings.push('Meditação e Oração Geral');
    }

    plan.push({
      id: `bible-${day}`,
      day: day,
      passage: readings.join('; '),
      completed: false
    });
  }

  return plan;
};

export const INITIAL_BIBLE_READINGS: BibleReading[] = generateBiblePlan();

export const INITIAL_MISSIONS: MissionChallenge[] = [
  {
    id: 'mission-1',
    title: 'Verso do Encorajamento',
    description: 'Compartilhe um versículo bíblico personalizado com alguém que está enfrentando dificuldades.',
    xpReward: 20,
    levelRequired: 1,
    completedCount: 0,
    isActive: true,
    difficulty: 'fácil'
  },
  {
    id: 'mission-2',
    title: 'Intercessão Secreta',
    description: 'Ore especialmente por 3 pessoas que você sabe que precisam de paciência, cura ou orientação.',
    xpReward: 20,
    levelRequired: 1,
    completedCount: 0,
    isActive: true,
    difficulty: 'fácil'
  },
  {
    id: 'mission-3',
    title: 'Visita Fraterna',
    description: 'Realize uma visita ou faça uma videochamada de apoio para uma pessoa enferma ou idosa resgatando o afeto.',
    xpReward: 50,
    levelRequired: 2,
    completedCount: 0,
    isActive: true,
    difficulty: 'avançado'
  },
  {
    id: 'mission-4',
    title: 'Mensagem de Gratidão',
    description: 'Escreva uma mensagem sincera de gratidão a alguém que influenciou positivamente sua caminhada de fé.',
    xpReward: 15,
    levelRequired: 1,
    completedCount: 0,
    isActive: true,
    difficulty: 'fácil'
  },
  {
    id: 'mission-5',
    title: 'Literatura da Esperança',
    description: 'Ofereça um livro, folheto físico ou artigo digital sobre esperança divina para um vizinho ou colega.',
    xpReward: 20,
    levelRequired: 3,
    completedCount: 0,
    isActive: true,
    difficulty: 'médio'
  },
  {
    id: 'mission-6',
    title: 'Anfitrião de Comunhão',
    description: 'Convide um colega ou amigo para assistir a um programa espiritual, sermão online ou ir à igreja com você.',
    xpReward: 50,
    levelRequired: 4,
    completedCount: 0,
    isActive: true,
    difficulty: 'avançado'
  }
];

export const INITIAL_MEDALS: Medal[] = [
  {
    id: 'medal-first-lesson',
    name: 'Primeiro Aprendizado',
    description: 'Concluiu e registrou a primeira lição da Escola Sabatina.',
    icon: 'BookOpen',
    conditionType: 'lessons',
    conditionValue: 1
  },
  {
    id: 'medal-first-reflection',
    name: 'Coração Contrito',
    description: 'Registrou sua primeira oração ou reflexão no diário pessoal.',
    icon: 'PenTool',
    conditionType: 'reflections',
    conditionValue: 1
  },
  {
    id: 'medal-streak-7',
    name: 'Habitante da Palavra',
    description: 'Manteve uma sequência ininterrupta de 7 dias com acesso espiritual.',
    icon: 'Flame',
    conditionType: 'streak',
    conditionValue: 7
  },
  {
    id: 'medal-streak-30',
    name: 'Sentinela Firme',
    description: 'Completou uma incrível sequência de 30 dias de comunhão espiritual diária.',
    icon: 'Crown',
    conditionType: 'streak',
    conditionValue: 30
  },
  {
    id: 'medal-readings-10',
    name: 'Explorador Escrito',
    description: 'Leitura de 10 passagens do Ano Bíblico registradas no aplicativo.',
    icon: 'Compass',
    conditionType: 'readings',
    conditionValue: 10
  },
  {
    id: 'medal-missions-5',
    name: 'Braços Estendidos',
    description: 'Concluiu 5 missões práticas de apoio, visita ou encorajamento no discipulado.',
    icon: 'HeartHandshake',
    conditionType: 'missions',
    conditionValue: 5
  },
  {
    id: 'medal-perfect-bible',
    name: 'Fidelidade nas Escrituras',
    description: 'Concluiu 100% das passagens de leitura agendadas para o período.',
    icon: 'ShieldCheck',
    conditionType: 'readings',
    conditionValue: 100
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'milestone-1m',
    months: 1,
    title: 'Marco de 1 Mês',
    description: 'Primeiro mês completo focado no fortalecimento espiritual e serviço prático.',
    rewardText: 'Certificado Digital de Aprendiz + Emblema Bronze Especial',
    xpRequired: 1000,
    medalId: 'medal-first-lesson'
  },
  {
    id: 'milestone-3m',
    months: 3,
    title: 'Marco de 3 Meses',
    description: 'Consolidação de hábitos de leitura da Bíblia e compartilhamento de valores.',
    rewardText: 'E-book devocional exclusivo "Profundezas da Fé" + Emblema Prata',
    xpRequired: 2500,
    medalId: 'medal-readings-10'
  },
  {
    id: 'milestone-6m',
    months: 6,
    title: 'Marco de 6 Meses',
    description: 'Meio ano vivendo o discipulado ativa e generosamente no dia a dia.',
    rewardText: 'Chaveiro de Metal Simbólico do Pescador + Emblema Ouro',
    xpRequired: 5000,
    medalId: 'medal-missions-5'
  },
  {
    id: 'milestone-1y',
    months: 12,
    title: 'Marco de 1 Ano',
    description: 'Uma jornada extraordinária de perseverança espiritual, amadurecimento e testemunho.',
    rewardText: 'Entrega de Bíblia de Estudo no próximo congresso + Caixa de Literatura Especial',
    xpRequired: 10000,
    medalId: 'medal-streak-30'
  }
];
