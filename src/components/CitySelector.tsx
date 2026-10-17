import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

export type City = 'saratov' | 'moscow';

interface CitySelectorProps {
  onCityChange: (city: City) => void;
  selectedCity: City;
}

const cities = [
  { id: 'saratov' as City, name: 'Саратов', icon: 'MapPin' }
];

export default function CitySelector({ onCityChange, selectedCity }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleCitySelect = (city: City) => {
    onCityChange(city);
    setIsOpen(false);
  };

  const currentCity = cities.find(c => c.id === selectedCity);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-400/40 text-white hover:border-blue-400/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] min-h-[44px]"
      >
        <Icon name={currentCity?.icon ?? 'MapPin'} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
        <span className="text-xs md:text-sm font-medium">{currentCity?.name}</span>
        <Icon name="ChevronDown" className={`w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 min-w-[140px] bg-gradient-to-br from-blue-600/95 to-cyan-600/95 backdrop-blur-xl rounded-lg shadow-2xl border border-blue-400/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/10 ${
                selectedCity === city.id ? 'bg-white/5' : ''
              }`}
            >
              <Icon name={city.icon} className="w-4 h-4 text-white" />
              <span className="text-sm font-light text-white">{city.name}</span>
              {selectedCity === city.id && (
                <Icon name="Check" className="w-4 h-4 text-blue-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
