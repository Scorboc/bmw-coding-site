import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Adaptive } from '@/components/ui/responsive';

const tips = [
  {
    id: 1,
    icon: 'Zap',
    title: 'Система Start/Stop и стартер-генератор',
    description: 'Современные BMW G-серии — это «мягкие гибриды». У них нет классического стартера; его роль выполняет мощный 48V стартер-генератор. С системой Start/Stop он быстро выходит из строя.',
    tips: [
      'Отключайте Start/Stop для продления срока службы',
      '48V стартер-генератор прослужит значительно дольше',
      'Экономия на замене дорогостоящего оборудования'
    ]
  },
  {
    id: 2,
    icon: 'Battery',
    title: 'Критическая просадка аккумулятора',
    description: 'Электроника BMW G-серии чувствительна к качеству питания. Просадка аккумулятора ниже критической отметки приводит к проблемам:',
    issues: [
      {
        title: 'Синхронизация ключей',
        text: 'Нарушается связь между BDC (кузовная электроника) и DME (двигатель). Машина «забудет» ключи и откажется заводиться даже после зарядки АКБ.'
      },
      {
        title: 'Сброс инициализации',
        text: '«Слетают» крайние положения люка, стеклоподъемников, рулевой колонки и датчика угла поворота руля. Потребуется адаптация через диагностику.'
      }
    ]
  }
];

function ExpertTipsMobile() {
  const [currentTip, setCurrentTip] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const tip = tips[currentTip];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className="mb-6 px-4">
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Icon name="Lightbulb" className="w-4 h-4 text-[#FFD700]" />
          <h2 className="font-light text-white text-base">Советы экспертов</h2>
        </div>
      </div>

      <div 
        className="rounded-xl p-3"
        style={{
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 20px 50px -20px rgba(255, 215, 0, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.02))'
        }}
      >
        <div 
          className="h-0.5 -mx-4 -mt-4 mb-3"
          style={{
            background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
          }}
        />

        <div className="flex items-center gap-2 mb-3">
          <div 
            className="p-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}
          >
            <Icon name={tip.icon} className="w-4 h-4 text-[#FFD700]" />
          </div>
          <h3 className="font-light text-white text-sm leading-tight">{tip.title}</h3>
        </div>

        <p className="text-white/80 text-xs font-light mb-3 leading-relaxed">
          {tip.description}
        </p>

        {tip.tips && (
          <div className="space-y-1.5">
            {tip.tips.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <Icon name="Check" className="w-3 h-3 text-[#FFD700] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-[11px] leading-tight">{item}</span>
              </div>
            ))}
          </div>
        )}

        {tip.issues && (
          <div className="space-y-2 mt-2">
            {tip.issues.map((issue, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name="AlertTriangle" className="w-3 h-3 text-[#FFD700]" />
                  <h4 className="text-[#FFD700] font-medium text-[11px]">{issue.title}</h4>
                </div>
                <p className="text-white/70 text-[11px] leading-relaxed">{issue.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-4">
          {tips.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAutoPlay(false);
                setCurrentTip(idx);
              }}
              className="transition-all duration-300"
              style={{
                width: currentTip === idx ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: currentTip === idx 
                  ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                  : 'rgba(255, 215, 0, 0.3)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpertTipsDesktop() {
  const [currentTip, setCurrentTip] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tip = tips[currentTip];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const handlePrev = () => {
    setAutoPlay(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev === 0 ? tips.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    setAutoPlay(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleDotClick = (idx: number) => {
    if (idx === currentTip) return;
    setAutoPlay(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTip(idx);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon name="Lightbulb" className="w-8 h-8 text-[#FFD700]" />
          <h2 className="font-light text-white text-3xl">Рекомендации экспертов</h2>
        </div>
      </div>

      <div className="relative">
        <div 
          className="relative rounded-3xl overflow-hidden p-12 md:px-20 flex items-center"
          style={{
            border: '1px solid rgba(255, 215, 0, 0.2)',
            boxShadow: '0 30px 90px -20px rgba(255, 215, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.02))',
            minHeight: '450px',
            height: '450px'
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-1 z-20"
            style={{
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
            }}
          />

          <div className="relative z-10 w-full transition-all duration-500" style={{ opacity: isTransitioning ? 0.3 : 1 }}>
            <div className="flex items-center gap-4 mb-5">
              <div 
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                <Icon name={tip.icon} className="w-7 h-7 text-[#FFD700]" />
              </div>
              <h3 className="font-light text-white text-xl">{tip.title}</h3>
            </div>

            <p className="text-white/80 text-base font-light mb-6 leading-relaxed">
              {tip.description}
            </p>

            {tip.tips && (
              <div className="space-y-2.5">
                {tip.tips.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Icon name="Check" className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {tip.issues && (
              <div className="space-y-4 mt-4">
                {tip.issues.map((issue, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                      border: '1px solid rgba(255, 215, 0, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="AlertTriangle" className="w-4 h-4 text-[#FFD700]" />
                      <h4 className="text-[#FFD700] font-medium text-sm">{issue.title}</h4>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{issue.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          aria-label="Предыдущий слайд" onClick={handlePrev}
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15))',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
          }}
        >
          <Icon name="ChevronLeft" className="w-6 h-6 text-[#FFD700]" />
        </button>

        <button
          aria-label="Следующий слайд" onClick={handleNext}
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15))',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
          }}
        >
          <Icon name="ChevronRight" className="w-6 h-6 text-[#FFD700]" />
        </button>

        <div className="flex items-center justify-center gap-3 mt-8">
          {tips.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className="transition-all duration-300"
              style={{
                width: currentTip === idx ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentTip === idx 
                  ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                  : 'rgba(255, 215, 0, 0.3)',
                boxShadow: currentTip === idx ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExpertTips() {
  return (
    <Adaptive
      mobile={<ExpertTipsMobile />}
      desktop={<ExpertTipsDesktop />}
    />
  );
}
