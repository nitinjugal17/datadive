
'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ChartConfig, KpiConfig, PyramidChartConfig, ScatterChartConfig, HistogramConfig, TreeMapConfig } from '@/lib/types';

export const SimpleChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<ChartConfig>;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
}) => {
  const { aggregation } = config;
  const isCount = aggregation === 'count';

  const handleAggregationChange = (value: string) => {
    const newAgg = value as ChartConfig['aggregation'];
    if (newAgg === 'count') {
      onConfigChange({ ...config, aggregation: newAgg, yAxis: undefined });
    } else {
      onConfigChange({ ...config, aggregation: newAgg });
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="x-axis" className="text-xs">X-Axis (Category)</Label>
          <Select
            value={config?.xAxis}
            onValueChange={(value) => onConfigChange({ ...config, xAxis: value })}
          >
            <SelectTrigger id="x-axis" className="w-full">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {allHeaders.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="y-axis" className="text-xs">Y-Axis (Value)</Label>
          <Select
            value={config?.yAxis}
            onValueChange={(value) => onConfigChange({ ...config, yAxis: value })}
            disabled={isCount}
          >
            <SelectTrigger id="y-axis" className="w-full">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {allHeaders.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="aggregation" className="text-xs">Aggregate Values By</Label>
          <Select
            value={aggregation || 'sum'}
            onValueChange={handleAggregationChange}
          >
            <SelectTrigger id="aggregation" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="count">Count Rows</SelectItem>
              <SelectItem value="count-distinct">Count Distinct Values</SelectItem>
              <SelectItem value="average-per-unique">Avg. Items per Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="facet-by" className="text-xs">Segment By (Small Multiples)</Label>
          <Select
            value={config?.facetBy || 'none'}
            onValueChange={(value) => onConfigChange({ ...config, facetBy: value === 'none' ? undefined : value })}
          >
            <SelectTrigger id="facet-by" className="w-full">
              <SelectValue placeholder="(Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {allHeaders.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export const BarChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<ChartConfig>;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
}) => {
  const { aggregation } = config;
  const isCount = aggregation === 'count';

  const handleBarTypeChange = (value: string) => {
    const barType = value as ChartConfig['barType'];
    if (barType === 'standard') {
      onConfigChange({ ...config, barType: barType, series: undefined });
    } else {
      onConfigChange({ ...config, barType: barType });
    }
  };
  
  const handleAggregationChange = (value: string) => {
    const newAgg = value as ChartConfig['aggregation'];
    if (newAgg === 'count') {
      onConfigChange({ ...config, aggregation: newAgg, yAxis: undefined, series: undefined });
    } else {
      onConfigChange({ ...config, aggregation: newAgg });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="x-axis" className="text-xs">X-Axis (Category)</Label>
          <Select
            value={config?.xAxis}
            onValueChange={(value) => onConfigChange({ ...config, xAxis: value })}
          >
            <SelectTrigger id="x-axis"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="y-axis" className="text-xs">Y-Axis (Value)</Label>
          <Select
            value={config?.yAxis}
            onValueChange={(value) => onConfigChange({ ...config, yAxis: value })}
            disabled={isCount}
          >
            <SelectTrigger id="y-axis"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="series" className="text-xs">Series (Group/Stack by)</Label>
          <Select
            value={config?.series}
            onValueChange={(value) => onConfigChange({ ...config, series: value })}
            disabled={isCount || config?.barType === 'standard' || !config.barType}
          >
            <SelectTrigger id="series"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="grid items-center gap-1.5">
              <Label className="text-xs">Chart Type</Label>
              <RadioGroup
                value={config.barType || 'standard'}
                onValueChange={handleBarTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="bar-standard" />
                    <Label htmlFor="bar-standard" className="font-normal text-sm">Standard</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grouped" id="bar-grouped" />
                    <Label htmlFor="bar-grouped" className="font-normal text-sm">Grouped</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stacked" id="bar-stacked" />
                    <Label htmlFor="bar-stacked" className="font-normal text-sm">Stacked</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stacked-100" id="bar-stacked-100" />
                    <Label htmlFor="bar-stacked-100" className="font-normal text-sm">100% Stacked</Label>
                </div>
              </RadioGroup>
          </div>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="aggregation" className="text-xs">Aggregate Values By</Label>
            <Select
              value={aggregation || 'sum'}
              onValueChange={handleAggregationChange}
            >
              <SelectTrigger id="aggregation" className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count Rows</SelectItem>
                <SelectItem value="count-distinct">Count Distinct Values</SelectItem>
                <SelectItem value="average-per-unique">Avg. Items per Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>
       <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-4">
        <div className="grid items-center gap-1.5 flex-1">
          <Label className="text-xs">Layout</Label>
          <RadioGroup
            value={config.layout || 'vertical'}
            onValueChange={(value) => onConfigChange({ ...config, layout: value as any })}
            className="flex gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="vertical" id="layout-vertical" />
                <Label htmlFor="layout-vertical" className="font-normal text-sm">Vertical</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="horizontal" id="layout-horizontal" />
                <Label htmlFor="layout-horizontal" className="font-normal text-sm">Horizontal</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="sort-order" className="text-xs">Sort Order</Label>
          <Select
            value={config?.sortOrder || 'none'}
            onValueChange={(value) => onConfigChange({ ...config, sortOrder: value === 'none' ? undefined : (value as any) })}
          >
            <SelectTrigger id="sort-order"><SelectValue placeholder="Default Order" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="none">Default Order</SelectItem>
                <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                <SelectItem value="value-asc">Value (Low to High)</SelectItem>
                <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                <SelectItem value="category-desc">Category (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};


export const KpiConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<KpiConfig>;
  onConfigChange: (newConfig: Partial<KpiConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="kpi-metric" className="text-xs">Metric</Label>
        <Select value={config?.metric} onValueChange={(value) => onConfigChange({ ...config, metric: value })}>
          <SelectTrigger id="kpi-metric" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="kpi-aggregation" className="text-xs">Aggregation</Label>
        <Select value={config?.aggregation} onValueChange={(value: KpiConfig['aggregation']) => onConfigChange({ ...config, aggregation: value })}>
          <SelectTrigger id="kpi-aggregation" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum">Sum</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="count">Count Rows</SelectItem>
            <SelectItem value="count-distinct">Count Distinct Values</SelectItem>
            <SelectItem value="average-per-unique">Avg. Items per Category</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const PyramidChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<PyramidChartConfig>;
  onConfigChange: (newConfig: Partial<PyramidChartConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="pyramid-age" className="text-xs">Age Group</Label>
        <Select value={config?.ageGroup} onValueChange={(value) => onConfigChange({ ...config, ageGroup: value })}>
          <SelectTrigger id="pyramid-age" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="pyramid-sex" className="text-xs">Sex</Label>
        <Select value={config?.sex} onValueChange={(value) => onConfigChange({ ...config, sex: value })}>
          <SelectTrigger id="pyramid-sex" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="pyramid-pop" className="text-xs">Population</Label>
        <Select value={config?.population} onValueChange={(value) => onConfigChange({ ...config, population: value })}>
          <SelectTrigger id="pyramid-pop" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const ScatterChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<ScatterChartConfig>;
  onConfigChange: (newConfig: Partial<ScatterChartConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="x-axis-scatter" className="text-xs">X-Axis</Label>
        <Select
          value={config?.xAxis}
          onValueChange={(value) => onConfigChange({ ...config, xAxis: value })}
        >
          <SelectTrigger id="x-axis-scatter" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="y-axis-scatter" className="text-xs">Y-Axis</Label>
        <Select
          value={config?.yAxis}
          onValueChange={(value) => onConfigChange({ ...config, yAxis: value })}
        >
          <SelectTrigger id="y-axis-scatter" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const BubbleChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<ScatterChartConfig>;
  onConfigChange: (newConfig: Partial<ScatterChartConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="x-axis-bubble" className="text-xs">X-Axis</Label>
        <Select
          value={config?.xAxis}
          onValueChange={(value) => onConfigChange({ ...config, xAxis: value })}
        >
          <SelectTrigger id="x-axis-bubble" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="y-axis-bubble" className="text-xs">Y-Axis</Label>
        <Select
          value={config?.yAxis}
          onValueChange={(value) => onConfigChange({ ...config, yAxis: value })}
        >
          <SelectTrigger id="y-axis-bubble" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="z-axis-bubble" className="text-xs">Bubble Size</Label>
        <Select
          value={config?.zAxis}
          onValueChange={(value) => onConfigChange({ ...config, zAxis: value })}
        >
          <SelectTrigger id="z-axis-bubble" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const HistogramConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<HistogramConfig>;
  onConfigChange: (newConfig: Partial<HistogramConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="hist-column" className="text-xs">Column</Label>
        <Select
          value={config?.column}
          onValueChange={(value) => onConfigChange({ ...config, column: value })}
        >
          <SelectTrigger id="hist-column" className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="hist-bins" className="text-xs">Number of Bins</Label>
        <Input
          id="hist-bins"
          type="number"
          className="w-full sm:w-[150px]"
          value={config?.bins ?? 10}
          onChange={(e) => onConfigChange({ ...config, bins: parseInt(e.target.value, 10) || 10 })}
          min="1"
          max="50"
        />
      </div>
    </div>
  );
};

export const TreeMapConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<TreeMapConfig>;
  onConfigChange: (newConfig: Partial<TreeMapConfig>) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="tm-category" className="text-xs">Group By (Category)</Label>
        <Select
          value={config?.categoryKey}
          onValueChange={(value) => onConfigChange({ ...config, categoryKey: value })}
        >
          <SelectTrigger id="tm-category" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="tm-name" className="text-xs">Label (Name)</Label>
        <Select
          value={config?.nameKey}
          onValueChange={(value) => onConfigChange({ ...config, nameKey: value })}
        >
          <SelectTrigger id="tm-name" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="tm-value" className="text-xs">Size (Value)</Label>
        <Select
          value={config?.valueKey}
          onValueChange={(value) => onConfigChange({ ...config, valueKey: value })}
        >
          <SelectTrigger id="tm-value" className="w-full sm:w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {allHeaders.map((header) => (
              <SelectItem key={header} value={header}>{header}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const AreaChartConfigurator = ({
  allHeaders,
  config,
  onConfigChange,
}: {
  allHeaders: string[];
  config: Partial<ChartConfig>;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
}) => {
  const { aggregation } = config;
  const isCount = aggregation === 'count';

  const handleAreaTypeChange = (value: string) => {
    const areaType = value as ChartConfig['areaType'];
    if (areaType === 'standard') {
      onConfigChange({ ...config, areaType: areaType, series: undefined });
    } else {
      onConfigChange({ ...config, areaType: areaType });
    }
  };
  
  const handleAggregationChange = (value: string) => {
    const newAgg = value as ChartConfig['aggregation'];
    if (newAgg === 'count') {
      onConfigChange({ ...config, aggregation: newAgg, yAxis: undefined, series: undefined });
    } else {
      onConfigChange({ ...config, aggregation: newAgg });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="x-axis-area" className="text-xs">X-Axis (Category)</Label>
          <Select
            value={config?.xAxis}
            onValueChange={(value) => onConfigChange({ ...config, xAxis: value })}
          >
            <SelectTrigger id="x-axis-area"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="y-axis-area" className="text-xs">Y-Axis (Value)</Label>
          <Select
            value={config?.yAxis}
            onValueChange={(value) => onConfigChange({ ...config, yAxis: value })}
            disabled={isCount}
          >
            <SelectTrigger id="y-axis-area"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="grid items-center gap-1.5 flex-1">
          <Label htmlFor="series-area" className="text-xs">Stack by (Series)</Label>
          <Select
            value={config?.series}
            onValueChange={(value) => onConfigChange({ ...config, series: value })}
            disabled={isCount || config?.areaType === 'standard' || !config.areaType}
          >
            <SelectTrigger id="series-area"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{allHeaders.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="grid items-center gap-1.5">
              <Label className="text-xs">Chart Type</Label>
              <RadioGroup
                value={config.areaType || 'standard'}
                onValueChange={handleAreaTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="area-standard" />
                    <Label htmlFor="area-standard" className="font-normal text-sm">Standard</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stacked" id="area-stacked" />
                    <Label htmlFor="area-stacked" className="font-normal text-sm">Stacked</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stacked-100" id="area-stacked-100" />
                    <Label htmlFor="area-stacked-100" className="font-normal text-sm">100% Stacked</Label>
                </div>
              </RadioGroup>
          </div>
           <div className="grid items-center gap-1.5">
            <Label htmlFor="aggregation-area" className="text-xs">Aggregate Values By</Label>
            <Select
              value={aggregation || 'sum'}
              onValueChange={handleAggregationChange}
            >
              <SelectTrigger id="aggregation-area" className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count Rows</SelectItem>
                <SelectItem value="count-distinct">Count Distinct Values</SelectItem>
                <SelectItem value="average-per-unique">Avg. Items per Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>
    </div>
  );
};
