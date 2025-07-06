
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useMemoryUsage } from '@/hooks/use-memory-usage';
import { useDataPipeline } from '@/hooks/use-data-pipeline';
import { useDashboardActions } from '@/hooks/use-dashboard-actions';
import { MOCK_WORKBOOK_DATA, type Workbook, type Sheet } from '@/lib/mock-data';
import type { ColumnMapping, Filter, FilterOptions, Template, DashboardChart, GroupReportRow } from '@/lib/types';
import { DEFAULT_CHARTS } from '@/lib/dashboard-config';

// Helpers for reading environment variables for performance settings
const getInitialChunkSize = () => {
    const envChunkSize = process.env.NEXT_PUBLIC_DEFAULT_CHUNK_SIZE_MB;
    const sizeNumber = envChunkSize ? parseInt(envChunkSize, 10) : NaN;
    return !isNaN(sizeNumber) ? sizeNumber : 1;
};

const getMaxChunkSize = () => {
    const envMaxSize = process.env.NEXT_PUBLIC_MAX_CHUNK_SIZE_MB;
    const sizeNumber = envMaxSize ? parseInt(envMaxSize, 10) : NaN;
    return !isNaN(sizeNumber) ? sizeNumber : 10;
}

const getInitialYieldThreshold = () => {
    const envYield = process.env.NEXT_PUBLIC_DEFAULT_YIELD_THRESHOLD;
    const yieldNumber = envYield ? parseInt(envYield, 10) : NaN;
    return !isNaN(yieldNumber) ? yieldNumber : 500;
};

const getMaxYieldThreshold = () => {
    const envMaxYield = process.env.NEXT_PUBLIC_MAX_YIELD_THRESHOLD;
    const yieldNumber = envMaxYield ? parseInt(envMaxYield, 10) : NaN;
    return !isNaN(yieldNumber) ? yieldNumber : 2000;
}

export function useDashboard() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  // Main data state
  const [workbook, setWorkbook] = useState<Workbook>(MOCK_WORKBOOK_DATA);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [addedColumns, setAddedColumns] = useState<string[]>([]);
  
  const { 
    memoryUsage, 
    memoryThresholdBytes, 
    setMemoryThresholdBytes,
    maxMemoryThresholdBytes,
    isMemoryApiAvailable, 
    formatBytes 
  } = useMemoryUsage(workbook);

  const memoryStateRef = useRef({ bytes: memoryUsage.bytes, threshold: memoryThresholdBytes });
  useEffect(() => {
    memoryStateRef.current = { bytes: memoryUsage.bytes, threshold: memoryThresholdBytes };
  }, [memoryUsage.bytes, memoryThresholdBytes]);

  // UI state
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [columnMaps, setColumnMaps] = useState<Record<string, ColumnMapping>>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [userConfiguredFilterable, setUserConfiguredFilterable] = useState<Record<string, boolean>>({});
  const [showDataMissingAlert, setShowDataMissingAlert] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Filter history state
  const [filterHistory, setFilterHistory] = useState<Filter[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const activeFilters = useMemo(() => filterHistory[currentHistoryIndex] || [], [filterHistory, currentHistoryIndex]);
  const [debouncedFilters, setDebouncedFilters] = useState<Filter[]>([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  // Charting state
  const [charts, setCharts] = useState<DashboardChart[]>(DEFAULT_CHARTS);
  const [pristineCharts, setPristineCharts] = useState<DashboardChart[]>(DEFAULT_CHARTS);
  const [forceFullChartUpdate, setForceFullChartUpdate] = useState(false);

  // Performance Settings state
  const [chunkSizeMB, setChunkSizeMB] = useState(getInitialChunkSize());
  const [yieldThreshold, setYieldThreshold] = useState(getInitialYieldThreshold());
  const [maxChunkSize] = useState(getMaxChunkSize());
  const [maxYieldThreshold] = useState(getMaxYieldThreshold());
  const [isPerformanceSettingsOpen, setIsPerformanceSettingsOpen] = useState(false);

  // Data Processing Pipeline
  const {
    isProcessing: isDataProcessing,
    processingMessage: dataProcessingMessage,
    cancelProcessing: cancelDataProcessing,
    combinedData,
    processedData,
    allHeaders,
    columnValueCounts,
    isChartDataSampled,
  } = useDataPipeline({
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
  });
  
  const isInitialMount = useRef(true);

  // Effect to reset forceFullChartUpdate flag after processing is done
  useEffect(() => {
    const isResetRun = isInitialMount.current === false && !isDataProcessing && forceFullChartUpdate;
    if (isResetRun) {
        setForceFullChartUpdate(false);
    }
  }, [isDataProcessing, forceFullChartUpdate]);

  // File upload & processing state
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headerRow, setHeaderRow] = useState(1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const debouncedHeaderRow = useRef(headerRow);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const commitAbortControllerRef = useRef<AbortController | null>(null);

  // Ref to break dependency cycle with filterOptions
  const filterOptionsRef = useRef(filterOptions);
  filterOptionsRef.current = filterOptions;

  const generateFilterOptions = useCallback(async (data: any[], headersToProcess: string[]) => {
    if (memoryStateRef.current.bytes > memoryStateRef.current.threshold) {
        toast({ variant: "destructive", title: "Memory Limit Reached", description: "Cannot generate new filter options.", duration: 5000 });
        setIsUploading(false);
        return;
    }
    const currentFilterOptions = filterOptionsRef.current;
    const headersThatTrulyNeedProcessing = headersToProcess.filter(h => !currentFilterOptions[h]);
    if (headersThatTrulyNeedProcessing.length === 0) return;
    setProcessingMessage(`Analyzing columns for filtering: ${headersThatTrulyNeedProcessing.join(', ')}`);
    const counts: Record<string, Record<string, number>> = {};
    headersThatTrulyNeedProcessing.forEach(header => counts[header] = {});
    for (const row of data) {
        for (const header of headersThatTrulyNeedProcessing) {
            const value = row[header] !== null && row[header] !== undefined ? String(row[header]) : 'null';
            counts[header][value] = (counts[header][value] || 0) + 1;
        }
    }
    const newOptions: FilterOptions = {};
    for (const header of headersThatTrulyNeedProcessing) {
        newOptions[header] = Object.entries(counts[header]).map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }));
    }
    setFilterOptions(prevOptions => ({...prevOptions, ...newOptions}));
  }, [toast, setIsUploading, setProcessingMessage]);
  
  // Save/Load state
  const [isSaveSettingsOpen, setIsSaveSettingsOpen] = useState(false);
  const [includeDataInSave, setIncludeDataInSave] = useState(true);

  // Dialogs state
  const [unsavedChangesInfo, setUnsavedChangesInfo] = useState<{ action: (() => void) | null; isOpen: boolean; }>({ action: null, isOpen: false });
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [bulkEditColumn, setBulkEditColumn] = useState('');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
  const [isCommitConfirmOpen, setIsCommitConfirmOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [rowForDetailView, setRowForDetailView] = useState<any | null>(null);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [addColumnError, setAddColumnError] = useState('');
  const [isSplitColumnDialogOpen, setIsSplitColumnDialogOpen] = useState(false);
  const [splitColumnSource, setSplitColumnSource] = useState('');
  const [splitColumnDelimiter, setSplitColumnDelimiter] = useState('');
  const [splitColumnNewNames, setSplitColumnNewNames] = useState('');
  const [splitColumnError, setSplitColumnError] = useState('');
  const [isMemorySettingsOpen, setIsMemorySettingsOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  // NocoBase state
  const [isNocoBaseOpen, setIsNocoBaseOpen] = useState(false);
  const [nocoBaseUrl, setNocoBaseUrl] = useState('');
  const [nocoBaseToken, setNocoBaseToken] = useState('');
  
  // Template state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [includeDataInTemplateSave, setIncludeDataInTemplateSave] = useState(false);
  const [isDeleteTemplateDialogOpen, setIsDeleteTemplateDialogOpen] = useState(false);
  const [templateToDeleteId, setTemplateToDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isTemplateWarningOpen, setIsTemplateWarningOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [templateWarningMessage, setTemplateWarningMessage] = useState('');
  const [isTemplatesUnlocked, setIsTemplatesUnlocked] = useState(false);
  const [isTemplateUnlockDialogOpen, setIsTemplateUnlockDialogOpen] = useState(false);
  const [templateUnlockPassword, setTemplateUnlockPassword] = useState('');
  const [templateUnlockError, setTemplateUnlockError] = useState('');

  // Summary Report State
  const [isSummaryReportOpen, setIsSummaryReportOpen] = useState(false);
  const [summaryReportSheets, setSummaryReportSheets] = useState<string[]>([]);
  const [summaryReportAggregation, setSummaryReportAggregation] = useState<'sum' | 'average' | 'count' | 'count-distinct'>('sum');
  const [summaryReportRows, setSummaryReportRows] = useState<string[]>([]);
  const [summaryReportPivotCol, setSummaryReportPivotCol] = useState<string>('');
  const [summaryReportValueCol, setSummaryReportValueCol] = useState<string>('');
  const [summaryReportData, setSummaryReportData] = useState<Record<string, { data: any[], headers: string[] }>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryReportMode, setSummaryReportMode] = useState<'single' | 'individual'>('single');

  // Group Report State
  const [isGroupReportOpen, setIsGroupReportOpen] = useState(false);
  const [groupReportSheets, setGroupReportSheets] = useState<string[]>([]);
  const [groupReportConfig, setGroupReportConfig] = useState({ column: '', newColumnName: 'Group', mappings: '' });
  const [groupReportData, setGroupReportData] = useState<GroupReportRow[]>([]);
  const [isGeneratingGroupReport, setIsGeneratingGroupReport] = useState(false);
  
  // Report Download State
  const [includeOriginalDataInReport, setIncludeOriginalDataInReport] = useState(true);

  // Report Changes Warning State
  const [isReportChangesDialogOpen, setIsReportChangesDialogOpen] = useState(false);
  const [reportChangeExample, setReportChangeExample] = useState('');
  const [pendingReportType, setPendingReportType] = useState<'summary' | 'group' | null>(null);
  
  const getHeadersForSheets = useCallback((sheetNames: string[]): string[] => {
    if (!sheetNames || sheetNames.length === 0) return [];
    const headers = new Set<string>();
    const sheetsToProcess = workbook.sheets.filter(s => sheetNames.includes(s.name));

    sheetsToProcess.forEach(sheet => {
        if (sheet && sheet.data.length > 0) {
            Object.keys(sheet.data[0]).forEach(k => {
                if (k !== '__id' && k !== '__source_sheet') {
                    headers.add(k);
                }
            });
        }
    });
    return Array.from(headers).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [workbook.sheets]);

  const summaryReportHeaders = useMemo(() => getHeadersForSheets(summaryReportSheets), [summaryReportSheets, getHeadersForSheets]);
  const groupReportHeaders = useMemo(() => getHeadersForSheets(groupReportSheets), [groupReportSheets, getHeadersForSheets]);

  const hasUnsavedDataChanges = useMemo(() => Object.keys(editedData).length > 0 || addedColumns.length > 0, [editedData, addedColumns]);
  const hasUnsavedChartChanges = useMemo(() => {
    if (isInitialMount.current) return false;
    return JSON.stringify(charts) !== JSON.stringify(pristineCharts);
  }, [charts, pristineCharts]);
  const hasUnsavedChanges = useMemo(() => hasUnsavedDataChanges || hasUnsavedChartChanges, [hasUnsavedDataChanges, hasUnsavedChartChanges]);
  const isAnyProcessing = isDataProcessing || isUploading || isCommitting || isGeneratingSummary || isGeneratingGroupReport;
  
  const actions = useDashboardActions({
    // State
    isClient, workbook, editedData, addedColumns, memoryThresholdBytes, selectedSheets, columnMaps, activeTab,
    filterHistory, currentHistoryIndex, activeFilters, debouncedSearchTerm, charts, pristineCharts, isUploading, headerRow, pendingFile, originalFile,
    chunkSizeMB, includeDataInSave, bulkEditColumn, bulkEditValue, newColumnName, splitColumnSource,
    splitColumnDelimiter, splitColumnNewNames, nocoBaseUrl, nocoBaseToken, newTemplateName, newTemplateDescription,
    includeDataInTemplateSave, editingTemplate, templateToDeleteId, deletePassword, pendingTemplate,
    templateUnlockPassword, hasUnsavedChanges, hasUnsavedDataChanges, combinedData, processedData, allHeaders, isTemplatesUnlocked,
    summaryReportSheets, summaryReportAggregation, summaryReportRows, summaryReportPivotCol, summaryReportValueCol, summaryReportData, isGeneratingSummary, yieldThreshold,
    groupReportSheets, groupReportConfig, groupReportData, isGeneratingGroupReport, includeOriginalDataInReport, pendingReportType, summaryReportMode,
    // State Setters
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
    // Refs
    fileInputRef, uploadAbortControllerRef, commitAbortControllerRef, memoryStateRef,
    // Functions
    generateFilterOptions
  });

  useEffect(() => {
    if (!isClient) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isAnyProcessing) {
        event.preventDefault();
        event.returnValue = 'An operation is in progress. Leaving now will cancel it.';
        return event.returnValue;
      }
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes that will be lost.';
        return event.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isClient, hasUnsavedChanges, isAnyProcessing]);

  useEffect(() => {
    setVisibleColumns(allHeaders);
  }, [allHeaders]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedHeaderRow.current !== headerRow && !isInitialMount.current) {
        debouncedHeaderRow.current = headerRow;
        if (originalFile) {
          actions.handleFileChange(null); // This is a trick to trigger re-upload logic if needed
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [headerRow, originalFile, actions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(activeFilters);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeFilters]);

  useEffect(() => {
    if (debouncedSearchTerm !== '') {
        setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const filterableHeaders = useMemo(() => {
    return allHeaders.filter(header => userConfiguredFilterable[header] !== false);
  }, [allHeaders, userConfiguredFilterable]);

  useEffect(() => {
    setIsClient(true);
    const initialize = async () => {
      if (sessionStorage.getItem('templatesUnlocked') === 'true') {
        setIsTemplatesUnlocked(true);
      }
      await generateFilterOptions(MOCK_WORKBOOK_DATA.sheets.flatMap(s => s.data), ['Region', 'Item Name']);
      setWorkbook(MOCK_WORKBOOK_DATA);
      setSelectedSheets(MOCK_WORKBOOK_DATA.sheets.map(s => s.name));
      setCharts(DEFAULT_CHARTS);
      setPristineCharts(DEFAULT_CHARTS);
      try {
          const response = await fetch('/api/templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          setTemplates(await response.json());
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Error Loading Templates' });
      }
    };
    initialize();
    if (isInitialMount.current) {
        isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < filterHistory.length - 1;
  const currentProcessingMessage = isUploading || isCommitting ? processingMessage : dataProcessingMessage;

  return {
    isClient, workbook, editedData, addedColumns, memoryUsage, memoryThresholdBytes, maxMemoryThresholdBytes, isMemoryApiAvailable, formatBytes,
    selectedSheets, columnMaps, activeTab, filterOptions, filterableHeaders, showDataMissingAlert, visibleColumns,
    filterHistory, currentHistoryIndex, activeFilters, debouncedFilters, searchTerm, debouncedSearchTerm, currentPage,
    rowsPerPage, charts, forceFullChartUpdate, isDataProcessing, dataProcessingMessage, cancelDataProcessing,
    combinedData, processedData, allHeaders, columnValueCounts, isChartDataSampled, isUploading, isCommitting,
    processingMessage, uploadProgress, fileInputRef, headerRow, chunkSizeMB, isPerformanceSettingsOpen,
    isSaveSettingsOpen, includeDataInSave, hasUnsavedChanges, unsavedChangesInfo, isBulkEditDialogOpen, bulkEditColumn, bulkEditValue,
    isUploadConfirmOpen, isCommitConfirmOpen, isDetailViewOpen, rowForDetailView, isUserGuideOpen,
    isAddColumnDialogOpen, newColumnName, addColumnError, isSplitColumnDialogOpen, splitColumnSource,
    splitColumnDelimiter, splitColumnNewNames, splitColumnError, isMemorySettingsOpen, isHistoryDialogOpen,
    isNocoBaseOpen, nocoBaseUrl, nocoBaseToken, templates, isSaveTemplateOpen, isSavingTemplate, editingTemplate,
    newTemplateName, newTemplateDescription, includeDataInTemplateSave, isDeleteTemplateDialogOpen, templateToDeleteId,
    deletePassword, isTemplateWarningOpen, pendingTemplate, templateWarningMessage, isTemplatesUnlocked,
    isTemplateUnlockDialogOpen, setIsTemplateUnlockDialogOpen, templateUnlockPassword, setTemplateUnlockPassword, templateUnlockError, setTemplateUnlockError,
    isSummaryReportOpen, setIsSummaryReportOpen, summaryReportHeaders,
    summaryReportSheets, setSummaryReportSheets,
    summaryReportAggregation, setSummaryReportAggregation,
    summaryReportRows, setSummaryReportRows,
    summaryReportPivotCol, setSummaryReportPivotCol,
    summaryReportValueCol, setSummaryReportValueCol,
    summaryReportData, setSummaryReportData,
    isGeneratingSummary, setIsGeneratingSummary,
    summaryReportMode, setSummaryReportMode,
    isGroupReportOpen, setIsGroupReportOpen, groupReportHeaders,
    groupReportSheets, setGroupReportSheets,
    groupReportConfig, setGroupReportConfig, groupReportData, setGroupReportData, isGeneratingGroupReport, setIsGeneratingGroupReport,
    includeOriginalDataInReport, setIncludeOriginalDataInReport,
    isReportChangesDialogOpen, setIsReportChangesDialogOpen, reportChangeExample, setPendingReportType,
    canUndo, canRedo, isAnyProcessing,
    currentProcessingMessage, yieldThreshold, maxChunkSize, maxYieldThreshold,
    setMemoryThresholdBytes, setActiveTab, setCharts, setUnsavedChangesInfo, setIsBulkEditDialogOpen, setBulkEditColumn,
    setBulkEditValue, setIsUploadConfirmOpen, setIsCommitConfirmOpen, setIsDetailViewOpen, setRowForDetailView, setIsUserGuideOpen,
    setIsAddColumnDialogOpen, setNewColumnName, setAddColumnError, setIsSplitColumnDialogOpen, setSplitColumnSource,
    setSplitColumnDelimiter, setSplitColumnNewNames, setSplitColumnError, setIsMemorySettingsOpen, setIsHistoryDialogOpen, setIsNocoBaseOpen, setNocoBaseUrl,
    setNocoBaseToken, setTemplates, setIsSaveTemplateOpen, setIsSaveSettingsOpen, setEditingTemplate, setNewTemplateName,
    setNewTemplateDescription, setIncludeDataInTemplateSave, setIsDeleteTemplateDialogOpen, setDeletePassword, setPendingTemplate,
    setForceFullChartUpdate, setIsPerformanceSettingsOpen, setChunkSizeMB,
    setSearchTerm, setYieldThreshold,
    setIncludeDataInSave, ...actions
  };
}

