

import type { ChiptuningData } from './types';

interface EngineStepProps {
  engines: ChiptuningData[];
  selectedBody: string | null;
  onSelectEngine: (engine: ChiptuningData) => void;
}

export default function EngineStep({ engines, selectedBody, onSelectEngine }: EngineStepProps) {
  return (
    <>
      <div 
        className="p-2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(26, 8, 8, 0.8) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.6) 0%, rgba(0, 212, 255, 0.6) 100%) 1',
          boxShadow: '0 0 20px rgba(127, 106, 127, 0.4)',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
        }}
      >
        <div className="absolute top-0 right-0 w-10 h-10 pointer-events-none" style={{ 
          background: 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.3), rgba(0, 212, 255, 0.2))',
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)' 
        }} />
        <p 
          className="text-white/80 text-[10px] mb-1 tracking-widest uppercase"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          /// КУЗОВ
        </p>
        <p 
          className="text-white text-sm tracking-wider font-bold"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          {selectedBody}
        </p>
      </div>

      <div className="space-y-1">
        {engines.map((engine, idx) => (
          <button
            key={idx}
            onClick={() => onSelectEngine(engine)}
            className="w-full p-1.5 text-left transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(26, 8, 8, 0.7) 100%)',
              border: '1px solid',
              borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.4) 0%, rgba(0, 212, 255, 0.4) 100%) 1',
              boxShadow: '0 0 15px rgba(127, 106, 127, 0.3)',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'
            }}
          >
            <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none" style={{ 
              background: 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.2), transparent)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 0)' 
            }} />
            
            <div className="relative z-10">
              <p 
                className="text-white text-sm mb-0.5 tracking-wider font-bold uppercase"
                style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
              >
                {engine.engine_code}
              </p>
              <div className="flex items-center gap-2">
                <p 
                  className="text-white/70 text-xs tracking-wide uppercase font-medium"
                  style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
                >
                  СТОК: {engine.stock.power} Л.С. / {engine.stock.torque} НМ
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
