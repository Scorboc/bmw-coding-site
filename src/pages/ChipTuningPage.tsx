import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StickyContactButton from '@/components/StickyContactButton';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { detectCityByGeolocation } from '@/utils/geolocation';

import { bmwModels } from '@/data/bmwModels';
import { bmwEngines } from '@/data/bmwEngines';
import { updateSeoMeta, injectServiceSchema, injectBreadcrumbSchema, cleanupSchemas } from '@/utils/seo';

export default function ChipTuningPage() {
  const [selectedCity, setSelectedCity] = useState<City>('saratov');
  const [showCityPulse, setShowCityPulse] = useState(false);

  useEffect(() => {
    updateSeoMeta({
      title: 'Чип-тюнинг BMW — Stage 1, Stage 2, Stage 3 | Reborn BMW',
      description: 'Профессиональный чип-тюнинг BMW: Stage 1 (+20-30% мощности), Stage 2, Stage 3. Прошивка ЭБУ, увеличение мощности и крутящего момента. Саратов, Москва.',
      path: '/chip-tuning'
    });
    injectBreadcrumbSchema([
      { name: 'Главная', url: 'https://reborn-bmw.tech/' },
      { name: 'Чип-тюнинг BMW', url: 'https://reborn-bmw.tech/chip-tuning' }
    ]);
    injectServiceSchema({ name: 'Чип-тюнинг BMW', description: 'Профессиональный чип-тюнинг BMW: Stage 1, Stage 2, Stage 3. Прошивка ЭБУ.', path: '/chip-tuning' });

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
            Чип-тюнинг <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">BMW</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl font-light mb-8 leading-relaxed">
            Увеличение мощности и крутящего момента вашего BMW через профессиональную прошивку ЭБУ. 
            Индивидуальная калибровка под каждый автомобиль.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { stage: 'Stage 1', power: '+20-30%', desc: 'Безопасная прошивка без вмешательства в железо. Не оставляет следов у дилера.' },
              { stage: 'Stage 2', power: '+30-40%', desc: 'Максимальная мощность с доработкой впуска и выхлопа. Для тех, кто хочет больше.' },
              { stage: 'Stage 3', power: '+40-60%', desc: 'Спортивная прошивка для трека. Максимум возможностей двигателя.' }
            ].map((item) => (
              <div
                key={item.stage}
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
                  border: '1px solid rgba(231, 34, 46, 0.25)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(231, 34, 46, 0.8), transparent)' }} />
                <h3 className="text-white text-xl font-light mb-1">{item.stage}</h3>
                <div className="text-red-400 text-2xl font-light mb-2">{item.power}</div>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <Link
              to="/#chiptuning"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #e7222e, #c41e28)', boxShadow: '0 10px 40px rgba(231, 34, 46, 0.4)' }}
            >
              <Icon name="Calculator" size={18} />
              Рассчитать стоимость
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Какие двигатели мы прошиваем</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bmwEngines.map((engine) => (
                <Link key={engine.slug} to={`/engines/${engine.slug}`} className="p-3 rounded-xl text-center transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-white font-light">{engine.name}</span>
                  <span className="text-white/30 text-xs block">{engine.type}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Популярные модели для чип-тюнинга</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {bmwModels.map((m) => (
                <Link key={m.slug} to={`/chip-tuning/${m.slug}`} className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 className="text-white font-light">{m.generation}</h3>
                  <p className="text-white/40 text-xs">{m.series} • {m.years}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Что входит в чип-тюнинг</h2>
            <div className="space-y-3">
              {[
                'Диагностика двигателя перед прошивкой',
                'Считывание и сохранение оригинальной прошивки',
                'Загрузка индивидуальной калибровки',
                'Тестовый заезд и проверка параметров'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <Icon name="Check" className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/80 font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Часто задаваемые вопросы</h2>
            <div className="space-y-4">
              {[
                { q: 'Безопасен ли чип-тюнинг для двигателя BMW?', a: 'Да. Stage 1 работает в пределах запаса прочности двигателя. Мы не превышаем допустимые нагрузки и используем проверенные калибровки. Stage 1 не оставляет следов в системе BMW.' },
                { q: 'Можно ли вернуть стоковую прошивку?', a: 'Да, мы сохраняем оригинальную прошивку и можем вернуть её в любой момент бесплатно. Процедура занимает 30-60 минут.' },
                { q: 'Сколько времени занимает чип-тюнинг?', a: 'Процедура занимает 1-3 часа в зависимости от модели и типа двигателя. Вам не нужно оставлять автомобиль.' },
                { q: 'Увеличится ли расход топлива?', a: 'При спокойной езде расход не меняется или даже снижается за счёт оптимизации карт впрыска. При активном вождении расход может увеличиться на 5-10%.' },
                { q: 'Оставляет ли прошивка следы?', a: 'Stage 1 не оставляет следов при стандартной диагностике. Stage 2-3 могут быть обнаружены при детальной диагностике у дилера.' }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-white/60 font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl mb-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.15), rgba(231, 34, 46, 0.05))', border: '1px solid rgba(231, 34, 46, 0.3)' }}>
            <h2 className="text-2xl font-light text-white mb-3">Рассчитать стоимость чип-тюнинга</h2>
            <p className="text-white/60 mb-4">Выберите модель и получите точную цену за 30 секунд</p>
            <Link
              to="/#chiptuning"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.9), rgba(231, 34, 46, 0.7))', boxShadow: '0 10px 40px rgba(231, 34, 46, 0.4)' }}
            >
              <Icon name="Calculator" size={18} />
              Открыть калькулятор
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-light text-white/50 mb-4">Другие услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Кодирование BMW', desc: 'Активация скрытых функций', link: '/coding' },
                { title: 'Изготовление ключей BMW', desc: 'Программирование ключей', link: '/keys' },
                { title: 'Отключение экологии BMW', desc: 'EGR, DPF, ADBLUE, Euro 2', link: '/ecology' }
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
