import { AI_API_URL } from '@/lib/api';
import { ChatGPTPlayground } from "@/components/extensions/chatgpt-polza/ChatGPTPlayground";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = AI_API_URL;

const BMW_SYSTEM_PROMPT = `Ты — профессиональный консультант BMW сервиса REBORN BMW (Саратов и Москва).

Твоя специализация:
- Диагностика BMW всех серий (F и G)
- Ремонт двигателей, трансмиссий, подвески
- Электрика и электроника BMW
- Чип-тюнинг (Stage 1, Stage 2, Stage 3)
- Кодирование и активация скрытых функций
- Обслуживание (ТО, замена масла, тормозов)
- Изготовление и программирование ключей
- Устранение ошибок и неисправностей

Стиль общения:
- Профессиональный, но дружелюбный
- Конкретные советы и рекомендации
- Если нужна диагностика — предлагай записаться
- Используй технические термины, но объясняй их
- Всегда указывай примерные цены, если знаешь

Важно:
- Если вопрос не про BMW или авто — вежливо скажи, что специализируешься только на BMW
- Не придумывай цены, если не уверен — скажи "нужна диагностика"
- Рекомендуй записаться на диагностику при серьезных проблемах`;

export default function ChatGPT() {
  const navigate = useNavigate();

  useEffect(() => {
    // Закрываем страницу от индексации
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    const metaTitle = document.createElement('title');
    metaTitle.textContent = 'AI Консультант BMW | Reborn BMW';
    document.head.appendChild(metaTitle);
    
    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaTitle);
    };
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
        style={{
          background: `
          radial-gradient(ellipse 800px 600px at 20% 30%, rgba(0, 150, 255, 0.15), transparent),
          radial-gradient(ellipse 600px 800px at 80% 70%, rgba(100, 200, 255, 0.12), transparent),
          radial-gradient(ellipse 400px 400px at 50% 50%, rgba(50, 180, 255, 0.08), transparent),
          linear-gradient(135deg, #000000 0%, #0a0d15 50%, #000509 100%)
        `,
      }}
    >
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-400/20 text-white/70 hover:text-white hover:border-blue-400/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] mb-6"
          >
            <Icon name="ArrowLeft" className="w-4 h-4" />
            <span className="text-sm font-light tracking-wide">На главную</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center">
                <Icon name="Bot" className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                BMW Консультант AI
              </h1>
            </div>
            <p className="text-white/50 text-sm font-light tracking-wide">
              Задайте любой вопрос по ремонту, диагностике и обслуживанию BMW
            </p>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-xl rounded-2xl border border-blue-400/20 overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.15)]" style={{ height: 'calc(100vh - 220px)' }}>
          <ChatGPTPlayground
            apiUrl={API_URL}
            defaultModel="openai/gpt-4o-mini"
            systemPrompt={BMW_SYSTEM_PROMPT}
            title="BMW Консультант"
            placeholder="Например: Как устранить ошибку P0300 на 320i F30?"
            hideSettings={true}
          />
        </div>
      </div>
    </div>
  );
}
