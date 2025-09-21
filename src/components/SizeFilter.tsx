import React from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Ruler, RotateCcw } from 'lucide-react';

interface SizeFilterProps {
  lengthRange: [number, number];
  onLengthRangeChange: (range: [number, number]) => void;
  heightRange: [number, number];
  onHeightRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

export default function SizeFilter({ 
  lengthRange, 
  onLengthRangeChange, 
  heightRange, 
  onHeightRangeChange,
  onReset 
}: SizeFilterProps) {
  const { t } = useTranslation();

  const maxLength = 50; // Maximum length in meters
  const maxHeight = 20; // Maximum height in meters

  const getSizeCategory = (length: number) => {
    if (length < 3) return { name: 'Small', emoji: '🐕', color: 'text-blue-500' };
    if (length < 10) return { name: 'Medium', emoji: '🐎', color: 'text-yellow-500' };
    if (length < 20) return { name: 'Large', emoji: '🐘', color: 'text-orange-500' };
    return { name: 'Giant', emoji: '🦕', color: 'text-red-500' };
  };

  const lengthCategory = getSizeCategory(lengthRange[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center">
          <Ruler className="mr-2 h-4 w-4" />
          {t('catalog.filters.size')}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="text-xs"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          {t('catalog.filters.reset')}
        </Button>
      </div>

      {/* Length Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">
            {t('catalog.stats.length')}
          </label>
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${lengthCategory.color}`}>
              {lengthCategory.emoji}
            </span>
            <span className="text-sm font-medium">
              {lengthRange[0]}m - {lengthRange[1]}m
            </span>
          </div>
        </div>
        
        <Slider
          value={lengthRange}
          onValueChange={(value) => onLengthRangeChange(value as [number, number])}
          max={maxLength}
          min={0}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0m</span>
          <span className="text-center">{lengthCategory.name}</span>
          <span>{maxLength}m</span>
        </div>
      </div>

      {/* Height Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">
            {t('catalog.stats.height')}
          </label>
          <span className="text-sm font-medium">
            {heightRange[0]}m - {heightRange[1]}m
          </span>
        </div>
        
        <Slider
          value={heightRange}
          onValueChange={(value) => onHeightRangeChange(value as [number, number])}
          max={maxHeight}
          min={0}
          step={0.5}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0m</span>
          <span>{maxHeight}m</span>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h4 className="text-xs font-medium mb-2">{t('catalog.filters.sizeComparison')}</h4>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="text-xs">
            <div className="text-lg text-blue-500">🐕</div>
            <div className="text-muted-foreground">Small</div>
            <div className="text-muted-foreground">&lt;3m</div>
          </div>
          <div className="text-xs">
            <div className="text-lg text-yellow-500">🐎</div>
            <div className="text-muted-foreground">Medium</div>
            <div className="text-muted-foreground">3-10m</div>
          </div>
          <div className="text-xs">
            <div className="text-lg text-orange-500">🐘</div>
            <div className="text-muted-foreground">Large</div>
            <div className="text-muted-foreground">10-20m</div>
          </div>
          <div className="text-xs">
            <div className="text-lg text-red-500">🦕</div>
            <div className="text-muted-foreground">Giant</div>
            <div className="text-muted-foreground">&gt;20m</div>
          </div>
        </div>
      </div>
    </div>
  );
}