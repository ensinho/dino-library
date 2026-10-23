import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Compass,
  MapPin,
  Calendar,
  GraduationCap,
  Newspaper,
  BookOpen,
  User,
  Sparkles,
  Flame,
  Shield,
  Feather,
  Globe2,
} from 'lucide-react';
import { useAllDinosaurs } from '@/hooks/useDinosaurs';
import { displayName } from '@/services/dinosaurService';

interface QuickSearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function QuickSearchDialog({ open: controlledOpen, onOpenChange }: QuickSearchDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: allDinosaurs = [] } = useAllDinosaurs();

  // Listen to Ctrl+K / Cmd+K and custom trigger event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-quick-search', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-quick-search', handleCustomOpen);
    };
  }, [isOpen, setIsOpen]);

  const runCommand = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const isPt = i18n.language.startsWith('pt');
  const isEs = i18n.language.startsWith('es');

  // Rooms list
  const rooms = [
    {
      name: isPt ? 'Catálogo de Dinossauros' : isEs ? 'Catálogo de Dinosaurios' : 'Dinosaur Catalogue',
      icon: Compass,
      href: '/catalog',
      badge: '1.541 espécimes',
    },
    {
      name: isPt ? 'Rotas Temáticas & Descobertas' : isEs ? 'Rutas Temáticas & Descubrimientos' : 'Discover & Themes',
      icon: Sparkles,
      href: '/discover',
      badge: isPt ? 'Expedições' : 'Routes',
    },
    {
      name: isPt ? 'Cartografia Fóssil (Mapa Global)' : isEs ? 'Mapa de Fósiles Global' : 'Fossil Cartography Map',
      icon: MapPin,
      href: '/map',
      badge: isPt ? 'Paleogeografia' : 'Map',
    },
    {
      name: isPt ? 'Linha do Tempo & Estratigrafia' : isEs ? 'Línea de Tiempo y Estratigrafía' : 'Mesozoic Timeline',
      icon: Calendar,
      href: '/timeline',
      badge: '252 — 66 MYA',
    },
    {
      name: isPt ? 'Escola de Paleontologia (Quizzes)' : isEs ? 'Escuela y Desafíos' : 'Paleontology Schoolroom',
      icon: GraduationCap,
      href: '/education',
      badge: 'Quiz',
    },
    {
      name: isPt ? 'Literatura Científica & Papers (DOIs)' : isEs ? 'Literatura Científica & DOIs' : 'Scientific Literature & DOIs',
      icon: Newspaper,
      href: '/news',
      badge: 'OpenAlex',
    },
    {
      name: isPt ? 'Glossário Paleontológico' : isEs ? 'Glosario Paleontológico' : 'Paleontology Glossary',
      icon: BookOpen,
      href: '/glossary',
      badge: 'A — Z',
    },
    {
      name: isPt ? 'Arquivo Pessoal / Coleção' : isEs ? 'Perfil y Colección' : 'Personal Collection & Profile',
      icon: User,
      href: '/profile',
      badge: isPt ? 'Perfil' : 'Profile',
    },
  ];

  // Curated themes
  const themes = [
    {
      name: isPt ? 'Os Gigantes do Gondwana e Laurásia' : 'The Largest Land Giants',
      href: '/catalog?theme=giants',
      icon: Flame,
    },
    {
      name: isPt ? 'Predadores Ápice da Pré-História' : 'Apex Predators of the Mesozoic',
      href: '/catalog?theme=predators',
      icon: Flame,
    },
    {
      name: isPt ? 'Dinossauros Fósseis do Brasil' : 'Prehistoric Brazil Fossils',
      href: '/catalog?theme=brazil',
      icon: Globe2,
    },
    {
      name: isPt ? 'Tanques Vivos & Armaduras Ósseas' : 'Armored Dinosaurs & Living Tanks',
      href: '/catalog?theme=armored',
      icon: Shield,
    },
    {
      name: isPt ? 'A Origem das Penas & Transição Aviar' : 'Feathered Dinosaurs & Avian Transition',
      href: '/catalog?theme=feathered',
      icon: Feather,
    },
  ];

  // Pre-index dinosaur records for instant search
  const dinosaurItems = useMemo(() => {
    return allDinosaurs.slice(0, 1500).map((dino) => ({
      id: dino.row_index,
      name: displayName(dino),
      scientificName: dino.scientific_name,
      period: dino.geological_period,
      diet: dino.diet,
      href: `/species/${dino.row_index}`,
    }));
  }, [allDinosaurs]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder={
          isPt
            ? 'Buscar espécimes, salas, artigos ou temas (ex: Spinosaurus, Gigantes, Mapa)...'
            : isEs
            ? 'Buscar especímenes, salas o temas (ej: Spinosaurus, Mapa)...'
            : 'Search specimens, rooms, articles or themes (e.g., Spinosaurus, Giants, Map)...'
        }
      />
      <CommandList className="max-h-[380px] p-2">
        <CommandEmpty className="py-8 text-center text-sm text-foreground/50 font-sans">
          {isPt ? 'Nenhum espécime ou sala encontrada.' : 'No specimen or room found.'}
        </CommandEmpty>

        {/* Museum Rooms */}
        <CommandGroup heading={isPt ? 'Salas do Museu & Ferramentas' : 'Museum Rooms & Inquiry'}>
          {rooms.map((room) => (
            <CommandItem
              key={room.href}
              value={room.name}
              onSelect={() => runCommand(() => navigate(room.href))}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <room.icon className="w-4 h-4 text-jade" />
                <span className="font-medium text-sm text-foreground">{room.name}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-foreground/60 border border-foreground/10">
                {room.badge}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Curated Themes */}
        <CommandGroup heading={isPt ? 'Rotas Temáticas' : 'Curated Routes'}>
          {themes.map((theme) => (
            <CommandItem
              key={theme.href}
              value={theme.name}
              onSelect={() => runCommand(() => navigate(theme.href))}
              className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <theme.icon className="w-3.5 h-3.5 text-jade" />
              <span className="text-xs text-foreground/80">{theme.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Specimen Index */}
        {dinosaurItems.length > 0 && (
          <CommandGroup heading={isPt ? 'Espécimes Catalogados' : 'Catalogued Specimens'}>
            {dinosaurItems.slice(0, 150).map((dino) => (
              <CommandItem
                key={dino.id}
                value={`${dino.name} ${dino.scientificName} ${dino.period} ${dino.diet}`}
                onSelect={() => runCommand(() => navigate(dino.href))}
                className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-medium text-sm text-foreground">{dino.name}</span>
                  {dino.scientificName && (
                    <span className="font-mono text-[11px] italic text-foreground/45 truncate">
                      {dino.scientificName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {dino.period && (
                    <span className="text-[10px] font-mono text-foreground/50 hidden sm:inline">
                      {dino.period}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-jade/10 text-jade">
                    {dino.diet}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
