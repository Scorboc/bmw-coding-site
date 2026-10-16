import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { MobileOnly } from '@/components/ui/responsive';
import { City } from '@/components/CitySelector';
import { getTelegramLink } from '@/utils/cityConfig';
import { getCityConfig } from '@/utils/cityConfig';
import { trackContactClick } from '@/utils/analytics';

const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

interface StickyContactButtonProps {
  selectedCity: City;
}

export default function StickyContactButton({ selectedCity }: StickyContactButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const handleToggle = () => {
    vibrate(15);
    setIsExpanded(!isExpanded);
  };

  const handleLinkClick = () => {
    vibrate(10);
  };

  const cityConfig = getCityConfig(selectedCity);

  return (
    <MobileOnly>
      <div ref={containerRef} className="fixed bottom-6 right-4 z-50">
        {isExpanded && (
          <div className="absolute bottom-16 right-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <a 
              href={`tel:${cityConfig.phone}`}
              onClick={() => {
                handleLinkClick();
                trackContactClick('phone', selectedCity);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 min-h-[44px]"
            >
              <Icon name="Phone" className="w-5 h-5 text-white" />
              <span className="text-white font-light text-sm whitespace-nowrap">{cityConfig.displayPhone}</span>
            </a>
            
            <a 
              href={getTelegramLink(selectedCity, 'консультация')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                handleLinkClick();
                trackContactClick('telegram', selectedCity);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 min-h-[44px] mt-1"
            >
              <Icon name="Send" className="w-5 h-5 text-white" />
              <span className="text-white font-light text-sm whitespace-nowrap">Telegram</span>
            </a>
          </div>
        )}
        
        <button
          aria-label="Открыть контакты" onClick={handleToggle}
          className="min-w-[56px] min-h-[56px] w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse"
          style={{
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.7)',
            animationDuration: '3s'
          }}
        >
          {isExpanded ? (
            <Icon name="X" className="w-6 h-6 text-white" />
          ) : (
            <Icon name="MessageCircle" className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </MobileOnly>
  );
}
