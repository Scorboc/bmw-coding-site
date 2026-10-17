import React from 'react';
import { City } from '@/components/CitySelector';

import { trackChiptuningOrder, trackGoal, goals } from '@/utils/analytics';
import type { Series } from './SeriesSelector';
import type { ChiptuningData } from './types';
import OptionCheckbox from './OptionCheckbox';
import StageCard from './StageCard';
import PriceDisplay from './PriceDisplay';

type DateOption = '2020' | '2023' | null;

interface StageStepProps {
  selectedEngine: ChiptuningData;
  selectedSeries: Series;
  selectedCity: City;
  selectedStage: 'stage1' | 'stage2' | null;
  euro2Enabled: boolean;
  dieselOptions: { egr: boolean; dpf: boolean; flaps: boolean; adblue: boolean };
  transmissionTuningEnabled: boolean;
  selectedBody: string | null;
  onSelectStage: (stage: 'stage1' | 'stage2' | null) => void;
  onEuro2Change: (enabled: boolean) => void;
  onDieselOptionChange: (option: 'egr' | 'dpf' | 'flaps' | 'adblue', enabled: boolean) => void;
  onTransmissionTuningChange: (enabled: boolean) => void;
  onOrder: (finalPrice: number, extras?: { dateOption?: string | null; startStopOff?: boolean }) => void;
}

export default function StageStep({ 
  selectedEngine, 
  selectedSeries, 
  selectedCity, 
  selectedStage,
  euro2Enabled,
  dieselOptions,
  transmissionTuningEnabled,
  selectedBody,
  onSelectStage,
  onEuro2Change,
  onDieselOptionChange,
  onTransmissionTuningChange,
  onOrder 
}: StageStepProps) {
  const [dateOption, setDateOption] = React.useState<DateOption>(null);
  const [startStopOff, setStartStopOff] = React.useState(false);

  const isGBody = selectedBody?.toUpperCase().startsWith('G') || false;
  
  const stages = [
    { id: 'stage1', name: 'STAGE 1', data: selectedEngine.stage1 },
    ...(selectedEngine.stage2 ? [{ id: 'stage2', name: 'STAGE 2', data: selectedEngine.stage2 }] : [])
  ];

  const isDiesel = selectedEngine.engine_code?.toLowerCase().includes('d') || false;

  const dateOptionPrice = dateOption === '2023' ? 95000 : dateOption === '2020' ? 50000 : 0;
  const startStopPrice = startStopOff ? 15000 : 0;

  const calculatePrice = (basePrice: number, _stageId: string) => {
    let price = selectedCity === 'moscow' ? basePrice : Math.round(basePrice * 0.9);
    
    if (selectedStage && euro2Enabled) {
      price += 5000;
    }
    
    if (selectedStage && isDiesel) {
      if (dieselOptions.egr) price += 5000;
      if (dieselOptions.dpf) price += 5000;
      if (dieselOptions.flaps) price += 5000;
      if (dieselOptions.adblue) price += 20000;
    }
    
    if (selectedStage && transmissionTuningEnabled) {
      price += 27000;
    }

    price += dateOptionPrice;
    price += startStopPrice;
    
    return price;
  };
  
  const euro2OnlyPrice = 12000;
  
  const dieselOnlyPrice = () => {
    let price = 0;
    if (dieselOptions.egr) price += 12000;
    if (dieselOptions.dpf) price += 12000;
    if (dieselOptions.flaps) price += 12000;
    if (dieselOptions.adblue) price += 20000;
    return price;
  };
  
  const transmissionOnlyPrice = transmissionTuningEnabled ? 27000 : 0;

  return (
    <>
      {isGBody && (
        <div className="space-y-2 mb-2">
          <div className="p-2 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(26, 8, 8, 0.7) 100%)',
              border: '1px solid',
              borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.4) 0%, rgba(0, 212, 255, 0.4) 100%) 1',
              boxShadow: '0 0 15px rgba(127, 106, 127, 0.3)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            }}
          >
            <p className="text-white/50 text-[10px] tracking-wider uppercase mb-1.5"
              style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
            >
              /// ДАТА ВЫПУСКА
            </p>
            <div className="flex gap-2">
              {([
                { value: '2020' as const, label: '06.2020+', price: '+50 000₽' },
                { value: '2023' as const, label: '01.2023+', price: '+95 000₽' }
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (dateOption === opt.value) {
                      setDateOption(null);
                      setStartStopOff(false);
                    } else {
                      setDateOption(opt.value);
                      if (opt.value !== '2023') setStartStopOff(false);
                    }
                  }}
                  className="flex-1 p-2 text-center transition-all duration-200"
                  style={{
                    background: dateOption === opt.value
                      ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.3) 0%, rgba(255, 0, 51, 0.3) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: dateOption === opt.value ? '2px solid rgba(255, 0, 0, 0.7)' : '2px solid rgba(255, 255, 255, 0.1)',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'
                  }}
                >
                  <span className="text-white text-xs tracking-wider font-bold block"
                    style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
                  >{opt.label}</span>
                  <span className="text-white/50 text-[10px] tracking-wider block"
                    style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
                  >{opt.price}</span>
                </button>
              ))}
            </div>
          </div>

          {dateOption === '2023' && (
            <OptionCheckbox
              checked={startStopOff}
              onChange={setStartStopOff}
              label="START/STOP OFF"
            />
          )}
        </div>
      )}

      <div className="space-y-2 mb-2">
        {!isDiesel && (
          <OptionCheckbox
            checked={euro2Enabled}
            onChange={onEuro2Change}
            label="EURO 2"
          />
        )}
        
        <OptionCheckbox
          checked={transmissionTuningEnabled}
          onChange={onTransmissionTuningChange}
          label="ЧИП-ТЮНИНГ АКПП"
        />
      </div>

      {isDiesel && (
        <div className="space-y-2 mb-2">
          {[
            { key: 'egr' as const, label: 'EGR', price: 12000, withStage: 5000 },
            { key: 'dpf' as const, label: 'DPF', price: 12000, withStage: 5000 },
            { key: 'flaps' as const, label: 'FLAPS', price: 12000, withStage: 5000 },
            { key: 'adblue' as const, label: 'ADBLUE', price: 20000, withStage: 20000 }
          ].map(option => (
            <OptionCheckbox
              key={option.key}
              checked={dieselOptions[option.key]}
              onChange={(checked) => onDieselOptionChange(option.key, checked)}
              label={option.label}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="space-y-1">
          {stages.map((stage) => {
            const price = calculatePrice(stage.data.price, stage.id);
            const isSelected = selectedStage === stage.id;

            return (
              <StageCard
                key={stage.id}
                stageId={stage.id}
                stageName={stage.name}
                isSelected={isSelected}
                price={price}
                power={stage.data.power}
                torque={stage.data.torque}
                onClick={() => {
                  if (isSelected) {
                    onSelectStage(null);
                  } else {
                    onSelectStage(stage.id as 'stage1' | 'stage2');
                    trackGoal(goals.chiptuningStageSelected, {
                      series: selectedSeries,
                      engine: selectedEngine.engine_code,
                      stage: stage.id,
                      city: selectedCity
                    });
                  }
                }}
              />
            );
          })}
        </div>

        <PriceDisplay
          finalPrice={
            selectedStage 
              ? calculatePrice(
                  stages.find(s => s.id === selectedStage)?.data.price || 0,
                  selectedStage
                )
              : (euro2Enabled ? euro2OnlyPrice : 0) + dieselOnlyPrice() + transmissionOnlyPrice + dateOptionPrice + startStopPrice
          }
          selectedStage={selectedStage}
          euro2Enabled={euro2Enabled}
          dieselOptions={dieselOptions}
          transmissionTuningEnabled={transmissionTuningEnabled}
          isDiesel={isDiesel}
          onOrder={() => {
            const finalPrice = selectedStage 
              ? calculatePrice(
                  stages.find(s => s.id === selectedStage)?.data.price || 0,
                  selectedStage
                )
              : (euro2Enabled ? euro2OnlyPrice : 0) + dieselOnlyPrice() + transmissionOnlyPrice + dateOptionPrice + startStopPrice;

            trackChiptuningOrder({
              series: selectedSeries,
              engine: selectedEngine.engine_code,
              stage: selectedStage || 'none',
              euro2: euro2Enabled,
              diesel: isDiesel ? Object.entries(dieselOptions).filter(([, enabled]) => enabled).map(([name]) => name) : undefined,
              transmissionTuning: transmissionTuningEnabled,
              city: selectedCity,
              price: finalPrice
            });

            onOrder(finalPrice, { dateOption, startStopOff });
          }}
        />
      </div>
    </>
  );
}
