import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Search, Map, Clock, GraduationCap, Zap, Globe, Book, Crown, Sparkles, Star } from 'lucide-react';
import heroImage from '@/assets/backgrounds/JurassicBackground.jpg';
import allosaurusImage from '@/assets/dinosaur-images/alossauro.jpg';
import brachiosaurusImage from '@/assets/dinosaur-images/braquiossauro.jpg';
import oxalaiaImage from '@/assets/dinosaur-images/oxalaia.jpg';

interface FavoriteDinosaur {
  name: string;
  scientificName: string;
  description: string;
  period: string;
  diet: string;
  funFact: string;
  imageUrl?: string;
}

const favoriteDinosaurs: FavoriteDinosaur[] = [
  {
    name: 'Allosaurus',
    scientificName: 'Allosaurus fragilis',
    description: 'A apex predator of the Jurassic, known for its large skull, sharp serrated teeth, and powerful claws. It was a big hunter that likely preyed on large herbivores like sauropods.',
    period: 'Late Jurassic',
    diet: 'Carnivore',
    funFact: 'It had relatively long arms compared to T-Rex, with claws up to 25cm long!',
    imageUrl: allosaurusImage
  },
  {
    name: "Oxalaia",
    scientificName: "Oxalaia quilombensis",
    description: "Considered the largest carnivorous dinosaur in Brazil, this spinosaurid was a close relative of Spinosaurus and lived in semi-aquatic environments.",
    period: "Late Cretaceous",
    diet: "Piscivore",
    funFact: "Its name honors the African deity Oxalá and the quilombos of Cajual Island, in Maranhão, where its fossils were found.",
    imageUrl: oxalaiaImage
  },
  {
    name: 'Brachiosaurus',
    scientificName: 'Brachiosaurus altithorax',
    description: 'One of the most recognizable dinosaurs. Its front legs were significantly longer than its hind legs, creating a steeply inclined posture that, combined with its immensely long neck',
    period: 'Late Jurassic',
    diet: 'Herbivore',
    funFact: 'Its heart weighed about 400kg and pumped blood up to 12 meters high!',
    imageUrl: brachiosaurusImage
  }
];

export default function Home() {
  const features = [
    {
      title: 'Species Collection',
      description: 'Explore our vast collection of dinosaurs with detailed information about each species.',
      icon: Search,
      href: '/catalog',
      color: 'bg-gradient-forest'
    },
    {
      title: 'Interactive Maps',
      description: 'Discover where fossils were found and explore prehistoric habitats.',
      icon: Map,
      href: '/map',
      color: 'bg-gradient-amber'
    },
    {
      title: 'Archaeological Timeline',
      description: 'Follow the evolution of paleontological discoveries over time.',
      icon: Clock,
      href: '/timeline',
      color: 'bg-gradient-prehistoric'
    },
    {
      title: 'Learning Area',
      description: 'Participate in interactive quizzes and learn in a fun way.',
      icon: GraduationCap,
      href: '/education',
      color: 'bg-gradient-hero'
    }
  ];

  const stats = [
    { label: 'Species Cataloged', value: '1000', icon: Zap },
    { label: 'Discoveries Mapped', value: '500+', icon: Globe },
    { label: 'Educational Resources', value: '5+', icon: Book }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.9)'
          }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            <span className="bg-gradient-amber bg-clip-text text-transparent">
              Dino Library
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Explore the fascinating world of dinosaurs through archaeological discoveries, 
            interactive maps, and immersive educational experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/catalog">
              <Button size="lg" className="w-full sm:w-auto shadow-amber hover:shadow-glow transition-all">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/education">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Start Quiz
                <GraduationCap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Discovering the Prehistoric Past
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform offers a complete dinosaur learning experience,
              combining science, technology, and education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className="group hover:shadow-fossil transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <Link to={feature.href}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Favorite Dinosaurs Section */}
      <section className="py-16 bg-card/50">    
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber animate-pulse" />
            <h2 className="text-4xl font-bold mb-4 bg-gradient-amber bg-clip-text text-transparent">
              Some of My Favorite Dinosaurs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Meet three of the most fascinating giants of the Mesozoic era.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {favoriteDinosaurs.map((dino, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-amber/30 overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-amber/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber/10 to-primary/10 group-hover:from-amber/20 group-hover:to-primary/20 transition-all duration-500" />
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    <img src={dino.imageUrl} alt={dino.name} className='object-cover' />
                  </div>
                </div>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-amber/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-6 h-6 text-amber fill-amber" />
                    <CardTitle className="text-xl text-primary">{dino.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm italic text-muted-foreground">
                    {dino.scientificName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="py-4 text-muted-foreground leading-relaxed">
                    {dino.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Period</div>
                      <div className="font-semibold text-sm text-primary">{dino.period}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Diet</div>
                      <div className="font-semibold text-sm text-primary">{dino.diet}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber/10 to-primary/10 p-4 rounded-lg border border-amber/20">
                    <div className="text-xs text-amber-light font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Fun Fact
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {dino.funFact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-amber rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}