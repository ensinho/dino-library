import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Search, Filter, Eye, Zap, Mountain, Skull, Globe } from 'lucide-react';
import { fetchDiscoveries as fetchDiscoveriesFromFirestore, type ArchaeologicalDiscovery as FirestoreDiscovery } from '@/services/discoveriesService';

type ArchaeologicalDiscovery = FirestoreDiscovery & { id: string };

interface GeologicalEvent {
  id: string;
  title: string;
  description: string;
  period: string;
  years_ago: number;
  type: 'period_start' | 'period_end' | 'extinction' | 'climate_change' | 'geological';
  icon: React.ReactNode;
  color: string;
}

export default function Timeline() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('navigation.timeline'));
  const [discoveries, setDiscoveries] = useState<ArchaeologicalDiscovery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState(6);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('discoveries');

  // Geological events data
  // Copy lives in the locale files under timeline.events.<id>.
  const geologicalEvents: GeologicalEvent[] = [
    {
      id: 'cretaceous_end',
      title: t('timeline.events.cretaceous_end.title'),
      description: t('timeline.events.cretaceous_end.description'),
      period: t('timeline.periods.cretaceous'),
      years_ago: 66,
      type: 'extinction',
      icon: <Skull className="w-6 h-6" />,
      color: '',
    },
    {
      id: 'cretaceous_start',
      title: t('timeline.events.cretaceous_start.title'),
      description: t('timeline.events.cretaceous_start.description'),
      period: t('timeline.periods.cretaceous'),
      years_ago: 145,
      type: 'period_start',
      icon: <Mountain className="w-6 h-6" />,
      color: '',
    },
    {
      id: 'jurassic_start',
      title: t('timeline.events.jurassic_start.title'),
      description: t('timeline.events.jurassic_start.description'),
      period: t('timeline.periods.jurassic'),
      years_ago: 201,
      type: 'period_start',
      icon: <Globe className="w-6 h-6" />,
      color: '',
    },
    {
      id: 'triassic_jurassic_extinction',
      title: t('timeline.events.triassic_jurassic_extinction.title'),
      description: t('timeline.events.triassic_jurassic_extinction.description'),
      period: t('timeline.periods.triassic'),
      years_ago: 201,
      type: 'extinction',
      icon: <Zap className="w-6 h-6" />,
      color: '',
    },
    {
      id: 'triassic_start',
      title: t('timeline.events.triassic_start.title'),
      description: t('timeline.events.triassic_start.description'),
      period: t('timeline.periods.triassic'),
      years_ago: 252,
      type: 'period_start',
      icon: <Mountain className="w-6 h-6" />,
      color: '',
    },
    {
      id: 'permian_extinction',
      title: t('timeline.events.permian_extinction.title'),
      description: t('timeline.events.permian_extinction.description'),
      period: t('timeline.periods.permian'),
      years_ago: 252,
      type: 'extinction',
      icon: <Skull className="w-6 h-6" />,
      color: '',
    },
  ];

  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    fetchDiscoveriesFromFirestore()
      .then((data) => {
        if (cancelled) return;
        setDiscoveries(data.map((d) => ({ ...d, id: d.id || crypto.randomUUID() })));
      })
      .catch((error) => {
        console.error('Error loading discoveries:', error);
        if (!cancelled) setFailed(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => setVisibleItems(6), [searchTerm, selectedYear]);

  const filteredDiscoveries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return discoveries.filter(
      (d) =>
        (!query || [d.title, d.description, d.location].some((f) => (f ?? '').toLowerCase().includes(query))) &&
        (!selectedYear || new Date(d.discovery_date).getFullYear().toString() === selectedYear),
    );
  }, [discoveries, searchTerm, selectedYear]);

  const getUniqueYears = () => {
    const years = discoveries.map(discovery => 
      new Date(discovery.discovery_date).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 6, filteredDiscoveries.length));
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.pullingRecord')}</div>
          <DinoLoader size="lg" label={t('editorial.loadingTimeline')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           HEADER — wall plaque
           ============================================================ */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.timeline')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{t('timeline.range')}</div>
          </div>

          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('timeline.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('timeline.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-editorial">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-1 hairline-b w-full justify-start rounded-none">
              <TabsTrigger
                value="discoveries"
                className="rounded-none px-4 py-3 text-caption text-foreground/50 data-[state=active]:bg-transparent data-[state=active]:text-jade data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-jade -mb-px flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                {t('timeline.tabs.discoveries')}
              </TabsTrigger>
              <TabsTrigger
                value="geological"
                className="rounded-none px-4 py-3 text-caption text-foreground/50 data-[state=active]:bg-transparent data-[state=active]:text-jade data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-jade -mb-px flex items-center gap-2"
              >
                <Mountain className="w-3.5 h-3.5" />
                {t('timeline.tabs.geological')}
              </TabsTrigger>
            </TabsList>

            {/* ============================================================
                 DISCOVERIES — chronological column
                 ============================================================ */}
            <TabsContent value="discoveries" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
                <div className="md:col-span-7 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    placeholder={t('timeline.filters.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 rounded-full bg-surface-1 border-foreground/10"
                  />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="md:col-span-3 h-11 px-4 rounded-full bg-surface-1 border border-foreground/10 text-sm text-foreground"
                >
                  <option value="">{t('timeline.filters.allYears')}</option>
                  {getUniqueYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedYear('');
                    setVisibleItems(6);
                  }}
                  className="md:col-span-2 text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {t('timeline.filters.clear')}
                </button>
              </div>

              {failed && (
                <div className="py-16 text-center hairline-t">
                  <p className="text-foreground/60 mb-6">{t('common.errorMessage')}</p>
                  <Button variant="outline" onClick={() => { setLoading(true); setAttempt((n) => n + 1); }}>
                    {t('common.retry')}
                  </Button>
                </div>
              )}

              <ol className="relative">
                {filteredDiscoveries.slice(0, visibleItems).map((discovery) => {
                  const expanded = expandedCard === discovery.id;
                  return (
                    <li key={discovery.id} className="hairline-t py-10 grid grid-cols-12 gap-6 group">
                      <div className="col-span-12 md:col-span-2">
                        <div className="font-display text-display-lg text-jade tracking-tighter leading-none">
                          {new Date(discovery.discovery_date).getFullYear()}
                        </div>
                        <div className="mt-2 text-caption text-foreground/40">
                          {formatDate(discovery.discovery_date)}
                        </div>
                      </div>

                      <div className={discovery.image_url ? 'col-span-12 md:col-span-7' : 'col-span-12 md:col-span-10'}>
                        <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-3 transition-colors duration-300 group-hover:text-jade">
                          {discovery.title}
                        </h3>
                        <div className="text-caption text-foreground/50 mb-4 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {discovery.location}
                        </div>
                        <p className={`text-foreground/70 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                          {discovery.description}
                        </p>

                        {expanded && (
                          <div className="mt-6 space-y-5 hairline-t pt-6">
                            {discovery.significance && (
                              <div>
                                <div className="text-caption text-jade mb-2">— {t('timeline.discovery.significance')}</div>
                                <p className="text-sm text-foreground/65 leading-relaxed">{discovery.significance}</p>
                              </div>
                            )}
                            {(discovery.researcher_name || discovery.organization) && (
                              <div className="text-caption text-foreground/50 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-jade" />
                                {discovery.researcher_name && <span>{discovery.researcher_name}</span>}
                                {discovery.organization && <span className="opacity-60">· {discovery.organization}</span>}
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleCardExpansion(discovery.id)}
                          className="mt-5 text-caption text-jade hover:text-foreground transition-colors duration-300 flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {expanded ? t('timeline.discovery.less') : t('timeline.discovery.more')}
                        </button>
                      </div>

                      {discovery.image_url && (
                        <figure className="col-span-12 md:col-span-3 relative overflow-hidden rounded-2xl ring-1 ring-foreground/8 aspect-[4/5] bg-surface-1">
                          <img
                            src={discovery.image_url}
                            alt={discovery.title}
                            className="absolute inset-0 w-full h-full object-cover img-duotone-hover"
                          />
                        </figure>
                      )}
                    </li>
                  );
                })}
                <li className="hairline-t" aria-hidden="true" />
              </ol>

              {visibleItems < filteredDiscoveries.length && (
                <div className="text-center mt-12">
                  <Button onClick={loadMoreItems} variant="outline" size="lg">
                    {t('timeline.discovery.viewMore')} ({filteredDiscoveries.length - visibleItems} {t('timeline.discovery.remaining')})
                  </Button>
                </div>
              )}

              {!failed && filteredDiscoveries.length === 0 && (
                <div className="py-24 text-center">
                  <div className="text-caption text-jade mb-4">— {t('timeline.discovery.emptyCaption')}</div>
                  <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                    {t('timeline.discovery.noDiscoveries')}
                  </h3>
                  <p className="text-foreground/60 max-w-[44ch] mx-auto">{t('timeline.discovery.adjustFilters')}</p>
                </div>
              )}
            </TabsContent>

            {/* ============================================================
                 GEOLOGICAL — era ledger
                 ============================================================ */}
            <TabsContent value="geological" className="mt-12">
              <ol>
                {geologicalEvents.map((event) => (
                  <li key={event.id} className="hairline-t py-10 grid grid-cols-12 gap-6 group">
                    <div className="col-span-12 md:col-span-2">
                      <div className="font-display text-display-lg text-jade tracking-tighter leading-none">
                        {event.years_ago}
                      </div>
                      <div className="mt-2 text-caption text-foreground/40">{t('timeline.geological.millionYearsAgo')}</div>
                    </div>
                    <div className="col-span-12 md:col-span-1 hidden md:flex md:justify-center md:pt-2">
                      <div className="text-jade">{event.icon}</div>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                      <div className="text-caption text-foreground/40 mb-3 flex items-center gap-2">
                        <span>{event.period} · {t('timeline.geological.period')}</span>
                        <span className="opacity-30">·</span>
                        <span>{t(`timeline.eventTypes.${event.type}`)}</span>
                      </div>
                      <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-3 transition-colors duration-300 group-hover:text-jade">
                        {event.title}
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">{event.description}</p>
                    </div>
                  </li>
                ))}
                <li className="hairline-t" aria-hidden="true" />
              </ol>

              <div className="mt-20 pt-10 hairline-t">
                <div className="text-caption text-jade mb-8">— {t('timeline.geological.eraOverview')}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/8 rounded-3xl overflow-hidden ring-1 ring-foreground/8">
                  {[
                    { name: t('timeline.geological.triassic'), range: `252–201 ${t('timeline.geological.mya')}`, desc: t('timeline.geological.triassicDesc') },
                    { name: t('timeline.geological.jurassic'), range: `201–145 ${t('timeline.geological.mya')}`, desc: t('timeline.geological.jurassicDesc') },
                    { name: t('timeline.geological.cretaceous'), range: `145–66 ${t('timeline.geological.mya')}`, desc: t('timeline.geological.cretaceousDesc') }
                  ].map((era, i) => (
                    <div key={era.name} className="bg-background p-8">
                      <div className="text-caption text-foreground/30 mb-6">0{i + 1}</div>
                      <h4 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-2">{era.name}</h4>
                      <div className="text-caption text-jade mb-4">{era.range}</div>
                      <p className="text-sm text-foreground/60 leading-relaxed">{era.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
