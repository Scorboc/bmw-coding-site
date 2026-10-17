import Icon from '@/components/ui/icon';
import { categories, options, calculatePrice } from './codingData';

interface OptionsListProps {
  selectedSeries: 'F' | 'G';
  selectedOptions: Set<string>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onToggleOption: (optionId: string) => void;
  onSendConfig: () => void;
  onBack: () => void;
}

export default function OptionsList({
  selectedSeries,
  selectedOptions,
  activeCategory,
  onCategoryChange,
  onToggleOption,
  onSendConfig,
  onBack
}: OptionsListProps) {
  const filteredOptions = options.filter(
    o => o.category === activeCategory && (o.series === selectedSeries || o.series === 'both')
  );

  const selectedCount = selectedOptions.size;
  const pricing = calculatePrice(selectedCount);

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg text-white/80 hover:text-white transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(129, 196, 255, 0.1), rgba(22, 88, 142, 0.1))',
          border: '1px solid rgba(129, 196, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Icon name="ChevronLeft" className="w-5 h-5 text-blue-400" />
        <span className="text-sm">Назад</span>
      </button>

      <div className="flex items-center justify-center mb-8">
        <div 
          className="px-6 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #81C4FF, #16588E)',
            boxShadow: '0 8px 32px rgba(129, 196, 255, 0.3)'
          }}
        >
          <span className="text-white font-medium">BMW {selectedSeries}-series</span>
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className="relative flex items-center gap-2 px-3 py-3 md:px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 whitespace-nowrap group overflow-hidden"
            style={{
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, #81C4FF, #16588E)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
              border: activeCategory === cat.id
                ? '1px solid rgba(129, 196, 255, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: activeCategory === cat.id
                ? '0 8px 32px rgba(129, 196, 255, 0.3)'
                : 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle at center, rgba(129, 196, 255, 0.3), transparent 70%)',
                boxShadow: '0 0 50px rgba(129, 196, 255, 0.5)'
              }}
            />
            <div className="relative group/tooltip">
              <Icon name={cat.icon} className="w-6 h-6 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-active/tooltip:opacity-100 transition-opacity pointer-events-none z-10 border border-blue-400/30 shadow-[0_8px_24px_rgba(59,130,246,0.5)]">
                {cat.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-cyan-600" />
              </div>
            </div>
            <span className="relative hidden md:inline">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 transition-all duration-500">
        {filteredOptions.map((option, index) => {
          const isSelected = selectedOptions.has(option.id);
          return (
            <button
              key={option.id}
              onClick={() => onToggleOption(option.id)}
              className="relative p-6 rounded-xl transition-all duration-300 text-left group hover:scale-[1.02] overflow-hidden"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(129, 196, 255, 0.15), rgba(22, 88, 142, 0.15))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                border: isSelected
                  ? '2px solid rgba(129, 196, 255, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected
                  ? '0 8px 32px rgba(129, 196, 255, 0.2)'
                  : 'none',
                animationDelay: `${index * 30}ms`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(129, 196, 255, 0.15), transparent 70%)',
                  boxShadow: '0 0 60px rgba(129, 196, 255, 0.4), inset 0 0 40px rgba(129, 196, 255, 0.2)'
                }}
              />
              <div 
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(129, 196, 255, 0.8), transparent)',
                  boxShadow: '0 0 30px rgba(129, 196, 255, 0.8), 0 2px 20px rgba(129, 196, 255, 0.6)'
                }}
              />
              {isSelected && (
                <>
                  <div 
                    className="absolute top-0 left-0 right-0"
                    style={{
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(129, 196, 255, 0.4) 20%, rgba(129, 196, 255, 0.9) 50%, rgba(129, 196, 255, 0.4) 80%, transparent 100%)',
                      boxShadow: '0 0 20px rgba(129, 196, 255, 0.6)'
                    }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 top-0"
                    style={{
                      width: '2px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(129, 196, 255, 0.5) 50%, transparent 100%)',
                      boxShadow: '0 0 15px rgba(129, 196, 255, 0.5)'
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
                    <defs>
                      <pattern id={`option-${option.id}`} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="11" cy="11" r="0.8" fill="rgba(129, 196, 255, 0.6)">
                          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
                        </circle>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#option-${option.id})`} />
                  </svg>
                </>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(129, 196, 255, 0.3), rgba(22, 88, 142, 0.2))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      border: '1px solid rgba(129, 196, 255, 0.2)'
                    }}
                  >
                    <Icon 
                      name={option.icon}
                      className="w-5 h-5 transition-all duration-300 group-hover:scale-110"
                      style={{ color: isSelected ? '#81C4FF' : 'rgba(255, 255, 255, 0.6)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="font-medium text-base"
                      style={{ color: isSelected ? '#81C4FF' : '#fff' }}
                    >
                      {option.name}
                    </h3>
                  </div>
                </div>
                
                <div 
                  className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0"
                  style={{
                    borderColor: isSelected ? '#81C4FF' : 'rgba(255, 255, 255, 0.2)',
                    background: isSelected ? '#81C4FF' : 'transparent'
                  }}
                >
                  {isSelected && <Icon name="Check" className="w-4 h-4 text-black" />}
                </div>
              </div>

              <p className="text-white/50 text-sm">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div 
        className="relative sticky bottom-6 rounded-2xl p-6 backdrop-blur-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(129, 196, 255, 0.15), rgba(22, 88, 142, 0.15))',
          border: '1px solid rgba(129, 196, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(129, 196, 255, 0.3) 20%, rgba(129, 196, 255, 0.8) 50%, rgba(129, 196, 255, 0.3) 80%, transparent 100%)',
            boxShadow: '0 0 25px rgba(129, 196, 255, 0.5)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(129, 196, 255, 0.4), transparent)',
            boxShadow: '0 0 12px rgba(129, 196, 255, 0.3)'
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
          <defs>
            <pattern id="summary-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="rgba(129, 196, 255, 0.6)">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#summary-pattern)" />
        </svg>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-white/60 text-sm mb-1">Выбрано опций</div>
              <div className="text-white text-2xl font-light">{selectedCount}</div>
            </div>
            <div 
              className="h-12 w-px"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(129, 196, 255, 0.3), transparent)' }}
            />
            <div>
              <div className="text-white/60 text-sm mb-1">
                {pricing.discount > 0 ? (
                  <span className="flex items-center gap-2">
                    Скидка <span className="text-[#81C4FF] font-medium">{pricing.discount}%</span>
                  </span>
                ) : (
                  'Итоговая стоимость'
                )}
              </div>
              <div className="flex items-center gap-3">
                {pricing.discount > 0 && (
                  <span className="text-white/40 text-lg line-through">
                    {pricing.original.toLocaleString('ru-RU')} ₽
                  </span>
                )}
                <span className="text-[#81C4FF] text-2xl font-light">
                  {pricing.total.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={onSendConfig}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
              style={{
                background: selectedCount > 0
                  ? 'linear-gradient(135deg, #81C4FF, #16588E)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(129, 196, 255, 0.3)',
                boxShadow: selectedCount > 0 ? '0 10px 40px rgba(129, 196, 255, 0.4)' : 'none',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Icon name="Send" className="w-5 h-5" />
              <span>Отправить конфигурацию</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
