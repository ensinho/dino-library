import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PeriodTimelineProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function PeriodTimeline({ selectedPeriod, onPeriodChange }: PeriodTimelineProps) {
  const { t } = useTranslation();

  const periods = [
    {
      id: 'all',
      name: t('catalog.filters.allPeriods'),
      emoji: '🌍',
      years: 'All Time',
      color: 'from-gray-400 to-gray-600',
      description: 'All geological periods'
    },
    {
      id: 'triassic',
      name: t('catalog.periods.triassic'),
      emoji: '🌋',
      years: '252-201 MYA',
      color: 'from-red-500 to-orange-500',
      description: 'Early dinosaur evolution'
    },
    {
      id: 'jurassic',
      name: t('catalog.periods.jurassic'),
      emoji: '🌲',
      years: '201-145 MYA',
      color: 'from-green-500 to-emerald-500',
      description: 'Golden age of dinosaurs'
    },
    {
      id: 'cretaceous',
      name: t('catalog.periods.cretaceous'),
      emoji: '🌺',
      years: '145-66 MYA',
      color: 'from-purple-500 to-pink-500',
      description: 'Final dinosaur period'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t('catalog.filters.period')}</h3>
      
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-red-200 via-green-200 to-purple-200 rounded-full transform -translate-y-1/2" />
        
        {/* Period buttons */}
        <div className="relative flex justify-between items-center">
          {periods.map((period, index) => (
            <div key={period.id} className="flex flex-col items-center space-y-2">
              <Button
                variant={selectedPeriod === period.id ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodChange(period.id)}
                className={cn(
                  "relative z-10 w-16 h-16 rounded-full p-0 transition-all duration-300",
                  selectedPeriod === period.id
                    ? `bg-gradient-to-br ${period.color} text-white shadow-lg scale-110 border-2 border-white`
                    : "bg-background hover:scale-105 border-2 border-muted"
                )}
              >
                <div className="text-center">
                  <div className="text-lg">{period.emoji}</div>
                </div>
              </Button>
              
              <div className="text-center space-y-1">
                <div className={cn(
                  "text-xs font-medium transition-colors",
                  selectedPeriod === period.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {period.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {period.years}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected period description */}
      {selectedPeriod !== 'all' && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {periods.find(p => p.id === selectedPeriod)?.emoji}
            </span>
            <div>
              <h4 className="text-sm font-medium">
                {periods.find(p => p.id === selectedPeriod)?.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {periods.find(p => p.id === selectedPeriod)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}