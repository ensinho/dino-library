import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, ArrowRight, Link as LinkIcon } from 'lucide-react';
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
    { id: 'all', name: 'All Categories', color: 'bg-gray-500' },
    { id: 'anatomy', name: 'Anatomy', color: 'bg-blue-500' },
    { id: 'geological', name: 'Geological', color: 'bg-green-500' },
    { id: 'paleontology', name: 'Paleontology', color: 'bg-purple-500' },
    { id: 'diet', name: 'Diet', color: 'bg-orange-500' }
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    return categories.find(cat => cat.id === category)?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-amber bg-clip-text text-transparent">Paleontology Glossary</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Essential terms and concepts for understanding the world of dinosaurs and paleontology.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? `${category.color} text-white` : ''}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Glossary Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((term) => (
            <Card key={term.id} className="hover:shadow-fossil transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-amber" />
                      {term.term}
                    </CardTitle>
                  </div>
                  <Badge className={`${getCategoryColor(term.category)} text-white text-xs`}>
                    {categories.find(cat => cat.id === term.category)?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {term.definition}
                </p>

                {term.examples && term.examples.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-amber mb-2">Examples:</h4>
                    <div className="flex flex-wrap gap-1">
                      {term.examples.map((example, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {term.relatedTerms && term.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-amber mb-2 flex items-center">
                      <LinkIcon className="mr-1 h-3 w-3" />
                      Related Terms:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {term.relatedTerms.map((relatedTerm, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchTerm(relatedTerm)}
                          className="text-xs text-amber hover:text-amber-dark underline"
                        >
                          {relatedTerm}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No terms found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or select a different category.
            </p>
            <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} variant="outline">
              Clear Search
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-amber/10 to-orange/10 border-amber/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Ready to explore?</h3>
              <p className="text-muted-foreground mb-4">
                Now that you know the terminology, dive into our dinosaur collection and discover amazing species.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/catalog">
                    Explore Species
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/discover">
                    Discover Themes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}