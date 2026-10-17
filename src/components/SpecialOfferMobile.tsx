
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { getTelegramLink } from '@/utils/cityConfig';

const offers = [
  {
    id: 1,
    icon: 'Map',
    title: 'Российские карты',
    description: 'Смена навигации за 1 час. Настройка и активация включены.',
    oldPrice: '35 000 ₽',
    newPrice: '25 000 ₽',
    discount: '-29%',
    image: '/media/mgu1.jpg',
    features: [
      { icon: 'Clock', text: '1 час' },
      { icon: 'Shield', text: 'Гарантия' },
      { icon: 'Gift', text: 'CarPlay' }
    ],
    hasButton: true,
    buttonText: 'Оформить',
    buttonService: 'Российские карты навигации'
  },
  {
    id: 2,
    icon: 'AlertTriangle',
    title: 'Удаление ошибки экстренного вызова',
    description: 'Программное удаление ошибки без замены блока',
    oldPrice: '20 000 ₽',
    newPrice: '5 000 ₽',
    discount: '-75%',
    image: '/media/KOnOQJrG2OG-A3IbwfD2C7UUxm4-1920.jpg',
    features: [
      { icon: 'Clock', text: '30 мин' },
      { icon: 'Shield', text: 'Гарантия' },
      { icon: 'Check', text: 'Без ремонта' }
    ],
    hasButton: true,
    buttonText: 'Оформить',
    buttonService: 'Удаление ошибки экстренного вызова'
  },
  {
    id: 3,
    icon: 'Cpu',
    title: 'Unlock блока двигателя',
    description: 'Разблокировка DME/DDE для BMW 2020+. Прямая логистика собственным курьером.',
    oldPrice: '',
    newPrice: '',
    discount: '',
    image: '/media/MDG1.jpg',
    features: [
      { icon: 'Clock', text: '3-5 дней' },
      { icon: 'Shield', text: 'Гарантия' },
      { icon: 'Truck', text: 'Курьер' }
    ],
    hasButton: true,
    buttonText: 'Записаться',
    buttonService: 'Unlock блока двигателя'
  },
  {
    id: 4,
    icon: 'Key',
    title: 'Новый ключ BMW за 25 000 ₽',
    description: 'За 30 минут без разбора авто. Полноценная копия для G-серии',
    oldPrice: '40 000 ₽',
    newPrice: '25 000 ₽',
    discount: '-37%',
    image: '/media/key.jpg',
    features: [
      { icon: 'Clock', text: '30 минут' },
      { icon: 'Shield', text: 'Без разбора' },
      { icon: 'Key', text: 'Копия' }
    ],
    hasButton: true,
    buttonText: 'Купить',
    buttonService: 'Новый ключ BMW'
  }
];

interface SpecialOfferMobileProps {
  selectedCity: City;
}

export default function SpecialOfferMobile({ selectedCity }: SpecialOfferMobileProps) {


  return (
    <div className="mb-12">
      <div className="overflow-x-auto scrollbar-hide -mx-4 snap-x snap-mandatory" id="offers-scroll">
        <div className="flex gap-4 px-4 pb-2">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="flex-shrink-0 snap-center rounded-2xl overflow-hidden"
              style={{
                minWidth: '300px',
                width: '300px',
                border: '1px solid rgba(231, 34, 46, 0.25)',
                boxShadow: '0 20px 50px -20px rgba(231, 34, 46, 0.4)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005))'
              }}
            >
              <div 
                className="h-0.5"
                style={{
                  background: 'linear-gradient(90deg, #81C4FF 0%, #16588E 50%, #E7222E 100%)',
                  boxShadow: '0 0 20px rgba(231, 34, 46, 0.6)'
                }}
              />
              
              <div className="relative h-40 overflow-hidden bg-black">
                <img 
                  src={offer.image}
                  alt={offer.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'brightness(1.2) contrast(1.2)',
                    objectPosition: 'center'
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.6) 100%)'
                  }}
                />
              </div>
              
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name={offer.icon} className="w-5 h-5 text-[#E7222E]" />
                </div>
                
                <h3 className="font-light text-white text-base mb-3 leading-snug h-[3rem] line-clamp-2">
                  {offer.title}
                </h3>
                
                <p className="text-white/70 text-xs font-light leading-relaxed h-[2.5rem] line-clamp-2 mb-4">
                  {offer.description}
                </p>
                
                {(offer.oldPrice || offer.newPrice) ? (
                  <div className="flex items-center justify-between mb-3 h-[2rem]">
                    <div className="flex items-center gap-3">
                      {offer.oldPrice && <span className="text-white/40 text-xs line-through">{offer.oldPrice}</span>}
                      {offer.newPrice && <span className="font-light text-[#E7222E] text-lg">{offer.newPrice}</span>}
                    </div>
                    {offer.discount && (
                      <div 
                        className="px-3 py-1 rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.9), rgba(231, 34, 46, 0.7))',
                          boxShadow: '0 4px 20px rgba(231, 34, 46, 0.3)'
                        }}
                      >
                        <span className="text-white text-sm font-medium">{offer.discount}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[2rem] mb-3" />
                )}
                
                <div className="flex items-center gap-3 text-xs mb-4 h-[1.5rem]">
                  {offer.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Icon 
                        name={feature.icon}
                        className="w-3 h-3 text-white/60"
                      />
                      <span className="text-white/60">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {offer.hasButton && (
                  <a 
                    href={getTelegramLink(selectedCity, offer.buttonService)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-medium text-white text-sm transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(231, 34, 46, 0.9), rgba(231, 34, 46, 0.7))',
                      boxShadow: '0 8px 24px rgba(231, 34, 46, 0.4)'
                    }}
                  >
                    <Icon name="Send" className="w-4 h-4" />
                    <span>{offer.buttonText}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <Icon name="ChevronsRight" className="w-4 h-4" />
          <span>Листайте для просмотра всех акций</span>
        </div>
      </div>
    </div>
  );
}
