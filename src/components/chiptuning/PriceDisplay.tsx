
import Icon from '@/components/ui/icon';

interface PriceDisplayProps {
  finalPrice: number;
  selectedStage: 'stage1' | 'stage2' | null;
  euro2Enabled: boolean;
  dieselOptions: { egr: boolean; dpf: boolean; flaps: boolean; adblue: boolean };
  transmissionTuningEnabled: boolean;
  isDiesel: boolean;
  onOrder: () => void;
}

export default function PriceDisplay({ 
  finalPrice, 
  selectedStage, 
  euro2Enabled, 
  dieselOptions, 
  transmissionTuningEnabled,
  isDiesel, 
  onOrder 
}: PriceDisplayProps) {
  const hasAnyOption = selectedStage || euro2Enabled || transmissionTuningEnabled || (isDiesel && (dieselOptions.egr || dieselOptions.dpf || dieselOptions.flaps || dieselOptions.adblue));

  return (
    <div 
      className="p-3 flex flex-col gap-2 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9) 0%, rgba(26, 8, 8, 0.9) 100%)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.6) 0%, rgba(0, 212, 255, 0.6) 100%) 1',
        boxShadow: hasAnyOption
          ? '0 0 40px rgba(127, 106, 127, 0.6), inset 0 0 40px rgba(127, 106, 127, 0.2)'
          : '0 0 10px rgba(100, 100, 100, 0.3)',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
      }}
    >
      <button 
        onClick={onOrder}
        disabled={!hasAnyOption}
        className={`
          w-full p-2.5 flex items-center justify-center gap-2 
          transition-all duration-300 relative overflow-hidden
          ${hasAnyOption
            ? 'hover:scale-[1.02] cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
          }
        `}
        style={{
          background: hasAnyOption
            ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.4) 0%, rgba(0, 212, 255, 0.4) 100%)'
            : 'linear-gradient(135deg, rgba(60, 60, 60, 0.3) 0%, rgba(40, 40, 40, 0.3) 100%)',
          border: '2px solid',
          borderImage: hasAnyOption
            ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.8) 0%, rgba(0, 212, 255, 0.8) 100%) 1'
            : 'linear-gradient(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(80, 80, 80, 0.3) 100%) 1',
          boxShadow: hasAnyOption
            ? '0 0 40px rgba(127, 106, 127, 0.6), inset 0 0 40px rgba(127, 106, 127, 0.2)'
            : '0 0 10px rgba(100, 100, 100, 0.3)',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
          animation: hasAnyOption ? 'orderButtonPulse 2s ease-in-out infinite' : 'none'
        }}
      >
        <Icon name={hasAnyOption ? "Send" : "AlertCircle"} className="w-4 h-4 text-white" />
        <span 
          className="text-white text-xs tracking-widest uppercase font-bold"
          style={{ 
            fontFamily: '"Reborn Technologies", sans-serif'
          }}
        >
          {hasAnyOption ? '/// ЗАКАЗАТЬ' : '/// ВЫБЕРИТЕ ОПЦИЮ'}
        </span>
      </button>
      
      <div className="flex justify-between items-baseline">
        <span 
          className="text-white/70 text-xs tracking-wider uppercase"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          ИТОГО:
        </span>
        <span 
          className="text-2xl font-bold tracking-wider"
          style={{ 
            fontFamily: '"Reborn Technologies", sans-serif',
            color: hasAnyOption ? '#00FF00' : '#666666'
          }}
        >
          {finalPrice.toLocaleString('ru-RU')}₽
        </span>
      </div>
      
      <style>{`
        @keyframes orderButtonPulse {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(127, 106, 127, 0.5), inset 0 0 30px rgba(127, 106, 127, 0.15);
          }
          50% { 
            box-shadow: 0 0 45px rgba(127, 106, 127, 0.7), inset 0 0 45px rgba(127, 106, 127, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
