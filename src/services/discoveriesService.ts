import { getDocs, orderBy, query } from 'firebase/firestore';
import { col } from './firestoreService';
import config from '@/lib/config';

export interface ArchaeologicalDiscovery {
  id?: string;
  title: string;
  description: string;
  location: string;
  discovery_date: string;
  researcher_name?: string;
  organization?: string;
  significance?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  species_id?: string;
  species_row_index?: string;
}

export const FALLBACK_DISCOVERIES: ArchaeologicalDiscovery[] = [
  {
    id: 'patagotitan-chubut-2012',
    title: 'Descoberta do Patagotitan mayorum',
    description: 'Trabalhadores rurais e paleontólogos do Museu Egidio Feruglio escavam mais de 150 ossos pertencentes a um dos maiores animais terrestres que já existiram.',
    location: 'La Flecha, Chubut, Argentina',
    discovery_date: '2012-11-20',
    researcher_name: 'José Luis Carballido & Diego Pol',
    organization: 'Museo Paleontológico Egidio Feruglio (MEF) / CONICET',
    significance: 'Forneceu o esqueleto mais completo conhecido de um titanossauro colossal de ~70 toneladas.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Patagotitan_mayorum_mount_AMNH.jpg/1280px-Patagotitan_mayorum_mount_AMNH.jpg',
    latitude: -43.85,
    longitude: -68.85,
  },
  {
    id: 'sinosauropteryx-liaoning-1996',
    title: 'Descoberta do Sinosauropteryx e Penas em Terópodes',
    description: 'Descoberta do primeiro dinossauro não-aviano com evidências incontestáveis de proto-penas fossilizadas nos sedimentos do Lago Yixian.',
    location: 'Sihetun, Liaoning, China',
    discovery_date: '1996-08-12',
    researcher_name: 'Ji Qiang & Chen Pei-ji',
    organization: 'National Geological Museum of China',
    significance: 'Confirmou a hipótese evolutiva de que pássaros modernos são descendentes diretos de dinossauros terópodes.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sinosauropteryx_fossil.jpg/1280px-Sinosauropteryx_fossil.jpg',
    latitude: 41.58,
    longitude: 120.47,
  },
  {
    id: 'deinonychus-montana-1964',
    title: 'Descoberta do Deinonychus e o Renascimento dos Dinossauros',
    description: 'John Ostrom encontra os restos de um terópode ágil com garra em foice retrátil, demonstrando que dinossauros eram animais ativos, endotérmicos e com alta taxa metabólica.',
    location: 'Bridger, Montana, EUA',
    discovery_date: '1964-08-01',
    researcher_name: 'John Ostrom',
    organization: 'Yale Peabody Museum',
    significance: 'Iniciou o movimento conhecido como o "Renascimento dos Dinossauros" na ciência do século XX.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Deinonychus_antirrhopus_03429.JPG/1280px-Deinonychus_antirrhopus_03429.JPG',
    latitude: 45.29,
    longitude: -108.91,
  },
  {
    id: 'gobi-eggs-1923',
    title: 'Expedição do Deserto de Gobi e Ninhos com Ovos',
    description: 'A histórica expedição do Museu Americano no Deserto de Gobi descobre os primeiros ninhos com ovos de dinossauro associados a esqueletos de Protoceratops e Oviraptor.',
    location: 'Penhascos Flamejantes (Shabarakh Usu), Deserto de Gobi, Mongólia',
    discovery_date: '1923-07-13',
    researcher_name: 'Roy Chapman Andrews & Walter Granger',
    organization: 'American Museum of Natural History (AMNH)',
    significance: 'Primeira evidência científica incontestável de reprodução ovípara em dinossauros.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oviraptor_nest_AMNH.jpg/1280px-Oviraptor_nest_AMNH.jpg',
    latitude: 44.14,
    longitude: 103.73,
  },
  {
    id: 'spinosaurus-egypt-1912',
    title: 'Descoberta do Spinosaurus aegyptiacus no Saara',
    description: 'O paleontólogo alemão Ernst Stromer descobre ossos com espinhas vertebrais de quase 2 metros no Oásis de Bahariya no Egito.',
    location: 'Oásis de Bahariya, Deserto Ocidental, Egito',
    discovery_date: '1912-05-10',
    researcher_name: 'Ernst Freiherr Stromer von Reichenbach',
    organization: 'Bavarian State Collection of Paleontology and Historical Geology',
    significance: 'Descoberta de um dos terópodes mais enigmáticos e longos já registrados.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Spinosaurus_holotype_illustration.png/1280px-Spinosaurus_holotype_illustration.png',
    latitude: 28.35,
    longitude: 28.86,
  },
  {
    id: 'bone-wars-1877',
    title: 'A "Guerra dos Ossos" e a Formação Morrison',
    description: 'A rivalidade científica febril entre O. C. Marsh e E. D. Cope leva à descoberta de centenas de espécies emblemáticas, incluindo Stegosaurus, Allosaurus, Apatosaurus e Diplodocus.',
    location: 'Como Bluff, Wyoming / Garden Park, Colorado, EUA',
    discovery_date: '1877-06-15',
    researcher_name: 'Othniel Charles Marsh & Edward Drinker Cope',
    organization: 'Yale University & Academy of Natural Sciences of Philadelphia',
    significance: 'Fundou as bases da paleontologia quantitativa na América do Norte.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cope_and_Marsh_skulls.jpg/1280px-Cope_and_Marsh_skulls.jpg',
    latitude: 41.87,
    longitude: -105.93,
  },
  {
    id: 'richard-owen-dinosauria-1842',
    title: 'Criação do Táxon Dinosauria por Richard Owen',
    description: 'O anatomista britânico Sir Richard Owen reconhece semelhanças esqueléticas profundas entre Megalosaurus, Iguanodon e Hylaeosaurus e cunha o termo "Dinosauria" ("Terríveis Lagartos").',
    location: 'Londres, Reino Unido',
    discovery_date: '1842-04-01',
    researcher_name: 'Sir Richard Owen',
    organization: 'British Association for the Advancement of Science',
    significance: 'Fundação formal do grupo taxonômico Dinosauria perante a comunidade científica global.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Richard_Owen_by_Thomas_Phillips.jpg/1280px-Richard_Owen_by_Thomas_Phillips.jpg',
    latitude: 51.50,
    longitude: -0.12,
  },
  {
    id: 'mary-anning-lyme-regis-1811',
    title: 'Descobertas Pioneiras de Mary Anning na Costa Jurássica',
    description: 'Mary Anning, aos 12 anos, desenterra o primeiro esqueleto completo de Ictiossauro e posteriormente o primeiro Plesiossauro e o primeiro pterossauro fora da Alemanha.',
    location: 'Lyme Regis, Dorset, Inglaterra',
    discovery_date: '1811-10-15',
    researcher_name: 'Mary Anning',
    organization: 'Independente / Royal Geological Society Recognition',
    significance: 'Estabeleceu as bases da anatomia comparada de vertebrados extintos e mudou a visão sobre o tempo geológico.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Mary_Anning_painting.jpg/1280px-Mary_Anning_painting.jpg',
    latitude: 50.72,
    longitude: -2.93,
  }
];

export async function fetchDiscoveries(): Promise<ArchaeologicalDiscovery[]> {
  if (!config.firebase) {
    return FALLBACK_DISCOVERIES;
  }

  try {
    const snap = await getDocs(query(col('archaeological_discoveries'), orderBy('discovery_date', 'desc')));
    if (snap.empty) {
      return FALLBACK_DISCOVERIES;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ArchaeologicalDiscovery, 'id'>) }));
  } catch (error) {
    console.warn('Firestore discoveries unavailable, serving offline historical discoveries benchmark:', error);
    return FALLBACK_DISCOVERIES;
  }
}
