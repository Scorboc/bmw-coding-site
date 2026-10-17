import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface MusicPlayerProps {
  isOpen: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const playlist = [
  '/music/track3.mp3',
  '/music/track2.mp3',
  '/music/1.mp3'
];

export default function MusicPlayer({ isOpen, audioRef }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackEnd = () => {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
      audio.src = playlist[nextIndex];
      if (!isMuted) {
        audio.play().catch(err => console.log('Play error:', err));
      }
    };

    audio.addEventListener('ended', handleTrackEnd);

    const handleBeforeUnload = () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentTrackIndex, isMuted, audioRef]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;

    if (isOpen) {
      setCurrentTrackIndex(0);
      audio.volume = 0.12;
    } else {
      audio.pause();
      audio.currentTime = 0;
      setIsMuted(false);
    }
  }, [isOpen, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== playlist[currentTrackIndex]) {
      audio.src = playlist[currentTrackIndex];
      if (!isMuted) {
        audio.play().catch(err => console.log('Play error:', err));
      }
    }
  }, [currentTrackIndex, isMuted, audioRef]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0.12;
      audio.play().catch(err => console.log('Play error:', err));
      setIsMuted(false);
    } else {
      audio.pause();
      setIsMuted(true);
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center transition-all hover:scale-110 z-10"
      style={{
        background: isMuted ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.3)',
        border: '2px solid rgba(255, 0, 0, 0.5)',
        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
        boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)'
      }}
      title={isMuted ? 'Включить звук' : 'Выключить звук'}
    >
      <Icon name={isMuted ? "VolumeX" : "Volume2"} className="w-5 h-5 text-red-400" />
    </button>
  );
}
