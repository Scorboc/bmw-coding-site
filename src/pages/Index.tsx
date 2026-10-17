import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/HeroSection';
import TrustBanner from '@/components/TrustBanner';
import SpecialOffer from '@/components/SpecialOffer';
import CalculatorHub from '@/components/CalculatorHub';
import ServicesGrid from '@/components/ServicesGrid';
import ExpertTips from '@/components/ExpertTips';
import Reviews from '@/components/Reviews';
import QuickActions from '@/components/QuickActions';
import StickyContactButton from '@/components/StickyContactButton';
import FloatingAIButton from '@/components/FloatingAIButton';
import BlogPreview from '@/components/BlogPreview';
import PullToRefresh from '@/components/PullToRefresh';
import { City } from '@/components/CitySelector';
import { detectCityByGeolocation } from '@/utils/geolocation';
import { preloadImages, clearExpiredCache } from '@/utils/imageCache';
import { updateSeoMeta } from '@/utils/seo';

export default function Index() {
  const [selectedCity, setSelectedCity] = useState<City>('saratov');
  const [showCityPulse, setShowCityPulse] = useState(false);


  useEffect(() => {
    updateSeoMeta({
      title: 'Reborn BMW — Чип-тюнинг и Кодирование BMW',
      description: 'Профессиональный чип-тюнинг BMW: Stage 1, Stage 2, Euro 2, EGR, DPF, ADBLUE. Кодирование, изготовление ключей, стоп пробег BMW и многое',
      path: '/'
    });

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

    // Предзагрузка ключевых изображений
    preloadImages([
      '/media/rebornlogo.png',
      '/media/reborn.jpg',
    ]);

    // Очистка устаревшего кэша
    clearExpiredCache();
  }, []);

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setShowCityPulse(false);
  };

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };



  return (
    <>

      <PullToRefresh onRefresh={handleRefresh}>
        <StickyContactButton selectedCity={selectedCity} />
        <FloatingAIButton />
        <MainLayout selectedCity={selectedCity} onCityChange={handleCityChange} showCityPulse={showCityPulse}>
          <HeroSection />
          <TrustBanner />
          <div id="offers">
            <SpecialOffer selectedCity={selectedCity} />
          </div>
          <div id="services">
            <CalculatorHub selectedCity={selectedCity} />
          </div>
          <ServicesGrid selectedCity={selectedCity} />
          <div id="tips">
            <ExpertTips />
          </div>
          <div id="reviews">
            <Reviews />
          </div>
          <BlogPreview />
          <div id="contact">
            <QuickActions selectedCity={selectedCity} />
          </div>
        </MainLayout>
      </PullToRefresh>
    </>
  );
}