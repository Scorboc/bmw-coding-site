type Series = '1 SERIES' | '2 SERIES' | '3 SERIES' | '4 SERIES' | '5 SERIES' | '6 SERIES' | '7 SERIES' | '8 SERIES' | 'X1' | 'X2' | 'X3' | 'X4' | 'X5' | 'X6' | 'X7' | 'XM' | 'Z4';

const seriesList: Series[] = [
  '1 SERIES', '2 SERIES', '3 SERIES', '4 SERIES', 
  '5 SERIES', '6 SERIES', '7 SERIES', '8 SERIES',
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4'
];

interface SeriesSelectorProps {
  showLights?: boolean;
  onSelectSeries: (series: Series) => void;
}

export default function SeriesSelector({ onSelectSeries }: SeriesSelectorProps) {
  const borderGradient = 'linear-gradient(135deg, rgba(255, 0, 0, 0.7) 0%, rgba(255, 0, 51, 0.7) 50%, rgba(0, 212, 255, 0.7) 50%, rgba(56, 189, 248, 0.7) 100%)';
  const glowColor = 'rgba(127, 106, 127, 0.5)';

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      {seriesList.map((series) => (
        <div key={series} className="relative">
          <div 
            className="absolute inset-0 bg-black rounded-lg"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
            }}
          />
          
          <button
            onClick={() => onSelectSeries(series)}
            className="group relative transition-all duration-300 hover:scale-105 active:scale-95 w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 8, 8, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid transparent',
              backgroundImage: `linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 8, 8, 0.95) 100%), ${borderGradient}`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: `0 0 15px ${glowColor}, inset 0 0 30px rgba(0, 0, 0, 0.6)`,
              minHeight: '140px',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
            }}
          >
          <div 
            className="absolute top-0 right-0 w-12 h-12 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ 
              background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.6')}, transparent)`,
              clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
            }} 
          />
          <div 
            className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ 
              background: `linear-gradient(to top right, ${glowColor.replace('0.5', '0.6')}, transparent)`,
              clipPath: 'polygon(0 100%, 100% 100%, 0 0)'
            }} 
          />
          
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${glowColor.replace('0.5', '0.3')}, transparent 70%)`,
              boxShadow: `inset 0 0 60px ${glowColor.replace('0.5', '0.3')}`
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${glowColor.replace('0.5', '0.3')} 2px, ${glowColor.replace('0.5', '0.3')} 4px)`
            }}
          />
          
          <div className="relative z-10 p-6 flex flex-col items-center justify-center h-full">
            <div 
              className="absolute top-2 left-2 w-8 h-0.5 group-hover:w-12 transition-all"
              style={{ 
                background: borderGradient,
                boxShadow: `0 0 10px ${glowColor}` 
              }}
            />
            <div 
              className="absolute top-2 left-2 w-0.5 h-8 group-hover:h-12 transition-all"
              style={{ 
                background: borderGradient,
                boxShadow: `0 0 10px ${glowColor}` 
              }}
            />
            
            <div 
              className="text-white text-xl font-bold tracking-widest text-center uppercase transition-colors group-hover:scale-110 transition-transform flex flex-col items-center leading-tight"
              style={{ 
                fontFamily: '"Reborn Technologies", sans-serif'
              }}
            >
              {series.includes('SERIES') ? (
                <>
                  <span>{series.split(' ')[0]}</span>
                  <span className="text-sm opacity-80">{series.split(' ')[1]}</span>
                </>
              ) : (
                series
              )}
            </div>
            
            <div className="absolute bottom-2 right-2 flex flex-col gap-0.5">
              <div 
                className="h-0.5 transition-all group-hover:w-8"
                style={{ 
                  width: '20px',
                  background: borderGradient,
                  boxShadow: `0 0 8px ${glowColor}`
                }} 
              />
              <div 
                className="h-0.5 transition-all group-hover:w-6"
                style={{ 
                  width: '16px',
                  background: borderGradient,
                  boxShadow: `0 0 8px ${glowColor}`
                }} 
              />
              <div 
                className="h-0.5 transition-all group-hover:w-4"
                style={{ 
                  width: '12px',
                  background: borderGradient,
                  boxShadow: `0 0 8px ${glowColor}`
                }} 
              />
            </div>
          </div>
        </button>
        </div>
      ))}
      </div>
    </div>
  );
}

export type { Series };
