
import type { DashboardChart } from '@/lib/types';

export async function yieldToMain(signal?: AbortSignal) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(resolve => setTimeout(resolve, 0));
}

export const DEFAULT_CHARTS: DashboardChart[] = [
  { id: 'kpi-1', type: 'kpi', title: 'Average Sale Amount', config: { metric: 'Sale_Amount', aggregation: 'average' }, size: 'small' },
  { 
    id: 'bar-1', 
    type: 'bar', 
    title: 'Sales by Product & Region', 
    size: 'medium',
    config: { 
        xAxis: 'Item Name', 
        yAxis: 'Sale_Amount', 
        series: 'Region', 
        barType: 'stacked' 
    } 
  },
  { id: 'line-1', type: 'line', title: 'Sales Over Time', config: { xAxis: 'Sale_Date', yAxis: 'Sale_Amount' }, size: 'medium' },
  { id: 'pie-1', type: 'pie', title: 'Sales by Region', config: { xAxis: 'Region', yAxis: 'Sale_Amount' }, size: 'small' },
  { 
    id: 'scatter-1', 
    type: 'scatter', 
    title: 'Neighborhood Density vs. Preference', 
    size: 'medium',
    config: { 
        xAxis: 'Population_Density', 
        yAxis: 'Preference_Score', 
    } 
  },
  { 
    id: 'bubble-1', 
    type: 'bubble', 
    title: 'Neighborhood Analysis: Density vs. Preference', 
    size: 'small',
    config: { 
        xAxis: 'Population_Density', 
        yAxis: 'Preference_Score', 
        zAxis: 'Average_Income' 
    } 
  },
  { id: 'pyramid-1', type: 'pyramid', title: 'Population Pyramid', config: { ageGroup: 'Age', sex: 'Sex', population: 'Population' }, size: 'medium' },
];
