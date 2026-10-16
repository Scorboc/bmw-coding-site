import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StickyContactButton from '@/components/StickyContactButton';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { detectCityByGeolocation } from '@/utils/geolocation';

import { getEngineBySlug, bmwEngines } from '@/data/bmwEngines';
import { bmwModels } from '@/data/bmwModels';
import { updateSeoMeta, injectFaqSchema, injectBreadcrumbSchema, injectServiceSchema, cleanupSchemas } from '@/utils/seo';
import { useChiptuningData } from '@/hooks/useChiptuningData';

export default function BMWEnginePage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedCity, setSelectedCity] = useState<City>('saratov');
  const [showCityPulse, setShowCityPulse] = useState(false);

  const engine = slug ? getEngineBySlug(slug) : undefined;
  const { variants, isSnapshot } = useChiptuningData(engine?.name || '');

  useEffect(() => {
    if (engine) {
      const path = `/engines/${engine.slug}`;
      updateSeoMeta({ title: engine.metaTitle, description: engine.metaDescription, path });
      injectBreadcrumbSchema([
        { name: 'Главная', url: 'https://reborn-bmw.tech/' },
        { name: 'Чип-тюнинг', url: 'https://reborn-bmw.tech/chip-tuning' },
        { name: `Двигатель ${engine.name}`, url: `https://reborn-bmw.tech${path}` }
      ]);
      injectServiceSchema({ name: `Чип-тюнинг двигателя BMW ${engine.name}`, description: engine.description, path });
      if (engine.faq?.length) injectFaqSchema({ questions: engine.faq });
    }

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
  }, [engine]);

  if (!engine) return <Navigate to="/chip-tuning" replace />;

  const relatedEngines = bmwEngines.filter(e => e.slug !== engine.slug).slice(0, 4);
  const relatedModels = bmwModels.filter(m =>
    m.engines.some(me => me.name.toLowerCase().includes(engine.name.toLowerCase()))
  ).slice(0, 4);

  return (
    <>
      {isSnapshot && <p role="status" className="text-white/70 px-4">Справочная копия каталога. Цены и доступность уточняйте у мастера.</p>}
      <StickyContactButton selectedCity={selectedCity} />
      <MainLayout selectedCity={selectedCity} onCityChange={setSelectedCity} showCityPulse={showCityPulse}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-6 flex-wrap">
            <Link to="/" className="hover:text-white/80 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <Link to="/chip-tuning" className="hover:text-white/80 transition-colors">Чип-тюнинг</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-white/70">{engine.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-light ${engine.type === 'бензиновый' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
              {engine.type}
            </span>
            <span className="text-white/40 text-sm">{engine.years}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extralight text-white mb-4 leading-tight">
            Чип-тюнинг двигателя <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">BMW {engine.name}</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl font-light mb-8 leading-relaxed">
            {engine.type === 'бензиновый' ? 'Бензиновый' : 'Дизельный'} двигатель BMW {engine.name} ({engine.years}). Индивидуальная калибровка ECU для увеличения мощности и крутящего момента.
          </p>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Характеристики {engine.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {engine.specs.filter((spec) => !spec.label.toLowerCase().includes('мощность') && !spec.label.toLowerCase().includes('момент')).map((spec) => (
                <div key={spec.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{spec.label}</div>
                  <div className="text-white font-light">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Модели с двигателем {engine.name}</h2>
            <div className="space-y-2">
              {(variants.length > 0
                ? variants.map((v) => v.model)
                : engine.models.map((m) => m.name)
              ).map((modelName) => (
                <div key={modelName} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-white font-light">{modelName}</span>
                  <Link
                    to="/#chiptuning"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.9), rgba(231, 34, 46, 0.7))' }}
                  >
                    <Icon name="Calculator" size={16} />
                    Рассчитать
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Преимущества чип-тюнинга BMW</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))', border: '1px solid rgba(231, 34, 46, 0.2)' }}>
                <Icon name="Zap" className="w-8 h-8 text-red-400 mb-3" />
                <h3 className="text-white text-lg font-medium mb-2">Увеличение мощности</h3>
                <p className="text-white/60 text-sm leading-relaxed">Прирост мощности и крутящего момента без вмешательства в механику двигателя</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))', border: '1px solid rgba(231, 34, 46, 0.2)' }}>
                <Icon name="Gauge" className="w-8 h-8 text-red-400 mb-3" />
                <h3 className="text-white text-lg font-medium mb-2">Улучшенная динамика</h3>
                <p className="text-white/60 text-sm leading-relaxed">Более быстрый отклик на педаль газа, уверенные обгоны, ровная полка момента</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))', border: '1px solid rgba(231, 34, 46, 0.2)' }}>
                <Icon name="ShieldCheck" className="w-8 h-8 text-red-400 mb-3" />
                <h3 className="text-white text-lg font-medium mb-2">Безопасность</h3>
                <p className="text-white/60 text-sm leading-relaxed">Работа в пределах запаса прочности мотора. Возможность отката на стоковую прошивку</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))', border: '1px solid rgba(231, 34, 46, 0.25)' }}>
                <h3 className="text-white text-lg font-light mb-2">Stage 1 — программный тюнинг</h3>
                <p className="text-white/60 text-sm leading-relaxed">Калибровка блока управления двигателем через OBD-порт. Оптимизация параметров впрыска, зажигания и наддува. Не требует доработок по железу.</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))', border: '1px solid rgba(231, 34, 46, 0.15)' }}>
                <h3 className="text-white text-lg font-light mb-2">Stage 2 — программа + железо</h3>
                <p className="text-white/60 text-sm leading-relaxed">Более агрессивная калибровка с установкой даунпайпа, улучшенного интеркулера и других компонентов. Максимальная производительность.</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">{engine.name} — описание двигателя</h2>
            <p className="text-white/60 leading-relaxed">{engine.description}</p>
          </div>

          {engine.knownIssues.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white mb-6">На что обратить внимание у {engine.name}</h2>
              <div className="space-y-3">
                {engine.knownIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                    <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-400/60 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 font-light text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Частые вопросы</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-medium mb-2">Что такое чип-тюнинг?</h3>
                <p className="text-white/60 font-light leading-relaxed">Это изменение программы блока управления двигателем (ECU). Оптимизируются карты впрыска, зажигания, давления наддува и других параметров для повышения мощности и крутящего момента.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-medium mb-2">Можно ли откатить прошивку?</h3>
                <p className="text-white/60 font-light leading-relaxed">Да. Перед прошивкой сохраняется оригинальная калибровка. Возврат к стоковой программе возможен в любой момент.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-medium mb-2">Как узнать стоимость и прирост для моего автомобиля?</h3>
                <p className="text-white/60 font-light leading-relaxed">Воспользуйтесь калькулятором на сайте — выберите свою модель и узнайте точные параметры. Также можно записаться на бесплатную диагностику.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl mb-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.15), rgba(231, 34, 46, 0.05))', border: '1px solid rgba(231, 34, 46, 0.3)' }}>
            <h2 className="text-2xl font-light text-white mb-3">Прошить {engine.name}</h2>
            <p className="text-white/60 mb-4">Бесплатная диагностика + точный расчёт мощности для вашего двигателя</p>
            <Link
              to="/#chiptuning"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.9), rgba(231, 34, 46, 0.7))', boxShadow: '0 10px 40px rgba(231, 34, 46, 0.4)' }}
            >
              <Icon name="Calculator" size={18} />
              Рассчитать стоимость
            </Link>
          </div>

          {relatedModels.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-light text-white/50 mb-4">Модели с {engine.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relatedModels.map((m) => (
                  <Link
                    key={m.slug}
                    to={`/chip-tuning/${m.slug}`}
                    className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <h3 className="text-white font-light text-sm mb-1">{m.generation}</h3>
                    <p className="text-white/40 text-xs">{m.series} • {m.years}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-xl font-light text-white/50 mb-4">Другие двигатели BMW</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedEngines.map((e) => (
                <Link
                  key={e.slug}
                  to={`/engines/${e.slug}`}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <h3 className="text-white font-light text-sm mb-1">{e.name}</h3>
                  <p className="text-white/40 text-xs">{e.type} • {e.displacement}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-light text-white/50 mb-4">Услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Чип-тюнинг BMW', desc: 'Все модели и двигатели', link: '/chip-tuning' },
                { title: 'Кодирование BMW', desc: 'Активация скрытых функций', link: '/coding' },
                { title: 'Отключение экологии', desc: 'EGR, DPF, ADBLUE', link: '/ecology' },
              ].map((s) => (
                <Link
                  key={s.link}
                  to={s.link}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <h3 className="text-white font-light mb-1">{s.title}</h3>
                  <p className="text-white/40 text-xs">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
