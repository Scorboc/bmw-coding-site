import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Adaptive } from '@/components/ui/responsive';

import { City } from '@/components/CitySelector';
import { getCityName, getCityConfig } from '@/utils/cityConfig';

const services = [
  {
    id: 'carplay',
    title: 'Apple CarPlay',
    description: 'Установка и интеграция системы',
    icon: 'Smartphone',
    price: 'от 15 000 ₽',
    color: '#FF0040',
    details: 'Полная интеграция Apple CarPlay в штатную мультимедийную систему BMW. Беспроводное подключение iPhone. Гарантия на установку.'
  },
  {
    id: 'startstop',
    title: 'Отключение старт-стоп авто 2023+',
    description: 'Программное отключение',
    icon: 'Power',
    price: 'от 35 000 ₽',
    color: '#00D4FF',
    details: 'Установка дополнительного модуля для отключения системы Start-Stop на автомобилях 2023+ года выпуска. Постоянное отключение, без необходимости ручного отключения при каждом запуске.'
  },
  {
    id: 'awd',
    title: 'Отключение переднего привода с кнопки',
    description: 'Дооснащение системой',
    icon: 'Settings',
    price: 'от 25 000 ₽',
    color: '#B4FF00',
    details: 'Дооснащение системой управления полным приводом. Установка модуля для переключения между полным и задним приводом. Интеграция в штатную электропроводку с возможностью переключения режимов.'
  },
  {
    id: 'russian',
    title: 'Русификация',
    description: 'Локализация интерфейса',
    icon: 'Languages',
    price: 'от 10 000 ₽',
    color: '#FF00E5',
    details: 'Полная русификация меню iDrive, приборной панели, голосовых команд. Замена языковых пакетов на русский язык.'
  },
  {
    id: 'maps',
    title: 'Навигация',
    description: 'Обновление карт',
    icon: 'MapPin',
    price: 'от 5 000 ₽',
    color: '#00FFB3',
    details: 'Установка последних карт России, Европы, Азии. Обновление навигационного ПО. Настройка голосового помощника на русском языке.'
  },
  {
    id: 'strobes',
    title: 'Установка стробоскопов',
    description: 'Импульсные спецсигналы',
    icon: 'Zap',
    price: 'от 60 000 ₽',
    color: '#0080FF',
    details: 'Профессиональная установка импульсных световых спецсигналов (стробоскопов) с полной интеграцией в штатную электропроводку. Гарантия на установку.'
  },
  {
    id: 'maintenance',
    title: 'ТО и ремонт BMW',
    description: 'Техническое обслуживание',
    icon: 'Wrench',
    price: 'от 5 000 ₽',
    color: '#FFA500',
    details: 'Комплексное техническое обслуживание и ремонт BMW. Замена масла, тормозных колодок, диагностика ходовой части, ремонт двигателя и трансмиссии. Оригинальные и качественные аналоги.',
    link: '/maintenance'
  }
];

interface ServiceCardProps { service: typeof services[number]; index: number; isSelected: boolean; onToggle: () => void; selectedCity: City; }

function ServiceCardMobile({ service, index, isSelected, onToggle, selectedCity }: ServiceCardProps) {
  return (
    <Card
      className="group relative overflow-hidden border-0 transition-all duration-500 flex-shrink-0"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animationDelay: `${index * 50}ms`,
        minWidth: '173px',
        width: '173px',
        height: isSelected ? 'auto' : '173px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%), linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%)',
        maskComposite: 'intersect',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%), linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%)',
        WebkitMaskComposite: 'source-in'
      }}
    >
      <div 
        className="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${service.color}40, transparent 70%)`,
          boxShadow: `inset 0 0 60px ${service.color}30`
        }}
      />
      <div 
        className="absolute top-0 left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${service.color}20 20%, ${service.color}80 50%, ${service.color}20 80%, transparent 100%)`,
          boxShadow: `0 0 30px ${service.color}60, 0 2px 20px ${service.color}40`
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${service.color}15 30%, ${service.color}40 50%, ${service.color}15 70%, transparent 100%)`,
          boxShadow: `0 0 15px ${service.color}30`
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
        <defs>
          <pattern id={`pattern-${service.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1" fill={service.color} opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-${service.id})`} />
      </svg>
      
      <CardContent className="p-3 relative z-10 flex flex-col h-full">
        <div className="mb-2 h-5">
          <Icon 
            name={service.icon} 
            className="w-5 h-5 transition-all duration-300"
            style={{ color: service.color }}
          />
        </div>
        
        <h3 className="text-xs font-light text-white mb-1.5 tracking-tight leading-tight overflow-hidden">
          {service.title}
        </h3>
        
        <div className="relative">
          <p className="text-[11px] text-white/70 font-light leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: isSelected ? 'unset' : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.details}
          </p>
          {!isSelected && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%)'
              }}
            />
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-[10px] font-medium tracking-wide"
              style={{ color: service.color }}
            >
              {service.price}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 rounded-lg transition-all duration-300 hover:bg-white/10"
              style={{
                background: isSelected ? `${service.color}20` : 'transparent'
              }}
            >
              <Icon 
                name="ChevronDown" 
                className="w-3 h-3 transition-all duration-300"
                style={{
                  color: service.color,
                  transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>
          </div>
          
          {service.link ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = service.link;
              }}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-lg transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                border: `1px solid ${service.color}30`,
                color: service.color
              }}
            >
              <span className="text-[10px] font-medium">Подробнее</span>
              <Icon name="ArrowRight" className="w-3 h-3" />
            </button>
          ) : (
            <a
              href={(() => {
                const msg = `${service.title}\n${service.price}\nГород: ${getCityName(selectedCity)}`;
                const config = getCityConfig(selectedCity);
                return `${config.telegram}?text=${encodeURIComponent(msg)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-lg transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                border: `1px solid ${service.color}30`,
                color: service.color
              }}
            >
              <span className="text-[10px] font-medium">Записаться</span>
              <Icon name="ArrowRight" className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceCardDesktop({ service, index, isSelected, onToggle, selectedCity }: ServiceCardProps) {
  return (
    <Card
      className="group relative overflow-hidden border-0 transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animationDelay: `${index * 50}ms`,
        minHeight: isSelected ? 'auto' : '267px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%), linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%)',
        maskComposite: 'intersect',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%), linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0.95) 100%)',
        WebkitMaskComposite: 'source-in'
      }}
    >
      <div 
        className="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${service.color}40, transparent 70%)`,
          boxShadow: `inset 0 0 60px ${service.color}30`
        }}
      />

      <div 
        className="absolute top-0 left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${service.color}20 20%, ${service.color}80 50%, ${service.color}20 80%, transparent 100%)`,
          boxShadow: `0 0 30px ${service.color}60, 0 2px 20px ${service.color}40`
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${service.color}15 30%, ${service.color}40 50%, ${service.color}15 70%, transparent 100%)`,
          boxShadow: `0 0 15px ${service.color}30`
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
        <defs>
          <pattern id={`pattern-desktop-${service.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1" fill={service.color} opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-desktop-${service.id})`} />
      </svg>
      
      <CardContent className="p-5 relative z-10 flex flex-col h-full">
        <div className="mb-4 h-8">
          <Icon 
            name={service.icon} 
            className="w-8 h-8 transition-all duration-300 group-hover:scale-110"
            style={{ color: service.color }}
          />
        </div>
        
        <h3 className="text-lg font-light text-white mb-2 tracking-tight h-[2.7rem] line-clamp-2">
          {service.title}
        </h3>
        
        <div className="relative">
          <p className="text-sm text-white/70 font-light leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: isSelected ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.details}
          </p>
          {!isSelected && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%)'
              }}
            />
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium tracking-wide"
              style={{ color: service.color }}
            >
              {service.price}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/10"
              style={{
                background: isSelected ? `${service.color}20` : 'transparent'
              }}
            >
              <Icon 
                name="ChevronDown" 
                className="w-3.5 h-3.5 transition-all duration-300"
                style={{
                  color: service.color,
                  transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>
          </div>
          
          {service.link ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = service.link;
              }}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                border: `1px solid ${service.color}30`,
                color: service.color
              }}
            >
              <span className="text-xs font-medium">Подробнее</span>
              <Icon name="ArrowRight" className="w-4 h-4" />
            </button>
          ) : (
            <a
              href={(() => {
                const msg = `${service.title}\n${service.price}\nГород: ${getCityName(selectedCity)}`;
                const config = getCityConfig(selectedCity);
                return `${config.telegram}?text=${encodeURIComponent(msg)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                border: `1px solid ${service.color}30`,
                color: service.color
              }}
            >
              <span className="text-xs font-medium">Записаться</span>
              <Icon name="ArrowRight" className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ServicesGridProps {
  selectedCity?: City;
}

export default function ServicesGrid({ selectedCity = 'saratov' }: ServicesGridProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <Adaptive
      mobile={
        <div className="mb-12">
          <div className="overflow-x-auto scrollbar-hide -mx-4 snap-x snap-mandatory">
            <div className="flex gap-4 px-4 pb-2">
              {services.map((service, index) => (
                <div key={service.id} className="snap-center">
                  <ServiceCardMobile
                    service={service}
                    index={index}
                    isSelected={selectedService === service.id}
                    onToggle={() => setSelectedService(selectedService === service.id ? null : service.id)}
                    selectedCity={selectedCity}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      desktop={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {services.map((service, index) => (
            <ServiceCardDesktop
              key={service.id}
              service={service}
              index={index}
              isSelected={selectedService === service.id}
              onToggle={() => setSelectedService(selectedService === service.id ? null : service.id)}
              selectedCity={selectedCity}
            />
          ))}
        </div>
      }
    />
  );
}
