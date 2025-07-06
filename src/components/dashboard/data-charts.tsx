
'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Expand, 
    PieChart as PieChartIcon, 
    BarChart2, 
    LineChart as LineChartIcon, 
    Users, 
    TrendingUp, 
    Filter as FunnelIcon, 
    Plus, 
    MoreVertical, 
    Edit, 
    Copy, 
    Trash2,
    ScatterChart as ScatterPlotIcon,
    CircleDot as BubbleChartIcon,
    BarChartHorizontal,
    Layers,
    ListChecks,
    LayoutGrid,
    AreaChart as AreaChartIconLucide,
    BarChart3 as HistogramIcon,
    Radar as RadarIcon,
    ChevronsUpDown,
    ChevronsLeftRight,
    Save,
    TriangleAlert,
    Info,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { DashboardChart, AnyChartConfig, ChartType, KpiConfig, PyramidChartConfig, ScatterChartConfig, HistogramConfig, TreeMapConfig, ChartConfig } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import {
  SimpleChartConfigurator,
  BarChartConfigurator,
  KpiConfigurator,
  PyramidChartConfigurator,
  ScatterChartConfigurator,
  BubbleChartConfigurator,
  HistogramConfigurator,
  TreeMapConfigurator,
  AreaChartConfigurator,
} from '@/components/charts/configurators';
import {
  GenericBarChart,
  GenericLineChart,
  GenericPieChart,
  GenericFunnelChart,
  GenericKpiCard,
  PopulationPyramidChart,
  GenericScatterChart,
  GenericBubbleChart,
  GenericHistogram,
  GenericTreeMap,
  GenericAreaChart,
  GenericRadarChart,
} from '@/components/charts/visualizations';


interface DataChartsProps {
  fullFilteredData: any[];
  allHeaders: string[];
  charts: DashboardChart[];
  onChartsChange: (charts: DashboardChart[]) => void;
  columnValueCounts: Record<string, number>;
  totalRowsInDataset: number;
  onSaveAsTemplate: () => void;
  memoryUsageBytes: number;
  memoryThresholdBytes: number;
  isProcessing: boolean;
  isChartDataSampled: boolean;
  onForceFullChartUpdate: () => void;
}

type AddableChart = {
  key: string;
  title: string;
  icon: React.ElementType;
  chart: {
    type: ChartType;
    config: Partial<AnyChartConfig>;
  };
};

const CHART_META: Record<ChartType, {
  defaultTitle: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  configurator: React.ComponentType<any>;
  expandDisabled?: boolean;
}> = {
  kpi: { defaultTitle: 'KPI', description: 'Display a key performance indicator.', icon: TrendingUp, component: GenericKpiCard, configurator: KpiConfigurator, expandDisabled: true },
  bar: { defaultTitle: 'Bar Chart', description: 'Compare values across categories. Supports aggregation, grouping, and stacking.', icon: BarChart2, component: GenericBarChart, configurator: BarChartConfigurator },
  line: { defaultTitle: 'Line Chart', description: 'Shows trends over time. Supports aggregation and can be segmented into small multiples.', icon: LineChartIcon, component: GenericLineChart, configurator: SimpleChartConfigurator },
  pie: { defaultTitle: 'Pie Chart', description: 'Displays proportional data. Values can be aggregated.', icon: PieChartIcon, component: GenericPieChart, configurator: SimpleChartConfigurator },
  scatter: { defaultTitle: 'Scatter Plot', description: 'Shows relationships between two numerical variables.', icon: ScatterPlotIcon, component: GenericScatterChart, configurator: ScatterChartConfigurator },
  bubble: { defaultTitle: 'Bubble Chart', description: 'Scatter plot with a third dimension for size.', icon: BubbleChartIcon, component: GenericBubbleChart, configurator: BubbleChartConfigurator },
  funnel: { defaultTitle: 'Funnel Chart', description: 'Visualizes stages in a process. Values can be aggregated.', icon: FunnelIcon, component: GenericFunnelChart, configurator: SimpleChartConfigurator },
  pyramid: { defaultTitle: 'Population Pyramid', description: 'Distribution of population by age and sex.', icon: Users, component: PopulationPyramidChart, configurator: PyramidChartConfigurator },
  histogram: { defaultTitle: 'Histogram', description: 'Shows the frequency distribution of a variable.', icon: HistogramIcon, component: GenericHistogram, configurator: HistogramConfigurator },
  treemap: { defaultTitle: 'Tree Map', description: 'Displays hierarchical data as nested rectangles.', icon: LayoutGrid, component: GenericTreeMap, configurator: TreeMapConfigurator },
  area: { defaultTitle: 'Area Chart', description: 'Shows trends of cumulative values. Supports aggregation and stacking.', icon: AreaChartIconLucide, component: GenericAreaChart, configurator: AreaChartConfigurator },
  radar: { defaultTitle: 'Radar Chart', description: "Compares multiple variables. The area can be misleading, and axis order can alter the shape.", icon: RadarIcon, component: GenericRadarChart, configurator: SimpleChartConfigurator },
};

const ADDABLE_CHARTS: AddableChart[] = [
    { key: 'kpi', title: 'KPI', icon: TrendingUp, chart: { type: 'kpi', config: {} } },
    { key: 'bar-standard', title: 'Bar Chart', icon: BarChart2, chart: { type: 'bar', config: { barType: 'standard' } } },
    { key: 'bar-grouped', title: 'Grouped Bar', icon: BarChartHorizontal, chart: { type: 'bar', config: { barType: 'grouped' } } },
    { key: 'bar-stacked', title: 'Stacked Bar', icon: Layers, chart: { type: 'bar', config: { barType: 'stacked' } } },
    { key: 'bar-stacked-100', title: '100% Stacked Bar', icon: Layers, chart: { type: 'bar', config: { barType: 'stacked-100' } } },
    { key: 'line', title: 'Line Chart', icon: LineChartIcon, chart: { type: 'line', config: {} } },
    { key: 'area', title: 'Area Chart', icon: AreaChartIconLucide, chart: { type: 'area', config: { areaType: 'standard' } } },
    { key: 'area-stacked', title: 'Stacked Area', icon: Layers, chart: { type: 'area', config: { areaType: 'stacked' } } },
    { key: 'pie', title: 'Pie Chart', icon: PieChartIcon, chart: { type: 'pie', config: {} } },
    { key: 'scatter', title: 'Scatter Plot', icon: ScatterPlotIcon, chart: { type: 'scatter', config: {} } },
    { key: 'bubble', title: 'Bubble Chart', icon: BubbleChartIcon, chart: { type: 'bubble', config: {} } },
    { key: 'funnel', title: 'Funnel Chart', icon: FunnelIcon, chart: { type: 'funnel', config: {} } },
    { key: 'pyramid', title: 'Population Pyramid', icon: Users, chart: { type: 'pyramid', config: {} } },
    { key: 'histogram', title: 'Histogram', icon: HistogramIcon, chart: { type: 'histogram', config: {} } },
    { key: 'treemap', title: 'Tree Map', icon: LayoutGrid, chart: { type: 'treemap', config: {} } },
    { key: 'radar', title: 'Radar Chart', icon: RadarIcon, chart: { type: 'radar', config: {} } },
];

const ValueSummaryCard = ({ allHeaders, columnValueCounts, totalRowsInDataset }: { allHeaders: string[]; columnValueCounts: Record<string, number>; totalRowsInDataset: number }) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnSelect = (column: string, checked: boolean) => {
    setSelectedColumns(prev => 
      checked ? [...prev, column] : prev.filter(c => c !== column)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />Column Summary</CardTitle>
        <CardDescription>Select columns to see their completeness.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between">
                        <span className="truncate">
                            {selectedColumns.length > 0 ? `${selectedColumns.length} selected` : `Select columns...`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <ScrollArea className="h-60">
                        <div className="p-2 space-y-1">
                            {allHeaders.map(header => (
                                <div key={header} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`summary-col-${header}`}
                                        checked={selectedColumns.includes(header)}
                                        onCheckedChange={(checked) => handleColumnSelect(header, !!checked)}
                                    />
                                    <Label htmlFor={`summary-col-${header}`} className="font-normal truncate cursor-pointer flex-1" title={header}>
                                        {header}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            {selectedColumns.length > 0 && (
                <ScrollArea className="max-h-64">
                    <div className="space-y-6 pt-2 pr-4">
                        {selectedColumns.map(column => {
                            const filledCount = columnValueCounts[column] || 0;
                            const completeness = totalRowsInDataset > 0 ? (filledCount / totalRowsInDataset) * 100 : 0;
                            return (
                                <div key={column} className="space-y-1">
                                    <h4 className="font-medium text-sm truncate" title={column}>Summary for "{column}"</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Filled Rows</span>
                                        <span>{filledCount.toLocaleString()} / {totalRowsInDataset.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                           <span className="text-muted-foreground">Completeness</span>
                                           <span className="font-semibold">{completeness.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={completeness} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}
        </div>
      </CardContent>
    </Card>
  );
};


const isConfigComplete = (chart: DashboardChart) => {
    const { config, type } = chart;
    const { aggregation } = config as ChartConfig;
    const isCountAgg = aggregation === 'count';

    switch (type) {
        case 'kpi':
            return !!(config as KpiConfig).metric && !!(config as KpiConfig).aggregation;
        case 'pyramid':
            const pyramidConfig = config as PyramidChartConfig;
            return !!pyramidConfig.ageGroup && !!pyramidConfig.sex && !!pyramidConfig.population;
        case 'scatter':
            return !!(config as ScatterChartConfig).xAxis && !!(config as ScatterChartConfig).yAxis;
        case 'bubble':
            const bubbleConfig = config as ScatterChartConfig;
            return !!bubbleConfig.xAxis && !!bubbleConfig.yAxis && !!bubbleConfig.zAxis;
        case 'histogram':
            return !!(config as HistogramConfig).column;
        case 'treemap':
            const treemapConfig = config as TreeMapConfig;
            return !!treemapConfig.categoryKey && !!treemapConfig.nameKey && !!treemapConfig.valueKey;
        case 'bar':
        case 'area':
        case 'line':
        case 'pie':
        case 'funnel':
        case 'radar':
            const chartConfig = config as ChartConfig;
            return !!chartConfig.xAxis && (!!chartConfig.yAxis || isCountAgg);
        default:
            return false;
    }
};

const ChartWrapper = ({
  chart,
  allHeaders,
  data,
  onChartConfigSave,
  onChartDelete,
  onChartClone,
  onChartRename,
  onChartResize,
  onChartExpand,
}: {
  chart: DashboardChart;
  allHeaders: string[];
  data: any[];
  onChartConfigSave: (chartId: string, newConfig: Partial<AnyChartConfig>) => void;
  onChartDelete: (chartId: string) => void;
  onChartClone: (chart: DashboardChart) => void;
  onChartRename: (chart: DashboardChart) => void;
  onChartResize: (chartId: string, size: 'small' | 'medium' | 'wide') => void;
  onChartExpand: (chart: DashboardChart) => void;
}) => {
  const [draftConfig, setDraftConfig] = useState(chart.config);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setDraftConfig(chart.config);
    setIsModified(false);
  }, [chart.config]);

  useEffect(() => {
    setIsModified(JSON.stringify(draftConfig) !== JSON.stringify(chart.config));
  }, [draftConfig, chart.config]);

  const handleApply = () => {
    onChartConfigSave(chart.id, draftConfig);
  };

  const handleReset = () => {
    setDraftConfig(chart.config);
  };

  const meta = CHART_META[chart.type];
  if (!meta) return null;
  const ChartComponent = meta.component;
  const Configurator = meta.configurator;
  const size = chart.size || 'small';
  const draftConfigIsComplete = isConfigComplete({ ...chart, config: draftConfig });
  const finalConfigIsComplete = isConfigComplete(chart);

  const invalidRowCount = useMemo(() => {
    if (!finalConfigIsComplete || !data?.length) return 0;

    const { config, type } = chart;

    return data.filter(row => {
        const isNotNumeric = (key?: string) => {
          if (!key) return true;
          const value = row[key];
          if (value === null || value === undefined) return true;
          return isNaN(parseFloat(String(value)));
        };
        const checkExists = (key?: string) => {
            if (!key) return true;
            const value = row[key];
            return value === null || value === undefined || String(value).trim() === '';
        };

        switch (type) {
            case 'bar':
            case 'line':
            case 'pie':
            case 'funnel':
            case 'area':
            case 'radar': {
                const chartConfig = config as ChartConfig;
                if (checkExists(chartConfig.xAxis)) return true;
                if (chartConfig.series && checkExists(chartConfig.series)) return true;

                const agg = chartConfig.aggregation || 'sum';
                if (agg !== 'count') {
                  if (checkExists(chartConfig.yAxis)) return true;
                  if ((agg === 'sum' || agg === 'average') && isNotNumeric(chartConfig.yAxis)) {
                    return true;
                  }
                }
                return false;
            }
            case 'kpi': {
                const kpiConfig = config as KpiConfig;
                if (!kpiConfig.metric) return false;
                if (checkExists(kpiConfig.metric)) return true;
                
                const agg = kpiConfig.aggregation || 'sum';
                if ((agg === 'sum' || agg === 'average') && isNotNumeric(kpiConfig.metric)) {
                    return true;
                }
                return false;
            }
            case 'pyramid': {
                const pyramidConfig = config as PyramidChartConfig;
                return checkExists(pyramidConfig.ageGroup) || checkExists(pyramidConfig.sex) || isNotNumeric(pyramidConfig.population);
            }
            case 'scatter':
            case 'bubble': {
                const scatterConfig = config as ScatterChartConfig;
                if (isNotNumeric(scatterConfig.xAxis) || isNotNumeric(scatterConfig.yAxis)) return true;
                if (type === 'bubble' && isNotNumeric(scatterConfig.zAxis)) return true;
                return false;
            }
            case 'histogram': {
                const histConfig = config as HistogramConfig;
                return isNotNumeric(histConfig.column);
            }
            case 'treemap': {
                const treeConfig = config as TreeMapConfig;
                return checkExists(treeConfig.categoryKey) || checkExists(treeConfig.nameKey) || isNotNumeric(treeConfig.valueKey);
            }
            default:
                return false;
        }
    }).length;
  }, [chart, data, finalConfigIsComplete]);

  return (
    <Card className={cn(
      size === 'medium' && 'lg:col-span-2',
      size === 'wide' && 'lg:col-span-3'
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2"><meta.icon className="h-5 w-5 text-primary" />{chart.title}</CardTitle>
            <CardDescription>{meta.description}</CardDescription>
          </div>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChartExpand(chart)}
                      disabled={meta.expandDisabled || !finalConfigIsComplete}
                    >
                      <Expand className="h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                {(!finalConfigIsComplete && !meta.expandDisabled) && (
                  <TooltipContent>
                    <p>Complete configuration to expand.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChartRename(chart)}>
                  <Edit className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChartClone(chart)}>
                  <Copy className="mr-2 h-4 w-4" /> Clone
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ChevronsLeftRight className="mr-2 h-4 w-4" />
                    <span>Resize</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={size}
                        onValueChange={(value) => onChartResize(chart.id, value as 'small' | 'medium' | 'wide')}
                      >
                        <DropdownMenuRadioItem value="small">Small</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="wide">Wide</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem className="text-destructive" onClick={() => onChartDelete(chart.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="pt-4 space-y-2">
          <Configurator
            allHeaders={allHeaders}
            config={draftConfig}
            onConfigChange={setDraftConfig}
          />
          {isModified && (
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={handleReset}>Reset</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button size="sm" onClick={handleApply} disabled={!draftConfigIsComplete}>
                        Apply Changes
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!draftConfigIsComplete && (
                    <TooltipContent>
                      <p>Please complete all required fields.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {invalidRowCount > 0 && finalConfigIsComplete && (
            <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Data Quality Warning</AlertTitle>
                <AlertDescription>
                    {invalidRowCount} of {data.length} rows were skipped due to missing or non-numeric data. Please check the columns used in this chart's configuration.
                </AlertDescription>
            </Alert>
        )}
        <div className={cn("h-[300px]", (chart.type === 'pyramid' || chart.type === 'histogram' || chart.type === 'bar' || chart.type === 'treemap' || chart.type === 'area' || chart.type === 'radar' || chart.type === 'line') && 'h-[400px]')}>
          <ChartComponent data={data} config={chart.config} />
        </div>
      </CardContent>
    </Card>
  );
};


export default function DataCharts({
  fullFilteredData,
  allHeaders,
  charts,
  onChartsChange,
  columnValueCounts,
  totalRowsInDataset,
  onSaveAsTemplate,
  memoryUsageBytes,
  memoryThresholdBytes,
  isProcessing,
  isChartDataSampled,
  onForceFullChartUpdate,
}: DataChartsProps) {
  const [expandedChart, setExpandedChart] = useState<DashboardChart | null>(null);

  const [isAddChartOpen, setIsAddChartOpen] = useState(false);
  const [chartToRename, setChartToRename] = useState<DashboardChart | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isFullUpdateLoading, setIsFullUpdateLoading] = useState(false);

  useEffect(() => {
    if (!isProcessing) {
        setIsFullUpdateLoading(false);
    }
  }, [isProcessing]);


  const handleChartConfigSave = useCallback((chartId: string, newConfig: Partial<AnyChartConfig>) => {
    onChartsChange(charts.map(c => 
        c.id === chartId ? { ...c, config: newConfig } : c
    ));
  }, [charts, onChartsChange]);
  
  const handleSizeChange = useCallback((chartId: string, newSize: 'small' | 'medium' | 'wide') => {
    onChartsChange(charts.map(c => 
        c.id === chartId ? { ...c, size: newSize } : c
    ));
  }, [charts, onChartsChange]);

  const handleAddChart = useCallback((addable: AddableChart) => {
    const { title, chart } = addable;
    const newChart: DashboardChart = {
      id: `${chart.type}-${Date.now()}`,
      type: chart.type,
      title: `New ${title}`,
      config: chart.config,
      size: 'small',
    };
    onChartsChange([...charts, newChart]);
    setIsAddChartOpen(false);
  }, [charts, onChartsChange]);

  const handleCloneChart = useCallback((chartToClone: DashboardChart) => {
    const newChart: DashboardChart = {
      ...JSON.parse(JSON.stringify(chartToClone)),
      id: `${chartToClone.type}-${Date.now()}`,
      title: `${chartToClone.title} (Copy)`,
    };
    onChartsChange([...charts, newChart]);
  }, [charts, onChartsChange]);

  const handleDeleteChart = useCallback((chartId: string) => {
    onChartsChange(charts.filter(c => c.id !== chartId));
  }, [charts, onChartsChange]);

  const handleOpenRenameDialog = useCallback((chart: DashboardChart) => {
    setChartToRename(chart);
    setNewTitle(chart.title);
  }, []);

  const handleRenameChart = useCallback(() => {
    if (!chartToRename || !newTitle) return;
    onChartsChange(charts.map(c => 
        c.id === chartToRename.id ? { ...c, title: newTitle } : c
    ));
    setChartToRename(null);
    setNewTitle('');
  }, [charts, onChartsChange, chartToRename, newTitle]);
  
  const handleForceUpdate = () => {
    setIsFullUpdateLoading(true);
    onForceFullChartUpdate();
  };

  const renderExpandedChart = () => {
    if (!expandedChart) return null;
    const meta = CHART_META[expandedChart.type];
    const ChartComponent = meta.component;
    return <ChartComponent data={fullFilteredData} config={expandedChart.config} />;
  };

  const isMemoryLimitExceeded = useMemo(() => {
    return memoryUsageBytes > memoryThresholdBytes;
  }, [memoryUsageBytes, memoryThresholdBytes]);

  if (isMemoryLimitExceeded && !isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Memory Limit Reached
          </CardTitle>
          <CardDescription>
            Chart rendering has been paused to prevent the application from crashing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Your current dataset is using too much memory. To re-enable charts, please return to the <strong>Dashboard</strong> tab and use the filter controls to reduce the amount of data being analyzed. Committing filters can also help.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      {isChartDataSampled && !isProcessing && (
        <Alert variant="info" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Charts are Based on Sampled Data</AlertTitle>
          <AlertDescription>
            To ensure performance, the charts below are generated from a sample of your {fullFilteredData.length.toLocaleString()} most relevant rows. KPIs and the data table are unaffected. You can force a one-time update using the full dataset.
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-4">
        {isChartDataSampled && (
          <Button variant="outline" onClick={handleForceUpdate} disabled={isProcessing || isFullUpdateLoading}>
              {isFullUpdateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Recalculate with Full Data
          </Button>
        )}
        <Button variant="outline" onClick={onSaveAsTemplate} disabled={isProcessing}>
            <Save className="mr-2 h-4 w-4" />
            Save Layout as Template
        </Button>
        <Button onClick={() => setIsAddChartOpen(true)} disabled={isProcessing}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chart
        </Button>
      </div>
      <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', (!fullFilteredData.length || isProcessing) && 'pointer-events-none opacity-50')}>
        <ValueSummaryCard
            allHeaders={allHeaders}
            columnValueCounts={columnValueCounts}
            totalRowsInDataset={totalRowsInDataset}
        />
        {charts.map((chart) => (
            <ChartWrapper
                key={chart.id}
                chart={chart}
                allHeaders={allHeaders}
                data={fullFilteredData}
                onChartConfigSave={handleChartConfigSave}
                onChartDelete={handleDeleteChart}
                onChartClone={handleCloneChart}
                onChartRename={handleOpenRenameDialog}
                onChartResize={handleSizeChange}
                onChartExpand={setExpandedChart}
            />
        ))}
      </div>

      <Dialog open={isAddChartOpen} onOpenChange={setIsAddChartOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Chart</DialogTitle>
                <DialogDescription>
                    Select the type of chart you want to add to your dashboard.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                {ADDABLE_CHARTS.map((addable) => (
                    <Button key={addable.key} variant="outline" className="h-20" onClick={() => handleAddChart(addable)}>
                        <div className="flex flex-col items-center gap-2">
                           <addable.icon className="h-6 w-6" />
                           <span className="text-center text-xs">{addable.title}</span>
                        </div>
                    </Button>
                ))}
            </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!chartToRename} onOpenChange={(isOpen) => !isOpen && setChartToRename(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename Chart</DialogTitle>
                <DialogDescription>
                    Enter a new name for "{chartToRename?.title}".
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-chart-name">Chart Name</Label>
                <Input id="new-chart-name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setChartToRename(null)}>Cancel</Button>
                <Button onClick={handleRenameChart}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!expandedChart} onOpenChange={(isOpen) => !isOpen && setExpandedChart(null)}>
        <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{expandedChart?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow h-full w-full pt-4">{renderExpandedChart()}</div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
