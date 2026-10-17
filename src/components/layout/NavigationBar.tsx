import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Adaptive } from '@/components/ui/responsive';
import CitySelector, { City } from '@/components/CitySelector';

interface NavigationBarProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  showCityPulse: boolean;
}

const menuItems = [
  { id: 'services', label: 'Услуги', icon: 'Wrench', type: 'scroll' },
  { id: 'chip-tuning', label: 'Чип-тюнинг', icon: 'Zap', type: 'link' },
  { id: 'coding', label: 'Кодирование', icon: 'Code', type: 'link' },
  { id: 'keys', label: 'Ключи', icon: 'Key', type: 'link' },
  { id: 'ecology', label: 'Экология', icon: 'Leaf', type: 'link' },
  { id: 'tips', label: 'Рекомендации', icon: 'Lightbulb', type: 'scroll' },
  { id: 'reviews', label: 'Отзывы', icon: 'Star', type: 'scroll' },
  { id: 'about', label: 'О нас', icon: 'Info', type: 'link' },
  { id: 'blog', label: 'Блог', icon: 'FileText', type: 'link' },
  { id: 'chatgpt', label: 'AI', icon: 'Bot', type: 'link' },
  { id: 'contact', label: 'Контакты', icon: 'MapPin', type: 'scroll' },
];

const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

function NavigationBarMobile({ selectedCity, onCityChange, showCityPulse }: NavigationBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (item: typeof menuItems[0]) => {
    vibrate(10);
    setIsMenuOpen(false);
    
    if (item.type === 'link') {
      window.location.href = `/${item.id}`;
    } else {
      const element = document.getElementById(item.id);
      if (element) {
        const offset = item.id === 'services' ? 100 : 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        window.location.href = `/#${item.id}`;
      }
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-b from-black/90 via-black/80 to-transparent border-b border-blue-500/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
            onClick={() => {
              vibrate(15);
              setIsMenuOpen(!isMenuOpen);
            }}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded blur-sm group-hover:blur-md transition-all" />
              <Icon name="Menu" className="w-4 h-4 text-blue-400 relative" />
            </div>
            <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
          </button>
          
          <div className="flex items-center gap-2 text-white/60 text-[10px]">
            <div className="relative">
              {showCityPulse && (
                <div className="absolute -inset-2 bg-blue-500/30 rounded-lg animate-pulse" />
              )}
              <CitySelector selectedCity={selectedCity} onCityChange={onCityChange} />
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
            onClick={() => { vibrate(5); setIsMenuOpen(false); }}
          />
          
          <div className="fixed top-16 left-4 right-4 z-[48] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-3 gap-2 p-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 min-h-[70px]"
                >
                  <Icon name={item.icon} className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-light text-xs text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NavigationBarDesktop({ selectedCity, onCityChange, showCityPulse }: NavigationBarProps) {
  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.type === 'link') {
      window.location.href = `/${item.id}`;
    } else {
      const element = document.getElementById(item.id);
      if (element) {
        const offset = item.id === 'services' ? 100 : 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        window.location.href = `/#${item.id}`;
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-b from-black/90 via-black/80 to-transparent border-b border-blue-500/10">
      <div className="px-8 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-1">
          {menuItems.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <button
                onClick={() => handleMenuClick(item)}
                className="text-white/70 hover:text-blue-400 text-sm font-light transition-all px-3 py-2 rounded-lg hover:bg-blue-500/5 whitespace-nowrap"
              >
                {item.label}
              </button>
              {index < menuItems.length - 1 && (
                <div className="text-white/30 mx-1">·</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-white/60 text-sm">
          <div className="relative">
            {showCityPulse && (
              <>
                <div className="absolute -inset-2 bg-blue-500/30 rounded-lg animate-pulse" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Icon name="MapPin" className="w-3 h-3" />
                    <span>Выберите город</span>
                  </div>
                </div>
              </>
            )}
            <CitySelector selectedCity={selectedCity} onCityChange={onCityChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavigationBarWrapperProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  showCityPulse: boolean;
}

export default function NavigationBar({ selectedCity, onCityChange, showCityPulse }: NavigationBarWrapperProps) {
  return (
    <Adaptive
      mobile={<NavigationBarMobile selectedCity={selectedCity} onCityChange={onCityChange} showCityPulse={showCityPulse} />}
      desktop={<NavigationBarDesktop selectedCity={selectedCity} onCityChange={onCityChange} showCityPulse={showCityPulse} />}
    />
  );
}
