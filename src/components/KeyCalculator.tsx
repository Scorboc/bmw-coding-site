import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { getCityName, getCityConfig } from '@/utils/cityConfig';
import { City } from '@/components/CitySelector';

type SeriesType = 'F' | 'G' | 'U';
type KeyType = 'copy' | 'dealer';

interface FSeriesKey {
  position: number;
  price: number;
}

const fSeriesKeys: FSeriesKey[] = [
  { position: 3, price: 15000 },
  { position: 3, price: 18000 },
  { position: 3, price: 20000 },
  { position: 3, price: 22000 },
];

interface KeyCalculatorProps {
  selectedCity: City;
}

export default function KeyCalculator({ selectedCity }: KeyCalculatorProps) {
  const [series, setSeries] = useState<SeriesType>('G');
  const [keyType, setKeyType] = useState<KeyType>('copy');
  const [selectedFKey, setSelectedFKey] = useState<number>(0);

  const calculatePrice = (): number => {
    if (series === 'F') {
      return fSeriesKeys[selectedFKey].price;
    }
    if (series === 'G') {
      return keyType === 'copy' ? 25000 : 40000;
    }
    if (series === 'U') {
      return 50000;
    }
    return 0;
  };

  const price = calculatePrice();

  return (
    <div id="key-calculator" className="mb-16">
      <div 
        className="relative rounded-3xl p-6 md:p-12 overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.08) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.4)',
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 15%, rgba(255, 215, 0, 0.7) 50%, rgba(255, 215, 0, 0.4) 85%, transparent 100%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.3) 30%, rgba(255, 215, 0, 0.5) 50%, rgba(255, 215, 0, 0.3) 70%, transparent 100%)',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
          <defs>
            <pattern id="key-calc-bg" x="0" y="0" width="35" height="35" patternUnits="userSpaceOnUse">
              <circle cx="17.5" cy="17.5" r="1.2" fill="rgba(255, 215, 0, 0.6)">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#key-calc-bg)" />
        </svg>
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <Icon name="Calculator" className="w-5 h-5 md:w-7 md:h-7" style={{ color: '#FFD700' }} />
          <h2 className="text-xl md:text-3xl font-light text-white">Калькулятор стоимости ключа</h2>
        </div>

        <p className="text-white/70 text-sm md:text-lg mb-6 md:mb-8 font-light">
          Рассчитайте стоимость изготовления ключа для вашего BMW
        </p>

        {/* Выбор серии */}
        <div className="mb-6 md:mb-8">
          <label className="block text-white/80 text-xs md:text-sm font-light mb-2 md:mb-3 uppercase tracking-wider">
            Серия автомобиля
          </label>
          <div className="flex gap-2 md:gap-4">
            {(['F', 'G', 'U'] as SeriesType[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeries(s);
                  if (s === 'F') setSelectedFKey(0);
                }}
                className="relative flex-1 py-3 px-3 md:py-4 md:px-6 rounded-xl font-medium transition-all duration-300 overflow-hidden"
                style={{
                  background: series === s 
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: series === s 
                    ? '1px solid rgba(255, 215, 0, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: series === s ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                {series === s && (
                  <>
                    <div 
                      className="absolute top-0 left-0 right-0"
                      style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.7), transparent)',
                      }}
                    />
                    <div 
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                      style={{
                        background: 'rgba(255, 215, 0, 0.6)',
                      }}
                    />
                  </>
                )}
                <div className="relative text-base md:text-2xl font-light">Серия {s}</div>
              </button>
            ))}
          </div>
        </div>

        {/* F серия - выбор позиции */}
        {series === 'F' && (
          <div className="mb-6 md:mb-8">
            <label className="block text-white/80 text-xs md:text-sm font-light mb-2 md:mb-3 uppercase tracking-wider">
              Выберите позицию
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {fSeriesKeys.map((key, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFKey(idx)}
                  className="py-2 px-2 md:py-3 md:px-4 rounded-lg font-medium transition-all duration-300"
                  style={{
                    background: selectedFKey === idx
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: selectedFKey === idx
                      ? '1px solid rgba(255, 215, 0, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedFKey === idx ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {selectedFKey === idx && (
                    <>
                      <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.7), transparent)',
                        }}
                      />
                      <div 
                        className="absolute top-1 left-1 w-2 h-2 rounded-full"
                        style={{
                          background: 'rgba(255, 215, 0, 0.6)',
                        }}
                      />
                    </>
                  )}
                  <div className="relative text-[10px] md:text-xs mb-0.5 md:mb-1 opacity-70">Поз. {key.position}</div>
                  <div className="text-xs md:text-sm font-medium">{key.price.toLocaleString()} ₽</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* G серия - тип ключа */}
        {series === 'G' && (
          <div className="mb-6 md:mb-8">
            <label className="block text-white/80 text-xs md:text-sm font-light mb-2 md:mb-3 uppercase tracking-wider">
              Тип ключа
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => setKeyType('copy')}
                className="relative py-4 px-4 md:py-6 md:px-6 rounded-xl transition-all duration-300 overflow-hidden"
                style={{
                  background: keyType === 'copy'
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: keyType === 'copy'
                    ? '1px solid rgba(255, 215, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {keyType === 'copy' && (
                  <>
                    <div 
                      className="absolute top-0 right-0 w-px h-full"
                      style={{
                        background: 'linear-gradient(180deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
                      }}
                    />
                    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                      <defs>
                        <pattern id="copy-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="0.8" fill="rgba(255, 215, 0, 0.6)" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#copy-dots)" />
                    </svg>
                  </>
                )}
                <div className="relative flex items-center justify-between mb-1 md:mb-2">
                  <span className="text-sm md:text-lg font-light" style={{ color: keyType === 'copy' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)' }}>
                    Копия
                  </span>
                  <Icon name="Key" className="w-4 h-4 md:w-5 md:h-5" style={{ color: keyType === 'copy' ? '#FFD700' : 'rgba(255, 255, 255, 0.3)' }} />
                </div>
                <div className="text-lg md:text-2xl font-medium" style={{ color: keyType === 'copy' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)' }}>
                  25 000 ₽
                </div>
              </button>

              <button
                onClick={() => setKeyType('dealer')}
                className="relative py-4 px-4 md:py-6 md:px-6 rounded-xl transition-all duration-300 overflow-hidden"
                style={{
                  background: keyType === 'dealer'
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: keyType === 'dealer'
                    ? '1px solid rgba(255, 215, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {keyType === 'dealer' && (
                  <>
                    <div 
                      className="absolute top-0 right-0 w-px h-full"
                      style={{
                        background: 'linear-gradient(180deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
                      }}
                    />
                    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                      <defs>
                        <pattern id="dealer-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="0.8" fill="rgba(255, 215, 0, 0.6)" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#dealer-dots)" />
                    </svg>
                  </>
                )}
                <div className="relative flex items-center justify-between mb-1 md:mb-2">
                  <span className="text-sm md:text-lg font-light" style={{ color: keyType === 'dealer' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)' }}>
                    Дилерский
                  </span>
                  <Icon name="Award" className="w-4 h-4 md:w-5 md:h-5" style={{ color: keyType === 'dealer' ? '#FFD700' : 'rgba(255, 255, 255, 0.3)' }} />
                </div>
                <div className="text-lg md:text-2xl font-medium" style={{ color: keyType === 'dealer' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)' }}>
                  40 000 ₽
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Итоговая стоимость */}
        <div 
          className="relative rounded-2xl p-4 md:p-8 mt-6 md:mt-8 overflow-hidden backdrop-blur-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.1))',
            border: '1px solid rgba(255, 215, 0, 0.4)',
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6) 30%, rgba(255, 215, 0, 0.8) 50%, rgba(255, 215, 0, 0.6) 70%, transparent)',
            }}
          />
          <div 
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: '2px',
              background: 'linear-gradient(180deg, transparent, rgba(255, 215, 0, 0.6) 50%, transparent)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <defs>
              <pattern id="final-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="rgba(255, 215, 0, 0.6)">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#final-grid)" />
          </svg>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/60 text-xs md:text-sm font-light mb-1 uppercase tracking-wider">
                  Итоговая стоимость
                </div>
                <div className="text-white text-2xl md:text-4xl font-light">
                  {price.toLocaleString()} ₽
                </div>
              </div>
            </div>
            <a
              href={(() => {
                const lines = ['ИЗГОТОВЛЕНИЕ КЛЮЧА BMW', ''];
                lines.push(`Серия: ${series}`);
                if (series === 'F') lines.push(`Позиция: ${selectedFKey + 1}`);
                if (series === 'G') lines.push(`Тип: ${keyType === 'copy' ? 'Копия' : 'Дилерский'}`);
                lines.push('');
                lines.push(`СТОИМОСТЬ: ${price.toLocaleString('ru-RU')} ₽`);
                lines.push(`Город: ${getCityName(selectedCity)}`);
                const message = lines.join('\n');
                const config = getCityConfig(selectedCity);
                return `${config.telegram}?text=${encodeURIComponent(message)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl text-sm md:text-base font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.35), rgba(255, 215, 0, 0.25))',
                border: '1px solid rgba(255, 215, 0, 0.6)',
                color: '#FFD700'
              }}
            >
              <Icon name="Send" className="w-4 h-4 md:w-5 md:h-5" />
              <span>Заказать</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
