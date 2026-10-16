import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { City } from '@/components/CitySelector';
import { getCityConfig, getTelegramLink } from '@/utils/cityConfig';

interface QuickActionsProps {
  selectedCity?: City;
}

const getQuickActions = (city: City) => {
  const config = getCityConfig(city);
  return [
    { id: 'call', icon: 'Phone', label: 'Позвонить', link: `tel:${config.phone}` },
    { id: 'telegram', icon: 'Send', label: 'Telegram', link: getTelegramLink(city, 'запись на обслуживание') },
    { id: 'location', icon: 'MapPin', label: 'Адрес' },
    { id: 'time', icon: 'Clock', label: 'Режим' }
  ];
};

const schedule = [
  { day: 'Понедельник', hours: '10:00–18:00' },
  { day: 'Вторник', hours: '10:00–18:00' },
  { day: 'Среда', hours: '10:00–18:00' },
  { day: 'Четверг', hours: '10:00–18:00' },
  { day: 'Пятница', hours: '10:00–18:00' },
  { day: 'Суббота', hours: '10:00–18:00' },
  { day: 'Воскресенье', hours: 'Выходной', isClosed: true }
];

export default function QuickActions({ selectedCity = 'saratov' }: QuickActionsProps) {
  const [showLocation, setShowLocation] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  
  const quickActions = getQuickActions(selectedCity);
  const cityConfig = getCityConfig(selectedCity);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'location') {
      setShowLocation(true);
    } else if (actionId === 'time') {
      setShowSchedule(true);
    }
  };

  return (
    <>
      <Card
        className="border-0 overflow-hidden max-w-3xl mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}
      >
        <CardContent className="p-6 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {quickActions.map((action) => {
              const Element = action.link ? 'a' : 'button';
              return (
              <Element
                key={action.id}
                {...(action.link ? { href: action.link, target: action.id === 'telegram' ? '_blank' : undefined, rel: action.id === 'telegram' ? 'noopener noreferrer' : undefined } : { onClick: () => handleActionClick(action.id) })}
                className="group flex flex-col items-center gap-2 md:gap-4 p-4 md:p-6 rounded-2xl transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(231,34,46,0.4)] min-h-[100px] md:min-h-[120px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.2), rgba(0, 150, 255, 0.1))',
                    boxShadow: '0 10px 30px -10px rgba(100, 200, 255, 0.3)'
                  }}
                >
                  <Icon 
                    name={action.icon}
                    className="w-6 h-6 md:w-8 md:h-8 text-blue-400"
                  />
                </div>
                <span className="text-xs md:text-base text-white/80 font-light text-center">{action.label}</span>
              </Element>
            )})}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLocation} onOpenChange={setShowLocation}>
        <DialogContent 
          className="border-0 max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 15, 0.98))',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <Icon name="MapPin" className="w-5 h-5 text-blue-400" />
              Наш адрес
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-white/80 text-sm leading-relaxed">
              Саратов, просп. имени 50 лет Октября, 116Д
            </p>
            <a
              href="https://yandex.ru/maps/org/reborn_technologies/70103871083/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-base text-blue-400 hover:text-blue-300 transition-colors min-h-[44px] py-3"
            >
              <Icon name="ExternalLink" className="w-5 h-5" />
              Открыть на карте
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent 
          className="border-0 max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 15, 0.98))',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <Icon name="Clock" className="w-5 h-5 text-blue-400" />
              Режим работы
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {schedule.map((item) => (
              <div 
                key={item.day}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{
                  background: item.isClosed ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${item.isClosed ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)'}`
                }}
              >
                <span className="text-white/70 text-sm">{item.day}</span>
                <span 
                  className="text-sm font-light"
                  style={{ color: item.isClosed ? '#ff6b6b' : '#64c8ff' }}
                >
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-white/30 text-sm font-light mb-6">
          © 2026 REBORN BMW. Чип-тюнинг, кодирование, ТО и ремонт BMW
        </p>
        
        <div className="flex items-center justify-center gap-6">
          <a 
            href={getTelegramLink(selectedCity, 'общий вопрос')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-blue-400 transition-colors duration-300"
          >
            <Icon name="Send" className="w-5 h-5" />
          </a>
          <a 
            href={`tel:${cityConfig.phone}`}
            className="text-white/40 hover:text-blue-400 transition-colors duration-300"
          >
            <Icon name="Phone" className="w-5 h-5" />
          </a>
        </div>
      </div>
    </>
  );
}
