
'use client';

import type { ChartConfig } from '@/lib/types';

/**
 * Aggregates and processes data for standard chart types based on a configuration.
 *
 * @param data - The raw data array.
 * @param config - The chart configuration object.
 * @returns An object containing the processed data and the keys for any series.
 */
export function aggregateData(
    data: any[],
    config: Partial<ChartConfig>
) {
    const { xAxis, yAxis, series, aggregation = 'sum', sortOrder } = config;

    if (!xAxis || (!yAxis && (aggregation !== 'count')) || !data.length) {
        return { processedData: [], seriesKeys: [] };
    }

    const aggregationMap: Record<string, any> = {};
    const seriesValues = new Set<string>();

    // Step 1: Iterate through data and perform aggregation.
    for (const row of data) {
        const category = row[xAxis];
        if (category === undefined || category === null) continue;
        
        const seriesKey = series ? (row[series] as string) : 'value';
        if (series && (seriesKey === undefined || seriesKey === null)) continue;
        if (series) seriesValues.add(seriesKey);

        const value = yAxis ? parseFloat(String(row[yAxis])) : 0;
        const distinctValue = yAxis ? row[yAxis] : null;


        if (!aggregationMap[category]) {
            aggregationMap[category] = {};
        }
        if (!aggregationMap[category][seriesKey]) {
            aggregationMap[category][seriesKey] = { sum: 0, countWithValue: 0, totalCount: 0, distinctValues: new Set() };
        }

        const aggObject = aggregationMap[category][seriesKey];
        if (!isNaN(value)) {
            aggObject.sum += value;
            aggObject.countWithValue++;
        }
        aggObject.totalCount++;
        if (distinctValue !== null && distinctValue !== undefined && String(distinctValue).trim() !== '') {
             aggObject.distinctValues.add(distinctValue);
        }
    }

    // Step 2: Format the aggregated map into a flat array for the charting library.
    let processedData = Object.entries(aggregationMap).map(([name, seriesData]) => {
        const finalRow: Record<string, any> = { name }; // 'name' is the standardized key for the category axis
        let totalValueForRow = 0;

        Object.entries(seriesData).forEach(([seriesKey, aggObject]: [string, any]) => {
            let finalValue: number;
            switch (aggregation) {
                case 'average':
                    finalValue = aggObject.countWithValue > 0 ? aggObject.sum / aggObject.countWithValue : 0;
                    break;
                case 'count':
                    finalValue = aggObject.totalCount;
                    break;
                case 'count-distinct':
                    finalValue = aggObject.distinctValues.size;
                    break;
                case 'average-per-unique':
                    finalValue = aggObject.distinctValues.size > 0 ? aggObject.totalCount / aggObject.distinctValues.size : 0;
                    break;
                case 'sum':
                default:
                    finalValue = aggObject.sum;
            }
            finalRow[seriesKey] = finalValue;
            totalValueForRow += finalValue;
        });
        
        finalRow._total = totalValueForRow; // Internal key for sorting by value
        return finalRow;
    });

    // Step 3: Sort the processed data if a sort order is specified.
    if (sortOrder) {
        processedData.sort((a, b) => {
            const aName = String(a.name);
            const bName = String(b.name);

            switch(sortOrder) {
                case 'value-desc': return b._total - a._total;
                case 'value-asc': return a._total - b._total;
                case 'category-asc': return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
                case 'category-desc': return bName.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
                default: return 0;
            }
        });
    } else if (!series) {
        // Default sort for non-series charts (like pie) is by value descending
        processedData.sort((a, b) => b._total - a._total);
    } else {
        // Default sort for series charts is by category name
        processedData.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' }));
    }

    const finalSeriesKeys = series ? Array.from(seriesValues).sort() : ['value'];

    return { processedData, seriesKeys: finalSeriesKeys };
}
