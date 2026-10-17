import { DATA_API_URL } from '@/lib/api';
import type { Series } from './SeriesSelector';

export interface ChiptuningData {
  snapshot?: boolean;
  model_name: string;
  series: string;
  body_type: string;
  engine_code: string;
  stock: {
    power: number;
    torque: number;
  };
  stage1: {
    power: number;
    torque: number;
    price: number;
  };
  stage2?: {
    price: number;
    power: number;
    torque: number;
  } | null;
  stage_type: string;
}

export const API_URL = DATA_API_URL;

export function convertSeriesForAPI(series: Series): string {
  const mapping: Record<string, string> = {
    '1 SERIES': '1-series',
    '2 SERIES': '2-series',
    '3 SERIES': '3-series',
    '4 SERIES': '4-series',
    '5 SERIES': '5-series',
    '6 SERIES': '6-series',
    '7 SERIES': '7-series',
    '8 SERIES': '8-series',
    'X1': 'X1',
    'X2': 'X2',
    'X3': 'X3',
    'X4': 'X4',
    'X5': 'X5',
    'X6': 'X6',
    'X7': 'X7',
    'XM': 'XM',
    'Z4': 'Z4'
  };
  return mapping[series] || series;
}
