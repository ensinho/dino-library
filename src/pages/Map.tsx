import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet.css';
import { PageError, PageLoader } from '@/components/PageState';
import { useAllDinosaurs } from '@/hooks/useDinosaurs';
import { useDinoLabels } from '@/hooks/useDinoLabels';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  CLADES,
  PERIOD_GROUPS,
  cladeOf,
  coordinatesOf,
  jitter,
  periodGroupOf,
  type Clade,
  type PeriodGroup,
} from '@/lib/taxonomy';
import { displayName, type DinosaurSpecies } from '@/services/dinosaurService';

interface Site {
  species: DinosaurSpecies;
  position: [number, number];
  /** Un-jittered locality, used to count distinct sites. */
  place: string;
  clade: Clade;
  period: PeriodGroup | null;
}

const CLADE_COLORS: Record<Clade, string> = {
  theropod: 'hsl(4 80% 64%)',
  sauropod: 'hsl(158 86% 72%)',
  armored: 'hsl(40 90% 62%)',
  ornithopod: 'hsl(200 85% 66%)',
  other: 'hsl(270 55% 72%)',
};

const INDEX_PAGE = 60;

const chip = (active: boolean) =>
  `text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
    active
      ? 'bg-jade text-canvas ring-jade'
      : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
  }`;

const MapPage = () => {
  const { t } = useTranslation();
  const labels = useDinoLabels();
  usePageTitle(t('navigation.map'));
  const { data: all, isPending, isError, refetch } = useAllDinosaurs();

  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clade, setClade] = useState<Clade | 'all'>('all');
  const [period, setPeriod] = useState<PeriodGroup | 'all'>('all');
  const [visible, setVisible] = useState(INDEX_PAGE);

  const sites = useMemo<Site[]>(
    () =>
      (all ?? []).flatMap((species) => {
        const coords = coordinatesOf(species.fossil_location, species.lived_in);
        if (!coords) return [];
        return [
          {
            species,
            position: jitter(coords, species.row_index),
            place: coords.join(','),
            clade: cladeOf(species),
            period: periodGroupOf(species.geological_period),
          },
        ];
      }),
    [all],
  );

  const filtered = useMemo(
    () => sites.filter((s) => (clade === 'all' || s.clade === clade) && (period === 'all' || s.period === period)),
    [sites, clade, period],
  );

  const siteCount = useMemo(() => new Set(filtered.map((s) => s.place)).size, [filtered]);

  const focus = (site: Site) => {
    setSelectedId(site.species.row_index);
    map?.flyTo(site.position, Math.max(map.getZoom(), 5), { duration: 0.8 });
  };

  const resetFilters = (next: () => void) => {
    next();
    setSelectedId(null);
    setVisible(INDEX_PAGE);
  };

  if (isPending) return <PageLoader caption={t('map.plotting')} label={t('editorial.loadingMap')} />;
  if (isError) return <PageError onRetry={() => refetch()} />;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.map')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">
              {t('map.mappedCount', { shown: filtered.length, total: sites.length })}
            </div>
          </div>

          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('map.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('map.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="pb-8">
        <div className="container-editorial space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('map.filters.clade')}>
            <button type="button" className={chip(clade === 'all')} onClick={() => resetFilters(() => setClade('all'))}>
              {t('map.filters.allGroups')}
            </button>
            {CLADES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={clade === c}
                className={chip(clade === c)}
                onClick={() => resetFilters(() => setClade(clade === c ? 'all' : c))}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLADE_COLORS[c] }} aria-hidden="true" />
                {t(`map.clades.${c}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('map.filters.period')}>
            <button type="button" className={chip(period === 'all')} onClick={() => resetFilters(() => setPeriod('all'))}>
              {t('catalog.filters.allPeriods')}
            </button>
            {PERIOD_GROUPS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                className={chip(period === p)}
                onClick={() => resetFilters(() => setPeriod(period === p ? 'all' : p))}
              >
                {t(`catalog.periods.${p}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAP + INDEX RAIL */}
      <section className="pb-12">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 relative overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 h-[60vh] lg:h-[70vh]">
              <MapContainer
                center={[20, 10]}
                zoom={2}
                minZoom={2}
                worldCopyJump
                preferCanvas
                className="z-0 h-full w-full"
                zoomControl={false}
                ref={setMap}
              >
                <ZoomControl position="bottomright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                />
                {filtered.map((site) => {
                  const selected = site.species.row_index === selectedId;
                  const color = CLADE_COLORS[site.clade];
                  return (
                    <CircleMarker
                      key={site.species.row_index}
                      center={site.position}
                      radius={selected ? 9 : 5}
                      pathOptions={{
                        color: selected ? 'hsl(0 0% 100%)' : color,
                        weight: selected ? 2 : 1,
                        fillColor: color,
                        fillOpacity: selected ? 1 : 0.75,
                      }}
                      eventHandlers={{ click: () => setSelectedId(site.species.row_index) }}
                    >
                      <Popup>
                        <div className="min-w-[200px] max-w-xs">
                          <div className="text-caption mb-1" style={{ color }}>{t(`map.clades.${site.clade}`)}</div>
                          <h3 className="font-display text-lg leading-tight text-foreground">{displayName(site.species)}</h3>
                          <p className="font-mono text-[11px] italic text-foreground/55 mb-2">{site.species.scientific_name}</p>
                          <p className="text-xs text-foreground/70 mb-1">{labels.period(site.species.geological_period)}</p>
                          <p className="text-xs text-foreground/50 mb-3">{site.species.fossil_location}</p>
                          <Link to={`/species/${site.species.row_index}`} className="text-caption text-jade hover:underline">
                            {t('map.popup.viewDetails')} →
                          </Link>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Index rail */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl ring-1 ring-foreground/8 bg-surface-1/40 overflow-hidden h-[50vh] lg:h-[70vh]">
              <div className="px-5 py-4 hairline-b flex items-center justify-between text-caption">
                <span className="text-jade">— {t('map.index', { count: filtered.length })}</span>
                <span className="text-foreground/40">{t('map.stats.sites', { count: siteCount })}</span>
              </div>
              <ul className="flex-1 overflow-y-auto divide-y divide-foreground/8">
                {filtered.slice(0, visible).map((site) => {
                  const active = selectedId === site.species.row_index;
                  return (
                    <li key={site.species.row_index}>
                      <button
                        type="button"
                        onClick={() => focus(site)}
                        className={`w-full text-left px-5 py-4 transition-colors duration-300 ease-spring ${
                          active ? 'bg-jade/10' : 'hover:bg-foreground/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className={`font-display text-base tracking-[-0.025em] truncate ${active ? 'text-jade' : 'text-foreground'}`}>
                            {displayName(site.species)}
                          </h3>
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: CLADE_COLORS[site.clade] }}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs text-foreground/55 truncate">{site.species.fossil_location || site.species.lived_in}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mt-1">
                          {labels.period(site.species.geological_period)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {visible < filtered.length && (
                <div className="px-5 py-4 hairline-t">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + INDEX_PAGE)}
                    className="w-full text-caption text-jade hover:text-foreground transition-colors duration-300"
                  >
                    {t('editorial.loadMoreEntries')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-6 text-caption text-foreground/35">{t('map.disclaimer')}</p>
        </div>
      </section>
    </div>
  );
};

export default MapPage;
