
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Workbook } from '@/lib/mock-data';
import type { ColumnMapping, Filter } from '@/lib/types';
import { yieldToMain } from '@/lib/dashboard-config';

const CHART_DATA_SAMPLE_THRESHOLD = 5000; // Sample data for charts if rows exceed this

interface UseDataPipelineProps {
    workbook: Workbook;
    selectedSheets: string[];
    columnMaps: Record<string, ColumnMapping>;
    addedColumns: string[];
    debouncedSearchTerm: string;
    debouncedFilters: Filter[];
    editedData: Record<string, any>;
    currentPage: number;
    rowsPerPage: number;
    forceFullChartUpdate: boolean;
    yieldThreshold: number;
}

export function useDataPipeline({
    workbook,
    selectedSheets,
    columnMaps,
    addedColumns,
    debouncedSearchTerm,
    debouncedFilters,
    editedData,
    currentPage,
    rowsPerPage,
    forceFullChartUpdate,
    yieldThreshold,
}: UseDataPipelineProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [combinedData, setCombinedData] = useState<any[]>([]);
    const [processedData, setProcessedData] = useState({
        paginatedData: [] as any[],
        totalRows: 0,
        processedDataForCharts: [] as any[],
    });
    const [allHeaders, setAllHeaders] = useState<string[]>([]);
    const [columnValueCounts, setColumnValueCounts] = useState<Record<string, number>>({});
    const [isChartDataSampled, setIsChartDataSampled] = useState(false);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const prevForceFullChartUpdate = useRef<boolean>();


    const cancelProcessing = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };
    
    useEffect(() => {
        // This check prevents the pipeline from re-running when forceFullChartUpdate is reset from true to false.
        const isResetRun = prevForceFullChartUpdate.current === true && forceFullChartUpdate === false;
        prevForceFullChartUpdate.current = forceFullChartUpdate;
        if (isResetRun) {
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;
        
        const processData = async () => {
            setIsProcessing(true);

            try {
                // 1. Combine sheets
                setProcessingMessage('Combining sheets...');
                const data: any[] = [];
                let uniqueId = 0;
                for (const sheet of workbook.sheets) {
                    if (selectedSheets.includes(sheet.name)) {
                        setProcessingMessage(`Processing sheet: ${sheet.name}...`);
                        await yieldToMain(signal); // yield before heavy loop

                        for (let i = 0; i < sheet.data.length; i++) {
                            if (i % yieldThreshold === 0) await yieldToMain(signal);
                            const row = sheet.data[i];
                            const mappedRow: { [key: string]: any } = { 
                                '__source_sheet': sheet.name,
                                '__id': uniqueId++,
                            };
                            const currentMap = columnMaps[sheet.name] || {};
                            Object.keys(row).forEach(originalHeader => {
                                const standardizedHeader = currentMap[originalHeader] || originalHeader;
                                if (standardizedHeader) {
                                    mappedRow[standardizedHeader] = row[originalHeader as keyof typeof row];
                                }
                            });
                            addedColumns.forEach(newCol => {
                                if (!mappedRow.hasOwnProperty(newCol)) {
                                    mappedRow[newCol] = ''; 
                                }
                            });
                            data.push(mappedRow);
                        }
                    }
                }
                setCombinedData(data);

                // 2. Derive headers
                const headers = new Set<string>();
                data.forEach(row => { 
                    Object.keys(row).forEach(key => {
                        if(key !== '__source_sheet' && key !== '__id') headers.add(key);
                    });
                });
                const currentHeaders = Array.from(headers);
                setAllHeaders(currentHeaders);

                // 3. Calculate column value counts
                setProcessingMessage('Analyzing columns...');
                const counts: Record<string, number> = {};
                currentHeaders.forEach(header => { counts[header] = 0; });
                for (let i = 0; i < data.length; i++) {
                     if (i % yieldThreshold === 0) {
                         await yieldToMain(signal);
                         setProcessingMessage(`Analyzing columns: ${i.toLocaleString()} / ${data.length.toLocaleString()} rows`);
                    }
                    const row = data[i];
                    for (const header of currentHeaders) {
                        const value = row[header];
                        if (value !== null && value !== undefined && String(value).trim() !== '') {
                            counts[header]++;
                        }
                    }
                }
                setColumnValueCounts(counts);
                
                // 4. Filter and paginate
                const lowercasedSearchTerm = debouncedSearchTerm.toLocaleLowerCase();
                
                let searchedData: any[] = [];
                if (debouncedSearchTerm) {
                    setProcessingMessage(`Searching data for "${debouncedSearchTerm}"...`);
                    for (let i = 0; i < data.length; i++) {
                        if (i % yieldThreshold === 0) {
                             await yieldToMain(signal);
                             setProcessingMessage(`Searching: ${i.toLocaleString()} / ${data.length.toLocaleString()} rows`);
                        }
                        const row = data[i];
                        if (Object.values(row).some(value => String(value).toLocaleLowerCase().includes(lowercasedSearchTerm))) {
                            searchedData.push(row);
                        }
                    }
                } else {
                    searchedData = data;
                }

                const pageRows: any[] = [];
                let filteredRowCount = 0;
                const startIndex = (currentPage - 1) * rowsPerPage;
                const endIndex = startIndex + rowsPerPage;
                let allFilteredDataForCharts: any[] = [];

                setProcessingMessage('Applying filters...');
                for (let i = 0; i < searchedData.length; i++) {
                    if (i % yieldThreshold === 0) {
                        await yieldToMain(signal);
                        setProcessingMessage(`Applying filters: ${i.toLocaleString()} / ${searchedData.length.toLocaleString()} rows`);
                    }
                    const originalRow = searchedData[i];
                    const rowEdits = Object.entries(editedData).filter(([key]) => key.startsWith(`${originalRow.__id}_`));
                    const currentRow = { ...originalRow };
                    if (rowEdits.length > 0) {
                        rowEdits.forEach(([key, value]) => {
                            const column = key.substring(`${originalRow.__id}_`.length);
                            currentRow[column] = value;
                        });
                    }
                    
                    const passesFilters = debouncedFilters.every(filter => {
                        if (!filter.values || filter.values.length === 0) return true;
                        return filter.values.includes(String(currentRow[filter.column]));
                    });

                    if (passesFilters) {
                        filteredRowCount++;
                        if (filteredRowCount > startIndex && filteredRowCount <= endIndex) {
                            pageRows.push(currentRow);
                        }
                        allFilteredDataForCharts.push(currentRow);
                    }
                }
                
                // 5. Sample chart data if necessary
                let isSampled = false;
                if (!forceFullChartUpdate && allFilteredDataForCharts.length > CHART_DATA_SAMPLE_THRESHOLD) {
                    setProcessingMessage(`Sampling ${CHART_DATA_SAMPLE_THRESHOLD.toLocaleString()} rows for charts...`);
                    await yieldToMain(signal);
                    
                    const step = Math.ceil(allFilteredDataForCharts.length / CHART_DATA_SAMPLE_THRESHOLD);
                    const sampledChartData = [];
                    let iterationCount = 0;
                    for (let i = 0; i < allFilteredDataForCharts.length; i += step) {
                         if (iterationCount++ % yieldThreshold === 0) await yieldToMain(signal);
                         sampledChartData.push(allFilteredDataForCharts[i]);
                    }
                    allFilteredDataForCharts = sampledChartData;
                    isSampled = true;
                } else if (forceFullChartUpdate) {
                    setProcessingMessage(`Preparing ${allFilteredDataForCharts.length.toLocaleString()} rows for charts...`);
                    await yieldToMain(signal); // Give UI a chance to update before potential freeze
                }
                setIsChartDataSampled(isSampled);

                setProcessedData({ 
                    paginatedData: pageRows, 
                    totalRows: filteredRowCount, 
                    processedDataForCharts: allFilteredDataForCharts 
                });

            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Data processing pipeline failed:", error);
                }
            } finally {
                // This block runs regardless of whether the try block succeeded or failed (or was aborted).
                if (!signal.aborted) {
                    setIsProcessing(false);
                    abortControllerRef.current = null;
                }
            }
        };

        processData();

        return () => {
            controller.abort();
        };

    }, [
        workbook,
        selectedSheets,
        columnMaps,
        addedColumns,
        debouncedSearchTerm,
        debouncedFilters,
        editedData,
        currentPage,
        rowsPerPage,
        forceFullChartUpdate,
        yieldThreshold,
    ]);
    
    return { 
        isProcessing,
        processingMessage,
        cancelProcessing,
        combinedData,
        processedData,
        allHeaders,
        columnValueCounts,
        isChartDataSampled,
    };
}
