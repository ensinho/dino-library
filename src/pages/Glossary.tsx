import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
  examples?: string[];
}

interface TermTranslation {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
  examples?: string[];
}

const GLOSSARY_DICTIONARY: Record<string, Record<'en' | 'pt-BR' | 'es', TermTranslation>> = {
  theropod: {
    'pt-BR': {
      term: 'Terópode',
      definition: 'Grupo de dinossauros bípedes caracterizados por ossos ocos e membros com três dedos funcionais. A maioria era de predadores carnívoros, e deles descendem as aves modernas.',
      category: 'anatomy',
      relatedTerms: ['Carnívoro', 'Bípede'],
      examples: ['Tyrannosaurus rex', 'Velociraptor', 'Allosaurus', 'Spinosaurus']
    },
    'es': {
      term: 'Terópodo',
      definition: 'Grupo de dinosaurios bípedos caracterizados por huesos huecos y extremidades con tres dedos principales. La mayoría eran carnívoros, y de ellos descienden las aves.',
      category: 'anatomy',
      relatedTerms: ['Carnívoro', 'Bípedo'],
      examples: ['Tyrannosaurus rex', 'Velociraptor', 'Allosaurus', 'Spinosaurus']
    },
    'en': {
      term: 'Theropod',
      definition: 'A group of bipedal dinosaurs characterized by hollow bones and three-toed limbs. Most were carnivorous predators, and modern birds evolved from this clade.',
      category: 'anatomy',
      relatedTerms: ['Carnivore', 'Bipedal'],
      examples: ['Tyrannosaurus rex', 'Velociraptor', 'Allosaurus', 'Spinosaurus']
    }
  },
  sauropod: {
    'pt-BR': {
      term: 'Saurópode',
      definition: 'Dinossauros gigantescos de pescoço e cauda longos, quadrúpedes e estritamente herbívoros. Incluem os maiores animais terrestres que já caminharam sobre o planeta.',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Osteodermo'],
      examples: ['Patagotitan', 'Brachiosaurus', 'Diplodocus', 'Argentinosaurus']
    },
    'es': {
      term: 'Saurópodo',
      definition: 'Dinosaurios cuadrúpedos de cuello y cola muy largos, estrictamente herbívoros. Incluyen a los mayores animales terrestres de la historia del planeta.',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Osteodermo'],
      examples: ['Patagotitan', 'Brachiosaurus', 'Diplodocus', 'Argentinosaurus']
    },
    'en': {
      term: 'Sauropod',
      definition: 'Large, long-necked quadrupedal dinosaurs that were typically herbivorous. They included the largest terrestrial animals ever to walk the Earth.',
      category: 'anatomy',
      relatedTerms: ['Herbivore', 'Osteoderm'],
      examples: ['Patagotitan', 'Brachiosaurus', 'Diplodocus', 'Argentinosaurus']
    }
  },
  cretaceous: {
    'pt-BR': {
      term: 'Período Cretáceo',
      definition: 'O período final da Era Mesozoica (145 a 66 milhões de anos atrás), marcado pelo apogeu de dinossauros com chifres, encouraçados e tiranossauros, finalizado pela colisão do asteroide de Chicxulub.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Extinção'],
      examples: ['T. rex', 'Triceratops', 'Spinosaurus', 'Borealopelta']
    },
    'es': {
      term: 'Período Cretácico',
      definition: 'El período final de la Era Mesozoica (hace 145 a 66 millones de años), que culminó con el evento de extinción masiva que eliminó a los dinosaurios no aviares.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Extinción'],
      examples: ['T. rex', 'Triceratops', 'Spinosaurus', 'Borealopelta']
    },
    'en': {
      term: 'Cretaceous Period',
      definition: 'The final period of the Mesozoic Era (145 to 66 million years ago), ending with the mass extinction event that eliminated non-avian dinosaurs.',
      category: 'geological',
      relatedTerms: ['Mesozoic', 'Extinction'],
      examples: ['T. rex', 'Triceratops', 'Spinosaurus', 'Borealopelta']
    }
  },
  jurassic: {
    'pt-BR': {
      term: 'Período Jurássico',
      definition: 'O período intermediário do Mesozoico (201 a 145 milhões de anos atrás), frequentemente chamado de a "Era de Ouro dos Dinossauros", célebre pela proliferação de estegossauros e saurópodes monumentais.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Triássico'],
      examples: ['Stegosaurus', 'Allosaurus', 'Brachiosaurus', 'Archaeopteryx']
    },
    'es': {
      term: 'Período Jurásico',
      definition: 'El período medio de la Era Mesozoica (hace 201 a 145 millones de años), célebre por la proliferación de estegosaurios y gigantescos saurópodos.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Triásico'],
      examples: ['Stegosaurus', 'Allosaurus', 'Brachiosaurus', 'Archaeopteryx']
    },
    'en': {
      term: 'Jurassic Period',
      definition: 'The middle period of the Mesozoic Era (201 to 145 million years ago), characterized by lush gymnosperm forests and colossal sauropods and stegosaurs.',
      category: 'geological',
      relatedTerms: ['Mesozoic', 'Triassic'],
      examples: ['Stegosaurus', 'Allosaurus', 'Brachiosaurus', 'Archaeopteryx']
    }
  },
  triassic: {
    'pt-BR': {
      term: 'Período Triássico',
      definition: 'O primeiro período da Era Mesozoica (252 a 201 milhões de anos atrás), após a grande extinção Permo-Triássica, quando os primeiros dinossauros evoluíram no supercontinente Pangeia.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Evolução'],
      examples: ['Coelophysis', 'Plateosaurus', 'Herrerasaurus', 'Eoraptor']
    },
    'es': {
      term: 'Período Triásico',
      definition: 'El primer período de la Era Mesozoica (hace 252 a 201 millones de años), cuando los dinosaurios evolucionaron por primera vez en el supercontinente Pangea.',
      category: 'geological',
      relatedTerms: ['Mesozoico', 'Evolución'],
      examples: ['Coelophysis', 'Plateosaurus', 'Herrerasaurus', 'Eoraptor']
    },
    'en': {
      term: 'Triassic Period',
      definition: 'The first period of the Mesozoic Era (252 to 201 million years ago), following the Great Dying, during which dinosaurs first evolved in Pangaea.',
      category: 'geological',
      relatedTerms: ['Mesozoic', 'Evolution'],
      examples: ['Coelophysis', 'Plateosaurus', 'Herrerasaurus', 'Eoraptor']
    }
  },
  fossil: {
    'pt-BR': {
      term: 'Fóssil',
      definition: 'Restos ou vestígios preservados de organismos antigos em rochas sedimentares, incluindo ossos mineralizados, pegadas, ovos e impressões de tecidos moles.',
      category: 'paleontology',
      relatedTerms: ['Tafonomia', 'Holótipo'],
      examples: ['Fósseis corporais', 'Icnofósseis (pegadas)', 'Coprólitos', 'Âmbar']
    },
    'es': {
      term: 'Fósil',
      definition: 'Restos o huellas preservadas de organismos del pasado en rocas sedimentarias, como huesos mineralizados, huellas, huevos e impresiones dérmicas.',
      category: 'paleontology',
      relatedTerms: ['Tafonomía', 'Holotipo'],
      examples: ['Fósiles corporales', 'Icnofósiles (huellas)', 'Coprolitos', 'Ámbar']
    },
    'en': {
      term: 'Fossil',
      definition: 'The preserved remains or traces of ancient organisms found in sedimentary rock formations, including permineralized bones, footprints, and amber inclusions.',
      category: 'paleontology',
      relatedTerms: ['Taphonomy', 'Holotype'],
      examples: ['Body fossils', 'Trace fossils (ichnites)', 'Coprolites', 'Amber']
    }
  },
  carnivore: {
    'pt-BR': {
      term: 'Carnívoro',
      definition: 'Organismo cuja dieta é baseada no consumo de outros animais. Dinossauros carnívoros possuíam dentes serrilhados recurvados e garras adaptadas para captura.',
      category: 'diet',
      relatedTerms: ['Terópode', 'Predador'],
      examples: ['Tyrannosaurus', 'Velociraptor', 'Carnotaurus', 'Spinosaurus']
    },
    'es': {
      term: 'Carnívoro',
      definition: 'Organismo cuya alimentación se basa en la carne de otros animales. Poseían dientes aserrados y garras afiladas para cazar o carroñear.',
      category: 'diet',
      relatedTerms: ['Terópodo', 'Depredador'],
      examples: ['Tyrannosaurus', 'Velociraptor', 'Carnotaurus', 'Spinosaurus']
    },
    'en': {
      term: 'Carnivore',
      definition: 'An organism that primarily feeds on meat. Carnivorous dinosaurs featured serrated, curved teeth (ziphodont dentition) and acute binocular or olfactory senses.',
      category: 'diet',
      relatedTerms: ['Theropod', 'Predator'],
      examples: ['Tyrannosaurus', 'Velociraptor', 'Carnotaurus', 'Spinosaurus']
    }
  },
  herbivore: {
    'pt-BR': {
      term: 'Herbívoro',
      definition: 'Organismo adaptado para se alimentar exclusivamente de matéria vegetal. Desenvolveram baterias dentárias complexas, moelas com gastrólitos ou fermentação intestinal prolongada.',
      category: 'diet',
      relatedTerms: ['Saurópode', 'Gastrólito'],
      examples: ['Triceratops', 'Stegosaurus', 'Parasaurolophus', 'Ankylosaurus']
    },
    'es': {
      term: 'Herbívoro',
      definition: 'Organismo adaptado para alimentarse de plantas. Desarrollaron baterías dentales trituradoras, mollejas con gastrolitos y amplios estómagos para fermentar celulosa.',
      category: 'diet',
      relatedTerms: ['Saurópodo', 'Gastrolito'],
      examples: ['Triceratops', 'Stegosaurus', 'Parasaurolophus', 'Ankylosaurus']
    },
    'en': {
      term: 'Herbivore',
      definition: 'An organism that feeds exclusively on vegetation. Herbivorous dinosaurs developed grinding dental batteries, beak shearing mechanisms, or gastrolith gizzards.',
      category: 'diet',
      relatedTerms: ['Sauropod', 'Gastrolith'],
      examples: ['Triceratops', 'Stegosaurus', 'Parasaurolophus', 'Ankylosaurus']
    }
  },
  ornithopod: {
    'pt-BR': {
      term: 'Ornitópode',
      definition: 'Clado de dinossauros herbívoros com bicos córneos, dentições trituradoras sofisticadas e bipedia facultativa, incluindo os dinossauros bico-de-pato com cristas elaboradas.',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Hadrossaurídeo'],
      examples: ['Parasaurolophus', 'Iguanodon', 'Maiasaura', 'Edmontosaurus']
    },
    'es': {
      term: 'Ornitópodo',
      definition: 'Grupo de dinosaurios herbívoros con picos de cuerno, dientes trituradores avanzados y bipedismo facultativo, conocidos comúnmente como "picos de pato".',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Hadrosáurido'],
      examples: ['Parasaurolophus', 'Iguanodon', 'Maiasaura', 'Edmontosaurus']
    },
    'en': {
      term: 'Ornithopod',
      definition: 'A group of herbivorous dinosaurs characterized by horn-sheathed beaks, complex grinding dental batteries, and facultative bipedal locomotion.',
      category: 'anatomy',
      relatedTerms: ['Herbivore', 'Hadrosaur'],
      examples: ['Parasaurolophus', 'Iguanodon', 'Maiasaura', 'Edmontosaurus']
    }
  },
  ceratopsian: {
    'pt-BR': {
      term: 'Ceratopsídeo',
      definition: 'Dinossauros com chifres faciais e uma gola óssea (folho) cervical distintiva projetada a partir dos ossos parietal e esquamosal, dominante no Cretáceo Superior.',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Cretáceo'],
      examples: ['Triceratops', 'Styracosaurus', 'Centrosaurus', 'Torosaurus']
    },
    'es': {
      term: 'Ceratópsido',
      definition: 'Dinosaurios cuadrúpedos con cuernos faciales y una llamativa gola ósea protectora en el cuello, muy comunes a finales del Cretácico.',
      category: 'anatomy',
      relatedTerms: ['Herbívoro', 'Cretácico'],
      examples: ['Triceratops', 'Styracosaurus', 'Centrosaurus', 'Torosaurus']
    },
    'en': {
      term: 'Ceratopsian',
      definition: 'Beaked quadrupedal dinosaurs featuring elaborate facial horns and a prominent neck frill derived from parietal and squamosal bones.',
      category: 'anatomy',
      relatedTerms: ['Herbivore', 'Cretaceous'],
      examples: ['Triceratops', 'Styracosaurus', 'Centrosaurus', 'Torosaurus']
    }
  },
  taphonomy: {
    'pt-BR': {
      term: 'Tafonomia',
      definition: 'O ramo da paleontologia que estuda a transição dos restos orgânicos desde a morte do organismo até sua fossilização, sepultamento e descoberta.',
      category: 'paleontology',
      relatedTerms: ['Fóssil', 'Lagerstätte'],
      examples: ['Borealopelta de Alberta', 'Fósseis da Formação Santana', 'Calcário de Solnhofen']
    },
    'es': {
      term: 'Tafonomía',
      definition: 'Rama de la paleontología que investiga los procesos que sufre un organismo desde su muerte biológica hasta su enterramiento y preservación fósil.',
      category: 'paleontology',
      relatedTerms: ['Fósil', 'Lagerstätte'],
      examples: ['Borealopelta de Alberta', 'Fósiles de Formación Santana', 'Calizas de Solnhofen']
    },
    'en': {
      term: 'Taphonomy',
      definition: 'The branch of paleontology that studies the processes of decay, preservation, burial, and fossilization of biological organisms over geological time.',
      category: 'paleontology',
      relatedTerms: ['Fossil', 'Lagerstätte'],
      examples: ['Alberta Borealopelta', 'Santana Formation Biota', 'Solnhofen Limestone']
    }
  },
  holotype: {
    'pt-BR': {
      term: 'Holótipo',
      definition: 'O espécime fóssil físico individual que serve como âncora oficial para a descrição formal e nomeação científica de uma espécie biológica perante o ICZN.',
      category: 'paleontology',
      relatedTerms: ['Taxonomia', 'Fóssil'],
      examples: ['Holótipo TMP 2011.033.0001 (Borealopelta)', 'Holótipo FSAC-KK 1188 (Spinosaurus)']
    },
    'es': {
      term: 'Holotipo',
      definition: 'El espécimen fósil físico único que sirve como base oficial para la descripción y denominación de una nueva especie científica según el código zoológico.',
      category: 'paleontology',
      relatedTerms: ['Taxonomía', 'Fósil'],
      examples: ['Holotipo TMP 2011.033.0001 (Borealopelta)', 'Holotipo FSAC-KK 1188 (Spinosaurus)']
    },
    'en': {
      term: 'Holotype',
      definition: 'The single physical specimen designated as the official name-bearing type specimen for the formal scientific description of a biological species.',
      category: 'paleontology',
      relatedTerms: ['Taxonomy', 'Fossil'],
      examples: ['Holotype TMP 2011.033.0001 (Borealopelta)', 'Holotype FSAC-KK 1188 (Spinosaurus)']
    }
  }
};

export default function Glossary() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('footer.glossary'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const normalizedLang: 'en' | 'pt-BR' | 'es' = useMemo(() => {
    if (i18n.language.startsWith('pt')) return 'pt-BR';
    if (i18n.language.startsWith('es')) return 'es';
    return 'en';
  }, [i18n.language]);

  const glossaryTerms: GlossaryTerm[] = useMemo(() => {
    return Object.entries(GLOSSARY_DICTIONARY).map(([id, translations]) => {
      const data = translations[normalizedLang] || translations.en;
      return {
        id,
        term: data.term,
        definition: data.definition,
        category: data.category,
        relatedTerms: data.relatedTerms,
        examples: data.examples,
      };
    });
  }, [normalizedLang]);

  const categories = [
    { id: 'all',          name: t('glossary.categories.all'),          color: 'bg-gray-500' },
    { id: 'anatomy',      name: t('glossary.categories.anatomy'),      color: 'bg-jade' },
    { id: 'geological',   name: t('glossary.categories.geological'),   color: 'bg-green-500' },
    { id: 'paleontology', name: t('glossary.categories.paleontology'), color: 'bg-purple-500' },
    { id: 'diet',         name: t('glossary.categories.diet'),         color: 'bg-orange-500' }
  ];

  const filteredTerms = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return glossaryTerms.filter((term) => {
      const matchesSearch =
        !q ||
        term.term.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        (term.examples && term.examples.some((ex) => ex.toLowerCase().includes(q)));
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [glossaryTerms, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.glossary')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{glossaryTerms.length} {t('editorial.entries')}</div>
          </div>
          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('glossary.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('glossary.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="hairline-t hairline-b py-4 sticky top-16 bg-background/80 backdrop-blur-md z-30">
        <div className="container-editorial">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder={t('glossary.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-full bg-surface-1 border-foreground/10"
              />
            </div>
            <div className="md:col-span-7 flex flex-wrap gap-2 md:justify-end">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring ${
                    selectedCategory === category.id
                      ? 'bg-jade text-canvas ring-jade'
                      : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INDEX LIST */}
      <section className="pb-20 pt-8">
        <div className="container-editorial">
          {filteredTerms.length > 0 ? (
            <ol>
              {filteredTerms.map((term) => (
                <li key={term.id} className="hairline-t py-6 lg:py-7 grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-12 md:col-span-3 lg:col-span-2">
                    <div className="text-caption text-jade mb-1.5">— {categories.find((cat) => cat.id === term.category)?.name}</div>
                    <h2 className="font-display text-xl sm:text-2xl text-foreground tracking-tight leading-snug">
                      {term.term}
                    </h2>
                  </div>
                  <div className="col-span-12 md:col-span-9 lg:col-span-7">
                    <p className="text-foreground/75 leading-relaxed text-sm md:text-base max-w-[65ch]">
                      {term.definition}
                    </p>
                    {term.examples && term.examples.length > 0 && (
                      <div className="mt-4 hairline-t pt-3">
                        <div className="text-caption text-foreground/40 mb-1.5">{t('glossary.examples')}</div>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-[11px] italic text-foreground/70">
                          {term.examples.map((example, index) => (
                            <span key={index}>
                              {example}
                              {index < term.examples!.length - 1 && <span className="text-foreground/25 ml-2.5">·</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-span-12 lg:col-span-3">
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className="hairline-t lg:hairline-t pt-4 lg:pt-0 lg:border-t-0">
                        <div className="text-caption text-foreground/40 mb-2 flex items-center gap-1.5">
                          <LinkIcon className="w-3 h-3" />
                          {t('glossary.seeAlso')}
                        </div>
                        <div className="flex flex-col gap-1">
                          {term.relatedTerms.map((relatedTerm, index) => (
                            <button
                              key={index}
                              onClick={() => setSearchTerm(relatedTerm)}
                              className="text-caption text-jade hover:text-foreground transition-colors duration-300 text-left"
                            >
                              → {relatedTerm}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              <li className="hairline-t" aria-hidden="true" />
            </ol>
          ) : (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— {t('glossary.nothingInIndex')}</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                {t('glossary.noTermsFound')}
              </h3>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('glossary.noTermsHint')}</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} variant="outline" size="lg">
                {t('glossary.clearSearch')}
              </Button>
            </div>
          )}

          {/* CTA */}
          <div className="hairline-t mt-20 pt-16 grid lg:grid-cols-12 gap-y-6 gap-x-12 items-center">
            <div className="lg:col-span-7">
              <div className="text-caption text-jade mb-3">— {t('glossary.readyToExplore')}</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                {t('glossary.ctaTitle')}
              </h3>
              <p className="text-foreground/65 max-w-[55ch] leading-relaxed">
                {t('glossary.ctaDesc')}
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button asChild className="bg-jade text-canvas hover:bg-jade/90">
                <Link to="/catalog">
                  {t('glossary.ctaExplore')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/discover">{t('glossary.ctaDiscover')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
