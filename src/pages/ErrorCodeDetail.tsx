import { DATA_API_URL, apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { City } from '@/components/CitySelector';
import { getTelegramLink } from '@/utils/cityConfig';

const API_URL = DATA_API_URL;

interface ErrorCode {
  id: number;
  code: string;
  title: string;
  description: string;
  severity: string;
  common_causes: string[];
  symptoms: string[];
  solutions: string[];
  related_systems: string[];
  category: string;
}

interface AIResponse {
  answer: string;
  loading: boolean;
}

export default function ErrorCodeDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [errorData, setErrorData] = useState<ErrorCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingSnapshot, setUsingSnapshot] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse>({ answer: '', loading: false });
  const [selectedCity] = useState<City>('moscow');

  useEffect(() => {
    if (code) {
      loadErrorCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (errorData) {
      // Добавляем breadcrumbs микроразметку
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify({
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
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `Ошибка ${errorData.code}`,
            "item": `https://reborn-bmw.tech/error-codes/${errorData.code}`
          }
        ]
      });
      document.head.appendChild(breadcrumbScript);

      // Добавляем FAQ микроразметку для решений
      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Что означает ошибка ${errorData.code}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": errorData.description
            }
          },
          {
            "@type": "Question",
            "name": `Как устранить ошибку ${errorData.code}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": errorData.solutions.join('. ')
            }
          }
        ]
      });
      document.head.appendChild(faqScript);

      return () => {
        document.head.removeChild(breadcrumbScript);
        document.head.removeChild(faqScript);
      };
    }
  }, [errorData]);

  const loadErrorCode = async (errorCode: string) => {
    setLoading(true);
    setNotFound(false);
    setLoadError('');
    setErrorData(null);
    try {
      const response = await apiFetch(`${API_URL}?action=get_error&code=${errorCode.toUpperCase()}`);
      setUsingSnapshot(response.headers.get('X-Data-Source') === 'repository-snapshot');
      const data = await response.json();
      
      if (data.found) {
        setErrorData(data.error);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load error code:', error);
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить код ошибки.');
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (!aiQuestion.trim() || !errorData) return;

    setAiResponse({ answer: '', loading: true });

    try {
      const response = await apiFetch(`${API_URL}?action=ask_ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: errorData.code,
          question: aiQuestion,
          context: {
            title: errorData.title,
            description: errorData.description
          }
        })
      });

      const data = await response.json();
      setAiResponse({ answer: data.answer, loading: false });
    } catch (error) {
      console.error('AI request failed:', error);
      setAiResponse({
        answer: 'Произошла ошибка при обращении к ИИ. Попробуйте позже.',
        loading: false
      });
    }
  };

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
        return 'Критическая ошибка';
      case 'warning':
        return 'Предупреждение';
      default:
        return 'Информация';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#E7222E]/20 border-t-[#E7222E] animate-spin" />
      </div>
    );
  }

  if (loadError) return <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 px-4">
    <h1>Не удалось загрузить код ошибки</h1><p role="alert">{loadError}</p>
    <Button onClick={() => code && loadErrorCode(code)}>Повторить</Button>
    <Link to="/error-codes">Вернуться к поиску</Link>
  </main>;

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Icon name="SearchX" className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">{usingSnapshot ? 'Код отсутствует в справочной копии' : 'Код ошибки не найден'}</h1>
          <p className="text-white/60 mb-8">
            Код <span className="font-mono font-bold">{code}</span> {usingSnapshot ? 'не найден в справочной копии. Онлайн-база сейчас недоступна.' : 'не найден в нашей базе данных.'}
          </p>
          <Button onClick={() => navigate('/error-codes')}>
            <Icon name="ArrowLeft" className="w-5 h-5 mr-2" />
            Вернуться к поиску
          </Button>
        </div>
      </div>
    );
  }

  if (!errorData) return null;

  const colors = getSeverityColor(errorData.severity);
  const telegramLink = getTelegramLink(
    selectedCity,
    `ошибка BMW ${errorData.code}: ${errorData.title}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Link
          to="/error-codes"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <Icon name="ArrowLeft" className="w-5 h-5" />
          <span>Все коды ошибок</span>
        </Link>

        {usingSnapshot && <p role="status" className="text-white/70 mb-6">Справочная копия каталога. Онлайн-база сейчас недоступна. Точную причину ошибки определяет диагностика.</p>}
        {/* Error code header */}
        <div
          className="p-6 md:p-8 rounded-xl mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-2 rounded-lg font-mono font-bold text-2xl"
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  {errorData.code}
                </span>
                <span
                  className="text-sm px-3 py-1 rounded"
                  style={{
                    background: colors.bg,
                    color: colors.text
                  }}
                >
                  {getSeverityLabel(errorData.severity)}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">{errorData.title}</h1>
              <p className="text-lg text-white/70">{errorData.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open(telegramLink, '_blank')}
              className="flex-1"
              style={{
                background: 'linear-gradient(135deg, #E7222E, #B51820)',
                boxShadow: '0 8px 32px rgba(231, 34, 46, 0.4)'
              }}
            >
              <Icon name="MessageCircle" className="w-5 h-5 mr-2" />
              Записаться в сервис
            </Button>
            <Button
              onClick={() => window.open(telegramLink, '_blank')}
              variant="outline"
              className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Icon name="Phone" className="w-5 h-5 mr-2" />
              Позвонить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Common causes */}
          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon name="Search" className="w-6 h-6 text-[#E7222E]" />
              <h2 className="text-xl font-bold text-white">Возможные причины</h2>
            </div>
            <ul className="space-y-2">
              {errorData.common_causes.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white/70">
                  <Icon name="ChevronRight" className="w-5 h-5 text-[#E7222E] flex-shrink-0 mt-0.5" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Symptoms */}
          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon name="AlertCircle" className="w-6 h-6 text-[#E7222E]" />
              <h2 className="text-xl font-bold text-white">Симптомы</h2>
            </div>
            <ul className="space-y-2">
              {errorData.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white/70">
                  <Icon name="ChevronRight" className="w-5 h-5 text-[#E7222E] flex-shrink-0 mt-0.5" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Solutions */}
        <div
          className="p-6 rounded-xl mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Wrench" className="w-6 h-6 text-[#E7222E]" />
            <h2 className="text-xl font-bold text-white">Что делать?</h2>
          </div>
          <ul className="space-y-3">
            {errorData.solutions.map((solution, idx) => (
              <li key={idx} className="flex items-start gap-3 text-white/70">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {idx + 1}
                </span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Chat */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.05), rgba(181, 24, 32, 0.02))',
            border: '1px solid rgba(231, 34, 46, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Brain" className="w-6 h-6 text-[#E7222E]" />
            <h2 className="text-xl font-bold text-white">ИИ-консультант</h2>
          </div>
          <p className="text-white/60 mb-4">
            Задайте вопрос о вашей конкретной ситуации, и ИИ даст персональную рекомендацию
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                placeholder="Например: можно ли ехать с этой ошибкой?"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#E7222E]/50"
              />
              <Button
                onClick={askAI}
                disabled={aiResponse.loading || !aiQuestion.trim()}
                style={{
                  background: 'linear-gradient(135deg, #E7222E, #B51820)',
                }}
              >
                {aiResponse.loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="Send" className="w-5 h-5" />
                )}
              </Button>
            </div>

            {aiResponse.answer && (
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <p className="text-white/80 whitespace-pre-wrap">{aiResponse.answer}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-white/40 text-sm self-center">Примеры вопросов:</span>
              {['Можно ли ехать?', 'Сколько стоит ремонт?', 'Насколько это срочно?'].map((q) => (
                <button
                  key={q}
                  onClick={() => setAiQuestion(q)}
                  className="px-3 py-1 rounded text-sm text-white/60 hover:text-white transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
