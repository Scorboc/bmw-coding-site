// Яндекс.Метрика - отслеживание целей
declare global {
  interface Window {
    ym?: (
      counterId: number,
      action: string,
      target: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

const METRIKA_ID = 106827578;

/**
 * Отправка цели в Яндекс.Метрику
 */
export const trackGoal = (goalName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.ym) {
    try {
      window.ym(METRIKA_ID, 'reachGoal', goalName, params);
      console.log(`[Analytics] Цель отправлена: ${goalName}`, params);
    } catch (error) {
      console.error('[Analytics] Ошибка отправки цели:', error);
    }
  }
};

/**
 * Цели для чип-тюнинга
 */
export const goals = {
  // Калькулятор чип-тюнинга
  chiptuningStart: 'chiptuning_start', // Начало расчёта
  chiptuningEngineSelected: 'chiptuning_engine_selected', // Выбран двигатель
  chiptuningStageSelected: 'chiptuning_stage_selected', // Выбран Stage
  chiptuningOrderClick: 'chiptuning_order', // Клик "Записаться"
  
  // Калькулятор кодирования
  codingStart: 'coding_start',
  codingPackageSelected: 'coding_package_selected',
  codingOrderClick: 'coding_order',
  
  // Калькулятор ключей
  keyStart: 'key_start',
  keyOrderClick: 'key_order',
  
  // Контакты
  phoneClick: 'phone_click', // Клик по номеру телефона
  telegramClick: 'telegram_click', // Клик по Telegram
  whatsappClick: 'whatsapp_click', // Клик по WhatsApp
  
  // Быстрые действия
  quickActionClick: 'quick_action_click',
  
  // Специальные предложения
  specialOfferView: 'special_offer_view',
  specialOfferClick: 'special_offer_click',
} as const;

/**
 * Трекинг клика по калькулятору чип-тюнинга
 */
export const trackChiptuningOrder = (params: {
  series: string;
  engine: string;
  stage?: string;
  euro2?: boolean;
  diesel?: string[];
  transmissionTuning?: boolean;
  city: string;
  price: number;
}) => {
  trackGoal(goals.chiptuningOrderClick, {
    ...params,
    diesel_options: params.diesel?.join(', ') || 'none',
  });
};

/**
 * Трекинг клика по калькулятору кодирования
 */
export const trackCodingOrder = (params: {
  packages: string[];
  city: string;
  price: number;
}) => {
  trackGoal(goals.codingOrderClick, {
    ...params,
    packages_list: params.packages.join(', '),
  });
};

/**
 * Трекинг клика по калькулятору ключей
 */
export const trackKeyOrder = (params: {
  service: string;
  city: string;
  price: number;
}) => {
  trackGoal(goals.keyOrderClick, params);
};

/**
 * Трекинг клика по контактам
 */
export const trackContactClick = (type: 'phone' | 'telegram' | 'whatsapp', city: string) => {
  const goalMap = {
    phone: goals.phoneClick,
    telegram: goals.telegramClick,
    whatsapp: goals.whatsappClick,
  };
  
  trackGoal(goalMap[type], { city });
};
