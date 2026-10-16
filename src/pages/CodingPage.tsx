import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StickyContactButton from '@/components/StickyContactButton';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { detectCityByGeolocation } from '@/utils/geolocation';
import { getCityConfig } from '@/utils/cityConfig';
import { updateSeoMeta, injectServiceSchema, injectBreadcrumbSchema, cleanupSchemas } from '@/utils/seo';

export default function CodingPage() {
  const [selectedCity, setSelectedCity] = useState<City>('saratov');
  const [showCityPulse, setShowCityPulse] = useState(false);

  useEffect(() => {
    updateSeoMeta({
      title: 'Кодирование BMW — Активация скрытых функций | Reborn BMW',
      description: 'Кодирование BMW: активация Apple CarPlay, видео в движении, отключение Start/Stop, спортивный режим АКПП, русификация. Саратов, Москва.',
      path: '/coding'
    });
    injectBreadcrumbSchema([
      { name: 'Главная', url: 'https://reborn-bmw.tech/' },
      { name: 'Кодирование BMW', url: 'https://reborn-bmw.tech/coding' }
    ]);
    injectServiceSchema({ name: 'Кодирование BMW', description: 'Активация скрытых функций BMW: CarPlay, видео в движении, русификация.', path: '/coding' });

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

  const config = getCityConfig(selectedCity);

  const codingOptions = [
    { category: 'Комфорт', items: ['Отключение Start/Stop по умолчанию', 'Складывание зеркал по ключу', 'Автозакрытие окон', 'Комфортный доступ', 'Память положения сидений'] },
    { category: 'Мультимедиа', items: ['Apple CarPlay / Android Auto', 'Видео в движении', 'Активация DVD/USB видео', 'Fullscreen CarPlay', 'Управление голосом Siri/Google'] },
    { category: 'Спорт', items: ['Спортивный режим АКПП', 'Launch Control', 'Спортивный дисплей мощности', 'Digital Speedometer', 'M Performance звук'] },
    { category: 'Безопасность', items: ['Активация камеры заднего вида', 'Трёхмерная проекция авто', 'Расширенная информация Check Control', 'Отображение давления в шинах', 'Активация ассистента парковки'] }
  ];

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
            Кодирование <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">BMW</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl font-light mb-8 leading-relaxed">
            Активация скрытых функций вашего BMW. Более 100 опций для серий F и G. 
            Всё, что заложено производителем, но не активировано с завода.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {codingOptions.map((group) => (
              <div
                key={group.category}
                className="p-5 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <h3 className="text-blue-400 text-lg font-light mb-3">{group.category}</h3>
                <div className="space-y-2">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon name="Check" className="w-4 h-4 text-blue-400/60 flex-shrink-0" />
                      <span className="text-white/70 text-sm font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Какие серии поддерживаются</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white text-xl font-light mb-2">Серия F</h3>
                <p className="text-white/50 text-sm leading-relaxed">F10, F20, F25, F30, F15, F16, F48 и другие. Полный набор опций кодирования через E-Sys и ISTA.</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white text-xl font-light mb-2">Серия G</h3>
                <p className="text-white/50 text-sm leading-relaxed">G20, G30, G05, G01, G11 и другие. Расширенный набор опций включая новые мультимедийные функции.</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Как проходит кодирование</h2>
            <div className="space-y-3">
              {[
                { step: '01', text: 'Подключаемся к OBD-порту автомобиля' },
                { step: '02', text: 'Считываем текущую конфигурацию модулей' },
                { step: '03', text: 'Активируем выбранные функции' },
                { step: '04', text: 'Проверяем работу каждой опции' },
                { step: '05', text: 'Сохраняем бэкап на случай обновления ПО у дилера' }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-blue-400/40 text-2xl font-light w-10">{item.step}</span>
                  <span className="text-white/80 font-light">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Часто задаваемые вопросы</h2>
            <div className="space-y-4">
              {[
                { q: 'Что такое кодирование BMW?', a: 'Кодирование — это активация скрытых функций, которые заложены производителем, но не включены с завода. Это программная процедура без вмешательства в железо.' },
                { q: 'Сбросится ли кодирование при обновлении ПО у дилера?', a: 'Возможно. Некоторые обновления могут сбросить часть настроек. Мы сохраняем бэкап и можем восстановить всё бесплатно.' },
                { q: 'Безопасно ли кодирование для автомобиля?', a: 'Да. Кодирование — это изменение конфигурации модулей, аналогичное тому, что делает дилер при установке дополнительных опций.' },
                { q: 'Сколько времени занимает кодирование?', a: '30-60 минут в зависимости от количества активируемых функций.' }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-white/60 font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl mb-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h2 className="text-2xl font-light text-white mb-3">Рассчитать стоимость кодирования</h2>
            <p className="text-white/60 mb-4">Выберите нужные опции и получите итоговую цену</p>
            <Link
              to="/#coding"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)' }}
            >
              <Icon name="Calculator" size={18} />
              Открыть конфигуратор
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-light text-white/50 mb-4">Другие услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Чип-тюнинг BMW', desc: 'Увеличение мощности до 30%', link: '/chip-tuning' },
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

          <div className="text-center pb-8">
            <a
              href={`${config.telegram}?text=${encodeURIComponent('Здравствуйте! Интересует кодирование BMW')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)' }}
            >
              <Icon name="Send" size={18} />
              Записаться на кодирование
            </a>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
