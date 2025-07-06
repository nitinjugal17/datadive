

export type ColumnMapping = { [originalHeader: string]: string };
export type Filter = { column: string; values: string[] };

export type FilterOptions = {
    [column: string]: { value: string; count: number }[];
};

export type ChartConfig = {
    xAxis?: string;
    yAxis?: string;
    series?: string;
    facetBy?: string;
    barType?: 'standard' | 'grouped' | 'stacked' | 'stacked-100';
    areaType?: 'standard' | 'stacked' | 'stacked-100';
    layout?: 'vertical' | 'horizontal';
    sortOrder?: 'value-desc' | 'value-asc' | 'category-asc' | 'category-desc';
    aggregation?: 'sum' | 'average' | 'count' | 'count-distinct' | 'average-per-unique';
};

export type ScatterChartConfig = {
    xAxis?: string;
    yAxis?: string;
    zAxis?: string; // For bubble size
};

export type KpiConfig = {
    metric?: string;
    aggregation?: 'sum' | 'average' | 'count' | 'count-distinct' | 'average-per-unique';
};

export type PyramidChartConfig = {
    ageGroup?: string;
    sex?: string;
    population?: string;
};

export type HistogramConfig = {
    column?: string;
    bins?: number;
};

export type TreeMapConfig = {
    categoryKey?: string;
    nameKey?: string;
    valueKey?: string;
};

export type AnyChartConfig = ChartConfig | KpiConfig | PyramidChartConfig | ScatterChartConfig | HistogramConfig | TreeMapConfig;

export type ChartType = 'bar' | 'line' | 'pie' | 'funnel' | 'kpi' | 'pyramid' | 'scatter' | 'bubble' | 'histogram' | 'treemap' | 'area' | 'radar';

export type DashboardChart = {
    id: string;
    title: string;
    type: ChartType;
    config: Partial<AnyChartConfig>;
    size?: 'small' | 'medium' | 'wide';
};

export type Template = {
  id: string;
  name: string;
  description: string;
  filters: Filter[];
  columnMaps: Record<string, ColumnMapping>;
  chartConfigs: DashboardChart[];
  originalHeaders?: string[];
  dataFilePath?: string;
};

export type GroupReportRow = {
  group: string;
  total: number;
  breakdown: { value: string; count: number }[];
};
