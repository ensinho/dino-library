import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet.css';
import { divIcon } from 'leaflet';
import { getDocs, limit as fsLimit, query as fsQuery } from 'firebase/firestore';
import { col } from '@/services/firestoreService';
import { DinoLoader } from '@/components/loader';

// Types for dinosaur data
interface   DinoLocation {
  id: string;
  name: string;
  species: string;
  period: string;
  coordinates: [number, number];
  description: string;
  behaviorNotes: string;
}

// Interface for Firestore data
interface dinosaur_species2 {
  behavior_notes: string | null
  common_name: string | null
  diet: string | null
  first_discovered: string | null
  fossil_location: string | null
  geological_period: string | null
  height_m: number | null
  intelligence_level: string | null
  length_m: number | null
  lived_in: string | null
  locomotion: string | null
  meaning: string | null
  notable_features: string | null
  row_index: string
  scientific_name: string | null
  source_link: string | null
  weight_kg: number | null
}

// Coordinates of famous fossil locations to map the actual dinosaurs
const fossilLocations: { [key: string]: [number, number] } = {
  'Montana': [47.0527, -109.6333],
  'Wyoming': [43.0642, -107.5308],
  'Colorado': [39.5501, -105.7821],
  'Utah': [39.3210, -111.0937],
  'Dakota': [47.5515, -101.0020],
  'Texas': [31.9686, -99.9018],
  'Argentina': [-34.6118, -58.3960],
  'Mongolia': [46.8625, 103.8467],
  'China': [35.0000, 105.0000],
  'England': [52.3555, -1.1743],
  'Germany': [51.1657, 10.4515],
  'Egypt': [26.8206, 30.8025],
  'Morocco': [31.7917, -7.0926],
  'Brazil': [-14.2400, -51.9253],
  'Australia': [-25.2744, 133.7751],
  'Canada': [56.1304, -106.3468],
  'Europe': [54.5260, 15.2551],
  'Africa': [0.0236, 37.9062],
  'Asia': [34.0479, 100.6197],
  'North America': [45.0000, -100.0000],
  'South America': [-8.7832, -55.4915]
};

// Function to get dinosaur icon based on characteristics
const getDinosaurIcon = (dino: DinoLocation, isSelected: boolean = false) => {
  let emoji = '🦖'; // default
  let color = 'hsl(45, 95%, 60%)';
  
  // Determine icon based on name, species, and behavior characteristics
  const name = dino.name.toLowerCase();
  const species = dino.species.toLowerCase();
  const behavior = dino.behaviorNotes.toLowerCase();
  
  // Check behavior_notes first for more accurate categorization
  if (behavior.includes('theropod') || behavior.includes('carnivorous')) {
     if (name.includes('raptor') || name.includes('veloci')) {
      emoji = '🦅'; 
      color = 'hsl(25, 90%, 50%)'; 
    } else {
      emoji = '🦖'; 
      color = 'hsl(0, 85%, 55%)';
    }
  } else if (behavior.includes('sauropod') || behavior.includes('herbivorous') && (name.includes('brachio') || name.includes('diplodoc') || name.includes('apatosaur'))) {
    emoji = '🦕'; // Long neck sauropods
    color = 'hsl(120, 70%, 45%)'; 
  } else if (behavior.includes('ceratopsian') || name.includes('tricerat') || name.includes('stegosaur') || name.includes('ankylosaur')) {
    emoji = '🛡️'; // Armored
    color = 'hsl(158, 86%, 72%)'; // jade
  } else if (behavior.includes('pterosaur') || name.includes('pterano') || name.includes('ptero') || name.includes('flying')) {
    emoji = '🦇'; // Flying
    color = 'hsl(280, 70%, 55%)'; 
  } else if (behavior.includes('spinosaurid') || behavior.includes('aquatic') || name.includes('spino') || name.includes('fish')) {
    emoji = '🐊'; 
    color = 'hsl(180, 60%, 45%)'; 
  } else if (behavior.includes('hadrosaur') || name.includes('hadro') || name.includes('duck') || name.includes('parasaur')) {
    emoji = '🦆'; // Duck-billed
    color = 'hsl(60, 80%, 55%)'; // Yellow
  }else if (dino.period.toLowerCase().includes('triassic')) {
    emoji = '🦎'; // Early dinosaurs
    color = 'hsl(300, 60%, 50%)'; // Magenta
  } else if (dino.period.toLowerCase().includes('jurassic')) {
    emoji = '🦴'; // Jurassic
    color = 'hsl(40, 75%, 55%)'; // Amber
  }
  
  // Darken color if selected
  if (isSelected) {
    color = color.replace(/(\d+)%\)$/, (match, lightness) => {
      const newLightness = Math.max(parseInt(lightness) - 15, 20);
      return `${newLightness}%)`;
    });
  }
  
  return divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${isSelected ? '38px' : '32px'};
      height: ${isSelected ? '38px' : '32px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 ${isSelected ? '15px' : '10px'} ${color.replace('hsl', 'hsla').replace(')', ', 0.6)')};
      font-size: ${isSelected ? '24px' : '20px'};
      border: ${isSelected ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.5)'};
      transition: all 0.3s ease;
      z-index: ${isSelected ? '1000' : '100'};
    ">${emoji}</div>`,
    className: '',
    iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
    iconAnchor: [isSelected ? 19 : 16, isSelected ? 38 : 32],
    popupAnchor: [0, isSelected ? -38 : -32],
  });
};

// Function to get card emoji based on dinosaur characteristics
const getCardEmoji = (dino: DinoLocation) => {
  const name = dino.name.toLowerCase();
  const behavior = dino.behaviorNotes.toLowerCase();
  
  // Check behavior_notes first for more accurate categorization
  if (behavior.includes('theropod') || behavior.includes('carnivorous')) {
    if (name.includes('rex') || name.includes('tyrann')) return '🦖';
    if (name.includes('raptor') || name.includes('veloci')) return '🦅';
    return '🐺';
  }
  if (behavior.includes('sauropod') || (behavior.includes('herbivorous') && (name.includes('brachio') || name.includes('diplodoc') || name.includes('apatosaur')))) return '🦕';
  if (behavior.includes('ceratopsian') || name.includes('tricerat') || name.includes('stegosaur') || name.includes('ankylosaur')) return '🛡️';
  if (behavior.includes('pterosaur') || name.includes('pterano') || name.includes('ptero')) return '🦇';
  if (behavior.includes('spinosaurid') || behavior.includes('aquatic') || name.includes('spino')) return '🐊';
  if (behavior.includes('hadrosaur') || name.includes('hadro') || name.includes('duck') || name.includes('parasaur')) return '🦆';
  if (name.includes('carno') || name.includes('allosaur') || name.includes('gigano')) return '🐺';
  if (dino.period.toLowerCase().includes('triassic')) return '🦎';
  if (dino.period.toLowerCase().includes('jurassic')) return '🦴';
  return '🦖';
};

const MapPage = () => {
  const { t } = useTranslation();
  const [selectedDino, setSelectedDino] = useState<DinoLocation | null>(null);
  const [dinoLocations, setDinoLocations] = useState<DinoLocation[]>([]);
  const [filteredDinos, setFilteredDinos] = useState<DinoLocation[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(120);
  const [mapRef, setMapRef] = useState<any>(null);

  useEffect(() => {
    fetchDinosaurs();
  }, []);

  // Force map re-render when selection changes
  useEffect(() => {
    if (mapRef) {
      // Small delay to ensure state has updated
      setTimeout(() => {
        mapRef.invalidateSize();
      }, 100);
    }
  }, [selectedDino]);

  // Update filtered dinos when locations or filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredDinos(dinoLocations);
    } else {
      const filtered = dinoLocations.filter(dino => {
        const emoji = getCardEmoji(dino);
        return getFilterCategory(emoji) === activeFilter;
      });
      setFilteredDinos(filtered);
    }
  }, [dinoLocations, activeFilter]);

  // Function to get filter category from emoji
  const getFilterCategory = (emoji: string): string => {
    const categories: { [key: string]: string } = {
      '🦖': 'trex',
      '🦅': 'raptors', 
      '🦕': 'sauropods',
      '🛡️': 'armored',
      '🦇': 'flying',
      '🐊': 'aquatic',
      '🦆': 'duckbilled',
      '🦎': 'triassic',
      '🦴': 'jurassic'
    };
    return categories[emoji] || 'other';
  };

  // Define legend categories with labels
  const legendCategories = [
    { emoji: '🦖', label: 'Theropods', filter: 'trex' },
    { emoji: '🦅', label: 'Raptors', filter: 'raptors' },
    { emoji: '🦕', label: 'Sauropods', filter: 'sauropods' },
    { emoji: '🛡️', label: 'Armored', filter: 'armored' },
    { emoji: '🦇', label: 'Flying', filter: 'flying' },
    { emoji: '🐊', label: 'Aquatic', filter: 'aquatic' },
    { emoji: '🦆', label: 'Duck-billed', filter: 'duckbilled' },
    { emoji: '🦎', label: 'Triassic', filter: 'triassic' },
    { emoji: '🦴', label: 'Jurassic', filter: 'jurassic' }
  ];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter === activeFilter ? 'all' : filter);
    setSelectedDino(null); // Clear selection when filtering
  };

  const getCoordinatesFromLocation = (location: string | null): [number, number] => {
    if (!location) return [0, 0];
    
    // Searches for matches in known locations
    for (const [key, coords] of Object.entries(fossilLocations)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        // Adds a small random variation to avoid overlap
        const randomOffset = () => (Math.random() - 0.5) * 10;
        return [coords[0] + randomOffset(), coords[1] + randomOffset()];
      }
    }
    
    // Default coordinate if no match is found
    return [0, 0];
  };

  const fetchDinosaurs = async (limit: number = 120, append: boolean = false) => {
    try {
      if (append) setLoadingMore(true);

      // Firestore doesn't support "IS NOT NULL" queries.
      // We fetch a slice and filter client-side.
      const snap = await getDocs(fsQuery(col('dinosaur_species2'), fsLimit(limit)));
      const data = snap.docs.map((d) => d.data() as dinosaur_species2);

      const mappedDinos: DinoLocation[] = data
        .filter((dino) => !!dino.fossil_location)
        .map((dino) => ({
        id: dino.row_index,
        name: dino.common_name || dino.scientific_name || 'Unknown Dinosaur',
        species: dino.scientific_name || t('editorial.unknownSpecies'),
        period: dino.geological_period || 'Unknown Period',
        coordinates: getCoordinatesFromLocation(dino.fossil_location),
        description: dino.behavior_notes || dino.notable_features || 'Information not available',
        behaviorNotes: dino.behavior_notes || ''
      })).filter(dino => dino.coordinates[0] !== 0 || dino.coordinates[1] !== 0);

      if (append) {
        setDinoLocations(prev => [...prev, ...mappedDinos.slice(prev.length)]);
      } else {
        setDinoLocations(mappedDinos);
      }
    } catch (error) {
      console.error('Error fetching dinosaurs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreDinosaurs = () => {
    const newLimit = currentLimit + 25;
    setCurrentLimit(newLimit);
    fetchDinosaurs(newLimit, true);
  };

  const focusOnDinosaur = (dino: DinoLocation) => {
    setSelectedDino(dino);
    if (mapRef) {
      mapRef.setView(dino.coordinates, 6);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— Plotting fossil sites</div>
          <DinoLoader size="lg" label={t('editorial.loadingMap')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           HEADER
           ============================================================ */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.map')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">
              {filteredDinos.length} of {dinoLocations.length} mapped
            </div>
          </div>

          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              The fossil map
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              Sites of origin, plotted across the world. Filter by category, click a marker to focus.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
           MAP + INDEX RAIL
           ============================================================ */}
      <section className="pb-12">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Map canvas */}
            <div className="lg:col-span-8 relative overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 h-[70vh]">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                minZoom={2}
                className="z-0 h-full w-full"
                zoomControl={false}
                ref={setMapRef}
              >
                <ZoomControl position="bottomright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredDinos.map((dino) => (
                  <Marker
                    key={dino.id}
                    position={dino.coordinates}
                    icon={getDinosaurIcon(dino, selectedDino?.id === dino.id)}
                    eventHandlers={{ click: () => setSelectedDino(dino) }}
                  >
                    <Popup>
                      <div className="p-3 max-w-xs bg-card text-foreground">
                        <h3 className="text-lg font-bold text-jade">{dino.name}</h3>
                        <p className="text-sm"><span className="font-semibold">Species:</span> {dino.species}</p>
                        <p className="text-sm"><span className="font-semibold">Period:</span> {dino.period}</p>
                        <p className="text-sm mt-2">{dino.description}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Index rail */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl ring-1 ring-foreground/8 bg-surface-1/40 overflow-hidden h-[70vh]">
              <div className="px-5 py-4 hairline-b text-caption text-jade">
                — Index · {filteredDinos.length} entries
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-foreground/8">
                {filteredDinos.map((dino) => {
                  const active = selectedDino?.id === dino.id;
                  return (
                    <button
                      key={dino.id}
                      type="button"
                      onClick={() => focusOnDinosaur(dino)}
                      className={`w-full text-left px-5 py-4 transition-colors duration-300 ease-spring ${
                        active ? 'bg-jade/10' : 'hover:bg-foreground/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3 className={`font-display text-base tracking-[-0.025em] truncate ${active ? 'text-jade' : 'text-foreground'}`}>
                          {dino.name}
                        </h3>
                        <span className="text-base flex-shrink-0">{getCardEmoji(dino)}</span>
                      </div>
                      <p className="text-xs text-foreground/55 italic truncate">{dino.species}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mt-1">{dino.period}</p>
                    </button>
                  );
                })}
              </div>
              {currentLimit < 750 && (
                <div className="px-5 py-4 hairline-t">
                  <button
                    type="button"
                    onClick={loadMoreDinosaurs}
                    disabled={loadingMore}
                    className="w-full text-caption text-jade hover:text-foreground transition-colors duration-300 disabled:opacity-50"
                  >
                    {loadingMore ? t('editorial.loadingShort') : t('editorial.loadMoreEntries')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           LEGEND / FILTER STRIP
           ============================================================ */}
      <section className="pb-32">
        <div className="container-editorial">
          <div className="hairline-t pt-8">
            <div className="text-caption text-jade mb-5">— Filter by category</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilterClick('all')}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring ${
                  activeFilter === 'all'
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                }`}
              >
                All
              </button>
              {legendCategories.map((category) => (
                <button
                  key={category.filter}
                  type="button"
                  onClick={() => handleFilterClick(category.filter)}
                  className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                    activeFilter === category.filter
                      ? 'bg-jade text-canvas ring-jade'
                      : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                  }`}
                >
                  <span>{category.emoji}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MapPage;