import { SERVICES_API_URL, apiFetch } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import CarVisualization from './services/CarVisualization';
import ServicePreviewModal from './services/ServicePreviewModal';
import { categoryIcons, serviceVisuals } from './services/ServiceVisualData';
import { getTelegramLink } from '@/utils/cityConfig';
import { City } from '@/components/CitySelector';

const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

interface Service {
  service_code: string;
  category: string;
  service_name: string;
  description: string;
  price: number;
  duration_minutes: number;
  complexity: string;
  is_popular: boolean;
  is_available: boolean;
  missing_blocks?: string[];
}

interface Category {
  name: string;
  services: Service[];
  total_services: number;
}

interface CalculatorProps {
  vinData: { vin: string; vehicle: { manufacturer: string; series: string; year: string | number } };
  selectedCity: City;
}

export default function ServicesCalculator({ vinData, selectedCity }: CalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [previewService, setPreviewService] = useState<Service | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch(SERVICES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_services',
          vinData: vinData
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [vinData]);

  const calculateTotal = useCallback(async () => {
    if (selectedServices.size === 0) return;

    try {
      const response = await apiFetch(SERVICES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_order',
          vinData: vinData,
          selectedServices: Array.from(selectedServices)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setTotalPrice(data.total_price);
        setFinalPrice(data.final_price);
        setDiscount(data.discount_percent);
        setTotalDuration(data.total_duration);
      }
    } catch (error) {
      console.error(error);
    }
  }, [vinData, selectedServices]);

  const toggleService = (serviceCode: string) => {
    vibrate(10);
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceCode)) {
      newSelected.delete(serviceCode);
    } else {
      newSelected.add(serviceCode);
    }
    setSelectedServices(newSelected);
  };

  useEffect(() => {
    if (vinData) {
      loadServices();
    }
  }, [vinData, loadServices]);

  useEffect(() => {
    if (selectedServices.size > 0) {
      calculateTotal();
    } else {
      setTotalPrice(0);
      setFinalPrice(0);
      setDiscount(0);
      setTotalDuration(0);
    }
  }, [selectedServices, calculateTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (Object.keys(categories).length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <CarVisualization hoveredService={hoveredService} />
        
        <div 
          className="relative backdrop-blur-xl rounded-2xl border p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.25)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 20%, rgba(59, 130, 246, 0.9) 50%, rgba(59, 130, 246, 0.3) 80%, transparent 100%)',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
            }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0"
            style={{
              width: '2px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.5) 50%, transparent 100%)',
              boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <defs>
              <pattern id="services-bg-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1" fill="rgba(59, 130, 246, 0.5)">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite" />
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#services-bg-pattern)" />
          </svg>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Icon name="ShoppingCart" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold">Выберите услуги</h3>
              <p className="text-gray-400 text-sm">Скидка 10% от 3 услуг, 15% от 5 услуг</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(categories).map(([catKey, category]) => (
              <div 
                key={catKey} 
                className="relative rounded-xl p-4 border overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.6) 0%, rgba(15, 15, 25, 0.8) 100%)',
                  borderColor: 'rgba(100, 100, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(100, 100, 255, 0.1)'
                }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: '3px',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(100, 150, 255, 0.8) 50%, transparent 100%)',
                    boxShadow: '0 0 20px rgba(100, 150, 255, 0.6)'
                  }}
                />
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ mixBlendMode: 'overlay' }}>
                  <defs>
                    <pattern id={`dots-${catKey}`} x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                      <circle cx="12.5" cy="12.5" r="0.8" fill="rgba(150, 180, 255, 0.5)">
                        <animate attributeName="r" values="0.5;1.2;0.5" dur="4s" repeatCount="indefinite" />
                      </circle>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#dots-${catKey})`} />
                </svg>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative group">
                    <Icon name={categoryIcons[catKey] || 'Box'} className="w-6 h-6 md:w-5 md:h-5 text-blue-400" />
                    <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-active:opacity-100 transition-opacity pointer-events-none z-10 border border-blue-400/30 shadow-[0_8px_24px_rgba(59,130,246,0.5)]">
                      {category.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-cyan-600" />
                    </div>
                  </div>
                  <h4 className="text-white font-medium hidden md:block">{category.name}</h4>
                  <span className="text-gray-400 text-sm">({category.total_services})</span>
                </div>

                <div className="space-y-2">
                  {category.services.map((service) => (
                    <div key={service.service_code} className="relative">
                      <label
                        onMouseEnter={() => setHoveredService(service.service_name)}
                        onMouseLeave={() => setHoveredService(null)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedServices.has(service.service_code)
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        } border relative overflow-hidden`}
                      >
                        {selectedServices.has(service.service_code) && (
                          <>
                            <div 
                              className="absolute left-0 top-0 bottom-0"
                              style={{
                                width: '2px',
                                background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.8), transparent)',
                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                              }}
                            />
                            <div 
                              className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-full"
                              style={{
                                background: 'rgba(59, 130, 246, 0.3)',
                                boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                              }}
                            />
                          </>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedServices.has(service.service_code)}
                          onChange={() => toggleService(service.service_code)}
                          className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white font-medium text-sm">{service.service_name}</span>
                            {service.is_popular && (
                              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                                Популярно
                              </span>
                            )}
                            {serviceVisuals[service.service_code] && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  vibrate(10);
                                  setPreviewService(service);
                                }}
                                className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs px-2 py-1 rounded-full transition-all"
                              >
                                <Icon name="Image" className="w-3 h-3" />
                                <span>Фото</span>
                              </button>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mb-2">{service.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-green-400 font-semibold">{service.price.toLocaleString()} ₽</span>
                            <span className="text-gray-500">{service.duration_minutes} мин</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedServices.size > 0 && (
        <div 
          className="relative backdrop-blur-xl rounded-2xl border p-6 sticky bottom-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2), 0 0 80px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.4) 20%, rgba(16, 185, 129, 1) 50%, rgba(16, 185, 129, 0.4) 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <defs>
              <pattern id="total-pattern" x="0" y="0" width="35" height="35" patternUnits="userSpaceOnUse">
                <circle cx="17.5" cy="17.5" r="1.2" fill="rgba(16, 185, 129, 0.7)">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#total-pattern)" />
          </svg>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-semibold mb-1">Итого услуг: {selectedServices.size}</div>
              <div className="text-gray-400 text-sm">Время работы: ~{Math.round(totalDuration / 60)} ч</div>
            </div>
            <div className="text-right">
              {discount > 0 && (
                <div className="text-gray-400 text-sm line-through mb-1">
                  {totalPrice.toLocaleString()} ₽
                </div>
              )}
              <div className="text-3xl font-bold text-green-400">
                {finalPrice.toLocaleString()} ₽
              </div>
              {discount > 0 && (
                <div className="text-green-400 text-sm mt-1">
                  Скидка {discount}%: -{(totalPrice - finalPrice).toLocaleString()} ₽
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { vibrate(15); setShowContact(true); }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="CheckCircle" className="w-5 h-5" />
              <span>Форма заказа</span>
            </button>
            <button
              onClick={() => {
                vibrate(15);
                const services = Array.from(selectedServices)
                  .map(code => {
                    for (const cat of Object.values(categories)) {
                      const service = cat.services.find(s => s.service_code === code);
                      if (service) return `${service.service_name} (${service.price.toLocaleString()} ₽)`;
                    }
                    return '';
                  })
                  .filter(Boolean)
                  .join('\n');
                
                const message = `🚗 *Заказ с VIN Decoder*\n\n*VIN:* ${vinData.vin}\n*Авто:* ${vinData.vehicle.manufacturer} ${vinData.vehicle.series} (${vinData.vehicle.year})\n\n*Выбранные услуги:*\n${services}\n\n*Итого:* ${finalPrice.toLocaleString()} ₽${discount > 0 ? ` (скидка ${discount}%)` : ''}\n*Время работы:* ~${Math.round(totalDuration / 60)} ч`;
                
                const url = getTelegramLink(selectedCity, 'услуги по VIN');
                const separator = url.includes('?') ? '&' : '?';
                window.open(`${url}${separator}text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="Send" className="w-5 h-5" />
              <span>В Telegram</span>
            </button>
          </div>
        </div>
      )}

      {previewService && (
        <ServicePreviewModal
          service={previewService}
          isSelected={selectedServices.has(previewService.service_code)}
          onToggle={() => toggleService(previewService.service_code)}
          onClose={() => setPreviewService(null)}
        />
      )}

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowContact(false)}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 p-8 max-w-md w-full animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Icon name="CheckCircle" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">Форма заказа</h3>
              <p className="text-gray-400">Скоро здесь появится форма для оформления заказа</p>
            </div>
            <button
              onClick={() => { vibrate(10); setShowContact(false); }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
