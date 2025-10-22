export interface Character {
  id: number;
  name: string;
  race: string;
  level: number;
  xp: number;
  user_id: number;
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
  pontos_disponiveis: number;
  weapon_name: string;
  weapon_attr: string;
  weapon_bonus: number;
  current_pv: number;
  current_pc: number;
  current_pe: number;
  currency: number;
  campaign_id?: number;
  location?: {
    x: number;
    y: number;
  };
  color?: string; // cor opcional para representar o personagem no mapa e nos cards
  inventory?: {
    equipped: {
      [key: string]: Item | null;
    };
    items: Item[];
    currency: number;
  };
}

export interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'completed' | 'paused';
  map_seed: number;
  map_size: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  type: string;
  bonus?: {
    attr: string;
    value: number;
  };
}

export interface Race {
  name: string;
  gender: 'masculino' | 'feminino';
  baseStats: {
    forca: number;
    destreza: number;
    constituicao: number;
    inteligencia: number;
    sabedoria: number;
    carisma: number;
  };
  description: string;
  weapon: {
    name: string;
    attr: string;
    bonus: number;
  };
}

export interface Enemy {
  id: number;
  name: string;
  level: number;
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
  weapon_name: string;
  weapon_attr: string;
  weapon_bonus: number;
  current_pv: number;
  current_pc: number;
  current_pe: number;
}

export const races: Race[] = [
  // Raças Masculinas
  {
    name: 'Davi',
    gender: 'masculino',
    baseStats: { forca: 3, destreza: 2, constituicao: 2, inteligencia: 1, sabedoria: 3, carisma: 2 },
    description: 'Rei guerreiro, músico e poeta. Forte na fé e liderança.',
    weapon: { name: 'Funda de Davi', attr: 'destreza', bonus: 2 }
  },
  {
    name: 'Moisés',
    gender: 'masculino',
    baseStats: { forca: 1, destreza: 1, constituicao: 2, inteligencia: 3, sabedoria: 4, carisma: 3 },
    description: 'Líder profeta, guia do povo. Forte na sabedoria e inteligência.',
    weapon: { name: 'Cajado de Moisés', attr: 'sabedoria', bonus: 2 }
  },
  {
    name: 'Abraão',
    gender: 'masculino',
    baseStats: { forca: 2, destreza: 1, constituicao: 3, inteligencia: 2, sabedoria: 4, carisma: 2 },
    description: 'Patriarca da fé, exemplo de obediência. Forte na sabedoria e constituição.',
    weapon: { name: 'Espada de Abraão', attr: 'forca', bonus: 2 }
  },
  {
    name: 'Paulo',
    gender: 'masculino',
    baseStats: { forca: 1, destreza: 1, constituicao: 2, inteligencia: 4, sabedoria: 3, carisma: 3 },
    description: 'Apóstolo missionário, teólogo. Forte na inteligência e sabedoria.',
    weapon: { name: 'Rolo de Paulo', attr: 'inteligencia', bonus: 2 }
  },
  {
    name: 'Josué',
    gender: 'masculino',
    baseStats: { forca: 3, destreza: 3, constituicao: 2, inteligencia: 2, sabedoria: 2, carisma: 2 },
    description: 'Conquistador militar, sucessor de Moisés. Forte na força e destreza.',
    weapon: { name: 'Trombeta de Josué', attr: 'carisma', bonus: 2 }
  },
  // Raças Femininas
  {
    name: 'Ester',
    gender: 'feminino',
    baseStats: { forca: 1, destreza: 2, constituicao: 1, inteligencia: 3, sabedoria: 2, carisma: 4 },
    description: 'Rainha corajosa, salvou seu povo. Forte no carisma e inteligência.',
    weapon: { name: 'Cetro de Ester', attr: 'carisma', bonus: 2 }
  },
  {
    name: 'Débora',
    gender: 'feminino',
    baseStats: { forca: 2, destreza: 2, constituicao: 1, inteligencia: 3, sabedoria: 4, carisma: 2 },
    description: 'Juíza e profetisa, líder militar. Forte na sabedoria e inteligência.',
    weapon: { name: 'Palma de Débora', attr: 'sabedoria', bonus: 2 }
  },
  {
    name: 'Rute',
    gender: 'feminino',
    baseStats: { forca: 2, destreza: 1, constituicao: 3, inteligencia: 2, sabedoria: 3, carisma: 2 },
    description: 'Leal e trabalhadora, exemplo de fidelidade. Forte na constituição e sabedoria.',
    weapon: { name: 'Foice de Rute', attr: 'constituicao', bonus: 2 }
  },
  {
    name: 'Maria',
    gender: 'feminino',
    baseStats: { forca: 1, destreza: 1, constituicao: 2, inteligencia: 2, sabedoria: 4, carisma: 3 },
    description: 'Mãe de Jesus, cheia de graça. Forte na sabedoria e carisma.',
    weapon: { name: 'Lenço de Maria', attr: 'sabedoria', bonus: 2 }
  },
  {
    name: 'Priscila',
    gender: 'feminino',
    baseStats: { forca: 1, destreza: 2, constituicao: 1, inteligencia: 4, sabedoria: 3, carisma: 2 },
    description: 'Missionária inteligente, ensinadora. Forte na inteligência e sabedoria.',
    weapon: { name: 'Livro de Priscila', attr: 'inteligencia', bonus: 2 }
  }
];