import { useState, useEffect, useRef, memo } from 'react';
import Icon from '@/components/ui/icon';
import { Adaptive } from '@/components/ui/responsive';
import SeriesSelector from './coding/SeriesSelector';
import OptionsList from './coding/OptionsList';
import { options, calculatePrice } from './coding/codingData';
import { getCityName, getCityConfig } from '@/utils/cityConfig';
import { City } from '@/components/CitySelector';

interface CodingPackagesProps {
  selectedCity: City;
}

const CodingPackagesMobile = memo(function CodingPackagesMobile({ selectedCity }: CodingPackagesProps) {
  const [selectedSeries, setSelectedSeries] = useState<'F' | 'G' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('comfort');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (selectedSeries) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/music/1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.05;
        audioRef.current.play().catch(() => {});
      }

      const handleVisibilityChange = () => {
        if (document.hidden && audioRef.current) {
          audioRef.current.pause();
          setIsMuted(true);
        }
      };

      const handleBeforeUnload = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };

      const handlePageHide = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsMuted(true);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [selectedSeries]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = 0.05;
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const handleSendConfig = () => {
    const selectedItems = Array.from(selectedOptions)
      .map(id => options.find(o => o.id === id))
      .filter(Boolean)
      .map(o => `• ${o!.name}`)
      .join('\n');
    
    const selectedCount = selectedOptions.size;
    const pricing = calculatePrice(selectedCount);
    
    let message = `Конфигурация опций BMW ${selectedSeries}-series:\n\n${selectedItems}\n\n`;
    message += `Количество опций: ${selectedCount}\n`;
    if (pricing.discount > 0) {
      message += `Скидка: ${pricing.discount}%\n`;
      message += `Было: ${pricing.original.toLocaleString('ru-RU')} ₽\n`;
    }
    message += `Итого: ${pricing.total.toLocaleString('ru-RU')} ₽\n`;
    message += `Город: ${getCityName(selectedCity)}`;
    
    const config = getCityConfig(selectedCity);
    window.open(`${config.telegram}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSeriesChange = (series: 'F' | 'G') => {
    setSelectedSeries(series);
    setSelectedOptions(new Set());
  };

  const handleBack = () => {
    setSelectedSeries(null);
    setSelectedOptions(new Set());
  };

  return (
    <div className="mb-12 px-4 relative">
      {selectedSeries && (
        <button
          onClick={toggleMute}
          className="absolute top-0 right-4 w-10 h-10 flex items-center justify-center transition-all hover:scale-110 z-10 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-400/50 rounded-lg"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          <Icon name={isMuted ? "VolumeX" : "Volume2"} className="w-5 h-5 text-blue-400" />
        </button>
      )}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Icon name="Wrench" className="w-6 h-6 text-[#81C4FF]" />
          <h2 className="font-light text-white text-xl">Конфигуратор опций</h2>
        </div>
        <p className="text-white/60 text-xs">Соберите свой пакет кодировок</p>
      </div>

      {!selectedSeries ? (
        <SeriesSelector onSelectSeries={handleSeriesChange} />
      ) : (
        <OptionsList
          selectedSeries={selectedSeries}
          selectedOptions={selectedOptions}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onToggleOption={toggleOption}

          onSendConfig={handleSendConfig}
          onBack={handleBack}
        />
      )}
    </div>
  );
});

const CodingPackagesDesktop = memo(function CodingPackagesDesktop({ selectedCity }: CodingPackagesProps) {
  const [selectedSeries, setSelectedSeries] = useState<'F' | 'G' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('comfort');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (selectedSeries) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/music/1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.12;
        audioRef.current.play().catch(() => {});
      }

      const handleVisibilityChange = () => {
        if (document.hidden && audioRef.current) {
          audioRef.current.pause();
          setIsMuted(true);
        }
      };

      const handleBeforeUnload = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };

      const handlePageHide = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsMuted(true);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [selectedSeries]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = 0.12;
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const handleSendConfig = () => {
    const selectedItems = Array.from(selectedOptions)
      .map(id => options.find(o => o.id === id))
      .filter(Boolean)
      .map(o => `• ${o!.name}`)
      .join('\n');
    
    const selectedCount = selectedOptions.size;
    const pricing = calculatePrice(selectedCount);
    
    let message = `Конфигурация опций BMW ${selectedSeries}-series:\n\n${selectedItems}\n\n`;
    message += `Количество опций: ${selectedCount}\n`;
    if (pricing.discount > 0) {
      message += `Скидка: ${pricing.discount}%\n`;
      message += `Было: ${pricing.original.toLocaleString('ru-RU')} ₽\n`;
    }
    message += `Итого: ${pricing.total.toLocaleString('ru-RU')} ₽\n`;
    message += `Город: ${getCityName(selectedCity)}`;
    
    const config = getCityConfig(selectedCity);
    window.open(`${config.telegram}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSeriesChange = (series: 'F' | 'G') => {
    setSelectedSeries(series);
    setSelectedOptions(new Set());
  };

  const handleBack = () => {
    setSelectedSeries(null);
    setSelectedOptions(new Set());
  };

  return (
    <div className="mb-16 relative">
      {selectedSeries && (
        <button
          onClick={toggleMute}
          className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center transition-all hover:scale-110 z-10 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-400/50 rounded-lg"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          <Icon name={isMuted ? "VolumeX" : "Volume2"} className="w-6 h-6 text-blue-400" />
        </button>
      )}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon name="Wrench" className="w-8 h-8 text-[#81C4FF]" />
          <h2 className="font-light text-white text-3xl">Конфигуратор опций BMW</h2>
        </div>
        <p className="text-white/60 text-sm">Выберите серию и соберите свой пакет кодировок</p>
      </div>

      {!selectedSeries ? (
        <SeriesSelector onSelectSeries={handleSeriesChange} />
      ) : (
        <OptionsList
          selectedSeries={selectedSeries}
          selectedOptions={selectedOptions}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onToggleOption={toggleOption}

          onSendConfig={handleSendConfig}
          onBack={handleBack}
        />
      )}


    </div>
  );
});

export default memo(function CodingPackages({ selectedCity }: CodingPackagesProps) {
  return (
    <Adaptive
      mobile={<CodingPackagesMobile selectedCity={selectedCity} />}
      desktop={<CodingPackagesDesktop selectedCity={selectedCity} />}
    />
  );
});
