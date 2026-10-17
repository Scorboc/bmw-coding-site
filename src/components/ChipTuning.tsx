import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import MusicPlayer from './chiptuning/MusicPlayer';
import SeriesSelector, { type Series } from './chiptuning/SeriesSelector';
import StageSelector from './chiptuning/StageSelector';

interface ChipTuningProps {
  selectedCity: City;
  isOpen: boolean;
  onClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

type DepthLevel = 'series' | 'body' | 'engine' | 'stage';

export default function ChipTuning({ selectedCity, isOpen, onClose, audioRef }: ChipTuningProps) {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [depthLevel, setDepthLevel] = useState<DepthLevel>('series');

  useEffect(() => {
    if (!isOpen) {
      setSelectedSeries(null);
      setDepthLevel('series');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen, audioRef]);

  useEffect(() => {
    const cleanupAudio = audioRef.current;
    // Останавливаем музыку при закрытии/перезагрузке страницы
    const handleBeforeUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    const handlePageHide = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupAudio?.pause();
      if (cleanupAudio) cleanupAudio.currentTime = 0;
    };
  }, [audioRef]);

  const handleReset = () => {
    setSelectedSeries(null);
    setDepthLevel('series');
  };

  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setDepthLevel('body');
  };

  const lightsOpacity = depthLevel === 'series' ? 1 : depthLevel === 'body' ? 0.5 : depthLevel === 'engine' ? 0.2 : 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20"
      onClick={onClose}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-0" />

      {/* Modal content */}
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto z-20"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0808 50%, #0a0a0f 100%)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #ff0000 0%, #ff0033 50%, #ff0000 100%) 1',
          boxShadow: '0 0 40px rgba(255, 0, 0, 0.4), inset 0 0 80px rgba(0, 0, 0, 0.8), 0 40px 100px rgba(0, 0, 0, 0.8)',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Diagonal corner cuts - NFS MW style */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-600/50 to-transparent pointer-events-none" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-red-600/50 to-transparent pointer-events-none" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
        
        {/* Police lights wrapper — opacity controlled by depth */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{ opacity: lightsOpacity }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(255, 0, 0, 0.12)',
              animation: 'policeRedFlash 0.8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 150, 255, 0.12)',
              animation: 'policeBlueFlash 0.8s ease-in-out infinite'
            }}
          />
        </div>

        <style>{`
          @keyframes policeRedFlash {
            0%, 100% { opacity: 0.15; }
            15% { opacity: 1; }
            30% { opacity: 0.1; }
            45% { opacity: 0.9; }
            60% { opacity: 0.05; }
          }
          @keyframes policeBlueFlash {
            0%, 100% { opacity: 0.05; }
            60% { opacity: 0.15; }
            75% { opacity: 1; }
            85% { opacity: 0.1; }
            95% { opacity: 0.9; }
          }
        `}</style>

        {/* Grunge scratches overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 0, 0, 0.15) 2px, rgba(255, 0, 0, 0.15) 4px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 0, 0, 0.08) 3px, rgba(255, 0, 0, 0.08) 6px)',
            mixBlendMode: 'overlay'
          }}
        />

        {/* Music player controls - top left */}
        <MusicPlayer isOpen={isOpen} audioRef={audioRef} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center transition-all z-10 group"
          style={{
            background: 'linear-gradient(135deg, #ff0000 0%, #ff0033 100%)',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.6), inset 0 0 10px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Icon name="X" className="w-5 h-5 text-black group-hover:text-white transition-colors" />
        </button>

        <div className="p-6">
          {/* Header - NFS MW style */}
          <div className="relative mb-8">
            {/* Top accent bar */}
            <div 
              className="h-1 mb-6"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #ff0000 20%, #ff0033 50%, #ff0000 80%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)'
              }}
            />
            
            <div className="flex items-center justify-center px-4">
              <img 
                src="/media/rebornlogo.png"
                alt="Reborn Technologies" 
                className="h-16 md:h-20 w-auto object-contain"
              />
            </div>
            
            {/* Bottom accent bar */}
            <div 
              className="h-0.5 mt-6"
              style={{
                background: 'linear-gradient(90deg, #ff0000 0%, transparent 50%, #ff0000 100%)',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
              }}
            />
          </div>

          {!selectedSeries ? (
            <SeriesSelector 
              onSelectSeries={handleSelectSeries}
            />
          ) : (
            <StageSelector 
              selectedSeries={selectedSeries}
              selectedCity={selectedCity}
              onReset={handleReset}
              onStepChange={(step) => setDepthLevel(step as DepthLevel)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
