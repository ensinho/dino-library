import React, { useState } from 'react';
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

interface SpeciesGalleryProps {
  species: DinosaurSpecies;
}

export default function SpeciesGallery({ species }: SpeciesGalleryProps) {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // For now, we'll create a gallery with the main image and some placeholder images
  // In a real implementation, you'd fetch multiple images from your database
  const images = [
    {
      url: species.image_url || '/placeholder.svg',
      title: `${species.common_name || species.scientific_name} - Main View`,
      description: 'Primary illustration of the species'
    },
    // Add some conceptual additional images (these would come from your database)
    ...(species.image_url ? [
      {
        url: species.image_url,
        title: `${species.common_name || species.scientific_name} - Skeleton`,
        description: 'Skeletal reconstruction showing bone structure'
      },
      {
        url: species.image_url,
        title: `${species.common_name || species.scientific_name} - Habitat`,
        description: 'Artistic representation in natural habitat'
      },
      {
        url: species.image_url,
        title: `${species.common_name || species.scientific_name} - Fossil`,
        description: 'Actual fossil remains discovered'
      }
    ] : [])
  ];

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
      {/* Main Carousel */}
      <div className="relative">
        <Carousel className="w-full max-w-2xl mx-auto">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-80 object-cover rounded-xl shadow-fossil cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImageIndex(index)}
                  />
                  
                  {/* Overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                      <ZoomIn className="h-4 w-4" />
                      {t('species.gallery.viewLarge')}
                    </Button>
                  </div>
                  
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
      <Dialog>
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