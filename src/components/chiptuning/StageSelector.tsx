import { apiFetch } from '@/lib/api';
import React from 'react';
import Icon from '@/components/ui/icon';
import { City } from '@/components/CitySelector';
import { getCityName, getCityConfig } from '@/utils/cityConfig';
import type { Series } from './SeriesSelector';
import { API_URL, convertSeriesForAPI, ChiptuningData } from './types';
import BodyTypeStep from './BodyTypeStep';
import EngineStep from './EngineStep';
import StageStep from './StageStep';

interface StageSelectorProps {
  selectedSeries: Series;
  selectedCity: City;
  onReset: () => void;
  onStepChange?: (step: string) => void;
}

export default function StageSelector({ selectedSeries, selectedCity, onReset, onStepChange }: StageSelectorProps) {
  const [step, setStepState] = React.useState<'body' | 'engine' | 'stage'>('body');
  
  const setStep = (newStep: 'body' | 'engine' | 'stage') => {
    setStepState(newStep);
    onStepChange?.(newStep);
  };
  const [bodyTypes, setBodyTypes] = React.useState<string[]>([]);
  const [selectedBody, setSelectedBody] = React.useState<string | null>(null);
  const [engines, setEngines] = React.useState<ChiptuningData[]>([]);
  const [selectedEngine, setSelectedEngine] = React.useState<ChiptuningData | null>(null);
  const [selectedStage, setSelectedStage] = React.useState<'stage1' | 'stage2' | null>(null);
  const [euro2Enabled, setEuro2Enabled] = React.useState(false);
  const [dieselOptions, setDieselOptions] = React.useState({ egr: false, dpf: false, flaps: false, adblue: false });
  const [transmissionTuningEnabled, setTransmissionTuningEnabled] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [usingSnapshot, setUsingSnapshot] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const apiSeries = convertSeriesForAPI(selectedSeries);

  // Шаг 1: Загружаем типы кузовов
  React.useEffect(() => {
    const loadBodyTypes = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await apiFetch(`${API_URL}?action=bodies&series=${encodeURIComponent(apiSeries)}`);
        setUsingSnapshot(response.headers.get('X-Data-Source') === 'repository-snapshot');
        const data = await response.json();
        setBodyTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить кузова.');
        setBodyTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadBodyTypes();
  }, [apiSeries]);

  // Шаг 2: Загружаем двигатели при выборе кузова
  const handleBodySelect = async (body: string) => {
    setSelectedBody(body);
    setLoading(true);
    setLoadError('');
    try {
      const response = await apiFetch(`${API_URL}?action=engines&series=${encodeURIComponent(apiSeries)}&body_type=${encodeURIComponent(body)}`);
      const data = await response.json();
      setEngines(Array.isArray(data) ? data.map((engine: ChiptuningData) => ({
        ...engine,
        stage2: engine.stage2 && Number.isFinite(engine.stage2.price) ? engine.stage2 : null
      })) : []);
      setStep('engine');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить двигатели.');
      setEngines([]);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 3: Выбор двигателя
  const handleEngineSelect = (engine: ChiptuningData) => {
    setSelectedEngine(engine);
    setStep('stage');
  };

  const handleOrder = (finalPrice: number, extras?: { dateOption?: string | null; startStopOff?: boolean }) => {
    if (!selectedEngine) return;

    const messageLines = [`ЧИП-ТЮНИНГ BMW ${selectedSeries}`, '', `${selectedEngine.engine_code} (${selectedEngine.body_type})`];

    if (selectedStage) {
      const stageData = selectedStage === 'stage1' ? selectedEngine.stage1 : selectedEngine.stage2;
      if (stageData) {
        const gains = `${selectedEngine.stock.power} → ${stageData.power} л.с. | ${selectedEngine.stock.torque} → ${stageData.torque} Нм`;
        messageLines.push(selectedStage.toUpperCase());
        messageLines.push(gains);
      }
    }

    if (extras?.dateOption === '2020') messageLines.push('Дата выпуска: 06.2020+ (+50 000₽)');
    if (extras?.dateOption === '2023') messageLines.push('Дата выпуска: 01.2023+ (+95 000₽)');
    if (extras?.startStopOff) messageLines.push('Start/Stop OFF: Да');
    if (euro2Enabled) messageLines.push('EURO 2: Да');
    if (transmissionTuningEnabled) messageLines.push('Чип-тюнинг АКПП: Да');
    if (dieselOptions.egr) messageLines.push('EGR: Да');
    if (dieselOptions.dpf) messageLines.push('DPF: Да');
    if (dieselOptions.flaps) messageLines.push('FLAPS: Да');
    if (dieselOptions.adblue) messageLines.push('ADBLUE: Да');

    messageLines.push('');
    if (selectedEngine.snapshot) messageLines.push('Расчёт по справочной копии — подтвердите цену и доступность.');
    messageLines.push(`СТОИМОСТЬ: ${finalPrice.toLocaleString('ru-RU')} ₽`);
    messageLines.push(`Город: ${getCityName(selectedCity)}`);
    
    const message = messageLines.join('\n');
    const config = getCityConfig(selectedCity);
    window.open(`${config.telegram}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBack = () => {
    if (step === 'stage') {
      setStep('engine');
      setSelectedEngine(null);
      setSelectedStage(null);
      setEuro2Enabled(false);
      setDieselOptions({ egr: false, dpf: false, flaps: false, adblue: false });
      setTransmissionTuningEnabled(false);
    } else if (step === 'engine') {
      setStep('body');
      setSelectedBody(null);
    } else {
      // Если на шаге выбора кузова - возвращаемся к выбору серии
      onReset();
    }
  };

  return (
    <div className="space-y-2">
      {loadError && <p role="alert" className="text-amber-200">{loadError}</p>}
      {usingSnapshot && <p role="status" className="text-white/70 text-sm">Справочная копия каталога. Актуальные цены и доступность подтвердит мастер.</p>}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-1.5 transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(255, 0, 51, 0.4))',
          border: '2px solid rgba(255, 0, 0, 0.5)',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          boxShadow: '0 0 15px rgba(255, 0, 0, 0.4)'
        }}
      >
        <Icon name="ChevronLeft" className="w-5 h-5 text-red-400" />
        <span 
          className="tracking-wider text-red-400 uppercase"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          /// НАЗАД
        </span>
      </button>

      <div 
        className="p-2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.9) 0%, rgba(26, 8, 8, 0.9) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.7) 0%, rgba(255, 0, 51, 0.7) 50%, rgba(0, 212, 255, 0.7) 50%, rgba(56, 189, 248, 0.7) 100%) 1',
          boxShadow: '0 0 30px rgba(127, 106, 127, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.5)',
          clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)'
        }}
      >
        <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(255, 0, 0, 0.3), rgba(0, 212, 255, 0.3))', clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
        <p 
          className="text-white text-[10px] mb-0.5 tracking-widest uppercase"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          /// ВЫБРАНА СЕРИЯ
        </p>
        <p 
          className="text-white text-lg tracking-widest font-bold uppercase"
          style={{ 
            fontFamily: '"Reborn Technologies", sans-serif'
          }}
        >
          {selectedSeries}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-white/60 text-sm tracking-wider" style={{ fontFamily: '"Reborn Technologies", sans-serif' }}>
            /// ЗАГРУЗКА ДАННЫХ...
          </p>
        </div>
      ) : (
        <>
          {step === 'body' && (
            <BodyTypeStep 
              bodyTypes={bodyTypes}
              onSelectBody={handleBodySelect}
            />
          )}

          {step === 'engine' && (
            <EngineStep
              engines={engines}
              selectedBody={selectedBody}
              onSelectEngine={handleEngineSelect}
            />
          )}

          {step === 'stage' && selectedEngine && (
            <StageStep
              selectedEngine={selectedEngine}
              selectedSeries={selectedSeries}
              selectedCity={selectedCity}
              selectedStage={selectedStage}
              euro2Enabled={euro2Enabled}
              dieselOptions={dieselOptions}
              transmissionTuningEnabled={transmissionTuningEnabled}
              selectedBody={selectedBody}
              onSelectStage={setSelectedStage}
              onEuro2Change={setEuro2Enabled}
              onDieselOptionChange={(option, enabled) => {
                setDieselOptions(prev => ({ ...prev, [option]: enabled }));
              }}
              onTransmissionTuningChange={setTransmissionTuningEnabled}
              onOrder={handleOrder}
            />
          )}
        </>
      )}
    </div>
  );
}
