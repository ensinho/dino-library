import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Map, Clock, GraduationCap, Zap, Globe, Book } from 'lucide-react';
import dinoArt1 from '@/assets/backgrounds/DinoArt.jpg';
import dinoArt2 from '@/assets/backgrounds/DinoArt2.jpg';
import dinoArt3 from '@/assets/backgrounds/DinoArt3.jpg';
import paleoArt from '@/assets/backgrounds/Paleoart2.jpg';
import jurassicBrachiosaurs from '@/assets/backgrounds/JurassicBackgroundBrachiosaurs.jpg';
import allosaurusImage from '@/assets/dinosaur-images/alossauro.jpg';
import brachiosaurusImage from '@/assets/dinosaur-images/braquiossauro.jpg';
import oxalaiaImage from '@/assets/dinosaur-images/oxalaia.jpg';
import SmartImage from '@/components/SmartImage';

interface FavoriteDinosaur {
  name: string;
  scientificName: string;
  description: string;
  period: string;
  diet: string;
  funFact: string;
  imageUrl?: string;
}

const favoriteImages = {
  allosaurus: allosaurusImage,
  oxalaia: oxalaiaImage,
  brachiosaurus: brachiosaurusImage,
} as const;

type FavoriteKey = keyof typeof favoriteImages;

const favoriteOrder: { id: FavoriteKey; name: string; scientificName: string }[] = [
  { id: 'allosaurus',    name: 'Allosaurus',    scientificName: 'Allosaurus fragilis' },
  { id: 'oxalaia',       name: 'Oxalaia',       scientificName: 'Oxalaia quilombensis' },
  { id: 'brachiosaurus', name: 'Brachiosaurus', scientificName: 'Brachiosaurus altithorax' },
];

export default function Home() {
  const { t } = useTranslation();

  const favoriteDinosaurs: FavoriteDinosaur[] = favoriteOrder.map((f) => ({
    name: f.name,
    scientificName: f.scientificName,
    description: t(`home.favorites.items.${f.id}.description`),
    period:      t(`home.favorites.items.${f.id}.period`),
    diet:        t(`home.favorites.items.${f.id}.diet`),
    funFact:     t(`home.favorites.items.${f.id}.funFact`),
    imageUrl:    favoriteImages[f.id],
  }));
  const features = [
    {
      title: t('home.features.collection.title'),
      description: t('home.features.collection.description'),
      icon: Search,
      href: '/catalog',
      color: 'bg-gradient-forest'
    },
    {
      title: t('home.features.maps.title'),
      description: t('home.features.maps.description'),
      icon: Map,
      href: '/map',
      color: 'bg-gradient-amber'
    },
    {
      title: t('home.features.timeline.title'),
      description: t('home.features.timeline.description'),
      icon: Clock,
      href: '/timeline',
      color: 'bg-gradient-prehistoric'
    },
    {
      title: t('home.features.education.title'),
      description: t('home.features.education.description'),
      icon: GraduationCap,
      href: '/education',
      color: 'bg-gradient-hero'
    }
  ];

  const stats = [
    { label: t('home.stats.cataloged'), value: '1000', icon: Zap },
    { label: t('home.stats.discoveries'), value: '500+', icon: Globe },
    { label: t('home.stats.resources'), value: '5+', icon: Book }
  ];

  const credibility = [
    {
      title: t('home.features.maps.title'),
      description: t('home.features.maps.description'),
      icon: Map,
    },
    {
      title: t('home.features.timeline.title'),
      description: t('home.features.timeline.description'),
      icon: Clock,
    },
    {
      title: t('home.features.education.title'),
      description: t('home.features.education.description'),
      icon: GraduationCap,
    },
  ];


  return (
    <div className="flex flex-col">
      {/* ============================================================
           PLATE I — ENTRANCE
           A single grand frame. Like stepping into the foyer of a
           natural history museum: one image, hung deliberately,
           with the title etched on the wall beside it.
           ============================================================ */}
      <section className="relative overflow-hidden bg-background pt-10 lg:pt-12 pb-24">
        <div className="hero-halo" aria-hidden="true" />

        <div className="container-editorial relative z-10">
          {/* The single grand plate */}
          <figure className="relative overflow-hidden rounded-3xl ring-1 ring-jade/25 shadow-[0_0_60px_-20px_hsl(158_86%_72%/0.45)] fade-rise fade-rise-delay-1">
            <div className="aspect-[16/9] sm:aspect-[21/9]">
              <SmartImage
                src={dinoArt1}
                alt="Two carnotaurs in a luminous prehistoric forest"
                className="absolute inset-0 w-full h-full"
                skeletonClassName="rounded-3xl"
                imgClassName="object-cover w-full h-full [filter:hue-rotate(-18deg)_saturate(0.92)]"
                loading="eager"
              />
            </div>
            {/* Jade harmonisation tint — pushes cyan crystals toward brand jade */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color"
              style={{ background: 'hsl(158 86% 72% / 0.18)' }}
              aria-hidden="true"
            />
            {/* Soft top-down vignette so caption stays readable */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, transparent 40%, hsl(240 8% 4% / 0.55) 100%)' }}
              aria-hidden="true"
            />
            <figcaption className="absolute left-6 bottom-6 right-6 flex items-end justify-between gap-3 z-10">
              <div className="text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                {t('editorial.plateOne')}
              </div>
              <div className="hidden md:block text-caption text-foreground/55 bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                {t('editorial.plateOneSub')}
              </div>
            </figcaption>
          </figure>

          {/* Title beside the plate, like wall text */}
          <div className="grid gap-y-10 gap-x-12 lg:grid-cols-12 mt-16 lg:mt-20">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-2xl text-foreground tracking-tighter fade-rise fade-rise-delay-2">
                {t('home.hero.title')}
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pt-6">
              <p className="max-w-[44ch] text-base md:text-lg text-foreground/65 leading-relaxed fade-rise fade-rise-delay-3">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 fade-rise fade-rise-delay-4">
                <Link to="/catalog">
                  <Button variant="accent" size="lg">
                    {t('home.hero.exploreCollection')}
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/education">
                  <Button variant="ghost" size="lg">
                    {t('home.hero.startQuiz')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Colophon hairline — invitation to descend */}
        <div className="container-editorial mt-24">
          <div className="hairline-t pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-caption text-foreground/40">{t('editorial.openLibrary')}</p>
            <p className="text-caption text-foreground/40 hidden sm:block">{t('editorial.takeYourTime')}</p>
          </div>
        </div>
      </section>

      {/* ============================================================
           PLATE II — TOOLS OF INQUIRY  (Features)
           A side-by-side gallery: a tall sticky portrait of an
           ankylosaur on the left, a vertical list of "what you can
           explore" on the right. The image lingers as you read.
           ============================================================ */}
      <section className="relative py-32 bg-surface-1/40">
        <div className="container-editorial">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 items-start">
            {/* Sticky tall plate */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <figure className="relative overflow-hidden rounded-3xl ring-1 ring-jade/25 shadow-[0_0_50px_-20px_hsl(158_86%_72%/0.4)]">
                  <div className="aspect-[3/4]">
                    <SmartImage
                      src={dinoArt3}
                      alt="Ankylosaur silhouette in a misty clearing"
                      className="absolute inset-0 w-full h-full"
                      skeletonClassName="rounded-3xl"
                      imgClassName="object-cover w-full h-full [filter:hue-rotate(-15deg)_saturate(0.95)]"
                      loading="lazy"
                    />
                  </div>
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-color"
                    style={{ background: 'hsl(158 86% 72% / 0.15)' }}
                    aria-hidden="true"
                  />
                  <figcaption className="absolute left-5 bottom-5 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                    Plate II · Ankylosaur, study at dusk
                  </figcaption>
                </figure>

                <div className="mt-6 hidden lg:block">
                  <p className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                    {t('editorial.rooms.tools')}
                  </p>
                </div>
              </div>
            </div>

            {/* Reading column */}
            <div className="lg:col-span-7">
              <div className="text-caption text-jade mb-6">— What you can explore</div>
              <h2 className="font-display text-display-xl text-foreground max-w-[18ch] tracking-tighter">
                {t('home.features.title')}
              </h2>
              <p className="mt-6 max-w-[52ch] text-base md:text-lg text-foreground/65 leading-relaxed">
                {t('home.features.subtitle')}
              </p>

              {/* Vertical list of rooms — hairline between each */}
              <ul className="mt-14">
                {features.map((feature, i) => (
                  <li key={feature.title}>
                    <Link
                      to={feature.href}
                      className="group block hairline-t py-7 transition-colors duration-500 ease-spring"
                    >
                      <div className="grid grid-cols-12 gap-6 items-start">
                        <div className="col-span-2 md:col-span-1 text-caption text-foreground/30 pt-1">
                          0{i + 1}
                        </div>
                        <div className="col-span-1 md:col-span-1">
                          <feature.icon className="w-5 h-5 text-jade transition-transform duration-500 ease-spring group-hover:translate-x-1" strokeWidth={1.5} />
                        </div>
                        <div className="col-span-9 md:col-span-9">
                          <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-2 transition-colors duration-500 ease-spring group-hover:text-jade">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-foreground/60 leading-relaxed max-w-[52ch]">
                            {feature.description}
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex md:justify-end">
                          <ArrowRight className="w-4 h-4 text-foreground/30 mt-2 transition-all duration-500 ease-spring group-hover:text-jade group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                <li className="hairline-t" aria-hidden="true" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           PLATE III — A PAUSE  (Quiz callout)
           A wide intermission: the JurassicBackground bleeds
           edge-to-edge, treated like a panoramic mural. A single
           sentence rests on top — an invitation, not a pitch.
           ============================================================ */}
      <section className="relative">
        <div className="relative overflow-hidden">
          <div className="aspect-[21/9] md:aspect-[28/9] max-h-[420px]">
            <SmartImage
              src={paleoArt}
              alt="Paleo art landscape, twilight"
              className="absolute inset-0 w-full h-full"
              skeletonClassName=""
              imgClassName="object-cover w-full h-full scale-105 blur-[3px]"
              loading="lazy"
            />
          </div>
          {/* Heavy editorial vignette — pushes the mural back so type breathes */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, hsl(240 8% 4% / 0.75) 0%, hsl(240 8% 4% / 0.80) 60%, hsl(240 8% 4% / 0.95) 100%)'
            }}
            aria-hidden="true"
          />
          {/* Top hairline */}
          <div className="absolute top-0 inset-x-0 hairline-t" aria-hidden="true" />

          <div className="absolute inset-0 z-10 flex items-end">
            <div className="container-editorial w-full pb-16 md:pb-24">
              <div className="grid gap-10 md:grid-cols-12 items-end">
                <div className="md:col-span-8">
                  <div className="text-caption text-jade mb-6 flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" /> {t('editorial.rooms.learning')}
                  </div>
                  <h3 className="font-display text-display-lg text-foreground max-w-[20ch] tracking-tighter">
                    {t('home.features.education.description')}
                  </h3>
                </div>
                <div className="md:col-span-4 flex md:justify-end">
                  <Link to="/education">
                    <Button variant="accent" size="lg">
                      {t('home.hero.startQuiz')}
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Caption plate, like under the mural */}
              <div className="mt-10 inline-flex text-caption text-foreground/55 bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                Plate III · Paleo landscape · panoramic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           PLATE IV — SPECIMENS  (Favorites)
           A clean three-up portrait gallery. The brachiosaur backdrop
           lingers behind, very faint, so the room feels furnished
           without competing with the specimens themselves.
           ============================================================ */}
      <section className="relative py-32 overflow-hidden">
        {/* Faded backdrop — just enough to feel "in a room" */}
        <div
          className="absolute inset-0 z-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${jurassicBrachiosaurs})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(1) contrast(1.1)'
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-background/85 to-background" aria-hidden="true" />

        <div className="container-editorial relative z-10">
          <div className="grid gap-12 md:grid-cols-12 mb-20">
            <div className="md:col-span-4">
              <div className="text-caption text-jade mb-6">— {t('editorial.rooms.featured')}</div>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-display-xl text-foreground max-w-[16ch] tracking-tighter">
                {t('home.favorites.title')}
              </h2>
              <p className="mt-6 max-w-[52ch] text-base md:text-lg text-foreground/65 leading-relaxed">
                {t('home.favorites.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {favoriteDinosaurs.map((dino, index) => (
              <article key={index} className="group flex flex-col">
                <div
                  className={
                    'relative overflow-hidden rounded-3xl ring-1 ring-jade/25 shadow-[0_0_40px_-18px_hsl(158_86%_72%/0.4)] mb-6 ' +
                    // Slight asymmetric heights so the trio reads like a hung gallery
                    (index === 1 ? 'aspect-[3/4] md:mt-10' : 'aspect-[4/5]')
                  }
                >
                  <SmartImage
                    src={dino.imageUrl}
                    alt={dino.name}
                    className="absolute inset-0 w-full h-full"
                    skeletonClassName="rounded-3xl"
                    imgClassName="object-cover w-full h-full img-duotone-hover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                    Plate IV · 0{index + 1}
                  </div>
                </div>

                <div className={index === 1 ? 'md:mt-10' : ''}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground">
                      {dino.name}
                    </h3>
                    <span className="font-mono text-xs uppercase tracking-widest text-jade">
                      {dino.diet}
                    </span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-4">
                    {dino.scientificName} · {dino.period}
                  </p>
                  <p className="text-sm text-foreground/65 leading-relaxed line-clamp-3">
                    {dino.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           PLATE V — IN NUMBERS  (Stats)
           A closing room. A skull rests on the right like a vitrine
           specimen; the figures sit quietly to the left. The page
           ends the way a museum ends: with a single quiet artefact.
           ============================================================ */}
      <section className="relative py-32">
        <div className="hairline-t" />
        <div className="container-editorial pt-24">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 items-center">
            {/* Numbers */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="text-caption text-jade mb-8">— {t('editorial.rooms.inNumbers')}</div>
              <dl className="divide-y divide-foreground/8">
                {stats.map((stat) => (
                  <div key={stat.label} className="grid grid-cols-12 items-baseline gap-6 py-8">
                    <dt className="col-span-12 md:col-span-5 flex items-center gap-3 text-caption text-foreground/50">
                      <stat.icon className="w-4 h-4 text-jade" strokeWidth={1.5} />
                      {stat.label}
                    </dt>
                    <dd className="col-span-12 md:col-span-7 font-display text-display-lg tracking-[-0.04em] text-foreground leading-none">
                      {stat.value}
                    </dd>
                  </div>
                ))}
                <div className="hairline-t" aria-hidden="true" />
              </dl>
            </div>

            {/* Skull as closing artefact */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <figure className="relative overflow-hidden rounded-3xl ring-1 ring-jade/25 shadow-[0_0_50px_-20px_hsl(158_86%_72%/0.4)]">
                <div className="aspect-[4/5]">
                  <SmartImage
                    src={dinoArt2}
                    alt="Weathered dinosaur skull resting in undergrowth"
                    className="absolute inset-0 w-full h-full"
                    skeletonClassName="rounded-3xl"
                    imgClassName="object-cover w-full h-full img-duotone-hover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="absolute left-5 bottom-5 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                  Plate V · Cranial study
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Closing colophon */}
          <div className="hairline-t mt-24 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-caption text-foreground/40">— End of guide · return any time</p>
            <p className="text-caption text-foreground/40 hidden sm:block">dino.library · mmxxvi</p>
          </div>
        </div>
      </section>
    </div>
  );
}
