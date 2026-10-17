import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StickyContactButton from '@/components/StickyContactButton';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { detectCityByGeolocation } from '@/utils/geolocation';

import { updateSeoMeta, injectServiceSchema, injectBreadcrumbSchema, cleanupSchemas } from '@/utils/seo';

const services = [
  {
    category: 'Замена масла и фильтров',
    icon: 'Droplets',
    color: '#FFA500',
    items: [
      { name: 'Замена масла в двигателе' },
      { name: 'Замена масла в АКПП' },
      { name: 'Замена масла в редукторе' },
      { name: 'Замена воздушного фильтра' },
      { name: 'Замена салонного фильтра' },
    ]
  },
  {
    category: 'Тормозная система',
    icon: 'CircleDot',
    color: '#FF4444',
    items: [
      { name: 'Замена тормозных колодок (ось)' },
      { name: 'Замена тормозных дисков (ось)' },
      { name: 'Замена тормозной жидкости' },
      { name: 'Диагностика тормозной системы' },
    ]
  },
  {
    category: 'Ходовая часть',
    icon: 'Car',
    color: '#00BFFF',
    items: [
      { name: 'Диагностика ходовой' },
      { name: 'Замена рычагов подвески' },
      { name: 'Замена амортизаторов' },
      { name: 'Замена ступичного подшипника' },
      { name: 'Сход-развал' },
    ]
  },
  {
    category: 'Двигатель и системы',
    icon: 'Settings',
    color: '#7B68EE',
    items: [
      { name: 'Компьютерная диагностика' },
      { name: 'Замена свечей зажигания' },
      { name: 'Замена катушек зажигания' },
      { name: 'Замена ремня/цепи ГРМ' },
      { name: 'Замена антифриза' },
    ]
  },
];

export default function MaintenancePage() {
  const [selectedCity, setSelectedCity] = useState<City>('saratov');
  const [showCityPulse, setShowCityPulse] = useState(false);

  useEffect(() => {
    updateSeoMeta({
      title: 'ТО и ремонт BMW — Техническое обслуживание | Reborn BMW',
      description: 'Техническое обслуживание и ремонт BMW в Саратове. Замена масла, тормозных колодок, диагностика ходовой, ремонт двигателя. Оригинальные запчасти.',
      path: '/maintenance'
    });
    injectBreadcrumbSchema([
      { name: 'Главная', url: 'https://reborn-bmw.tech/' },
      { name: 'ТО и ремонт BMW', url: 'https://reborn-bmw.tech/maintenance' }
    ]);
    injectServiceSchema({ name: 'ТО и ремонт BMW', description: 'Техническое обслуживание и ремонт BMW. Замена масла, тормозных колодок, диагностика ходовой.', path: '/maintenance' });

    const initCity = async () => {
      const result = await detectCityByGeolocation();
      if (result.detected && result.city) {
        setSelectedCity(result.city);
      } else {
        setShowCityPulse(true);
        setTimeout(() => setShowCityPulse(false), 5000);
      }
    };
    initCity();

    return () => { cleanupSchemas(); };
  }, []);


  return (
    <>
      <StickyContactButton selectedCity={selectedCity} />
      <MainLayout selectedCity={selectedCity} onCityChange={setSelectedCity} showCityPulse={showCityPulse}>
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mb-6 text-sm">
            <Icon name="ChevronLeft" size={16} />
            <span>На главную</span>
          </Link>

          <h1 className="text-3xl md:text-5xl font-extralight text-white mb-4 leading-tight">
            ТО и ремонт <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">BMW</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl font-light mb-8 leading-relaxed">
            Комплексное обслуживание вашего BMW. Оригинальные запчасти и качественные аналоги, 
            гарантия на все виды работ.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {services.map((group) => (
              <div
                key={group.category}
                className="p-5 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
                  border: `1px solid ${group.color}25`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${group.color}15`, border: `1px solid ${group.color}30` }}>
                    <Icon name={group.icon} className="w-4 h-4" style={{ color: group.color }} />
                  </div>
                  <h3 className="text-lg font-light" style={{ color: group.color }}>{group.category}</h3>
                </div>
                <div className="space-y-2.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon name="Check" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: `${group.color}80` }} />
                      <span className="text-white/70 text-sm font-light">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Почему мы</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: 'ShieldCheck', title: 'Гарантия', desc: 'На все виды работ от 6 месяцев' },
                { icon: 'Wrench', title: 'Специализация', desc: 'Работаем только с BMW' },
                { icon: 'Package', title: 'Запчасти', desc: 'Оригинал и качественные аналоги' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-400/20 flex items-center justify-center mx-auto mb-3">
                    <Icon name={item.icon} className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-white font-light mb-1">{item.title}</div>
                  <div className="text-white/50 text-sm font-light">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Как записаться</h2>
            <div className="space-y-3">
              {[
                { step: '01', text: 'Напишите нам в Telegram или позвоните' },
                { step: '02', text: 'Опишите проблему или нужное ТО' },
                { step: '03', text: 'Согласуем дату и стоимость' },
                { step: '04', text: 'Приезжаете — делаем всё в срок' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-orange-400/40 text-2xl font-light w-10">{item.step}</span>
                  <span className="text-white/80 font-light">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl mb-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.12), rgba(255, 165, 0, 0.04))', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
            <h2 className="text-2xl font-light text-white mb-3">Записаться на ТО / ремонт</h2>
            <p className="text-white/60 mb-5">Опишите что нужно — подберём запчасти и назовём точную цену</p>
            <a
              href="tel:+79586754984"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)' }}
            >
              <Icon name="Phone" size={18} />
              Позвонить
            </a>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-light text-white/50 mb-4">Другие услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Чип-тюнинг BMW', desc: 'Увеличение мощности до 30%', link: '/chip-tuning' },
                { title: 'Кодирование BMW', desc: 'Активация скрытых функций', link: '/coding' },
                { title: 'Отключение экологии BMW', desc: 'EGR, DPF, ADBLUE, Euro 2', link: '/ecology' },
              ].map((s) => (
                <Link key={s.link} to={s.link} className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-white font-light mb-1">{s.title}</div>
                  <div className="text-white/40 text-sm">{s.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
