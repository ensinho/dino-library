import React, { useState } from 'react';
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

export default function Glossary() {
  const { t } = useTranslation();
  usePageTitle(t('footer.glossary'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const glossaryTerms: GlossaryTerm[] = [
    {
      id: 'theropod',
      term: 'Theropod',
      definition: 'A group of bipedal dinosaurs characterized by hollow bones and three-toed limbs. Most were carnivorous predators.',
      category: 'anatomy',
      relatedTerms: ['carnivore', 'bipedal'],
      examples: ['Tyrannosaurus rex', 'Velociraptor', 'Allosaurus']
    },
    {
      id: 'sauropod',
      term: 'Sauropod',
      definition: 'Large, long-necked dinosaurs that were typically herbivorous. They were quadrupedal and included the largest land animals ever.',
      category: 'anatomy',
      relatedTerms: ['herbivore', 'quadrupedal'],
      examples: ['Brachiosaurus', 'Diplodocus', 'Titanosaurus']
    },
    {
      id: 'cretaceous',
      term: 'Cretaceous Period',
      definition: 'The final period of the Mesozoic Era (145-66 million years ago), ending with the mass extinction event that eliminated non-avian dinosaurs.',
      category: 'geological',
      relatedTerms: ['mesozoic', 'extinction'],
      examples: ['T. rex', 'Triceratops', 'Spinosaurus']
    },
    {
      id: 'jurassic',
      term: 'Jurassic Period',
      definition: 'The middle period of the Mesozoic Era (201-145 million years ago), often called the "Golden Age of Dinosaurs".',
      category: 'geological',
      relatedTerms: ['mesozoic', 'triassic'],
      examples: ['Stegosaurus', 'Allosaurus', 'Brachiosaurus']
    },
    {
      id: 'triassic',
      term: 'Triassic Period',
      definition: 'The first period of the Mesozoic Era (252-201 million years ago), when dinosaurs first evolved and diversified.',
      category: 'geological',
      relatedTerms: ['mesozoic', 'evolution'],
      examples: ['Coelophysis', 'Plateosaurus', 'Eoraptor']
    },
    {
      id: 'fossil',
      term: 'Fossil',
      definition: 'The preserved remains or traces of ancient organisms, typically found in sedimentary rock formations.',
      category: 'paleontology',
      relatedTerms: ['sedimentary', 'preservation'],
      examples: ['Bone fossils', 'Trace fossils', 'Coprolites']
    },
    {
      id: 'carnivore',
      term: 'Carnivore',
      definition: 'An organism that primarily feeds on meat. Carnivorous dinosaurs had sharp teeth and claws for hunting.',
      category: 'diet',
      relatedTerms: ['predator', 'theropod'],
      examples: ['Tyrannosaurus', 'Velociraptor', 'Carnotaurus']
    },
    {
      id: 'herbivore',
      term: 'Herbivore',
      definition: 'An organism that feeds exclusively on plants. Many dinosaurs were herbivores with specialized teeth for plant processing.',
      category: 'diet',
      relatedTerms: ['sauropod', 'ornithopod'],
      examples: ['Triceratops', 'Stegosaurus', 'Parasaurolophus']
    },
    {
      id: 'ornithopod',
      term: 'Ornithopod',
      definition: 'A group of herbivorous dinosaurs characterized by bird-like hips and often elaborate head crests or frills.',
      category: 'anatomy',
      relatedTerms: ['herbivore', 'hadrosaurid'],
      examples: ['Parasaurolophus', 'Iguanodon', 'Maiasaura']
    },
    {
      id: 'ceratopsian',
      term: 'Ceratopsian',
      definition: 'Horned dinosaurs with distinctive frills and facial horns, primarily from the Cretaceous period.',
      category: 'anatomy',
      relatedTerms: ['herbivore', 'cretaceous'],
      examples: ['Triceratops', 'Styracosaurus', 'Centrosaurus']
    }
  ];

  const categories = [
    { id: 'all',          name: t('glossary.categories.all'),          color: 'bg-gray-500' },
    { id: 'anatomy',      name: t('glossary.categories.anatomy'),      color: 'bg-jade' },
    { id: 'geological',   name: t('glossary.categories.geological'),   color: 'bg-green-500' },
    { id: 'paleontology', name: t('glossary.categories.paleontology'), color: 'bg-purple-500' },
    { id: 'diet',         name: t('glossary.categories.diet'),         color: 'bg-orange-500' }
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.glossary')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{glossaryTerms.length} {t('editorial.entries')}</div>
          </div>
          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('glossary.title')}
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              {t('glossary.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="hairline-t hairline-b py-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
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
      <section className="pb-24 pt-16">
        <div className="container-editorial">
          {filteredTerms.length > 0 ? (
            <ol>
              {filteredTerms.map((term) => (
                <li key={term.id} className="hairline-t py-10 grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-3 lg:col-span-2">
                    <div className="text-caption text-jade mb-2">— {categories.find(cat => cat.id === term.category)?.name}</div>
                    <h2 className="font-display text-display-lg text-foreground tracking-tighter leading-[0.95]">
                      {term.term}
                    </h2>
                  </div>
                  <div className="col-span-12 md:col-span-9 lg:col-span-7">
                    <p className="text-foreground/75 leading-relaxed text-base md:text-lg max-w-[60ch]">
                      {term.definition}
                    </p>
                    {term.examples && term.examples.length > 0 && (
                      <div className="mt-6 hairline-t pt-4">
                        <div className="text-caption text-foreground/40 mb-2">{t('glossary.examples')}</div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs italic text-foreground/70">
                          {term.examples.map((example, index) => (
                            <span key={index}>{example}{index < term.examples!.length - 1 && <span className="text-foreground/25 ml-3">·</span>}</span>
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
