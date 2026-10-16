

interface BodyTypeStepProps {
  bodyTypes: string[];
  onSelectBody: (body: string) => void;
}

export default function BodyTypeStep({ bodyTypes, onSelectBody }: BodyTypeStepProps) {
  return (
    <>
      {bodyTypes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60 text-sm tracking-wider" style={{ fontFamily: '"Reborn Technologies", sans-serif' }}>
            /// НЕТ ДАННЫХ ДЛЯ ЭТОЙ СЕРИИ
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bodyTypes.map((body) => (
            <button
              key={body}
              onClick={() => onSelectBody(body)}
              className="w-full p-3 text-left transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(26, 8, 8, 0.7) 100%)',
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.5) 0%, rgba(0, 212, 255, 0.5) 100%) 1',
                boxShadow: '0 0 20px rgba(127, 106, 127, 0.4)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
              }}
            >
              <div className="absolute top-0 right-0 w-10 h-10 pointer-events-none" style={{ 
                background: 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.3), transparent)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 0)' 
              }} />
              
              <div className="relative z-10">
                <p 
                  className="text-white text-base tracking-widest font-bold uppercase"
                  style={{ 
                    fontFamily: '"Reborn Technologies", sans-serif'
                  }}
                >
                  {body}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
