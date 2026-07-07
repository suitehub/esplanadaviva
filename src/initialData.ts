import { SabbathLesson, BibleReading, MissionChallenge, Medal, Milestone, BookChapter } from './types';

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
    xpRequired: 1000,
    medalId: 'medal-streak-30'
  }
];

export const INITIAL_BOOK_CHAPTERS: BookChapter[] = [
  {
    id: 'chapter-1',
    chapterNumber: 1,
    title: 'A última crise da terra',
    pages: 'pág. 14 - 18',
    summary: 'Uma análise da apreensão e expectativa generalizadas quanto ao futuro do planeta. Alerta-nos sobre as rápidas transformações sociais, geopolíticas e desastres naturais que sinalizam a proximidade do encerramento da história humana, enfatizando a importância do estudo sério dos livros de Daniel e Apocalipse.',
    completed: false
  },
  {
    id: 'chapter-2',
    chapterNumber: 2,
    title: 'Sinais de que Cristo voltará em breve',
    pages: 'pág. 19 - 28',
    summary: 'Apresenta os sinais celestes e terrestres previstos pelo Salvador no sermão profético de Mateus 24. Aborda o surgimento de falsos profetas, o aumento da violência, a intemperança social, as guerras e desastres de grandes proporções no mar e na terra como prenúncios visíveis de Sua gloriosa vinda.',
    completed: false
  },
  {
    id: 'chapter-3',
    chapterNumber: 3,
    title: '“Quando sucederão estas coisas?”',
    pages: 'pág. 29 - 36',
    summary: 'Examina a questão do tempo no plano divino. Mostra que o momento exato da volta de Cristo não é revelado aos homens nem aos anjos e adverte contra marcar datas precisas, o que historicamente gera descrença e fanatismo, convocando o povo a viver em constante vigilância e prontidão ativa.',
    completed: false
  },
  {
    id: 'chapter-4',
    chapterNumber: 4,
    title: 'A igreja de Deus nos últimos dias',
    pages: 'pág. 37 - 50',
    summary: 'Descreve o papel profético do remanescente que guarda os mandamentos de Deus e tem a fé em Jesus. Destaca a necessidade contínua de organização e união estrutural e aborda os perigos da debilidade espiritual interna, reafirmando a paciência, providência e cooperação do Senhor para com Sua igreja.',
    completed: false
  },
  {
    id: 'chapter-5',
    chapterNumber: 5,
    title: 'A vida devocional do remanescente',
    pages: 'pág. 51 - 59',
    summary: 'Trata do cultivo diário da intimidade espiritual mediante a oração fervorosa, a meditação e o estudo sistemático das escrituras sagradas. Aponta o exemplo histórico de Enoque, que andou de forma prática e constante com Deus em meio a uma sociedade corrompida.',
    completed: false
  },
  {
    id: 'chapter-6',
    chapterNumber: 6,
    title: 'O estilo de vida e as atividades do remanescente',
    pages: 'pág. 60 - 73',
    summary: 'Traz conselhos práticos para a conduta diária e o serviço abnegado. Aborda a conscienciosa observância do sábado, a fidelidade nos dízimos e ofertas, o estabelecimento de instituições, a reforma de saúde, a temperança no regime alimentar, a recreação sadia e a música espiritual.',
    completed: false
  },
  {
    id: 'chapter-7',
    chapterNumber: 7,
    title: 'Vida campestre',
    pages: 'pág. 74 - 84',
    summary: 'Destaca as vantagens do convívio harmônico com a natureza para o desenvolvimento físico, mental e de caráter. Recomenda que as famílias estabeleçam lares no campo para ficarem protegidas das tentações das metrópoles, instruindo também sobre a localização de instituições e escolas.',
    completed: false
  },
  {
    id: 'chapter-8',
    chapterNumber: 8,
    title: 'As cidades',
    pages: 'pág. 85 - 94',
    summary: 'Alerta sobre os perigos morais, físicos e espirituais que permeiam as grandes cidades modernas. Mostra as metrópoles como viveiros de vícios, criminalidade e corrupção e apela para que o trabalho de evangelização seja feito partindo de postos avançados situados na periferia.',
    completed: false
  },
  {
    id: 'chapter-9',
    chapterNumber: 9,
    title: 'Leis dominicais',
    pages: 'pág. 95 - 108',
    summary: 'Aborda a grande controvérsia final envolvendo a guarda do sábado em contraste com as leis civis humanas. Discorre sobre o desafio de Satanás à autoridade de Deus e sobre os movimentos políticos e religiosos que buscarão impor o domingo como feriado civil nacional obrigatório.',
    completed: false
  },
  {
    id: 'chapter-10',
    chapterNumber: 10,
    title: 'O pequeno tempo de angústia',
    pages: 'pág. 109 - 116',
    summary: 'Detalha a fase de provação que ocorre pouco antes de as pragas finais serem derramadas. Examina o fim das liberdades civis e religiosas, o preconceito e oposição estatal contra o povo de Deus e as perseguições que farão com que os fiéis percam o apoio terreno temporário.',
    completed: false
  },
  {
    id: 'chapter-11',
    chapterNumber: 11,
    title: 'Enganos satânicos nos últimos dias',
    pages: 'pág. 117 - 128',
    summary: 'Desmascara as fraudes e artimanhas sobrenaturais que Satanás operará para enganar a humanidade. Adverte sobre o espiritismo, a personificação visual e falada de entes queridos falecidos, a imitação do próprio Cristo e a ocorrência de curas mentirosas e fenômenos de fogo no céu.',
    completed: false
  },
  {
    id: 'chapter-12',
    chapterNumber: 12,
    title: 'A sacudidura',
    pages: 'pág. 129 - 136',
    summary: 'Explica o doloroso processo de joeiramento na igreja, onde a perseguição e a rejeição das mensagens de repreensão purificarão o povo de Deus. Mostra que crentes superficiais e dirigentes vacilarão, enquanto novos conversos de todo o mundo ocuparão firmemente os seus lugares.',
    completed: false
  },
  {
    id: 'chapter-13',
    chapterNumber: 13,
    title: 'A chuva serôdia',
    pages: 'pág. 137 - 146',
    summary: 'Apresenta o derramamento glorioso e sem precedentes do Espírito Santo sobre os crentes preparados, capacitando-os com o poder divino para anunciar o evangelho. Explica que a chuva temporã (conversão) deve ser valorizada para que se possa discernir e receber a chuva serôdia.',
    completed: false
  },
  {
    id: 'chapter-14',
    chapterNumber: 14,
    title: 'O alto clamor',
    pages: 'pág. 147 - 159',
    summary: 'Refere-se ao momento de proclamação global e decisiva da última mensagem de advertência de Apocalipse 14 e 18. Salienta que o evangelho alcançará com incrível poder todas as nações, línguas e religiões, convertendo milhares de sinceros de coração em um único dia.',
    completed: false
  },
  {
    id: 'chapter-15',
    chapterNumber: 15,
    title: 'O selo de Deus e a marca da besta',
    pages: 'pág. 160 - 167',
    summary: 'Examina a distinção final entre os súditos de Deus e os seguidores da besta. Mostra que o selo de Deus, gravado nas testas dos justos, representa a consolidação intelectual e espiritual na verdade do sábado, refletindo a perfeita semelhança com o caráter amoroso de Cristo.',
    completed: false
  },
  {
    id: 'chapter-16',
    chapterNumber: 16,
    title: 'O fim do tempo da graça',
    pages: 'pág. 168 - 175',
    summary: 'Discorre sobre o encerramento do ministério intercessor de Jesus no santuário celestial e a fixação irrevogável do destino de cada alma. Adverte que este momento solene ocorrerá de forma repentina e invisível, enquanto a vida quotidiana nas cidades prossegue normalmente.',
    completed: false
  },
  {
    id: 'chapter-17',
    chapterNumber: 17,
    title: 'As sete últimas pragas e os ímpios',
    pages: 'pág. 176 - 185',
    summary: 'Analisa o derramamento sucessivo das taças da ira de Deus sobre a terra, após a retirada de Sua proteção protetora. Descreve os graves flagelos físicos e a terrível angústia mental e física que assolarão os que rejeitaram a lei e a misericórdia do Criador.',
    completed: false
  },
  {
    id: 'chapter-18',
    chapterNumber: 18,
    title: 'As sete últimas pragas e os justos',
    pages: 'pág. 186 - 198',
    summary: 'Contrapõe o sofrimento físico dos justos ao amparo milagroso que receberão. Mostra que, em meio ao tempo de angústia de Jacó, Deus assegurará o sustento com pão e água e enviará Seus santos anjos para proteger individualmente cada um de Seus servos fiéis.',
    completed: false
  },
  {
    id: 'chapter-19',
    chapterNumber: 19,
    title: 'A volta de Cristo',
    pages: 'pág. 199 - 207',
    summary: 'Relata o evento culminante da história humana: o aparecimento de Jesus sobre as nuvens do céu com poder e glória. Aborda a ressurreição especial dos justos falecidos, a transformação dos vivos e a recepção das coroas e harpas diante das portas de pérola.',
    completed: false
  },
  {
    id: 'chapter-20',
    chapterNumber: 20,
    title: 'A herança dos santos',
    pages: 'pág. 208 - 224',
    summary: 'Apresenta a consolidação definitiva do reino eterno. Discorre sobre a restauração da terra, a glória indescritível da Nova Jerusalém, a comunhão face a face com o Pai e o Filho, o estudo infinito da história da redenção e as atividades felizes que reinarão no novo lar.',
    completed: false
  }
];

