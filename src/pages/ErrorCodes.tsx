import { DATA_API_URL, apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import ErrorCodeSearch from '@/components/ErrorCodeSearch';

const API_URL = DATA_API_URL;

interface ErrorCode {
  id: number;
  code: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  search_count: number;
}

export default function ErrorCodes() {
  const navigate = useNavigate();
  const [usingSnapshot, setUsingSnapshot] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [popularCodes, setPopularCodes] = useState<ErrorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'obd2' | 'bmw_specific'>('all');

  useEffect(() => {
    loadPopularCodes();
    
    // Добавляем breadcrumbs микроразметку
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://reborn-bmw.tech/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Коды ошибок BMW",
          "item": "https://reborn-bmw.tech/error-codes"
        }
      ]
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const loadPopularCodes = async () => {
    setLoading(true); setLoadError('');
    try {
      const response = await apiFetch(`${API_URL}?action=get_popular_errors`);
      setUsingSnapshot(response.headers.get('X-Data-Source') === 'repository-snapshot');
      const data = await response.json();
      setPopularCodes(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить список ошибок.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (code: string) => {
    navigate(`/error-codes/${code}`);
  };

  const filteredCodes = popularCodes.filter(
    (ec) => filter === 'all' || ec.category === filter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' };
      case 'warning':
        return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' };
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Критическая';
      case 'warning':
        return 'Предупреждение';
      default:
        return 'Информация';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Icon name="AlertTriangle" className="w-10 h-10 md:w-12 md:h-12 text-[#E7222E]" />
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Коды ошибок BMW
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-3xl mx-auto">
            Онлайн-расшифровка кодов ошибок BMW. Введите код ошибки и получите подробное объяснение, причины и рекомендации от ИИ-консультанта.
          </p>

          <ErrorCodeSearch onSearch={handleSearch} />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.1), rgba(181, 24, 32, 0.05))',
              border: '1px solid rgba(231, 34, 46, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon name="Zap" className="w-8 h-8 text-[#E7222E] mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Мгновенная расшифровка</h3>
            <p className="text-white/60 text-sm">
              Получите полное описание ошибки за секунды
            </p>
          </div>

          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.1), rgba(181, 24, 32, 0.05))',
              border: '1px solid rgba(231, 34, 46, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon name="Brain" className="w-8 h-8 text-[#E7222E] mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">ИИ-консультант</h3>
            <p className="text-white/60 text-sm">
              Задайте вопросы по вашей конкретной ситуации
            </p>
          </div>

          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.1), rgba(181, 24, 32, 0.05))',
              border: '1px solid rgba(231, 34, 46, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon name="Wrench" className="w-8 h-8 text-[#E7222E] mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Запись в сервис</h3>
            <p className="text-white/60 text-sm">
              Сразу запишитесь на диагностику и ремонт
            </p>
          </div>
        </div>

        {loadError && <div role="alert" className="text-amber-200 mb-6"><p>{loadError}</p><button className="underline mt-2" onClick={loadPopularCodes}>Повторить загрузку</button></div>}
        {usingSnapshot && <p role="status" className="text-white/70 mb-6">Сервер недоступен. Показана справочная копия кодов из каталога сайта; статистика популярности недоступна.</p>}
        {/* Popular error codes */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0">
              {usingSnapshot ? 'Справочник ошибок' : 'Популярные ошибки'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-[#E7222E] text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                style={{ border: filter === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Все
              </button>
              <button
                onClick={() => setFilter('obd2')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'obd2'
                    ? 'bg-[#E7222E] text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                style={{ border: filter === 'obd2' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                OBD-II
              </button>
              <button
                onClick={() => setFilter('bmw_specific')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'bmw_specific'
                    ? 'bg-[#E7222E] text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                style={{
                  border: filter === 'bmw_specific' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                BMW
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#E7222E]/20 border-t-[#E7222E] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCodes.map((errorCode) => {
                const colors = getSeverityColor(errorCode.severity);
                return (
                  <button
                    key={errorCode.id}
                    onClick={() => navigate(`/error-codes/${errorCode.code}`)}
                    className="p-6 rounded-xl text-left transition-all hover:scale-[1.02] group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="px-3 py-1 rounded-lg font-mono font-bold text-lg"
                        style={{
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          color: colors.text
                        }}
                      >
                        {errorCode.code}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: colors.bg,
                          color: colors.text
                        }}
                      >
                        {getSeverityLabel(errorCode.severity)}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#E7222E] transition-colors">
                      {errorCode.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2 mb-3">{errorCode.description}</p>
                    <div className="flex items-center text-white/40 text-xs">
                      <Icon name="TrendingUp" className="w-4 h-4 mr-1" />
                      <span>Просмотров: {errorCode.search_count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SEO content */}
        <div
          className="p-6 md:p-8 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Как работает расшифровка кодов ошибок BMW?
          </h2>
          <div className="text-white/70 space-y-4">
            <p>
              Наша система поддерживает расшифровку стандартных OBD-II кодов (P-коды) и специфичных
              кодов BMW. Введите код ошибки в поисковую строку, и вы получите:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Подробное описание ошибки и её значение</li>
              <li>Возможные причины возникновения</li>
              <li>Симптомы и признаки неисправности</li>
              <li>Рекомендации по устранению</li>
              <li>Консультацию ИИ-помощника по вашей ситуации</li>
            </ul>
            <p>
              Если вы не знаете точный код ошибки, запишитесь на компьютерную диагностику — мы
              считаем все ошибки и поможем их устранить.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
