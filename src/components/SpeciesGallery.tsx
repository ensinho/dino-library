import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, Camera, Image as ImageIcon } from 'lucide-react';
import { DinosaurSpecies } from '@/services/dinosaurService';
import { dinoPicturesService, type DinoPicturesImage } from '@/services/dinoPicturesService';
import type { CarouselApi } from '@/components/ui/carousel';
import SmartImage from '@/components/SmartImage';

interface SpeciesGalleryProps {
  species: DinosaurSpecies;
}

export default function SpeciesGallery({ species }: SpeciesGalleryProps) {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [externalImages, setExternalImages] = useState<DinoPicturesImage[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [open, setOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    let cancelled = false;

    const name = (species.scientific_name || species.common_name || '').trim();
    if (!name) {
      setExternalImages([]);
      return;
    }

    setLoadingExternal(true);
    dinoPicturesService
      .getDinosaur(name)
      .then((enrichment) => {
        if (cancelled) return;
        const imgs = enrichment?.images || [];
        setExternalImages(imgs);
      })
      .catch(() => {
        if (cancelled) return;
        setExternalImages([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingExternal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [species.row_index, species.scientific_name, species.common_name]);

  // Keep carousel slide in sync when user clicks thumbnails.
  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.scrollTo(selectedImageIndex);
  }, [carouselApi, selectedImageIndex]);

  // When the user swipes/uses arrows, update selected index so title/thumbnail highlight match.
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap();
      setSelectedImageIndex(idx);
    };

    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  const images = useMemo(() => {
    const seen = new Set<string>();

    const merged: Array<{ url: string; title: string; description: string }> = [];

    const add = (url: string | null | undefined, title: string, description: string) => {
      const u = (url || '').trim();
      if (!u) return;
      if (seen.has(u)) return;
      seen.add(u);
      merged.push({ url: u, title, description });
    };

    const displayName = species.common_name || species.scientific_name || t('species.unknown');

    // 1) Firestore/main image first
    add(
      species.image_url || null,
      `${displayName} - Main View`,
      t('species.gallery.primary')
    );

    // 1.5) Firestore persisted gallery (from enrichment script)
    const stored = (species.image_urls || []).filter(Boolean);
    for (let i = 0; i < stored.length; i++) {
      add(
        stored[i],
        `${displayName} - ${t('species.gallery.image')} ${merged.length + 1}`,
        t('species.gallery.externalSource')
      );
      if (merged.length >= 12) break;
    }

    // 2) Then unique external images
    const ext = externalImages || [];
    for (let i = 0; i < ext.length; i++) {
      const img = ext[i];
      add(
        img.url,
        `${displayName} - ${t('species.gallery.image')} ${i + 1}`,
        img.sourceDisplay || img.sourceUrl || t('species.gallery.externalSource')
      );

      if (merged.length >= 12) break; // keep UI snappy
    }

    // 3) If nothing, placeholder
    if (!merged.length) {
      merged.push({
        url: '/placeholder.svg',
        title: `${displayName}`,
        description: t('species.gallery.noImages'),
      });
    }

    return merged;
  }, [externalImages, species.common_name, species.scientific_name, species.image_url, t]);

  if (images.length <= 1 && !species.image_url) {
    return (
      <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{t('species.gallery.noImages')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loadingExternal && (
        <p className="text-center text-sm text-muted-foreground">
          {t('species.gallery.loading')}
        </p>
      )}
      {/* Main Carousel */}
      <div className="relative">
        <Carousel className="w-full max-w-2xl mx-auto" setApi={setCarouselApi}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative group">
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setOpen(true);
                        }}
                        aria-label={t('species.gallery.viewLarge')}
                      >
                        <SmartImage
                          src={image.url}
                          alt={image.title}
                          className="w-full h-80"
                          skeletonClassName="rounded-xl"
                          imgClassName="object-cover rounded-xl shadow-fossil cursor-pointer transition-transform group-hover:scale-105"
                        />

                        {/* Overlay with zoom icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex items-center gap-2 pointer-events-none"
                          >
                            <ZoomIn className="h-4 w-4" />
                            {t('species.gallery.viewLarge')}
                          </Button>
                        </div>
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-5xl w-full h-[80vh]">
                      <div className="h-full flex flex-col">
                        <div className="flex-1 relative">
                          <SmartImage
                            src={images[selectedImageIndex]?.url}
                            alt={images[selectedImageIndex]?.title}
                            className="w-full h-full"
                            skeletonClassName="rounded-md"
                            imgClassName="object-contain rounded-md"
                          />
                        </div>

                        {images.length > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                              disabled={selectedImageIndex === 0}
                            >
                              {t('species.gallery.previous')}
                            </Button>

                            <span className="text-sm text-muted-foreground">
                              {selectedImageIndex + 1} {t('species.gallery.of')} {images.length}
                            </span>

                            <Button
                              variant="outline"
                              onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                              disabled={selectedImageIndex === images.length - 1}
                            >
                              {t('species.gallery.next')}
                            </Button>
                          </div>
                        )}

                        <div className="text-center mt-2">
                          <p className="font-semibold">{images[selectedImageIndex]?.title}</p>
                          <p className="text-sm text-muted-foreground">{images[selectedImageIndex]?.description}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Image counter */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                    {index + 1} / {images.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImageIndex === index 
                  ? 'border-amber ring-2 ring-amber/20' 
                  : 'border-muted hover:border-amber/50'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">{images[selectedImageIndex]?.title}</h3>
        <p className="text-sm text-muted-foreground">{images[selectedImageIndex]?.description}</p>
      </div>

      {/* Full-screen Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            {t('species.gallery.viewFullGallery')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <div className="h-full flex flex-col">
            <div className="flex-1 relative">
              <img
                src={images[selectedImageIndex]?.url}
                alt={images[selectedImageIndex]?.title}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Navigation in dialog */}
            {images.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  disabled={selectedImageIndex === 0}
                >
                  {t('species.gallery.previous')}
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {selectedImageIndex + 1} {t('species.gallery.of')} {images.length}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                  disabled={selectedImageIndex === images.length - 1}
                >
                  {t('species.gallery.next')}
                </Button>
              </div>
            )}
            
            <div className="text-center mt-2">
              <p className="font-semibold">{images[selectedImageIndex]?.title}</p>
              <p className="text-sm text-muted-foreground">{images[selectedImageIndex]?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}