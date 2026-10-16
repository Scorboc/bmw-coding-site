
import Icon from '@/components/ui/icon';

interface StageCardProps {
  stageId: string;
  stageName: string;
  isSelected: boolean;
  price: number;
  power: string | number;
  torque: string | number;
  onClick: () => void;
}

export default function StageCard({ 
  stageId, 
  stageName, 
  isSelected, 
  power, 
  torque, 
  onClick 
}: StageCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 text-left transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
      style={{
        background: stageId === 'stage1'
          ? (isSelected ? 'linear-gradient(135deg, rgba(0, 255, 0, 0.25) 0%, rgba(0, 255, 0, 0.35) 100%)' : 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.15) 100%)')
          : (isSelected ? 'linear-gradient(135deg, rgba(26, 8, 8, 0.9) 0%, rgba(10, 10, 15, 0.9) 100%)' : 'linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(26, 8, 8, 0.7) 100%)'),
        border: '2px solid',
        borderImage: stageId === 'stage1'
          ? (isSelected ? 'linear-gradient(135deg, rgba(0, 255, 0, 1) 0%, rgba(0, 255, 0, 0.8) 50%, rgba(0, 255, 0, 1) 100%) 1' : 'linear-gradient(135deg, rgba(0, 255, 0, 0.6) 0%, rgba(0, 255, 0, 0.5) 50%, rgba(0, 255, 0, 0.6) 100%) 1')
          : (isSelected ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.9) 0%, rgba(255, 0, 51, 0.9) 50%, rgba(0, 212, 255, 0.9) 50%, rgba(56, 189, 248, 0.9) 100%) 1' : 'linear-gradient(135deg, rgba(255, 0, 0, 0.5) 0%, rgba(255, 0, 51, 0.5) 50%, rgba(0, 212, 255, 0.5) 50%, rgba(56, 189, 248, 0.5) 100%) 1'),
        boxShadow: stageId === 'stage1'
          ? (isSelected ? '0 0 60px rgba(0, 255, 0, 0.8), inset 0 0 80px rgba(0, 255, 0, 0.25)' : '0 0 30px rgba(0, 255, 0, 0.5), inset 0 0 50px rgba(0, 255, 0, 0.15)')
          : (isSelected ? '0 0 40px rgba(127, 106, 127, 0.7), inset 0 0 60px rgba(127, 106, 127, 0.15)' : '0 0 20px rgba(127, 106, 127, 0.4), inset 0 0 40px rgba(0, 0, 0, 0.5)'),
        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
        animation: isSelected ? 'chiptuningPulse 2s ease-in-out infinite' : 'none'
      }}
    >
      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{ 
        background: stageId === 'stage1'
          ? (isSelected ? 'linear-gradient(to bottom right, rgba(0, 255, 0, 0.6), transparent)' : 'linear-gradient(to bottom right, rgba(0, 255, 0, 0.3), transparent)')
          : (isSelected ? 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.4), rgba(0, 212, 255, 0.2))' : 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.15), rgba(0, 212, 255, 0.1))'),
        clipPath: 'polygon(100% 0, 100% 100%, 0 0)' 
      }} />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(127, 106, 127, 0.3) 2px, rgba(127, 106, 127, 0.3) 4px)'
      }} />
      
      <div className="flex items-start justify-between mb-0.5 relative z-10">
        <div>
          <h3 
            className="text-white text-base mb-0.5 tracking-widest uppercase font-bold"
            style={{ 
              fontFamily: '"Reborn Technologies", sans-serif'
            }}
          >
            {stageName}
          </h3>
          <p 
            className="text-white/90 text-sm tracking-wider uppercase font-medium"
            style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
          >
            {power} Л.С. / {torque} НМ
          </p>
        </div>
        {isSelected && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5" style={{ background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.9), rgba(0, 212, 255, 0.9))', boxShadow: '0 0 10px rgba(127, 106, 127, 0.7)', animation: 'blinkIndicator 1s ease-in-out infinite' }} />
            <Icon name="Check" className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes chiptuningPulse {
          0%, 100% { 
            box-shadow: ${stageId === 'stage1' 
              ? '0 0 30px rgba(0, 255, 0, 0.5), inset 0 0 50px rgba(0, 255, 0, 0.15)' 
              : '0 0 20px rgba(127, 106, 127, 0.4), inset 0 0 40px rgba(0, 0, 0, 0.5)'}; 
          }
          50% { 
            box-shadow: ${stageId === 'stage1' 
              ? '0 0 45px rgba(0, 255, 0, 0.7), inset 0 0 65px rgba(0, 255, 0, 0.2)' 
              : '0 0 30px rgba(127, 106, 127, 0.6), inset 0 0 50px rgba(127, 106, 127, 0.1)'}; 
          }
        }
        
        @keyframes blinkIndicator {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </button>
  );
}
