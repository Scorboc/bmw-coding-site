import { DATA_API_URL, apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';

interface ChiptuningVariant {
  model: string;
  stock_power: number;
  stock_torque: number;
  stage1_power: number;
  stage1_torque: number;
  stage1_price: number;
  stage2_power?: number;
  stage2_torque?: number;
  stage2_price?: number;
  show_stage2: boolean;
}

interface ApiChiptuningItem {
  model_name: string;
  engine_code: string;
  stock: { power: number; torque: number };
  stage1: { power: number; torque: number; price: number };
  stage2?: { power: number; torque: number; price?: number } | null;
  show_stage2: boolean;
  status: string;
}

interface ChiptuningData {
  variants: ChiptuningVariant[];
  isLoading: boolean;
  error: string | null;
  isSnapshot: boolean;
}

const CHIPTUNING_API = DATA_API_URL;

export function useChiptuningData(engineName: string): ChiptuningData {
  const [isSnapshot, setIsSnapshot] = useState(false);
  const [variants, setVariants] = useState<ChiptuningVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`${CHIPTUNING_API}?action=variants`);
        if (!response.ok) throw new Error('Failed to fetch chiptuning data');
        
        setIsSnapshot(response.headers.get('X-Data-Source') === 'repository-snapshot');
        const data: ApiChiptuningItem[] = await response.json();
        
        const filtered = data.filter((item) => 
          item.status === '1' &&
          item.engine_code && 
          item.engine_code.toLowerCase().includes(engineName.toLowerCase())
        );
        
        setVariants(filtered.map((item) => ({
          model: item.model_name,
          stock_power: item.stock.power,
          stock_torque: item.stock.torque,
          stage1_power: item.stage1.power,
          stage1_torque: item.stage1.torque,
          stage1_price: item.stage1.price,
          stage2_power: item.stage2?.power,
          stage2_torque: item.stage2?.torque,
          stage2_price: item.stage2?.price,
          show_stage2: item.show_stage2
        })));
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setVariants([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (engineName) {
      fetchData();
    }
  }, [engineName]);

  return { variants, isLoading, error, isSnapshot };
}
