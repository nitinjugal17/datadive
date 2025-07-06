
'use client';

import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Label,
  Funnel,
  FunnelChart,
  LabelList,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  AreaChart,
  Area,
  Brush,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig, KpiConfig, PyramidChartConfig, ScatterChartConfig, HistogramConfig, TreeMapConfig } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aggregateData } from '@/lib/aggregate-data';

export const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const GenericBarChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
  const { xAxis, yAxis, series, barType = 'standard', layout = 'vertical', aggregation = 'sum' } = config;

  // Determine if a series should be used. Standard bar charts or any 'count' aggregation do not use a series.
  const useSeries = barType !== 'standard' && aggregation !== 'count' && !!series;
  
  const { processedData, seriesKeys } = useMemo(() => aggregateData(data, {
    ...config,
    series: useSeries ? series : undefined,
  }), [data, config, useSeries, series]);


  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
        Select columns and chart type to build chart.
      </div>
    );
  }

  const isGrouped = barType === 'grouped';
  const isStacked = barType === 'stacked';
  const is100Stacked = barType === 'stacked-100';
  const isHorizontal = layout === 'horizontal';
  const valueAxisLabel = yAxis || aggregation;
  
  const margin = { top: 5, right: 30, left: 20, bottom: 60 };

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <BarChart
        data={processedData}
        layout={layout}
        margin={margin}
        barGap={isGrouped ? 4 : undefined}
        stackOffset={is100Stacked ? "expand" : undefined}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {isHorizontal ? (
          <>
            <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12 }}>
              <Label value={valueAxisLabel} position="bottom" offset={0} />
            </XAxis>
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" type="category" tick={{ fontSize: 12, angle: -45, dy: 20, dx: -20 }} textAnchor="end" interval={0} height={80}>
                <Label value={xAxis} position="bottom" offset={-50} />
            </XAxis>
            <YAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12 }} tickFormatter={is100Stacked ? (value) => `${(value * 100).toFixed(0)}%` : undefined}>
              <Label value={valueAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
            </YAxis>
          </>
        )}
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Legend />
        {seriesKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            name={key === 'value' ? yAxis || aggregation : key}
            stackId={isStacked || is100Stacked ? 'a' : undefined}
            fill={CHART_COLORS[index % CHART_COLORS.length]} 
            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export const GenericLineChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
    const { xAxis, yAxis, aggregation = 'sum', facetBy } = config;

    const { facetedData, globalMax, singleChartData } = useMemo(() => {
        const chartConfig = { ...config, sortOrder: config.sortOrder || 'category-asc' };

        if (!facetBy) {
            const { processedData } = aggregateData(data, chartConfig);
            return { facetedData: null, globalMax: 'auto', singleChartData: processedData };
        }

        const groups: Record<string, any[]> = {};
        data.forEach(row => {
            const facetValue = row[facetBy];
            if (facetValue === undefined || facetValue === null) return;
            const key = String(facetValue);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        });

        let overallMax = 0;
        const processedFacetedData = Object.entries(groups).map(([facetValue, groupData]) => {
            const { processedData: chartData } = aggregateData(groupData, chartConfig);
            const localMax = Math.max(...chartData.map(d => d.value));
            if (localMax > overallMax) {
                overallMax = localMax;
            }
            return { facetValue, data: chartData };
        }).filter(group => group.data.length > 0);

        return { facetedData: processedFacetedData, globalMax: overallMax > 0 ? overallMax : 'auto', singleChartData: [] };
    }, [data, config, facetBy]);


    if (facetBy) {
        if (!facetedData || facetedData.length === 0) {
            return (
                <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
                    Select columns to build charts. Ensure 'Segment By' column has data.
                </div>
            );
        }
        return (
            <ScrollArea className="h-full w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
                    {facetedData.map(({ facetValue, data: chartData }) => (
                        <div key={facetValue} className="flex flex-col items-center border rounded-lg p-2">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1 truncate w-full text-center" title={facetValue}>{facetValue}</h4>
                            <ChartContainer config={{}} className="h-[200px] w-full">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, globalMax]} tick={{ fontSize: 10 }} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Line type="monotone" dataKey="value" name={yAxis || aggregation} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    }
    
    if (singleChartData.length === 0) {
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select columns to build chart.
          </div>
        );
    }
    
    const valueAxisLabel = yAxis || aggregation;

    return (
        <ChartContainer config={{}} className="h-full w-full">
        <LineChart data={singleChartData} margin={{ top: 5, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }}>
                <Label value={xAxis} position="bottom" offset={0} />
            </XAxis>
            <YAxis tick={{ fontSize: 12 }}>
              <Label value={valueAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
            </YAxis>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Legend />
            <Line type="monotone" dataKey="value" name={yAxis || aggregation} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            <Brush dataKey="name" height={30} stroke="hsl(var(--primary))" />
        </LineChart>
        </ChartContainer>
    );
};

export const GenericPieChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
    const { processedData } = useMemo(() => aggregateData(data, config), [data, config]);

    if (processedData.length === 0) {
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select columns to build chart.
          </div>
        );
    }
    
    return (
        <ChartContainer config={{}} className="h-full w-full">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Pie
                    data={processedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50} // Make it a donut chart
                    outerRadius={80}
                    paddingAngle={2}
                    labelLine={false}
                    label={({ x, y, percent, name }) => {
                        if (percent < 0.05) return null; // Hide labels for very small slices
                        return (
                            <text
                                x={x}
                                y={y}
                                fill="hsl(var(--foreground))"
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="text-xs font-semibold"
                            >
                               {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        )
                    }}
                >
                    {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ChartContainer>
    );
};

export const GenericFunnelChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
  const { processedData } = useMemo(() => aggregateData(data, { ...config, sortOrder: 'value-desc' }), [data, config]);
  
  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select columns to build chart.
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <FunnelChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Funnel dataKey="value" data={processedData} isAnimationActive>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
          <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" />
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  );
};

export const GenericKpiCard = ({ data, config }: { data: any[]; config: Partial<KpiConfig> }) => {
  const { metric, aggregation } = config;

  const calculatedValue = useMemo(() => {
    if (!metric || !aggregation || !data) return null;

    if (aggregation === 'count') {
      if (!data.length) return 0;
      const count = data.filter(row => {
        const value = row[metric];
        return value !== null && value !== undefined && String(value).trim() !== '';
      }).length;
      return count > 0 ? count : 0;
    }

    if (aggregation === 'count-distinct') {
        if (!data.length) return 0;
        const values = data.map(row => row[metric]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
        return new Set(values).size;
    }
    
    if (aggregation === 'average-per-unique') {
        if (!data.length) return 0;
        const values = data.map(row => row[metric]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
        if (values.length === 0) return 0;
        const distinctCount = new Set(values).size;
        return distinctCount > 0 ? values.length / distinctCount : 0;
    }

    if (!data.length) return null;
    const values = data.map(row => parseFloat(String(row[metric]))).filter(v => !isNaN(v));
    
    if (values.length === 0) return null;

    if (aggregation === 'sum') {
        return values.reduce((a, b) => a + b, 0);
    }
    
    if (aggregation === 'average') {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    return null;
  }, [data, metric, aggregation]);

  const formattedValue = useMemo(() => {
    if (calculatedValue === null) return 'N/A';

    if ((aggregation === 'average' || aggregation === 'average-per-unique') && calculatedValue !== null) {
      return calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return calculatedValue.toLocaleString();
  }, [calculatedValue, aggregation]);

  if (!metric || !aggregation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select metric & aggregation.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-sm text-muted-foreground capitalize">{aggregation} of {metric}</p>
      <p className="text-4xl font-bold text-primary">{formattedValue}</p>
    </div>
  );
};

export const PopulationPyramidChart = ({ data, config }: { data: any[]; config: Partial<PyramidChartConfig> }) => {
  const processedData = useMemo(() => {
    if (!config?.ageGroup || !config?.sex || !config?.population || !data.length) return null;

    const ageGroups: { [age: string]: { male: number; female: number } } = {};

    data.forEach(row => {
      const age = row[config.ageGroup!];
      const sex = row[config.sex!] ? String(row[config.sex!]).toLowerCase() : null;
      const population = row[config.population!] ? parseFloat(String(row[config.population!])) : NaN;

      if (!age || !sex || isNaN(population)) return;

      if (!ageGroups[age]) {
        ageGroups[age] = { male: 0, female: 0 };
      }

      if (sex === 'male') {
        ageGroups[age].male += population;
      } else if (sex === 'female') {
        ageGroups[age].female += population;
      }
    });

    if (Object.keys(ageGroups).length === 0) return null;

    return Object.keys(ageGroups).map(age => ({
      age,
      male: -ageGroups[age].male,
      female: ageGroups[age].female,
    })).sort((a,b) => {
        const aStart = parseInt(String(a.age).split(/[^0-9]/)[0], 10);
        const bStart = parseInt(String(b.age).split(/[^0-9]/)[0], 10);
        return aStart - bStart;
    });

  }, [data, config]);

  if (!processedData) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-center p-4">
        Please select Age Group, Sex, and Population columns to build the chart.
      </div>
    );
  }
  
  const maxPopulation = Math.max(...processedData.flatMap(d => [Math.abs(d.male), d.female]));
  const domainMax = Math.ceil(maxPopulation / 1000) * 1000;

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <BarChart
        layout="vertical"
        data={processedData}
        margin={{ top: 5, right: 30, left: 30, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          domain={[-domainMax, domainMax]} 
          tickFormatter={(value) => Math.abs(value).toLocaleString()}
          allowDataOverflow={true}
          tick={{ fontSize: 12 }}
        >
          <Label value="Population" position="bottom" offset={0} />
        </XAxis>
        <YAxis 
          dataKey="age" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          width={80} 
          tick={{ fontSize: 12 }}
        >
          <Label value="Age Group" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
        </YAxis>
        <ChartTooltip 
          cursor={false} 
          content={<ChartTooltipContent indicator="dot" />}
          formatter={(value: number, name: string) => [Math.abs(value).toLocaleString(), name.charAt(0).toUpperCase() + name.slice(1)]} 
        />
        <Legend />
        <Bar dataKey="male" name="Male" fill="hsl(var(--primary))" stackId="stack" />
        <Bar dataKey="female" name="Female" fill="hsl(var(--accent))" stackId="stack" />
      </BarChart>
    </ChartContainer>
  );
};

export const GenericScatterChart = ({ data, config }: { data: any[]; config: Partial<ScatterChartConfig> }) => {
    const processedData = useMemo(() => {
      if (!config?.xAxis || !config?.yAxis) return [];
      
      const allPoints = data.map(row => {
        const x = parseFloat(String(row[config.xAxis!]));
        const y = parseFloat(String(row[config.yAxis!]));
        
        if (!isNaN(x) && !isNaN(y)) {
          return { x, y };
        }
        return null;
      }).filter((d): d is {x: number, y: number} => d !== null);

      const MAX_POINTS = 2000;
      if (allPoints.length > MAX_POINTS) {
          const step = Math.ceil(allPoints.length / MAX_POINTS);
          return allPoints.filter((_, i) => i % step === 0);
      }
      
      return allPoints;
    }, [data, config]);
  
    if (processedData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
           Select numerical X and Y columns.
        </div>
      );
    }
  
    return (
      <ChartContainer config={{}} className="h-full w-full">
        <ScatterChart data={processedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name={config.xAxis} unit="" tick={{ fontSize: 12 }}>
            <Label value={config.xAxis} position="bottom" offset={0} />
          </XAxis>
          <YAxis type="number" dataKey="y" name={config.yAxis} unit="" tick={{ fontSize: 12 }}>
            <Label value={config.yAxis} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="dot" />} />
          <Scatter name="Data points" fill="hsl(var(--primary) / 0.6)" shape="circle" />
        </ScatterChart>
      </ChartContainer>
    );
};

export const GenericBubbleChart = ({ data, config }: { data: any[]; config: Partial<ScatterChartConfig> }) => {
    const processedData = useMemo(() => {
      if (!config?.xAxis || !config?.yAxis || !config.zAxis) return [];

      const allPoints = data.map(row => {
        const x = parseFloat(String(row[config.xAxis!]));
        const y = parseFloat(String(row[config.yAxis!]));
        const z = parseFloat(String(row[config.zAxis!]));
        
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          return { x, y, z };
        }
        return null;
      }).filter((d): d is {x: number, y: number, z: number} => d !== null);

      const MAX_POINTS = 2000;
      if (allPoints.length > MAX_POINTS) {
          const step = Math.ceil(allPoints.length / MAX_POINTS);
          return allPoints.filter((_, i) => i % step === 0);
      }
      
      return allPoints;
    }, [data, config]);
  
    if (processedData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
           Select numerical X, Y, and Bubble Size columns.
        </div>
      );
    }
  
    return (
      <ChartContainer config={{}} className="h-full w-full">
        <ScatterChart data={processedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name={config.xAxis} unit="" tick={{ fontSize: 12 }}>
            <Label value={config.xAxis} position="bottom" offset={0} />
          </XAxis>
          <YAxis type="number" dataKey="y" name={config.yAxis} unit="" tick={{ fontSize: 12 }}>
            <Label value={config.yAxis} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <ZAxis type="number" dataKey="z" name={config.zAxis} range={[100, 1000]} />
          <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="dot" />} />
          <Scatter name="Data points" fill="hsl(var(--primary) / 0.6)" shape="circle" />
        </ScatterChart>
      </ChartContainer>
    );
};


export const GenericHistogram = ({ data, config }: { data: any[]; config: Partial<HistogramConfig> }) => {
  const { column, bins } = config;

  const processedData = useMemo(() => {
    if (!column || !data.length) return [];

    const values = data
      .map(row => (column && row[column] != null ? parseFloat(String(row[column])) : NaN))
      .filter(v => !isNaN(v));

    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = (bins && bins > 0) ? bins : 10;

    if (min === max) {
      return [{ range: String(min), count: values.length }];
    }

    const binWidth = (max - min) / binCount;
    if (binWidth <= 0) {
      return [{ range: `${min} - ${max}`, count: values.length }];
    }

    const histogramBins = Array.from({ length: binCount }, () => ({ count: 0 }));

    for (const value of values) {
      const binIndex = value === max
        ? binCount - 1
        : Math.floor((value - min) / binWidth);

      if (binIndex >= 0 && binIndex < binCount) {
        histogramBins[binIndex].count++;
      }
    }

    const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
    return histogramBins.map((bin, i) => {
      const lowerBound = min + i * binWidth;
      const upperBound = lowerBound + binWidth;
      return {
        ...bin,
        range: `${formatter.format(lowerBound)} - ${formatter.format(upperBound)}`,
      };
    });
  }, [data, column, bins]);

  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
        Select a numerical column to build the histogram.
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70}>
            <Label value={column} position="bottom" offset={-50} />
        </XAxis>
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }}>
            <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="count" name="Frequency" fill="hsl(var(--primary))" radius={2} />
      </BarChart>
    </ChartContainer>
  );
};

export const GenericTreeMap = ({ data, config }: { data: any[]; config: Partial<TreeMapConfig> }) => {
  const { categoryKey, nameKey, valueKey } = config;

  const processedData = useMemo(() => {
    if (!categoryKey || !nameKey || !valueKey || !data.length) return [];

    const groupedData: Record<string, { name: string; size: number }[]> = {};

    data.forEach(row => {
      const category = String(row[categoryKey]);
      const name = String(row[nameKey]);
      const value = parseFloat(String(row[valueKey]));

      if (category && name && !isNaN(value)) {
        if (!groupedData[category]) {
          groupedData[category] = [];
        }
        // Sum values for the same name within a category
        const existingEntry = groupedData[category].find(item => item.name === name);
        if (existingEntry) {
            existingEntry.size += value;
        } else {
            groupedData[category].push({ name, size: value });
        }
      }
    });

    return Object.entries(groupedData).map(([categoryName, children]) => ({
      name: categoryName,
      children,
    }));
  }, [data, categoryKey, nameKey, valueKey]);

  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
        Select category, label, and size columns to build chart.
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <Treemap
        data={processedData}
        dataKey="size"
        ratio={4 / 3}
        stroke="hsl(var(--card))"
        fill="hsl(var(--primary))"
        isAnimationActive={true}
        content={<CustomizedTreeMapContent colors={CHART_COLORS} />}
      >
        <ChartTooltip content={<ChartTooltipContent />} />
      </Treemap>
    </ChartContainer>
  );
};

// Custom content renderer for Treemap to apply colors correctly
const CustomizedTreeMapContent = ({ root, depth, x, y, width, height, index, colors, name }: any) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth === 1 ? colors[index % colors.length] : 'none',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 2 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}
        {depth === 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {name}
          </text>
        ) : null}
      </g>
    );
};

export const GenericAreaChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
  const { xAxis, yAxis, series, areaType = 'standard', aggregation = 'sum' } = config;
  
  const useSeries = areaType !== 'standard' && aggregation !== 'count' && !!series;
  
  const { processedData, seriesKeys } = useMemo(() => aggregateData(data, {
    ...config,
    series: useSeries ? series : undefined,
    sortOrder: config.sortOrder || 'category-asc',
  }), [data, config, useSeries, series]);


  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
        Select columns and chart type to build chart.
      </div>
    );
  }
  
  const is100Stacked = areaType === 'stacked-100';
  const valueAxisLabel = yAxis || aggregation;

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <AreaChart
        data={processedData}
        margin={{ top: 5, right: 30, left: 30, bottom: 20 }}
        stackOffset={is100Stacked ? "expand" : undefined}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }}>
          <Label value={xAxis} position="bottom" offset={0} />
        </XAxis>
        <YAxis tick={{ fontSize: 12 }} tickFormatter={is100Stacked ? (value) => `${(value * 100).toFixed(0)}%` : undefined}>
          <Label value={valueAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
        </YAxis>
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Legend />
        {seriesKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={key === 'value' ? yAxis || aggregation : key}
            stackId={areaType !== 'standard' ? '1' : undefined}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
        <Brush dataKey="name" height={30} stroke="hsl(var(--primary))" />
      </AreaChart>
    </ChartContainer>
  );
};


export const GenericRadarChart = ({ data, config }: { data: any[]; config: Partial<ChartConfig> }) => {
    const { xAxis, yAxis, aggregation = 'sum', facetBy } = config;

    const { facetedData, globalMax, singleChartData } = useMemo(() => {
        if (!facetBy) {
            const { processedData } = aggregateData(data, config);
            return { facetedData: null, globalMax: 'auto', singleChartData: processedData };
        }

        const groups: Record<string, any[]> = {};
        data.forEach(row => {
            const facetValue = row[facetBy];
            if (facetValue === undefined || facetValue === null) return;
            const key = String(facetValue);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        });
        
        let overallMax = 0;

        const processedFacetedData = Object.entries(groups).map(([facetValue, groupData]) => {
            const { processedData: chartData } = aggregateData(groupData, config);
            const localMax = Math.max(...chartData.map(d => d.value));
            if (localMax > overallMax) {
                overallMax = localMax;
            }
            return { facetValue, data: chartData };
        }).filter(group => group.data.length > 0);
        
        return { facetedData: processedFacetedData, globalMax: overallMax > 0 ? overallMax : 'auto', singleChartData: [] };

    }, [data, config, facetBy]);


    if (facetBy) {
        if (!facetedData || facetedData.length === 0) {
            return (
                <div className="h-full flex items-center justify-center text-muted-foreground text-center p-2">
                    Select columns to build charts. Ensure 'Segment By' column has data.
                </div>
            );
        }
        return (
            <ScrollArea className="h-full w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                    {facetedData.map(({ facetValue, data: chartData }) => (
                        <div key={facetValue} className="flex flex-col items-center border rounded-lg p-2">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1 truncate w-full text-center" title={facetValue}>{facetValue}</h4>
                            <ChartContainer config={{}} className="h-[200px] w-full">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, globalMax]} tick={{ fontSize: 9 }} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Radar name={yAxis || aggregation} dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                                </RadarChart>
                            </ChartContainer>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    }
    
    if (singleChartData.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Select columns to build chart.
            </div>
        );
    }
    
    const chartDataWithSubjects = singleChartData.map(item => ({ ...item, subject: item.name }));
    const valueAxisLabel = yAxis || aggregation;

    return (
        <ChartContainer config={{}} className="h-full w-full">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartDataWithSubjects}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Radar name={valueAxisLabel} dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                <Legend />
            </RadarChart>
        </ChartContainer>
    );
};
