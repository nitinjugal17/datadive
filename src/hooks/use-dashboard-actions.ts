
'use client';

import { useCallback, useMemo, Dispatch, SetStateAction, RefObject } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import type { Workbook, Sheet } from '@/lib/mock-data';
import type { ColumnMapping, Filter, FilterOptions, Template, DashboardChart, GroupReportRow } from '@/lib/types';
import { DEFAULT_CHARTS, yieldToMain } from '@/lib/dashboard-config';

type UseDashboardActionsProps = {
    // State
    isClient: boolean;
    workbook: Workbook;
    editedData: Record<string, any>;
    addedColumns: string[];
    memoryThresholdBytes: number;
    selectedSheets: string[];
    columnMaps: Record<string, ColumnMapping>;
    activeTab: string;
    filterHistory: Filter[][];
    currentHistoryIndex: number;
    activeFilters: Filter[];
    debouncedSearchTerm: string;
    charts: DashboardChart[];
    pristineCharts: DashboardChart[];
    isUploading: boolean;
    headerRow: number;
    pendingFile: File | null;
    originalFile: File | null;
    chunkSizeMB: number;
    includeDataInSave: boolean;
    bulkEditColumn: string;
    bulkEditValue: string;
    newColumnName: string;
    splitColumnSource: string;
    splitColumnDelimiter: string;
    splitColumnNewNames: string;
    nocoBaseUrl: string;
    nocoBaseToken: string;
    newTemplateName: string;
    newTemplateDescription: string;
    includeDataInTemplateSave: boolean;
    editingTemplate: Template | null;
    templateToDeleteId: string | null;
    deletePassword: string;
    pendingTemplate: Template | null;
    templateUnlockPassword: string;
    hasUnsavedChanges: boolean;
    hasUnsavedDataChanges: boolean;
    combinedData: any[];
    processedData: { totalRows: number, processedDataForCharts: any[] };
    allHeaders: string[];
    isTemplatesUnlocked: boolean;
    summaryReportSheets: string[];
    summaryReportAggregation: 'sum' | 'average' | 'count' | 'count-distinct';
    summaryReportRows: string[];
    summaryReportPivotCol: string;
    summaryReportValueCol: string;
    summaryReportData: Record<string, { data: any[], headers: string[] }>;
    isGeneratingSummary: boolean;
    summaryReportMode: 'single' | 'individual';
    groupReportSheets: string[];
    groupReportConfig: { column: string; newColumnName: string; mappings: string; };
    groupReportData: GroupReportRow[];
    isGeneratingGroupReport: boolean;
    yieldThreshold: number;
    includeOriginalDataInReport: boolean;
    pendingReportType: 'summary' | 'group' | null;
    // State Setters
    setWorkbook: Dispatch<SetStateAction<Workbook>>;
    setEditedData: Dispatch<SetStateAction<Record<string, any>>>;
    setAddedColumns: Dispatch<SetStateAction<string[]>>;
    setSelectedSheets: Dispatch<SetStateAction<string[]>>;
    setColumnMaps: Dispatch<SetStateAction<Record<string, ColumnMapping>>>;
    setActiveTab: Dispatch<SetStateAction<string>>;
    setShowDataMissingAlert: Dispatch<SetStateAction<boolean>>;
    setFilterHistory: Dispatch<SetStateAction<Filter[][]>>;
    setCurrentHistoryIndex: Dispatch<SetStateAction<number>>;
    setCharts: Dispatch<SetStateAction<DashboardChart[]>>;
    setPristineCharts: Dispatch<SetStateAction<DashboardChart[]>>;
    setForceFullChartUpdate: Dispatch<SetStateAction<boolean>>;
    setIsUploading: Dispatch<SetStateAction<boolean>>;
    setIsCommitting: Dispatch<SetStateAction<boolean>>;
    setProcessingMessage: Dispatch<SetStateAction<string>>;
    setUploadProgress: Dispatch<SetStateAction<number>>;
    setHeaderRow: Dispatch<SetStateAction<number>>;
    setPendingFile: Dispatch<SetStateAction<File | null>>;
    setOriginalFile: Dispatch<SetStateAction<File | null>>;
    setIsSaveSettingsOpen: Dispatch<SetStateAction<boolean>>;
    setUnsavedChangesInfo: Dispatch<SetStateAction<{ action: (() => void) | null; isOpen: boolean; }>>;
    setIsBulkEditDialogOpen: Dispatch<SetStateAction<boolean>>;
    setBulkEditColumn: Dispatch<SetStateAction<string>>;
    setBulkEditValue: Dispatch<SetStateAction<string>>;
    setIsUploadConfirmOpen: Dispatch<SetStateAction<boolean>>;
    setIsCommitConfirmOpen: Dispatch<SetStateAction<boolean>>;
    setIsDetailViewOpen: Dispatch<SetStateAction<boolean>>;
    setRowForDetailView: Dispatch<SetStateAction<any | null>>;
    setIsAddColumnDialogOpen: Dispatch<SetStateAction<boolean>>;
    setNewColumnName: Dispatch<SetStateAction<string>>;
    setAddColumnError: Dispatch<SetStateAction<string>>;
    setIsSplitColumnDialogOpen: Dispatch<SetStateAction<boolean>>;
    setSplitColumnSource: Dispatch<SetStateAction<string>>;
    setSplitColumnDelimiter: Dispatch<SetStateAction<string>>;
    setSplitColumnNewNames: Dispatch<SetStateAction<string>>;
    setSplitColumnError: Dispatch<SetStateAction<string>>;
    setIsHistoryDialogOpen: Dispatch<SetStateAction<boolean>>;
    setIsNocoBaseOpen: Dispatch<SetStateAction<boolean>>;
    setTemplates: Dispatch<SetStateAction<Template[]>>;
    setIsSaveTemplateOpen: Dispatch<SetStateAction<boolean>>;
    setIsSavingTemplate: Dispatch<SetStateAction<boolean>>;
    setEditingTemplate: Dispatch<SetStateAction<Template | null>>;
    setNewTemplateName: Dispatch<SetStateAction<string>>;
    setNewTemplateDescription: Dispatch<SetStateAction<string>>;
    setIncludeDataInTemplateSave: Dispatch<SetStateAction<boolean>>;
    setIsDeleteTemplateDialogOpen: Dispatch<SetStateAction<boolean>>;
    setTemplateToDeleteId: Dispatch<SetStateAction<string | null>>;
    setDeletePassword: Dispatch<SetStateAction<string>>;
    setIsTemplateWarningOpen: Dispatch<SetStateAction<boolean>>;
    setPendingTemplate: Dispatch<SetStateAction<Template | null>>;
    setTemplateWarningMessage: Dispatch<SetStateAction<string>>;
    setIsTemplatesUnlocked: Dispatch<SetStateAction<boolean>>;
    setIsTemplateUnlockDialogOpen: Dispatch<SetStateAction<boolean>>;
    setTemplateUnlockPassword: Dispatch<SetStateAction<string>>;
    setTemplateUnlockError: Dispatch<SetStateAction<string>>;
    setVisibleColumns: Dispatch<SetStateAction<string[]>>;
    setFilterOptions: Dispatch<SetStateAction<FilterOptions>>;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    setUserConfiguredFilterable: Dispatch<SetStateAction<Record<string, boolean>>>;
    setIsSummaryReportOpen: Dispatch<SetStateAction<boolean>>;
    setSummaryReportSheets: Dispatch<SetStateAction<string[]>>;
    setSummaryReportRows: Dispatch<SetStateAction<string[]>>;
    setSummaryReportPivotCol: Dispatch<SetStateAction<string>>;
    setSummaryReportValueCol: Dispatch<SetStateAction<string>>;
    setSummaryReportData: Dispatch<SetStateAction<Record<string, { data: any[], headers: string[] }>>>;
    setIsGeneratingSummary: Dispatch<SetStateAction<boolean>>;
    setSummaryReportMode: Dispatch<SetStateAction<'single' | 'individual'>>;
    setIsGroupReportOpen: Dispatch<SetStateAction<boolean>>;
    setGroupReportSheets: Dispatch<SetStateAction<string[]>>;
    setGroupReportConfig: Dispatch<SetStateAction<{ column: string; newColumnName: string; mappings: string; }>>;
    setGroupReportData: Dispatch<SetStateAction<GroupReportRow[]>>;
    setIsGeneratingGroupReport: Dispatch<SetStateAction<boolean>>;
    setIsReportChangesDialogOpen: Dispatch<SetStateAction<boolean>>;
    setReportChangeExample: Dispatch<SetStateAction<string>>;
    setPendingReportType: Dispatch<SetStateAction<'summary' | 'group' | null>>;
    // Refs
    fileInputRef: RefObject<HTMLInputElement>;
    uploadAbortControllerRef: RefObject<AbortController | null>;
    commitAbortControllerRef: RefObject<AbortController | null>;
    memoryStateRef: RefObject<{ bytes: number; threshold: number }>;
    // Functions from parent hook
    generateFilterOptions: (data: any[], headersToProcess: string[]) => Promise<void>;
};

export function useDashboardActions(props: UseDashboardActionsProps) {
    const { toast } = useToast();

    const {
        workbook, editedData, addedColumns, memoryThresholdBytes, selectedSheets, columnMaps, activeTab, filterHistory,
        currentHistoryIndex, activeFilters, debouncedSearchTerm, charts, pristineCharts, isUploading, headerRow, pendingFile, originalFile,
        chunkSizeMB, includeDataInSave, bulkEditColumn, bulkEditValue, newColumnName, splitColumnSource,
        splitColumnDelimiter, splitColumnNewNames, nocoBaseUrl, nocoBaseToken, newTemplateName, newTemplateDescription,
        includeDataInTemplateSave, editingTemplate, templateToDeleteId, deletePassword, pendingTemplate,
        templateUnlockPassword, hasUnsavedChanges, hasUnsavedDataChanges, combinedData, processedData, allHeaders, isTemplatesUnlocked,
        summaryReportSheets, summaryReportAggregation, summaryReportRows, summaryReportPivotCol, summaryReportValueCol, summaryReportData, isGeneratingSummary, yieldThreshold,
        groupReportSheets, groupReportConfig, groupReportData, isGeneratingGroupReport, includeOriginalDataInReport, pendingReportType,
        summaryReportMode,
        setWorkbook, setEditedData, setAddedColumns, setSelectedSheets, setColumnMaps, setActiveTab,
        setShowDataMissingAlert, setFilterHistory, setCurrentHistoryIndex, setCharts, setPristineCharts,
        setForceFullChartUpdate, setIsUploading, setIsCommitting, setProcessingMessage, setUploadProgress,
        setHeaderRow, setPendingFile, setOriginalFile, setIsSaveSettingsOpen, setUnsavedChangesInfo,
        setIsBulkEditDialogOpen, setBulkEditColumn, setBulkEditValue, setIsUploadConfirmOpen,
        setIsCommitConfirmOpen, setIsDetailViewOpen, setRowForDetailView, setIsAddColumnDialogOpen,
        setNewColumnName, setAddColumnError, setIsSplitColumnDialogOpen, setSplitColumnSource,
        setSplitColumnDelimiter, setSplitColumnNewNames, setSplitColumnError, setIsHistoryDialogOpen,
        setIsNocoBaseOpen, setTemplates, setIsSaveTemplateOpen, setIsSavingTemplate, setEditingTemplate,
        setNewTemplateName, setNewTemplateDescription, setIncludeDataInTemplateSave,
        setIsDeleteTemplateDialogOpen, setTemplateToDeleteId, setDeletePassword, setIsTemplateWarningOpen,
        setPendingTemplate, setTemplateWarningMessage, setIsTemplatesUnlocked, setIsTemplateUnlockDialogOpen,
        setTemplateUnlockPassword, setTemplateUnlockError, setVisibleColumns, setFilterOptions,
        setSearchTerm, setCurrentPage, setUserConfiguredFilterable,
        setIsSummaryReportOpen, setSummaryReportSheets, setSummaryReportRows, setSummaryReportPivotCol, setSummaryReportValueCol, setSummaryReportData, setIsGeneratingSummary,
        setSummaryReportMode,
        setIsGroupReportOpen, setGroupReportSheets, setGroupReportConfig, setGroupReportData, setIsGeneratingGroupReport,
        setIsReportChangesDialogOpen, setReportChangeExample, setPendingReportType,
        fileInputRef, uploadAbortControllerRef, commitAbortControllerRef, memoryStateRef,
        generateFilterOptions,
    } = props;

    const resetFilterHistory = useCallback((initialFilters: Filter[] = []) => {
        setFilterHistory([initialFilters]);
        setCurrentHistoryIndex(0);
    }, [setFilterHistory, setCurrentHistoryIndex]);

    const showPostUploadWarning = useCallback(() => {
        toast({
            title: "File Loaded",
            description: "Please verify that data types like numbers and dates are mapped and formatted correctly for accurate analysis.",
            variant: "info",
        });
    }, [toast]);
    
    const proceedWithUpload = useCallback(async (file: File, templateToApply?: Template) => {
        const controller = new AbortController();
        uploadAbortControllerRef.current = controller;

        setIsUploading(true);
        setUploadProgress(0);
        setProcessingMessage(templateToApply ? `Loading template: ${templateToApply.name}` : 'Preparing to upload...');
        setShowDataMissingAlert(false);

        const parseCancellable = (fileToParse: File, signal: AbortSignal): Promise<Workbook> => {
            return new Promise((resolve, reject) => {
                if (signal.aborted) return reject(new DOMException('Upload cancelled', 'AbortError'));
                const onAbort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
                signal.addEventListener('abort', onAbort, { once: true });
                
                const cleanup = () => signal.removeEventListener('abort', onAbort);

                if (fileToParse.name.endsWith('.csv')) {
                    const sheet: Sheet = { name: fileToParse.name.replace(/\.[^/.]+$/, ""), data: [] };
                    let rowCount = 0;
                    const fileSize = fileToParse.size;
                    let processedBytes = 0;
                    let csvHeaders: string[] = [];
                    let rowsToSkip = headerRow > 0 ? headerRow - 1 : 0;
                    let isHeaderFound = false;
                    const allData: any[] = [];
                    setProcessingMessage(`Parsing CSV: ${fileToParse.name}`);

                    Papa.parse<string[]>(fileToParse, {
                        worker: true,
                        header: false, 
                        dynamicTyping: false, 
                        skipEmptyLines: true, 
                        encoding: "UTF-8",
                        chunkSize: chunkSizeMB * 1024 * 1024,
                        chunk: (results, parser) => {
                            if (signal.aborted) {
                                parser.abort();
                                return;
                            }
                            if (memoryStateRef.current && memoryStateRef.current.bytes > memoryStateRef.current.threshold) {
                                parser.abort();
                                reject(new Error("Memory limit reached during parsing."));
                                return;
                            }

                            if (results.errors.length) {
                                parser.abort();
                                reject(new Error(results.errors[0].message));
                                return;
                            }
                            
                            let chunkData = results.data;
                            if (!isHeaderFound) {
                                if (chunkData.length > rowsToSkip) {
                                    csvHeaders = chunkData[rowsToSkip];
                                    chunkData = chunkData.slice(rowsToSkip + 1);
                                    isHeaderFound = true;
                                } else {
                                    rowsToSkip -= chunkData.length;
                                    chunkData = [];
                                }
                            }

                            if (isHeaderFound) {
                                allData.push(...chunkData.map(rowArray => {
                                    const rowObject: Record<string, any> = {};
                                    csvHeaders.forEach((h, i) => { if (h) rowObject[h] = rowArray[i]; });
                                    return rowObject;
                                }));
                            }
                            
                            rowCount += results.data.length;
                            processedBytes = Math.min(processedBytes + (parser as any).chunkSize, fileSize);
                            setUploadProgress((processedBytes / fileSize) * 100);
                            setProcessingMessage(`Processing... read ${rowCount} rows.`);
                        },
                        complete: () => {
                            cleanup();
                            if (!isHeaderFound) return reject(new Error(`Header row ${headerRow} not found in file.`));
                            sheet.data = allData;
                            resolve({ sheets: [sheet] });
                        },
                        error: (error) => {
                            cleanup();
                            reject(error.name === 'AbortError' ? error : new Error(error.message));
                        }
                    });
                } else if (fileToParse.name.endsWith('.xlsx') || fileToParse.name.endsWith('.xls')) {
                    setProcessingMessage(`Reading Excel file: ${fileToParse.name}`);
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const data = e.target?.result;
                            const workbook = XLSX.read(data, { type: 'array' });
                            const newWorkbook: Workbook = { sheets: [] };

                            for (let i = 0; i < workbook.SheetNames.length; i++) {
                                if (signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');
                                
                                const sheetName = workbook.SheetNames[i];
                                setUploadProgress((i / workbook.SheetNames.length) * 100);
                                setProcessingMessage(`Parsing sheet: ${sheetName}`);
                                
                                await new Promise(res => setTimeout(res, 0)); 
                                const worksheet = workbook.Sheets[sheetName];
                                const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRow > 0 ? headerRow - 1 : 0, raw: false });
                                
                                const stringifiedJsonData = jsonData.map((row: any) => {
                                    const newRow: { [key: string]: string | number | null | undefined } = {};
                                    for (const key in row) {
                                        if (Object.prototype.hasOwnProperty.call(row, key)) {
                                            const value = row[key];
                                            newRow[key] = (value !== null && value !== undefined) ? String(value) : value;
                                        }
                                    }
                                    return newRow;
                                });

                                newWorkbook.sheets.push({ name: sheetName, data: stringifiedJsonData as any[] });
                            }
                            cleanup();
                            resolve(newWorkbook);
                        } catch (error) { cleanup(); reject(error); }
                    };
                    reader.onerror = () => { cleanup(); reject(new Error('Failed to read the file.')); };
                    reader.readAsArrayBuffer(fileToParse);
                } else {
                    cleanup();
                    reject(new Error("Unsupported file type. Please upload a .csv, .xls, or .xlsx file."));
                }
            });
        };

        try {
            let newWorkbook = { sheets: [] } as Workbook;

            if (templateToApply?.dataFilePath) {
                setProcessingMessage(`Fetching template data from server...`);
                const dataResponse = await fetch(`/api/data-files/${templateToApply.dataFilePath}`, { signal: controller.signal });
                if (!dataResponse.ok) throw new Error('Failed to fetch template data from server.');
                const fileBlob = await dataResponse.blob();
                const fetchedFile = new File([fileBlob], templateToApply.dataFilePath, { type: fileBlob.type });
                newWorkbook = await parseCancellable(fetchedFile, controller.signal);
                setOriginalFile(fetchedFile);
            } else {
                newWorkbook = await parseCancellable(file, controller.signal);
                setOriginalFile(file);
            }

            setWorkbook(newWorkbook);
            
            if (templateToApply) {
                setSelectedSheets(templateToApply.columnMaps ? Object.keys(templateToApply.columnMaps) : newWorkbook.sheets.map(s => s.name));
                setColumnMaps(templateToApply.columnMaps);
                resetFilterHistory(templateToApply.filters);
                const chartsToApply = templateToApply.chartConfigs || [];
                setCharts(chartsToApply);
                setPristineCharts(chartsToApply);
            } else {
                setSelectedSheets(newWorkbook.sheets.map(s => s.name));
                setColumnMaps({});
                resetFilterHistory();
                setCharts(DEFAULT_CHARTS);
                setPristineCharts(DEFAULT_CHARTS);
            }

            setEditedData({});
            setFilterOptions({});
            setSearchTerm('');
            setAddedColumns([]);
            setCurrentPage(1);

            const allData = newWorkbook.sheets.flatMap(s => s.data);
            const allHeadersFromFile: Set<string> = Array.from(allData.reduce((acc: Set<string>, row: any) => {
                Object.keys(row).forEach(key => acc.add(key));
                return acc;
            }, new Set<string>()));

            const keyColumnSubstrings = ['id', 'key', 'code', 'uuid'];
            const defaultFilterableHeaders = Array.from(allHeadersFromFile).filter(h => !keyColumnSubstrings.some(s => h.toLowerCase().includes(s)));
            await generateFilterOptions(allData, defaultFilterableHeaders);

            setUploadProgress(100);
            setProcessingMessage('Complete!');
            
            if (templateToApply) {
                toast({ title: 'Template Loaded', description: `Successfully loaded "${templateToApply.name}" with its data.` });
            } else {
                toast({ title: 'Success', description: 'Workbook loaded.' });
                showPostUploadWarning();
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast({ title: 'Upload Cancelled', description: 'The file processing was stopped by the user.' });
            } else {
                toast({ variant: 'destructive', title: 'Upload Error', description: error.message });
            }
            throw error;
        } finally {
            setIsUploading(false);
            uploadAbortControllerRef.current = null;
        }
    }, [headerRow, toast, generateFilterOptions, resetFilterHistory, showPostUploadWarning, chunkSizeMB, memoryStateRef, uploadAbortControllerRef, setIsUploading, setUploadProgress, setProcessingMessage, setShowDataMissingAlert, setOriginalFile, setWorkbook, setSelectedSheets, setColumnMaps, setCharts, setPristineCharts, setEditedData, setFilterOptions, setSearchTerm, setAddedColumns, setCurrentPage]);

    const confirmAndExecute = useCallback((action: () => void) => {
        if (hasUnsavedChanges) {
          setUnsavedChangesInfo({ action, isOpen: true });
        } else {
          action();
        }
      }, [hasUnsavedChanges, setUnsavedChangesInfo]);

    const handleDiscardChanges = useCallback(() => {
        setUnsavedChangesInfo(prev => {
            if (prev.action) {
                prev.action();
            }
            return { action: null, isOpen: false };
        });
        setEditedData({});
        setAddedColumns([]);
        setCharts(pristineCharts);
    }, [setUnsavedChangesInfo, setEditedData, setAddedColumns, setCharts, pristineCharts]);

    const handleCancelUpload = useCallback(() => {
        if (uploadAbortControllerRef.current) {
            uploadAbortControllerRef.current.abort();
            toast({ title: "Upload Cancelled" });
        }
    }, [uploadAbortControllerRef, toast]);

    const handleCancelCommit = useCallback(() => {
        if (commitAbortControllerRef.current) {
            commitAbortControllerRef.current.abort();
            toast({ title: "Commit Cancelled" });
        }
    }, [commitAbortControllerRef, toast]);

    const handleTabChange = useCallback((newTab: string) => {
        if (newTab === activeTab) return;
        if (newTab === 'templates' && !isTemplatesUnlocked) {
          setTemplateUnlockError('');
          setTemplateUnlockPassword('');
          setIsTemplateUnlockDialogOpen(true);
          return;
        }
        confirmAndExecute(() => setActiveTab(newTab));
    }, [activeTab, isTemplatesUnlocked, confirmAndExecute, setActiveTab, setTemplateUnlockError, setTemplateUnlockPassword, setIsTemplateUnlockDialogOpen]);

    const handleSheetSelect = useCallback((sheetName: string, isSelected: boolean) => {
        confirmAndExecute(() => {
            setSelectedSheets(prev =>
            isSelected ? [...prev, sheetName] : prev.filter(name => name !== sheetName)
            );
            setEditedData({});
            setAddedColumns([]);
            setCharts(pristineCharts);
            setCurrentPage(1);
        });
    }, [confirmAndExecute, pristineCharts, setSelectedSheets, setEditedData, setAddedColumns, setCharts, setCurrentPage]);

    const handleSelectAllSheets = useCallback((isSelected: boolean) => {
        confirmAndExecute(() => {
            setSelectedSheets(isSelected ? workbook.sheets.map(s => s.name) : []);
            setEditedData({});
            setAddedColumns([]);
            setCharts(pristineCharts);
            setCurrentPage(1);
        });
    }, [workbook.sheets, confirmAndExecute, pristineCharts, setSelectedSheets, setEditedData, setAddedColumns, setCharts, setCurrentPage]);

    const handleColumnMapChange = useCallback((sheetName: string, originalHeader: string, newHeader: string) => {
        setColumnMaps(prev => ({
            ...prev,
            [sheetName]: { ...prev[sheetName], [originalHeader]: newHeader },
        }));
    }, [setColumnMaps]);
    
    const applyFiltersAndRecordHistory = useCallback((newFilters: Filter[]) => {
        const newHistory = filterHistory.slice(0, currentHistoryIndex + 1);
        if (JSON.stringify(newHistory[newHistory.length - 1]) === JSON.stringify(newFilters)) {
            return;
        }
        newHistory.push(newFilters);
        setFilterHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    }, [filterHistory, currentHistoryIndex, setFilterHistory, setCurrentHistoryIndex]);

    const handleClearFilters = useCallback(() => {
        applyFiltersAndRecordHistory([]);
        setCurrentPage(1);
        toast({ title: 'Filters Cleared' });
    }, [applyFiltersAndRecordHistory, toast, setCurrentPage]);

    const handleHeaderRowChange = useCallback((value: string) => {
        setHeaderRow(Math.max(1, parseInt(value, 10) || 1));
    }, [setHeaderRow]);

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, [setCurrentPage]);

    const handleCellEdit = useCallback((rowId: number, column: string, value: any) => {
        setEditedData(prev => ({ ...prev, [`${rowId}_${column}`]: value }));
    }, [setEditedData]);

    const executeSaveSettings = useCallback((includeData: boolean, callback?: () => void) => {
        const settings = {
            filters: activeFilters, columnMaps, selectedSheets, headerRow, charts,
            workbook: includeData ? workbook : null,
        };
        try {
            localStorage.setItem('dashboardSettings', JSON.stringify(settings));
            setPristineCharts(charts);
            const description = includeData ? 'Your dashboard configuration and data have been saved.' : 'Your dashboard configuration has been saved.';
            toast({ title: 'Success', description });
            if (callback) callback();
        } catch (error) {
            console.error("Failed to save to local storage", error);
            toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save settings.' });
        }
    }, [activeFilters, columnMaps, selectedSheets, headerRow, workbook, charts, toast, setPristineCharts]);

    const handleSaveChanges = useCallback(() => {
        if (Object.keys(editedData).length === 0) {
            toast({ title: 'No Changes', description: 'There are no pending changes to save.' });
            return;
        }
        toast({ title: 'Changes Saved', description: 'Your edits have been applied to the current session.' });
        executeSaveSettings(true);
        setEditedData({});
    }, [editedData, executeSaveSettings, toast, setEditedData]);

    const handleDownload = useCallback((format: 'csv' | 'xlsx') => {
        const dataWithEdits = combinedData.map(originalRow => {
          const rowEdits = Object.entries(editedData).filter(([key]) => key.startsWith(`${originalRow.__id}_`));
          if (rowEdits.length === 0) return originalRow;
          const newRow = { ...originalRow };
          rowEdits.forEach(([key, value]) => {
            const column = key.substring(`${originalRow.__id}_`.length);
            newRow[column] = value;
          });
          return newRow;
        });

        if (dataWithEdits.length === 0) {
          toast({ title: 'No Data', description: 'There is no data to download.' });
          return;
        }

        if (format === 'csv') {
            const dataToExport = dataWithEdits.map(({ __source_sheet, __id, ...rest }) => rest);
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'datadive_export.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else if (format === 'xlsx') {
            const sheetsByName: Record<string, any[]> = {};
            dataWithEdits.forEach(row => {
              const sheetName = row.__source_sheet;
              if (!sheetsByName[sheetName]) sheetsByName[sheetName] = [];
              const { __source_sheet, __id, ...rowData } = row;
              sheetsByName[sheetName].push(rowData);
            });
            const newWb = XLSX.utils.book_new();
            Object.keys(sheetsByName).forEach(sheetName => {
              if (sheetsByName[sheetName].length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(sheetsByName[sheetName]);
                XLSX.utils.book_append_sheet(newWb, worksheet, sheetName);
              }
            });
            if (newWb.SheetNames.length > 0) XLSX.writeFile(newWb, 'datadive_export.xlsx');
        }
        toast({ title: 'Download Started' });
    }, [combinedData, editedData, toast]);

    const handleBulkEdit = useCallback(() => {
        if (!bulkEditColumn) {
          toast({ variant: 'destructive', title: 'No Column Selected', description: 'Please select a column to edit.' });
          return;
        }
        const newEdits: Record<string, any> = { ...editedData };
        processedData.processedDataForCharts.forEach((row) => {
          newEdits[`${row.__id}_${bulkEditColumn}`] = bulkEditValue;
        });
        setEditedData(newEdits);
        toast({ title: 'Bulk Edit Applied', description: `Set column "${bulkEditColumn}" to "${bulkEditValue}" for all visible rows.` });
        setIsBulkEditDialogOpen(false);
        setBulkEditColumn('');
        setBulkEditValue('');
    }, [bulkEditColumn, bulkEditValue, processedData.processedDataForCharts, editedData, toast, setIsBulkEditDialogOpen, setBulkEditColumn, setBulkEditValue]);

    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, [fileInputRef]);

    const handleFilterableColumnChange = useCallback(async (header: string, isFilterable: boolean) => {
        setUserConfiguredFilterable(prev => ({ ...prev, [header]: isFilterable }));
        if (isFilterable && !props.filterOptions[header]) {
          await generateFilterOptions(combinedData, [header]);
        }
    }, [setUserConfiguredFilterable, props.filterOptions, generateFilterOptions, combinedData]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement> | null) => {
        const file = event?.target?.files?.[0];
        if (event?.target) event.target.value = '';
        if (!file) {
            setPendingFile(null);
            setIsUploadConfirmOpen(false);
            return;
        }
        if (file.size > memoryThresholdBytes) {
            toast({ variant: "destructive", title: "File Too Large", description: `File size exceeds memory threshold.`, duration: 8000 });
            return;
        }
        const hasActiveMappings = Object.values(columnMaps).some(map => Object.keys(map).length > 0);
        if (hasUnsavedChanges || activeFilters.length > 0 || hasActiveMappings) {
            setPendingFile(file);
            setIsUploadConfirmOpen(true);
        } else {
            await proceedWithUpload(file);
        }
    }, [memoryThresholdBytes, columnMaps, hasUnsavedChanges, activeFilters.length, toast, setPendingFile, setIsUploadConfirmOpen, proceedWithUpload]);
    
    const handleInitiateSaveSettings = useCallback(() => {
        setIsSaveSettingsOpen(true);
    }, [setIsSaveSettingsOpen]);

    const handleConfirmSaveSettings = useCallback(() => {
        executeSaveSettings(includeDataInSave);
        setIsSaveSettingsOpen(false);
    }, [executeSaveSettings, includeDataInSave, setIsSaveSettingsOpen]);

    const handleSaveAndUpload = useCallback(() => {
        setIsUploadConfirmOpen(false);
        executeSaveSettings(true, async () => {
            if (pendingFile) {
                await proceedWithUpload(pendingFile);
                setPendingFile(null);
            }
        });
    }, [setIsUploadConfirmOpen, executeSaveSettings, pendingFile, proceedWithUpload, setPendingFile]);

    const handleDiscardAndUpload = useCallback(async () => {
        setIsUploadConfirmOpen(false);
        if (pendingFile) {
          await proceedWithUpload(pendingFile);
          setPendingFile(null);
        }
    }, [setIsUploadConfirmOpen, pendingFile, proceedWithUpload, setPendingFile]);

    const handleLoadSettings = useCallback(async () => {
        const savedSettingsJSON = localStorage.getItem('dashboardSettings');
        if (savedSettingsJSON) {
            const savedSettings = JSON.parse(savedSettingsJSON);
            resetFilterHistory(savedSettings.filters || []);
            setColumnMaps(savedSettings.columnMaps || {});
            setSelectedSheets(savedSettings.selectedSheets || []);
            setHeaderRow(savedSettings.headerRow || 1);
            const loadedCharts = savedSettings.charts || DEFAULT_CHARTS;
            setCharts(loadedCharts);
            setPristineCharts(loadedCharts);

            if (savedSettings.workbook) {
                setWorkbook(savedSettings.workbook);
                setShowDataMissingAlert(false);
                const allData = savedSettings.workbook.sheets.flatMap((s: Sheet) => s.data);
                const headers = Array.from(allData.reduce((acc: Set<string>, row: any) => (Object.keys(row).forEach(key => acc.add(key)), acc), new Set<string>()));
                const filterable = headers.filter(h => !['id', 'key', 'code', 'uuid'].some(s => h.toLowerCase().includes(s)));
                await generateFilterOptions(allData, filterable);
                toast({ title: 'Success', description: 'Dashboard settings and data loaded.' });
            } else {
                setShowDataMissingAlert(true);
                toast({ title: 'Settings Loaded', description: 'Configuration applied. Please upload the file.' });
            }
            setCurrentPage(1);
            setEditedData({});
            setAddedColumns([]);
        } else {
            toast({ title: 'No Saved Settings' });
        }
    }, [resetFilterHistory, setColumnMaps, setSelectedSheets, setHeaderRow, setCharts, setPristineCharts, setWorkbook, setShowDataMissingAlert, generateFilterOptions, toast, setCurrentPage, setEditedData, setAddedColumns]);

    const handleReloadData = useCallback(() => {
        setEditedData({});
        setAddedColumns([]);
        setCharts(pristineCharts);
        if (activeFilters.length > 0) {
          applyFiltersAndRecordHistory([]);
          toast({ title: 'Data Reloaded', description: 'Edits, chart changes, added columns, and filters discarded.' });
        } else {
          toast({ title: 'Data Reloaded', description: 'Edits, chart changes, and added columns discarded.' });
        }
        setCurrentPage(1);
    }, [activeFilters.length, toast, applyFiltersAndRecordHistory, pristineCharts, setEditedData, setAddedColumns, setCharts, setCurrentPage]);

    const handleNocoBaseConnect = useCallback(async () => {
        if (!nocoBaseUrl) {
            toast({ variant: 'destructive', title: 'URL Required' });
            return;
        }
        setIsUploading(true);
        setProcessingMessage('Connecting to NocoBase API...');
        setShowDataMissingAlert(false);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (nocoBaseToken) headers['x-token'] = nocoBaseToken;
            const response = await fetch(nocoBaseUrl, { headers });
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
            const responseData = await response.json();
            const nocoData = Array.isArray(responseData) ? responseData : responseData.data;
            if (!Array.isArray(nocoData)) throw new Error('Invalid data format from API.');
            
            const sheet: Sheet = { name: 'NocoBase Data', data: nocoData };
            const newWorkbook: Workbook = { sheets: [sheet] };
            
            const headersFromNoco = Array.from(nocoData.reduce((acc: Set<string>, row: any) => (Object.keys(row).forEach(key => acc.add(key)), acc), new Set<string>()));
            const filterable = headersFromNoco.filter(h => !['id', 'key', 'code', 'uuid'].some(s => h.toLowerCase().includes(s)));
            await generateFilterOptions(nocoData, filterable);

            setWorkbook(newWorkbook);
            setSelectedSheets([sheet.name]);
            setColumnMaps({});
            resetFilterHistory();
            setEditedData({});
            setFilterOptions({});
            setSearchTerm('');
            setAddedColumns([]);
            setCurrentPage(1);
            
            toast({ title: 'Success', description: 'Connected and loaded data from NocoBase.' });
            showPostUploadWarning();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Connection Error', description: error.message });
        } finally {
            setIsUploading(false);
            setIsNocoBaseOpen(false);
        }
    }, [nocoBaseUrl, nocoBaseToken, toast, showPostUploadWarning, generateFilterOptions, resetFilterHistory, setIsUploading, setProcessingMessage, setShowDataMissingAlert, setWorkbook, setSelectedSheets, setColumnMaps, setEditedData, setFilterOptions, setSearchTerm, setAddedColumns, setCurrentPage, setIsNocoBaseOpen]);

    const handleOpenSaveTemplateDialog = useCallback(() => {
        setEditingTemplate(null);
        setNewTemplateName('');
        setNewTemplateDescription('');
        setIncludeDataInTemplateSave(false);
        setIsSaveTemplateOpen(true);
    }, [setEditingTemplate, setNewTemplateName, setNewTemplateDescription, setIncludeDataInTemplateSave, setIsSaveTemplateOpen]);

    const handleOpenEditTemplateDialog = useCallback((template: Template) => {
        setEditingTemplate(template);
        setNewTemplateName(template.name);
        setNewTemplateDescription(template.description);
        setIncludeDataInTemplateSave(!!template.dataFilePath);
        setIsSaveTemplateOpen(true);
    }, [setEditingTemplate, setNewTemplateName, setNewTemplateDescription, setIncludeDataInTemplateSave, setIsSaveTemplateOpen]);

    const handleSaveTemplate = useCallback(async () => {
        if (!newTemplateName) {
            toast({ variant: 'destructive', title: 'Template Name Required' });
            return;
        }

        const isUploadingData = includeDataInTemplateSave && originalFile;
        
        setIsSavingTemplate(true);
        if (isUploadingData) {
            setIsUploading(true);
            setProcessingMessage('Uploading data for template...');
        }

        try {
            let dataFilePath: string | undefined = undefined;
            if (isUploadingData) {
                const formData = new FormData();
                formData.append('file', originalFile!);
                const uploadResponse = await fetch('/api/data-files/upload', { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error(`File upload failed: ${await uploadResponse.text()}`);
                dataFilePath = (await uploadResponse.json()).filePath;
                setProcessingMessage('Data uploaded, saving template...');
            }

            const templateData = {
              name: newTemplateName, description: newTemplateDescription, filters: activeFilters,
              columnMaps, chartConfigs: charts, originalHeaders: allHeaders,
              dataFilePath: dataFilePath || (editingTemplate?.dataFilePath && includeDataInTemplateSave ? editingTemplate.dataFilePath : undefined),
            };
            
            const response = await fetch(editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates', {
              method: editingTemplate ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(editingTemplate ? templateData : { ...templateData, id: `template-${Date.now()}` }),
            });
            if (!response.ok) throw new Error('Failed to save template.');

            const savedTemplate = await response.json();
            if (editingTemplate) {
              setTemplates(prev => prev.map(t => (t.id === editingTemplate.id ? savedTemplate : t)));
              toast({ title: 'Template Updated' });
            } else {
              setTemplates(prev => [...prev, savedTemplate]);
              toast({ title: 'Template Saved' });
            }
            setPristineCharts(charts);
            setIsSaveTemplateOpen(false);
            setEditingTemplate(null);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Save Error', description: error.message });
        } finally {
            setIsSavingTemplate(false);
            if (isUploadingData) {
                setIsUploading(false);
            }
        }
    }, [
        newTemplateName, includeDataInTemplateSave, originalFile, toast, setIsSavingTemplate,
        setIsUploading, setProcessingMessage, newTemplateDescription, activeFilters, columnMaps,
        charts, allHeaders, editingTemplate, setTemplates, setPristineCharts, setIsSaveTemplateOpen, setEditingTemplate
    ]);

    const executeApplyTemplate = useCallback(async (template: Template) => {
        await proceedWithUpload(new File([], ''), template);
    }, [proceedWithUpload]);

    const handleApplyTemplateWithData = useCallback(async (template: Template) => {
        confirmAndExecute(() => executeApplyTemplate(template));
    }, [confirmAndExecute, executeApplyTemplate]);

    const handleApplyTemplate = useCallback((template: Template) => {
        confirmAndExecute(() => {
            if (!workbook?.sheets.some(s => s.data.length > 0)) {
                toast({ variant: 'destructive', title: 'No Data Loaded', description: 'Upload a file before applying a template.' });
                return;
            }
            const templateHeaders = new Set(template.originalHeaders || []);
            if (templateHeaders.size > 0) {
                const missingHeaders = [...templateHeaders].filter(h => !allHeaders.includes(h));
                if (missingHeaders.length > 0) {
                    setTemplateWarningMessage(`Template may not function as expected. Missing columns: ${missingHeaders.slice(0, 5).join(', ')}...`);
                    setPendingTemplate(template);
                    setIsTemplateWarningOpen(true);
                    return;
                }
            }
            setColumnMaps(template.columnMaps);
            resetFilterHistory(template.filters);
            const chartsToApply = template.chartConfigs || [];
            setCharts(chartsToApply);
            setPristineCharts(chartsToApply);
            setCurrentPage(1);
            toast({ title: 'Template Applied' });
        });
    }, [allHeaders, confirmAndExecute, resetFilterHistory, toast, workbook, setColumnMaps, setCharts, setPristineCharts, setCurrentPage, setTemplateWarningMessage, setPendingTemplate, setIsTemplateWarningOpen]);

    const handleConfirmApplyTemplate = useCallback(() => {
        if (pendingTemplate) {
            setColumnMaps(pendingTemplate.columnMaps);
            resetFilterHistory(pendingTemplate.filters);
            setCharts(pendingTemplate.chartConfigs || []);
            setPristineCharts(pendingTemplate.chartConfigs || []);
            setCurrentPage(1);
            toast({ title: 'Template Applied', description: `Applied "${pendingTemplate.name}" despite warnings.` });
        }
        setIsTemplateWarningOpen(false);
        setPendingTemplate(null);
    }, [pendingTemplate, resetFilterHistory, toast, setColumnMaps, setCharts, setPristineCharts, setCurrentPage, setIsTemplateWarningOpen, setPendingTemplate]);

    const handleDeleteTemplate = useCallback((templateId: string) => {
        setTemplateToDeleteId(templateId);
        setIsDeleteTemplateDialogOpen(true);
    }, [setTemplateToDeleteId, setIsDeleteTemplateDialogOpen]);

    const handleConfirmDeleteTemplate = useCallback(async () => {
        if (!templateToDeleteId || !deletePassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password or template ID missing.' });
            return;
        }
        try {
            const response = await fetch(`/api/templates/${templateToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${deletePassword}` },
            });
            if (response.status === 401) {
                toast({ variant: 'destructive', title: 'Incorrect Password' });
                setDeletePassword('');
                return;
            }
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete template.');
            setTemplates(prev => prev.filter(t => t.id !== templateToDeleteId));
            toast({ title: 'Template Deleted' });
            setIsDeleteTemplateDialogOpen(false);
            setTemplateToDeleteId(null);
            setDeletePassword('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Error', description: error.message });
        }
    }, [deletePassword, templateToDeleteId, toast, setDeletePassword, setTemplates, setIsDeleteTemplateDialogOpen, setTemplateToDeleteId]);

    const handleUnlockTemplates = useCallback(async () => {
        if (!templateUnlockPassword) {
            setTemplateUnlockError('Password cannot be empty.');
            return;
        }
        setTemplateUnlockError('');
        try {
            const response = await fetch('/api/verify-delete-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: templateUnlockPassword }),
            });
            if ((await response.json()).success) {
                setIsTemplatesUnlocked(true);
                sessionStorage.setItem('templatesUnlocked', 'true');
                setActiveTab('templates');
                setIsTemplateUnlockDialogOpen(false);
                toast({ title: 'Success', description: 'Template library unlocked.' });
            } else {
                setTemplateUnlockError('Incorrect password.');
            }
        } catch (error) {
            setTemplateUnlockError('An error occurred.');
        }
    }, [templateUnlockPassword, setTemplateUnlockError, setIsTemplatesUnlocked, setActiveTab, setIsTemplateUnlockDialogOpen, toast]);

    const handleApplySuggestedMap = useCallback((suggestedMap: Record<string, ColumnMapping>) => {
        confirmAndExecute(() => {
            setColumnMaps(suggestedMap);
            toast({ title: 'AI Suggestion Applied' });
        });
    }, [confirmAndExecute, toast, setColumnMaps]);

    const handleCommitFilters = useCallback(async (signal: AbortSignal) => {
        if (!memoryStateRef.current || memoryStateRef.current.bytes > memoryStateRef.current.threshold) {
            toast({ variant: "destructive", title: "Memory Limit Reached", duration: 5000 });
            return;
        }
        
        try {
            const dataToCommit = combinedData.filter(row => activeFilters.every(filter => filter.values.includes(String(row[filter.column]))));
            if (dataToCommit.length === combinedData.length || dataToCommit.length === 0) {
                toast({ title: 'No Change', description: 'Filters would not reduce the dataset.' });
                return;
            }
            const idsToKeep = new Set(dataToCommit.map(row => row.__id));
            const newSheets = workbook.sheets.map(sheet => ({
                ...sheet,
                data: sheet.data.filter((_, i) => idsToKeep.has(i)),
            })).filter(sheet => sheet.data.length > 0);

            setWorkbook({ sheets: newSheets });
            resetFilterHistory();
            setCurrentPage(1);
            setEditedData({});
            setAddedColumns([]);
            toast({ title: 'Data Reduced', description: `Dataset reduced to ${idsToKeep.size} rows.` });
        } catch (error) {
             if ((error as DOMException).name !== 'AbortError') {
                toast({ variant: 'destructive', title: 'Error', description: 'Error committing filters.' });
            }
            throw error;
        }
    }, [activeFilters, combinedData, memoryStateRef, toast, workbook.sheets, resetFilterHistory, setWorkbook, setCurrentPage, setEditedData, setAddedColumns]);

    const handleInitiateCommitFilters = useCallback(() => {
        if (activeFilters.length === 0) {
            toast({ title: 'No Active Filters' });
            return;
        }
        setIsCommitConfirmOpen(true);
    }, [activeFilters, toast, setIsCommitConfirmOpen]);

    const handleStartCommit = useCallback(async () => {
        if (commitAbortControllerRef.current) {
            commitAbortControllerRef.current.abort();
        }
        const controller = new AbortController();
        commitAbortControllerRef.current = controller;
        setIsCommitConfirmOpen(false);
        setIsCommitting(true);
        setProcessingMessage('Committing filters...');
        try {
            await handleCommitFilters(controller.signal);
        } catch (error) {
            if ((error as DOMException).name === 'AbortError') {
                 toast({ title: 'Commit Cancelled' });
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsCommitting(false);
                commitAbortControllerRef.current = null;
            }
        }
    }, [handleCommitFilters, commitAbortControllerRef, setIsCommitConfirmOpen, setIsCommitting, setProcessingMessage, toast]);

    const handleViewRowDetails = useCallback((row: any) => {
        setRowForDetailView(row);
        setIsDetailViewOpen(true);
    }, [setRowForDetailView, setIsDetailViewOpen]);

    const handleUndoFilter = useCallback(() => {
        if (currentHistoryIndex > 0) setCurrentHistoryIndex(prev => prev - 1);
    }, [currentHistoryIndex, setCurrentHistoryIndex]);

    const handleRedoFilter = useCallback(() => {
        if (currentHistoryIndex < filterHistory.length - 1) setCurrentHistoryIndex(prev => prev - 1);
    }, [currentHistoryIndex, filterHistory.length, setCurrentHistoryIndex]);

    const handleAddNewColumn = useCallback(() => {
        if (!newColumnName.trim()) {
            setAddColumnError('Column name cannot be empty.');
            return;
        }
        if (allHeaders.includes(newColumnName.trim())) {
            setAddColumnError('A column with this name already exists.');
            return;
        }
        const finalNewColumnName = newColumnName.trim();
        setAddedColumns(prev => [...prev, finalNewColumnName]);
        toast({ title: 'Column Added' });
        setIsAddColumnDialogOpen(false);
        setNewColumnName('');
        setAddColumnError('');
    }, [newColumnName, allHeaders, toast, setAddedColumns, setIsAddColumnDialogOpen, setNewColumnName, setAddColumnError]);

    const handleSplitColumn = useCallback(() => {
        if (!splitColumnSource || !splitColumnDelimiter || !splitColumnNewNames.trim()) {
            setSplitColumnError('All fields are required.');
            return;
        }
        const newNames = splitColumnNewNames.split(',').map(name => name.trim()).filter(Boolean);
        if (newNames.length === 0 || newNames.some(name => allHeaders.includes(name) || addedColumns.includes(name))) {
            setSplitColumnError('Invalid or duplicate new column names provided.');
            return;
        }
        const newEdits: Record<string, any> = { ...editedData };
        combinedData.forEach((row) => {
            const valueToSplit = row[splitColumnSource];
            if (typeof valueToSplit === 'string') {
                const parts = valueToSplit.split(splitColumnDelimiter);
                newNames.forEach((newName, index) => {
                    newEdits[`${row.__id}_${newName}`] = parts[index] ?? '';
                });
            }
        });
        setAddedColumns(prev => [...prev, ...newNames]);
        setEditedData(newEdits);
        toast({ title: 'Columns Split' });
        setIsSplitColumnDialogOpen(false);
        setSplitColumnSource('');
        setSplitColumnDelimiter('');
        setSplitColumnNewNames('');
        setSplitColumnError('');
    }, [splitColumnSource, splitColumnDelimiter, splitColumnNewNames, allHeaders, addedColumns, combinedData, editedData, toast, setAddedColumns, setEditedData, setIsSplitColumnDialogOpen, setSplitColumnSource, setSplitColumnDelimiter, setSplitColumnNewNames, setSplitColumnError]);
    
    const handleColumnVisibilityChange = useCallback((header: string, checked: boolean) => {
        setVisibleColumns(prevVisible => {
            const newVisible = checked ? [...prevVisible, header] : prevVisible.filter(h => h !== header);
            return allHeaders.filter(h => newVisible.includes(h));
        });
    }, [allHeaders, setVisibleColumns]);

    const handleOpenSummaryReport = useCallback(() => {
        setSummaryReportData({});
        setSummaryReportRows([]);
        setSummaryReportPivotCol('');
        setSummaryReportValueCol('');
        setSummaryReportSheets(selectedSheets);
        setSummaryReportMode('single');
        setIsSummaryReportOpen(true);
    }, [selectedSheets, setSummaryReportData, setSummaryReportRows, setSummaryReportPivotCol, setSummaryReportValueCol, setSummaryReportSheets, setIsSummaryReportOpen, setSummaryReportMode]);

    const executeGenerateSummaryReport = useCallback(async () => {
        if (memoryStateRef.current && memoryStateRef.current.bytes > memoryStateRef.current.threshold) {
            toast({ variant: "destructive", title: "Memory Limit Reached", description: "Cannot generate report. Please reduce data.", duration: 5000 });
            return;
        }
        setIsGeneratingSummary(true);
        setSummaryReportData({});
        await yieldToMain();
        
        try {
            const allSummaries: Record<string, { data: any[], headers: string[] }> = {};
            const sheetsToProcess = summaryReportMode === 'individual' ? summaryReportSheets : ['all'];

            for (const sheetIdentifier of sheetsToProcess) {
                let reportSheetsData: any[];

                if (summaryReportMode === 'individual') {
                    const sheet = workbook.sheets.find(s => s.name === sheetIdentifier);
                    if (!sheet || sheet.data.length === 0) continue;
                    reportSheetsData = sheet.data;
                } else {
                     reportSheetsData = workbook.sheets
                        .filter(s => summaryReportSheets.includes(s.name))
                        .flatMap(s => s.data);
                }

                if (reportSheetsData.length === 0) {
                    if (summaryReportMode === 'single') throw new Error("The selected sheets have no data to summarize.");
                    else continue;
                }
                
                let data = reportSheetsData.map(originalRow => {
                    const rowEdits = Object.entries(editedData).filter(([key]) => key.startsWith(`${originalRow.__id}_`));
                    if (rowEdits.length === 0) return originalRow;
                    const newRow = { ...originalRow };
                    rowEdits.forEach(([key, value]) => {
                        const column = key.substring(`${originalRow.__id}_`.length);
                        newRow[column] = value;
                    });
                    return newRow;
                });
                
                const lowercasedSearchTerm = (debouncedSearchTerm || '').toLocaleLowerCase();
                if (lowercasedSearchTerm) {
                    data = data.filter(row => Object.values(row).some(value => String(value).toLocaleLowerCase().includes(lowercasedSearchTerm)));
                }
                data = data.filter(row => activeFilters.every(filter => {
                    if (!filter.values || filter.values.length === 0) return true;
                    return filter.values.includes(String(row[filter.column]));
                }));

                if (data.length === 0) {
                    if (summaryReportMode === 'single') throw new Error("There is no filtered data to summarize in the selected sheets.");
                    else continue;
                }
                
                const groupCols = summaryReportRows;
                const pivotCol = summaryReportPivotCol;
                const valueCol = summaryReportValueCol;
                const aggType = summaryReportAggregation;
                
                const pivotKeys = Array.from(new Set(data.map(d => String(d[pivotCol] ?? '')))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                const summary = new Map<string, any>();
                
                for (let i = 0; i < data.length; i++) {
                    if (i % yieldThreshold === 0) await yieldToMain();
                    const record = data[i];
                    const groupKey = groupCols.map(key => record[key] ?? '').join(' | ');

                    if (!summary.has(groupKey)) {
                        const newEntry: any = {};
                        groupCols.forEach(key => { newEntry[key] = record[key]; });
                        pivotKeys.forEach(pk => {
                            newEntry[pk] = { sum: 0, countWithNumericValue: 0, distinctValues: new Set(), totalRowsInGroup: 0 };
                        });
                        summary.set(groupKey, newEntry);
                    }

                    const entry = summary.get(groupKey);
                    const pivotValue = String(record[pivotCol] ?? '');
                    const aggObject = entry[pivotValue];
                    
                    if (aggObject) {
                      const value = record[valueCol];
                      const numValue = parseFloat(String(value));
                      if (!isNaN(numValue)) {
                          aggObject.sum += numValue;
                          aggObject.countWithNumericValue++;
                      }
                      if (value !== undefined && value !== null && String(value).trim() !== '') {
                          aggObject.distinctValues.add(value);
                      }
                      aggObject.totalRowsInGroup++;
                    }
                }

                const finalHeaders = [...groupCols, ...pivotKeys, 'Grand Total'];
                const finalData = Array.from(summary.values()).map(entry => {
                    const finalEntry: Record<string, any> = {};
                    let grandTotal = 0;
                    groupCols.forEach(key => { finalEntry[key] = entry[key]; });
                    pivotKeys.forEach(pk => {
                        const aggObject = entry[pk];
                        let finalValue: number;
                        switch(aggType) {
                            case 'sum': finalValue = aggObject.sum; break;
                            case 'average': finalValue = aggObject.countWithNumericValue > 0 ? aggObject.sum / aggObject.countWithNumericValue : 0; break;
                            case 'count': finalValue = aggObject.totalRowsInGroup; break;
                            case 'count-distinct': finalValue = aggObject.distinctValues.size; break;
                            default: finalValue = 0;
                        }
                        finalEntry[pk] = finalValue;
                        if(typeof finalValue === 'number') grandTotal += finalValue;
                    });
                    finalEntry['Grand Total'] = grandTotal;
                    return finalEntry;
                });
                
                const grandTotalRow: Record<string, any> = { [groupCols[0]]: 'Grand Total' };
                [...pivotKeys, 'Grand Total'].forEach(header => {
                    grandTotalRow[header] = finalData.reduce((acc, row) => acc + (Number(row[header]) || 0), 0);
                });
                const finalDataWithTotal = [...finalData, grandTotalRow];


                const reportName = summaryReportMode === 'individual' ? `Summary for ${sheetIdentifier}` : 'Combined Summary';
                allSummaries[reportName] = { data: finalDataWithTotal, headers: finalHeaders };
            }

            if (Object.keys(allSummaries).length === 0) {
                throw new Error("No data was available to generate a summary for the selected sheet(s).");
            }
            
            setSummaryReportData(allSummaries);
            toast({ title: "Summary Generated", description: `Created ${Object.keys(allSummaries).length} summary report(s).`});
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "Could not generate summary." });
            console.error(error);
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [workbook.sheets, summaryReportSheets, editedData, debouncedSearchTerm, activeFilters, summaryReportRows, summaryReportPivotCol, summaryReportValueCol, summaryReportAggregation, toast, setIsGeneratingSummary, setSummaryReportData, yieldThreshold, memoryStateRef, summaryReportMode]);

    const handleGenerateSummaryReport = useCallback(() => {
        if (hasUnsavedDataChanges) {
            let example = '';
            if (addedColumns.length > 0) {
                example = `For example, you've added the column "${addedColumns[0]}".`;
            } else if (Object.keys(editedData).length > 0) {
                const firstChangeKey = Object.keys(editedData)[0];
                const [rowIdStr, column] = firstChangeKey.split('_');
                const newValue = editedData[firstChangeKey];
                example = `For example, a value in the "${column}" column was edited to "${newValue}".`;
            }
            setReportChangeExample(example);
            setPendingReportType('summary');
            setIsReportChangesDialogOpen(true);
        } else {
            executeGenerateSummaryReport();
        }
    }, [hasUnsavedDataChanges, addedColumns, editedData, setReportChangeExample, setPendingReportType, setIsReportChangesDialogOpen, executeGenerateSummaryReport]);

    const handleDownloadReports = useCallback(() => {
        if (Object.keys(summaryReportData).length === 0 && groupReportData.length === 0) {
            toast({ title: 'No Report Data', description: 'Please generate at least one report before downloading.' });
            return;
        }
    
        const newWb = XLSX.utils.book_new();
    
        // --- Define Styles ---
        const titleStyle: XLSX.CellStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } };
        const configLabelStyle: XLSX.CellStyle = { font: { bold: true } };
        const groupHeaderStyle: XLSX.CellStyle = { font: { bold: true }, border: { bottom: { style: 'thin' } } };
        const tableHeaderStyle: XLSX.CellStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4B0082" } },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' },
            }
        };
        const cellBorderStyle: XLSX.CellStyle = {
            border: {
                top: { style: 'thin', color: { rgb: "D3D3D3" } }, bottom: { style: 'thin', color: { rgb: "D3D3D3" } },
                left: { style: 'thin', color: { rgb: "D3D3D3" } }, right: { style: 'thin', color: { rgb: "D3D3D3" } },
            }
        };
        const totalRowStyle: XLSX.CellStyle = {
            font: { bold: true },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' },
            }
        };
    
        // --- Helper to safely apply styles ---
        const safeApplyStyle = (ws: XLSX.WorkSheet, addr: string, style: XLSX.CellStyle) => {
            if (!ws[addr]) {
                 ws[addr] = { t: 'z', v: '' }; // Create empty cell if it doesn't exist
            }
            ws[addr].s = style;
        };
    
        if (Object.keys(summaryReportData).length > 0) {
            if (summaryReportMode === 'individual') {
                const allSummariesDataForSheet: (string|number)[][] = [];
                let currentRowIndex = 0;
    
                Object.entries(summaryReportData).forEach(([reportName, reportObject], reportIndex) => {
                    const { data: reportData, headers } = reportObject;
                    if (reportData.length === 0) return;
    
                    if (reportIndex > 0) {
                        allSummariesDataForSheet.push([], []);
                        currentRowIndex += 2;
                    }
                    
                    const reportTitle: (string|number)[][] = [[reportName]];
                    const configDetails: (string|number)[][] = [
                        ['Grouped by (Rows):', summaryReportRows.join(', ')],
                        ['Pivoted on (Columns):', summaryReportPivotCol],
                        ['Values from:', summaryReportValueCol],
                        ['Aggregation Type:', summaryReportAggregation],
                    ];
                    
                    const preparedHeaders = headers.map(h => {
                        const headerString = String(h);
                        return headerString === summaryReportValueCol ? `${summaryReportAggregation} of ${summaryReportValueCol}` : headerString;
                    });
                    const tableHeader = [preparedHeaders];
                    const tableData = reportData.map(row => headers.map(header => row[String(header)]));
                    
                    const fullSectionData = [ ...reportTitle, [], ...configDetails, [], ...tableHeader, ...tableData ];
                    allSummariesDataForSheet.push(...fullSectionData);
                    currentRowIndex += fullSectionData.length;
                });
    
                if (allSummariesDataForSheet.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(allSummariesDataForSheet);
                    
                    let rowIndexOffset = 0;
                    Object.entries(summaryReportData).forEach(([reportName, reportObject], reportIndex) => {
                        const { data: reportData, headers } = reportObject;
                        if (reportData.length === 0) return;

                        if (reportIndex > 0) rowIndexOffset += 2;

                        const titleRow = rowIndexOffset;
                        const configStartRow = titleRow + 2;
                        const tableHeaderRow = configStartRow + 4 + 1;

                        ws['!merges'] = ws['!merges'] || [];
                        ws['!merges'].push({ s: { r: titleRow, c: 0 }, e: { r: titleRow, c: Math.max(0, headers.length - 1) } });
                        safeApplyStyle(ws, XLSX.utils.encode_cell({r: titleRow, c: 0}), titleStyle);

                        for(let i = 0; i < 4; i++) {
                            safeApplyStyle(ws, XLSX.utils.encode_cell({r: configStartRow + i, c: 0}), configLabelStyle);
                            safeApplyStyle(ws, XLSX.utils.encode_cell({r: configStartRow + i, c: 1}), cellBorderStyle);
                        }
                        
                        headers.forEach((h, colIndex) => {
                             safeApplyStyle(ws, XLSX.utils.encode_cell({r: tableHeaderRow, c: colIndex}), tableHeaderStyle);
                        });
                        
                        reportData.forEach((d, dataRowIndex) => {
                            const isTotal = dataRowIndex === reportData.length - 1;
                            headers.forEach((h, colIndex) => {
                                const cellAddress = XLSX.utils.encode_cell({r: tableHeaderRow + 1 + dataRowIndex, c: colIndex});
                                safeApplyStyle(ws, cellAddress, isTotal ? totalRowStyle : cellBorderStyle);
                            });
                        });
                        
                        rowIndexOffset += (reportData.length + 7);
                    });

                    const maxCols = Math.max(...allSummariesDataForSheet.map(row => row.length), 0);
                    const colWidths = Array(maxCols).fill(0);
                    allSummariesDataForSheet.forEach(rowArray => {
                        rowArray.forEach((cell, colIndex) => {
                            const cellLength = String(cell ?? '').length;
                            if(cellLength > colWidths[colIndex]) colWidths[colIndex] = cellLength;
                        });
                    });
                    ws['!cols'] = colWidths.map(wch => ({ wch: wch + 2 }));
    
                    XLSX.utils.book_append_sheet(newWb, ws, 'Individual Summaries');
                }
            } else {
                Object.entries(summaryReportData).forEach(([reportName, reportObject]) => {
                    const { data: reportData, headers } = reportObject;
                    if (reportData.length === 0) return;
    
                    const reportTitle: (string|number)[][] = [[reportName]];
                    const configDetails: (string|number)[][] = [
                        ['Report for Sheet(s):', summaryReportSheets.join(', ')],
                        ['Grouped by (Rows):', summaryReportRows.join(', ')],
                        ['Pivoted on (Columns):', summaryReportPivotCol],
                        ['Values from:', summaryReportValueCol],
                        ['Aggregation Type:', summaryReportAggregation],
                    ];
                    
                    const preparedHeaders = headers.map(h => {
                        const headerString = String(h);
                        return headerString === summaryReportValueCol ? `${summaryReportAggregation} of ${summaryReportValueCol}` : headerString;
                    });
                    const tableHeader = [preparedHeaders];
                    const tableData = reportData.map(row => headers.map(header => row[String(header)]));
                    const dataForSheet = [ ...reportTitle, [], ...configDetails, [], ...tableHeader, ...tableData ];
                    const ws = XLSX.utils.aoa_to_sheet(dataForSheet);
                    
                    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(0, headers.length - 1) } }];
                    safeApplyStyle(ws, 'A1', titleStyle);
    
                    configDetails.forEach((_: any, i: number) => {
                        safeApplyStyle(ws, XLSX.utils.encode_cell({ r: i + 2, c: 0 }), configLabelStyle);
                        safeApplyStyle(ws, XLSX.utils.encode_cell({ r: i + 2, c: 1 }), cellBorderStyle);
                    });
                    
                    const tableStartRow = configDetails.length + 3;
                    headers.forEach((_, colIndex) => {
                        const cell_address = XLSX.utils.encode_cell({ r: tableStartRow, c: colIndex });
                        safeApplyStyle(ws, cell_address, tableHeaderStyle);
                    });
                    
                    reportData.forEach((row, rowIndex) => {
                         const isTotalRow = rowIndex === reportData.length - 1;
                         const style = isTotalRow ? totalRowStyle : cellBorderStyle;
                        headers.forEach((_, colIndex) => {
                            const cell_address = XLSX.utils.encode_cell({ r: tableStartRow + 1 + rowIndex, c: colIndex });
                            safeApplyStyle(ws, cell_address, style);
                        });
                    });
                    
                    ws['!cols'] = headers.map((h, colIndex) => ({ wch: Math.max(...dataForSheet.map(row => String(row[colIndex] ?? '').length), String(h ?? '').length) + 2 }));
                    XLSX.utils.book_append_sheet(newWb, ws, reportName.substring(0, 30));
                });
            }
        }
    
        if (groupReportData.length > 0) {
            const dataForSheet: (string | number)[][] = [];
            const headers = [groupReportConfig.newColumnName, 'Value', 'Count'];

            const reportTitle: (string|number)[][] = [['Custom Group Report']];
            const configDetails: (string|number)[][] = [
                ['Report for Sheet(s):', groupReportSheets.join(', ')],
                ['Grouped by Column:', groupReportConfig.column],
                ['New Group Column:', groupReportConfig.newColumnName],
            ];
            
            dataForSheet.push(...reportTitle, [], ...configDetails, []);
            
            groupReportData.forEach(group => {
                dataForSheet.push([group.group, '', `Total: ${group.total}`]);
                group.breakdown.forEach(b => {
                    dataForSheet.push(['', b.value, b.count]);
                });
                dataForSheet.push([]); // Spacer row
            });

            const grandTotalCount = groupReportData.reduce((acc, group) => acc + group.total, 0);
            dataForSheet.push(['Grand Total', '', grandTotalCount]);

            const ws = XLSX.utils.aoa_to_sheet(dataForSheet);
            
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
            safeApplyStyle(ws, 'A1', titleStyle);
            
            configDetails.forEach((_, i) => {
                safeApplyStyle(ws, XLSX.utils.encode_cell({ r: i + 2, c: 0 }), configLabelStyle);
            });
    
            let currentRow = configDetails.length + 3; // Start after config section
            groupReportData.forEach(group => {
                currentRow++; // Move to group header row
                safeApplyStyle(ws, XLSX.utils.encode_cell({c: 0, r: currentRow}), groupHeaderStyle);
                safeApplyStyle(ws, XLSX.utils.encode_cell({c: 2, r: currentRow}), groupHeaderStyle);
                
                group.breakdown.forEach(() => {
                    currentRow++; // Move to breakdown row
                    headers.forEach((_, colIndex) => {
                        const cell_address = XLSX.utils.encode_cell({r: currentRow, c: colIndex});
                        safeApplyStyle(ws, cell_address, cellBorderStyle);
                    });
                });
                currentRow++; // Move past spacer
            });

            currentRow++; // Move to grand total row
            safeApplyStyle(ws, XLSX.utils.encode_cell({c: 0, r: currentRow}), totalRowStyle);
            safeApplyStyle(ws, XLSX.utils.encode_cell({c: 2, r: currentRow}), totalRowStyle);
            
            ws['!cols'] = headers.map((_, colIndex) => ({ wch: Math.max(...dataForSheet.map(r => String(r[colIndex] ?? '').length)) + 2 }));
            XLSX.utils.book_append_sheet(newWb, ws, 'Group Report');
        }
    
        if (includeOriginalDataInReport) {
            workbook.sheets.forEach(sheet => {
                if (selectedSheets.includes(sheet.name) && sheet.data.length > 0) {
                    const originalDataWorksheet = XLSX.utils.json_to_sheet(sheet.data);
                    XLSX.utils.book_append_sheet(newWb, originalDataWorksheet, `Original_${sheet.name.substring(0, 20)}`);
                }
            });
        }
        
        XLSX.writeFile(newWb, 'datadive_report_export.xlsx');
        toast({ title: "Download Started" });
    }, [summaryReportData, groupReportData, includeOriginalDataInReport, workbook.sheets, selectedSheets, summaryReportSheets, summaryReportRows, summaryReportPivotCol, summaryReportValueCol, summaryReportAggregation, groupReportSheets, groupReportConfig, toast, summaryReportMode]);

    const handleDownloadSummaryReport = useCallback(() => {
        if (Object.keys(summaryReportData).length === 0) {
            toast({ title: 'No Summary Data', description: 'Please generate a report before downloading.' });
            return;
        }
        handleDownloadReports();
    }, [summaryReportData, handleDownloadReports, toast]);

    const handleDownloadGroupReport = useCallback(() => {
        if (groupReportData.length === 0) {
            toast({ title: 'No Group Data', description: 'Please generate a report before downloading.' });
            return;
        }
        handleDownloadReports();
    }, [groupReportData, handleDownloadReports, toast]);
    
    const handleOpenGroupReport = useCallback(() => {
        setGroupReportConfig({ column: '', newColumnName: 'Group', mappings: '' });
        setGroupReportData([]);
        setGroupReportSheets(selectedSheets);
        setIsGroupReportOpen(true);
    }, [selectedSheets, setGroupReportConfig, setGroupReportData, setGroupReportSheets, setIsGroupReportOpen]);

    const executeGenerateGroupReport = useCallback(async () => {
        setIsGeneratingGroupReport(true);
        setGroupReportData([]);
        await yieldToMain();
        
        try {
            const { column, mappings } = groupReportConfig;
            const reportSheetsData = workbook.sheets
                .filter(s => groupReportSheets.includes(s.name))
                .flatMap(s => s.data);

            if (reportSheetsData.length === 0) {
                throw new Error("The selected sheets have no data to group.");
            }
            
            let data = reportSheetsData.map(originalRow => {
                const rowEdits = Object.entries(editedData).filter(([key]) => key.startsWith(`${originalRow.__id}_`));
                if (rowEdits.length === 0) return originalRow;
                const newRow = { ...originalRow };
                rowEdits.forEach(([key, value]) => {
                    const column = key.substring(`${originalRow.__id}_`.length);
                    newRow[column] = value;
                });
                return newRow;
            });
            
            const lowercasedSearchTerm = (debouncedSearchTerm || '').toLocaleLowerCase();
            if (lowercasedSearchTerm) {
                data = data.filter(row => Object.values(row).some(value => String(value).toLocaleLowerCase().includes(lowercasedSearchTerm)));
            }
            data = data.filter(row => activeFilters.every(filter => {
                if (!filter.values || filter.values.length === 0) return true;
                return filter.values.includes(String(row[filter.column]));
            }));

            const valueToKeyMap = new Map<string, string>();
            mappings.split('\n').forEach(line => {
                const [key, valuesStr] = line.split('=');
                if (key && valuesStr) {
                    valuesStr.split(',').forEach(value => {
                        valueToKeyMap.set(value.trim(), key.trim());
                    });
                }
            });

            const groupData = new Map<string, Map<string, number>>();

            for (let i = 0; i < data.length; i++) {
                if (i % yieldThreshold === 0) await yieldToMain();
                const record = data[i];
                const originalValue = String(record[column]);
                const groupName = valueToKeyMap.get(originalValue) || '(Unmapped)';
                
                if (!groupData.has(groupName)) {
                    groupData.set(groupName, new Map());
                }
                const valueCounts = groupData.get(groupName)!;
                valueCounts.set(originalValue, (valueCounts.get(originalValue) || 0) + 1);
            }

            const finalData: GroupReportRow[] = Array.from(groupData.entries()).map(([group, breakdownMap]) => {
                const breakdown = Array.from(breakdownMap.entries())
                    .map(([value, count]) => ({ value, count }))
                    .sort((a, b) => b.count - a.count);
                
                const total = breakdown.reduce((sum, item) => sum + item.count, 0);

                return { group, total, breakdown };
            }).sort((a, b) => b.total - a.total);

            setGroupReportData(finalData);
            toast({ title: "Group Report Generated" });

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "Could not generate group report." });
        } finally {
            setIsGeneratingGroupReport(false);
        }
    }, [groupReportConfig, workbook.sheets, groupReportSheets, editedData, debouncedSearchTerm, activeFilters, toast, setIsGeneratingGroupReport, setGroupReportData, yieldThreshold]);

    const handleGenerateGroupReport = useCallback(() => {
        const { column, mappings, newColumnName } = groupReportConfig;
        if (!column || !mappings || !newColumnName) {
            toast({ variant: 'destructive', title: 'Missing Configuration' });
            return;
        }

        if (hasUnsavedDataChanges) {
            let example = '';
             if (addedColumns.length > 0) {
                example = `For example, you've added the column "${addedColumns[0]}".`;
            } else if (Object.keys(editedData).length > 0) {
                const firstChangeKey = Object.keys(editedData)[0];
                const [rowIdStr, column] = firstChangeKey.split('_');
                const newValue = editedData[firstChangeKey];
                example = `For example, a value in the "${column}" column was edited to "${newValue}".`;
            }
            setReportChangeExample(example);
            setPendingReportType('group');
            setIsReportChangesDialogOpen(true);
        } else {
            executeGenerateGroupReport();
        }
    }, [hasUnsavedDataChanges, groupReportConfig, toast, addedColumns, editedData, setReportChangeExample, setPendingReportType, setIsReportChangesDialogOpen, executeGenerateGroupReport]);
    
    const handleConfirmReportWithChanges = useCallback(async () => {
        if (pendingReportType === 'summary') {
            await executeGenerateSummaryReport();
        } else if (pendingReportType === 'group') {
            await executeGenerateGroupReport();
        }
        setIsReportChangesDialogOpen(false);
        setPendingReportType(null);
    }, [pendingReportType, executeGenerateSummaryReport, executeGenerateGroupReport, setIsReportChangesDialogOpen, setPendingReportType]);

    return {
        handleCancelUpload, handleCancelCommit, handleDiscardChanges, handleTabChange, handleSheetSelect,
        handleSelectAllSheets, handleColumnMapChange, applyFiltersAndRecordHistory, handleClearFilters,
        handleHeaderRowChange, handlePageChange, handleCellEdit, handleSaveChanges, handleDownload,
        handleBulkEdit, handleFileSelect, handleFilterableColumnChange, handleFileChange,
        handleInitiateSaveSettings, handleConfirmSaveSettings, handleSaveAndUpload, handleDiscardAndUpload,
        handleLoadSettings, handleReloadData, handleNocoBaseConnect, handleOpenSaveTemplateDialog,
        handleOpenEditTemplateDialog, handleSaveTemplate, handleApplyTemplateWithData, handleApplyTemplate,
        handleConfirmApplyTemplate, handleDeleteTemplate, handleConfirmDeleteTemplate, handleUnlockTemplates,
        handleApplySuggestedMap, handleInitiateCommitFilters, handleStartCommit, handleViewRowDetails,
        handleUndoFilter, handleRedoFilter, handleAddNewColumn, handleSplitColumn, handleColumnVisibilityChange,
        handleOpenSummaryReport, handleGenerateSummaryReport, handleDownloadSummaryReport,
        handleOpenGroupReport, handleGenerateGroupReport, handleDownloadGroupReport, handleConfirmReportWithChanges,
    };
}
