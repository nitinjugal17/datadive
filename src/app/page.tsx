'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataDiveDashboardUI from '@/components/dashboard/data-dive-dashboard-ui';
import DataCharts from '@/components/dashboard/data-charts';
import UserGuide from '@/components/dashboard/user-guide';
import TemplateManager from '@/components/dashboard/template-manager';
import { FileSpreadsheet, BarChart2, Layers, FolderOpen, Save, Database, Loader2, Search, Upload, ChevronDown, Info, Split, HardDrive, History, CheckCircle, Zap, FilePieChart, Tags, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import React, { useMemo, useState } from 'react';

// Locally defined MultiSelect for the new Summary Report Dialog
const MultiSelectDropdown = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select...",
  className
}: {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() =>
    options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={isOpen} className={cn("w-full justify-between", className)}>
          <span className="truncate">
            {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-48">
          <div className="p-1">
            {filteredOptions.map(option => (
              <div key={option} className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent">
                <Checkbox
                  id={`multi-select-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={checked => {
                    onChange(checked ? [...selectedValues, option] : selectedValues.filter(v => v !== option));
                  }}
                />
                <label htmlFor={`multi-select-${option}`} className="w-full text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer truncate" title={option}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};


export default function Home() {
  const {
    isClient,
    workbook,
    editedData,
    addedColumns,
    memoryUsage,
    memoryThresholdBytes,
    maxMemoryThresholdBytes,
    isMemoryApiAvailable,
    formatBytes,
    selectedSheets,
    columnMaps,
    activeTab,
    filterOptions,
    filterableHeaders,
    showDataMissingAlert,
    visibleColumns,
    activeFilters,
    searchTerm,
    setSearchTerm,
    currentPage,
    rowsPerPage,
    charts,
    isDataProcessing,
    cancelDataProcessing,
    processedData,
    allHeaders,
    columnValueCounts,
    isChartDataSampled,
    isUploading,
    isCommitting,
    processingMessage,
    uploadProgress,
    fileInputRef,
    headerRow,
    chunkSizeMB,
    isPerformanceSettingsOpen,
    isSaveSettingsOpen,
    setIsSaveSettingsOpen,
    includeDataInSave,
    setIncludeDataInSave,
    unsavedChangesInfo,
    setUnsavedChangesInfo,
    isBulkEditDialogOpen,
    setIsBulkEditDialogOpen,
    bulkEditColumn,
    setBulkEditColumn,
    bulkEditValue,
    setBulkEditValue,
    isUploadConfirmOpen,
    setIsUploadConfirmOpen,
    isCommitConfirmOpen,
    setIsCommitConfirmOpen,
    isDetailViewOpen,
    setIsDetailViewOpen,
    rowForDetailView,
    isUserGuideOpen,
    setIsUserGuideOpen,
    isAddColumnDialogOpen,
    setIsAddColumnDialogOpen,
    newColumnName,
    setNewColumnName,
    addColumnError,
    setAddColumnError,
    isSplitColumnDialogOpen,
    setIsSplitColumnDialogOpen,
    splitColumnSource,
    setSplitColumnSource,
    splitColumnDelimiter,
    setSplitColumnDelimiter,
    splitColumnNewNames,
    setSplitColumnNewNames,
    splitColumnError,
    setSplitColumnError,
    isMemorySettingsOpen,
    setIsMemorySettingsOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    filterHistory,
    currentHistoryIndex,
    isNocoBaseOpen,
    setIsNocoBaseOpen,
    nocoBaseUrl,
    setNocoBaseUrl,
    nocoBaseToken,
    setNocoBaseToken,
    templates,
    isSaveTemplateOpen,
    setIsSaveTemplateOpen,
    isSavingTemplate,
    editingTemplate,
    newTemplateName,
    setNewTemplateName,
    newTemplateDescription,
    setNewTemplateDescription,
    includeDataInTemplateSave,
    setIncludeDataInTemplateSave,
    isDeleteTemplateDialogOpen,
    setIsDeleteTemplateDialogOpen,
    templateToDeleteId,
    deletePassword,
    setDeletePassword,
    isTemplateWarningOpen,
    setIsTemplateWarningOpen,
    pendingTemplate,
    setPendingTemplate,
    templateWarningMessage,
    isTemplatesUnlocked,
    isTemplateUnlockDialogOpen,
    setIsTemplateUnlockDialogOpen,
    templateUnlockPassword,
    setTemplateUnlockPassword,
    templateUnlockError,
    setTemplateUnlockError,
    isSummaryReportOpen,
    summaryReportHeaders,
    summaryReportSheets,
    setSummaryReportSheets,
    summaryReportAggregation,
    setSummaryReportAggregation,
    summaryReportRows,
    setSummaryReportRows,
    summaryReportPivotCol,
    setSummaryReportPivotCol,
    summaryReportValueCol,
    setSummaryReportValueCol,
    summaryReportData,
    isGeneratingSummary,
    summaryReportMode,
    setSummaryReportMode,
    isGroupReportOpen,
    groupReportHeaders,
    groupReportSheets,
    setGroupReportSheets,
    setIsGroupReportOpen,
    groupReportConfig,
    setGroupReportConfig,
    groupReportData,
    isGeneratingGroupReport,
    includeOriginalDataInReport,
    setIncludeOriginalDataInReport,
    isReportChangesDialogOpen,
    reportChangeExample,
    setPendingReportType,
    setIsReportChangesDialogOpen,
    canUndo,
    canRedo,
    isAnyProcessing,
    currentProcessingMessage,
    yieldThreshold,
    maxChunkSize,
    maxYieldThreshold,
    setMemoryThresholdBytes,
    setActiveTab,
    setCharts,
    handleCancelUpload,
    handleCancelCommit,
    handleDiscardChanges,
    handleTabChange,
    handleSheetSelect,
    handleSelectAllSheets,
    handleColumnMapChange,
    applyFiltersAndRecordHistory,
    handleClearFilters,
    handleHeaderRowChange,
    handlePageChange,
    handleCellEdit,
    handleSaveChanges,
    handleDownload,
    handleBulkEdit,
    handleFileSelect,
    handleFilterableColumnChange,
    handleFileChange,
    handleInitiateSaveSettings,
    handleConfirmSaveSettings,
    handleSaveAndUpload,
    handleDiscardAndUpload,
    handleLoadSettings,
    handleReloadData,
    handleNocoBaseConnect,
    handleOpenSaveTemplateDialog,
    handleOpenEditTemplateDialog,
    handleSaveTemplate,
    handleApplyTemplateWithData,
    handleApplyTemplate,
    handleConfirmApplyTemplate,
    handleDeleteTemplate,
    handleConfirmDeleteTemplate,
    handleUnlockTemplates,
    handleApplySuggestedMap,
    handleInitiateCommitFilters,
    handleStartCommit,
    handleViewRowDetails,
    handleUndoFilter,
    handleRedoFilter,
    handleAddNewColumn,
    handleSplitColumn,
    handleColumnVisibilityChange,
    setForceFullChartUpdate,
    setIsPerformanceSettingsOpen,
    setChunkSizeMB,
    setYieldThreshold,
    handleOpenSummaryReport,
    handleGenerateSummaryReport,
    handleDownloadSummaryReport,
    setIsSummaryReportOpen,
    handleOpenGroupReport,
    handleGenerateGroupReport,
    handleDownloadGroupReport,
    handleConfirmReportWithChanges,
  } = useDashboard();

  // New state for report detail view
  const [reportDetailRow, setReportDetailRow] = useState<any | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);

  // Moved hooks before conditional return to prevent order changes
  const summaryPivotOptions = useMemo(() =>
    summaryReportHeaders.filter(h => h !== summaryReportValueCol && !summaryReportRows.includes(h)),
    [summaryReportHeaders, summaryReportValueCol, summaryReportRows]
  );
  
  const summaryValueOptions = useMemo(() =>
    summaryReportHeaders.filter(h => h !== summaryReportPivotCol && !summaryReportRows.includes(h)),
    [summaryReportHeaders, summaryReportPivotCol, summaryReportRows]
  );
  
  const summaryRowOptions = useMemo(() =>
    summaryReportHeaders.filter(h => h !== summaryReportPivotCol && h !== summaryReportValueCol),
    [summaryReportHeaders, summaryReportPivotCol, summaryReportValueCol]
  );

  if (!isClient) {
    return null; // or a loading skeleton
  }

  const handleViewReportRow = (row: any) => {
    setReportDetailRow(row);
    setIsReportDetailOpen(true);
  };
  
  const handleSummaryReportRowsChange = (values: string[]) => {
    setSummaryReportRows(values);
    if (values.includes(summaryReportPivotCol)) setSummaryReportPivotCol('');
    if (values.includes(summaryReportValueCol)) setSummaryReportValueCol('');
  };
  
  const handleSummaryPivotColChange = (value: string) => {
    setSummaryReportPivotCol(value);
    if (summaryReportRows.includes(value)) {
      setSummaryReportRows(summaryReportRows.filter(r => r !== value));
    }
    if (value === summaryReportValueCol) setSummaryReportValueCol('');
  };

  const handleSummaryValueColChange = (value: string) => {
    setSummaryReportValueCol(value);
    if (summaryReportRows.includes(value)) {
      setSummaryReportRows(summaryReportRows.filter(r => r !== value));
    }
    if (value === summaryReportPivotCol) setSummaryReportPivotCol('');
  };


  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative">
       {isAnyProcessing && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{currentProcessingMessage || 'Processing data...'}</span>
          </div>
          {isUploading && (
            <>
              <Progress value={uploadProgress} className="w-1/3 mt-4" />
              <Button variant="ghost" onClick={handleCancelUpload} className="mt-4">
                Cancel Upload
              </Button>
            </>
          )}
          {isDataProcessing && !isUploading && (
             <Button variant="ghost" onClick={cancelDataProcessing} className="mt-4">
                Cancel Processing
              </Button>
          )}
          {isCommitting && (
             <Button variant="ghost" onClick={handleCancelCommit} className="mt-4">
                Cancel Commit
              </Button>
          )}
        </div>
      )}
      <div className={cn("max-w-screen-2xl mx-auto", isAnyProcessing && "opacity-50 pointer-events-none")}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
        
        <AlertDialog open={isSaveSettingsOpen} onOpenChange={setIsSaveSettingsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Dashboard Settings</AlertDialogTitle>
              <AlertDialogDescription>
                You can save your current filters, column mappings, and sheet selections to local storage for your next session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center space-x-2 py-4">
              <Checkbox
                id="include-data"
                checked={includeDataInSave}
                onCheckedChange={(checked) => setIncludeDataInSave(Boolean(checked))}
              />
              <label htmlFor="include-data" className="text-sm font-medium leading-none cursor-pointer">
                Include workbook data (for faster loading next time)
              </label>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSaveSettings}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isCommitConfirmOpen} onOpenChange={setIsCommitConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Commit Filtered Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently reduce your in-session dataset to only the rows matching the current active filters. This action is irreversible for the current session. Are you sure?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStartCommit}>Yes, Reduce Data</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isUploadConfirmOpen} onOpenChange={setIsUploadConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Override current state?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes, active filters, or column mappings. Uploading a new file will discard this state. How would you like to proceed?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => handleFileChange(null)}>Cancel</AlertDialogCancel>
                    <Button variant="outline" onClick={handleDiscardAndUpload}>Discard and Upload</Button>
                    <AlertDialogAction onClick={handleSaveAndUpload}>Save and Upload</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={isTemplateWarningOpen} onOpenChange={setIsTemplateWarningOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Template Mismatch Warning</AlertDialogTitle>
              <AlertDialogDescription>
                {templateWarningMessage}
                <br/><br/>
                The template may not function as expected. Do you want to apply it anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingTemplate(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmApplyTemplate}>Apply Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <AlertDialog open={unsavedChangesInfo.isOpen} onOpenChange={(isOpen) => setUnsavedChangesInfo(prev => ({ ...prev, isOpen }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
              <AlertDialogDescription>
                If you proceed, your current edits will be lost. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDiscardChanges}>Discard Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={isReportChangesDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) setPendingReportType(null);
            setIsReportChangesDialogOpen(isOpen);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes Detected</AlertDialogTitle>
              <AlertDialogDescription>
                Your report will be generated using your unsaved edits. {reportChangeExample}
                <br />
                <br />
                This may affect the results. Do you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmReportWithChanges}>
                Proceed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Edit Column</DialogTitle>
              <DialogDescription>
                Apply a new value to all visible rows for a selected column. This action will add to your unsaved changes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bulk-edit-column" className="text-right">Column</Label>
                    <Select onValueChange={setBulkEditColumn} value={bulkEditColumn}>
                        <SelectTrigger id="bulk-edit-column" className="col-span-3">
                            <SelectValue placeholder="Select a column" />
                        </SelectTrigger>
                        <SelectContent>
                            {allHeaders.map(header => (
                                <SelectItem key={header} value={header}>{header}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bulk-edit-value" className="text-right">New Value</Label>
                    <Input
                        id="bulk-edit-value"
                        value={bulkEditValue}
                        onChange={(e) => setBulkEditValue(e.target.value)}
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkEdit}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Column</DialogTitle>
              <DialogDescription>
                Enter a name for the new column. It will be added to your dataset with empty values. This change is temporary and will be lost if you reload the page without downloading.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="new-column-name">Column Name</Label>
                <Input
                    id="new-column-name"
                    value={newColumnName}
                    onChange={(e) => {
                        setNewColumnName(e.target.value);
                        if (addColumnError) setAddColumnError('');
                    }}
                    placeholder="e.g., 'Notes' or 'Follow-up'"
                />
                {addColumnError && <p className="text-sm text-destructive">{addColumnError}</p>}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNewColumn}>Add Column</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSplitColumnDialogOpen} onOpenChange={setIsSplitColumnDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Split Column into New Columns</DialogTitle>
                    <DialogDescription>
                        Choose a column to split, a delimiter, and provide comma-separated names for the new columns. This change is temporary.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="split-source-column">Column to Split</Label>
                        <Select onValueChange={setSplitColumnSource} value={splitColumnSource}>
                            <SelectTrigger id="split-source-column">
                                <SelectValue placeholder="Select a column" />
                            </SelectTrigger>
                            <SelectContent>
                                {allHeaders.map(header => (
                                    <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="split-delimiter">Delimiter</Label>
                        <Input
                            id="split-delimiter"
                            value={splitColumnDelimiter}
                            onChange={(e) => setSplitColumnDelimiter(e.target.value)}
                            placeholder="e.g., ',' or ' '"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="split-new-names">New Column Names</Label>
                        <Input
                            id="split-new-names"
                            value={splitColumnNewNames}
                            onChange={(e) => setSplitColumnNewNames(e.target.value)}
                            placeholder="e.g., FirstName,LastName"
                        />
                         <p className="text-xs text-muted-foreground">Provide names separated by commas.</p>
                    </div>
                    {splitColumnError && <p className="text-sm text-destructive">{splitColumnError}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSplitColumnDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSplitColumn}>Split Column</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isMemorySettingsOpen} onOpenChange={setIsMemorySettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Memory Management</DialogTitle>
              <DialogDescription>
                Adjust the memory usage threshold. Operations will be paused if usage exceeds this limit to prevent crashes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="memory-threshold">Threshold: {formatBytes(memoryThresholdBytes, 0)}</Label>
                {!isMemoryApiAvailable && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Live memory monitoring is not available in your browser. <br/> The threshold will be compared against the estimated data size.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Slider
                id="memory-threshold"
                min={100}
                max={maxMemoryThresholdBytes / (1024 * 1024)}
                step={100}
                value={[memoryThresholdBytes / (1024 * 1024)]}
                onValueChange={(value) => setMemoryThresholdBytes(value[0] * 1024 * 1024)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Keep between 500MB and 2GB. Setting it too high may cause your browser to become unresponsive with large datasets.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMemorySettingsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPerformanceSettingsOpen} onOpenChange={setIsPerformanceSettingsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Performance Settings</DialogTitle>
                    <DialogDescription>
                    Adjust settings that affect performance. Higher values can speed up processing but may use more memory or make the UI less responsive.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <Label htmlFor="chunk-size-slider">CSV Chunk Size: {chunkSizeMB} MB</Label>
                        </div>
                        <Slider
                        id="chunk-size-slider"
                        min={1}
                        max={maxChunkSize}
                        step={1}
                        value={[chunkSizeMB]}
                        onValueChange={(value) => setChunkSizeMB(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                        Affects how large CSV files are read into memory. Larger chunks can be faster but use more memory.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <Label htmlFor="yield-threshold-slider">Processing Yield Rate: {yieldThreshold} rows</Label>
                        </div>
                        <Slider
                            id="yield-threshold-slider"
                            min={100}
                            max={maxYieldThreshold}
                            step={100}
                            value={[yieldThreshold]}
                            onValueChange={(value) => setYieldThreshold(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                            Lower values make the UI more responsive during heavy operations, but may slightly increase total processing time. Higher values can be faster but may cause the UI to feel sluggish.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPerformanceSettingsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog open={isNocoBaseOpen} onOpenChange={setIsNocoBaseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to NocoBase API</DialogTitle>
              <DialogDescription>
                Enter your NocoBase API endpoint URL and token to load data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nocobase-url" className="text-right">API URL</Label>
                    <Input
                        id="nocobase-url"
                        value={nocoBaseUrl}
                        onChange={(e) => setNocoBaseUrl(e.target.value)}
                        className="col-span-3"
                        placeholder="https://yourapp.nocobase.com/api/your_collection"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nocobase-token" className="text-right">API Token</Label>
                    <Input
                        id="nocobase-token"
                        value={nocoBaseToken}
                        onChange={(e) => setNocoBaseToken(e.target.value)}
                        className="col-span-3"
                        placeholder="(Optional) Your x-token value"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNocoBaseOpen(false)}>Cancel</Button>
                <Button onClick={handleNocoBaseConnect} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Connect
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter History</DialogTitle>
              <DialogDescription>
                Review and revert to previous filter states. The current state is highlighted.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-2 py-2">
                {filterHistory.map((filters, index) => (
                  <Button
                    key={`history-${index}`}
                    variant={index === currentHistoryIndex ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto py-2 text-left"
                    onClick={() => {
                      applyFiltersAndRecordHistory(filters);
                      setIsHistoryDialogOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {index === currentHistoryIndex ? (
                        <CheckCircle className="h-4 w-4 mt-1 text-primary shrink-0" />
                      ) : (
                        <div className="h-4 w-4 mt-1 shrink-0" /> 
                      )}
                      <div>
                        <p className="font-semibold">State {index + 1}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {filters.length === 0 ? 'No filters applied' : `${filters.length} filter column(s) active`}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>


        <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingTemplate ? 'Edit Template' : 'Save New Template'}</DialogTitle>
                    <DialogDescription>
                        {editingTemplate
                            ? 'Update the name and description for this template. This will save over the previous version with the current dashboard view.'
                            : 'Save the current column mappings, filters, and chart configurations as a reusable template.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template-name" className="text-right">Name</Label>
                        <Input
                            id="template-name"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., Quarterly Sales Report"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="template-description" className="text-right mt-2">Description</Label>
                        <Textarea
                            id="template-description"
                            value={newTemplateDescription}
                            onChange={(e) => setNewTemplateDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="(Optional) A brief description of what this template does."
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <Checkbox
                            id="include-data-template"
                            checked={includeDataInTemplateSave}
                            onCheckedChange={(checked) => setIncludeDataInTemplateSave(Boolean(checked))}
                            disabled={!workbook}
                        />
                        <label htmlFor="include-data-template" className="text-sm font-medium leading-none cursor-pointer">
                            Save current data file with this template
                        </label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSaveTemplateOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTemplate} disabled={isSavingTemplate}>
                        {isSavingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingTemplate ? 'Save Changes' : 'Save Template'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

         <Dialog open={isDeleteTemplateDialogOpen} onOpenChange={setIsDeleteTemplateDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        To delete this template, please enter the administrator password. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="delete-password">Password</Label>
                    <Input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter password"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteTemplateDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirmDeleteTemplate}>Delete Template</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isTemplateUnlockDialogOpen} onOpenChange={(isOpen) => !isOpen && setIsTemplateUnlockDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlock Template Library</DialogTitle>
              <DialogDescription>
                Enter the administrator password to view, manage, and apply templates.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="template-unlock-password">Password</Label>
              <Input
                id="template-unlock-password"
                type="password"
                value={templateUnlockPassword}
                onChange={(e) => {
                  setTemplateUnlockPassword(e.target.value);
                  if (templateUnlockError) setTemplateUnlockError('');
                }}
                placeholder="Enter password"
              />
              {templateUnlockError && <p className="text-sm text-destructive">{templateUnlockError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateUnlockDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUnlockTemplates}>Unlock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Row Details</DialogTitle>
                    <DialogDescription>
                        Viewing all data for a single row from sheet '{rowForDetailView?.__source_sheet}'.
                    </DialogDescription>
                </DialogHeader>
                {rowForDetailView && (
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4 py-4">
                    {Object.entries(rowForDetailView).map(([key, value]) => {
                        if (key === '__id' || key === '__source_sheet') return null;
                        return (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                            <Label htmlFor={`detail-${key}`} className="md:text-right md:mt-2 font-semibold text-muted-foreground truncate" title={key}>{key}</Label>
                            <div className="md:col-span-2">
                            <Textarea
                                id={`detail-${key}`}
                                readOnly
                                value={String(value)}
                                className="bg-muted/50 border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                rows={String(value).split('\n').length}
                            />
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </ScrollArea>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDetailViewOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isUserGuideOpen} onOpenChange={setIsUserGuideOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>User Guide</DialogTitle>
                    <DialogDescription>
                        A guide to get you started, plus AI-powered help for your data.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto -mx-6 px-6 py-4">
                    <UserGuide workbookData={JSON.stringify(workbook, null, 2)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserGuideOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Report Row Details</DialogTitle>
                    <DialogDescription>
                        Viewing all data for a single row from the report.
                    </DialogDescription>
                </DialogHeader>
                {reportDetailRow && (
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4 py-4">
                    {Object.entries(reportDetailRow).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                            <Label htmlFor={`report-detail-${key}`} className="md:text-right md:mt-2 font-semibold text-muted-foreground truncate" title={key}>{key}</Label>
                            <div className="md:col-span-2">
                            <Textarea
                                id={`report-detail-${key}`}
                                readOnly
                                value={String(value ?? '')}
                                className="bg-muted/50 border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                rows={String(value ?? '').split('\n').length}
                            />
                            </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsReportDetailOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isSummaryReportOpen} onOpenChange={setIsSummaryReportOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Custom Pivot Report</DialogTitle>
              <DialogDescription>
                Create a pivot table summary for one or more sheets. The report respects active filters and will be added as a new sheet to a downloadable Excel file.
              </DialogDescription>
            </DialogHeader>
             <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>Report Mode</Label>
                    <RadioGroup
                        value={summaryReportMode}
                        onValueChange={(value) => setSummaryReportMode(value as 'single' | 'individual')}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="mode-single" />
                            <Label htmlFor="mode-single" className="font-normal">Combined summary for all selected sheets</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="mode-individual" />
                            <Label htmlFor="mode-individual" className="font-normal">Individual summary for each selected sheet</Label>
                        </div>
                    </RadioGroup>
                 </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report on Sheet(s)</Label>
                    <MultiSelectDropdown
                      options={selectedSheets}
                      selectedValues={summaryReportSheets}
                      onChange={setSummaryReportSheets}
                      placeholder="Select sheets..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Group by (Rows)</Label>
                    <MultiSelectDropdown
                      options={summaryRowOptions}
                      selectedValues={summaryReportRows}
                      onChange={handleSummaryReportRowsChange}
                      placeholder="Select columns to group by..."
                    />
                  </div>
                </div>
                 <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Pivot On (Columns)</Label>
                      <Select value={summaryReportPivotCol} onValueChange={handleSummaryPivotColChange}>
                          <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                          <SelectContent>
                              {summaryPivotOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Values</Label>
                        <Select value={summaryReportValueCol} onValueChange={handleSummaryValueColChange}>
                            <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                            <SelectContent>
                                {summaryValueOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Aggregation</Label>
                        <Select onValueChange={(value) => setSummaryReportAggregation(value as any)} value={summaryReportAggregation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an aggregation method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="count-distinct">Count Unique Values</SelectItem>
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="average">Average</SelectItem>
                                <SelectItem value="count">Count Rows</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </div>

            {isGeneratingSummary && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p>Generating pivot report...</p>
              </div>
            )}
            
            {Object.keys(summaryReportData).length > 0 && !isGeneratingSummary && (
              <div className="space-y-4">
                <h4 className="font-medium">Report Preview</h4>
                {(() => {
                  const COLUMN_VISIBILITY_THRESHOLD = 5;
                  
                  const renderTable = (data: any[], reportHeaders: string[]) => {
                    const allReportHeaders = reportHeaders;
                    const shouldTruncateColumns = allReportHeaders.length > COLUMN_VISIBILITY_THRESHOLD;
                    const visibleReportHeaders = shouldTruncateColumns 
                      ? allReportHeaders.slice(0, COLUMN_VISIBILITY_THRESHOLD -1) 
                      : allReportHeaders;

                    return (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {shouldTruncateColumns && <TableHead className="w-12"></TableHead>}
                                    {visibleReportHeaders.map(header => (
                                        <TableHead key={header}>{header}</TableHead>
                                    ))}
                                    {shouldTruncateColumns && <TableHead>...</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                <TableRow key={index}>
                                    {shouldTruncateColumns && (
                                        <TableCell>
                                            <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewReportRow(row)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>View Full Row</p></TooltipContent>
                                            </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    )}
                                    {visibleReportHeaders.map(header => (
                                    <TableCell key={header}>{row[header]}</TableCell>
                                    ))}
                                    {shouldTruncateColumns && <TableCell>...</TableCell>}
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    );
                  }

                  return (
                    <>
                      {Object.keys(summaryReportData).length === 1 ? (
                          <ScrollArea className="h-64 border rounded-md">
                              {renderTable(Object.values(summaryReportData)[0].data, Object.values(summaryReportData)[0].headers)}
                          </ScrollArea>
                      ) : (
                          <Tabs defaultValue={Object.keys(summaryReportData)[0]} className="w-full">
                              <TabsList>
                                  {Object.keys(summaryReportData).map(reportName => (
                                      <TabsTrigger key={reportName} value={reportName} className="text-xs">{reportName}</TabsTrigger>
                                  ))}
                              </TabsList>
                              {Object.entries(summaryReportData).map(([reportName, reportObject]) => (
                                  <TabsContent key={reportName} value={reportName}>
                                      <ScrollArea className="h-64 border rounded-md">
                                        {renderTable(reportObject.data, reportObject.headers)}
                                      </ScrollArea>
                                  </TabsContent>
                              ))}
                          </Tabs>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-4 mt-4 border-t">
                <Checkbox
                    id="include-data-summary"
                    checked={includeOriginalDataInReport}
                    onCheckedChange={(checked) => setIncludeOriginalDataInReport(Boolean(checked))}
                />
                <label htmlFor="include-data-summary" className="text-sm font-medium">
                    Include original data sheets in download
                </label>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDownloadSummaryReport}
                disabled={Object.keys(summaryReportData).length === 0 || isGeneratingSummary}
              >
                Download as XLSX
              </Button>
              <Button
                onClick={handleGenerateSummaryReport}
                disabled={isGeneratingSummary || summaryReportSheets.length === 0 || summaryReportRows.length === 0 || !summaryReportPivotCol || !summaryReportValueCol}
              >
                {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isGroupReportOpen} onOpenChange={setIsGroupReportOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Custom Group Report</DialogTitle>
                    <DialogDescription>
                        Create a report for one or more sheets by grouping values from a column into new categories.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="group-report-sheet">Report on Sheet(s)</Label>
                            <MultiSelectDropdown
                                options={selectedSheets}
                                selectedValues={groupReportSheets}
                                onChange={setGroupReportSheets}
                                placeholder="Select sheets..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-report-column">Column to Group</Label>
                            <Select 
                                value={groupReportConfig.column} 
                                onValueChange={(value) => setGroupReportConfig(c => ({...c, column: value}))}
                            >
                                <SelectTrigger id="group-report-column">
                                    <SelectValue placeholder="Select a column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupReportHeaders.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="group-report-new-name">New Group Column Name</Label>
                        <Input
                            id="group-report-new-name"
                            value={groupReportConfig.newColumnName}
                            onChange={(e) => setGroupReportConfig(c => ({...c, newColumnName: e.target.value}))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="group-report-mappings">Mappings</Label>
                        <Textarea
                            id="group-report-mappings"
                            placeholder="Enter one mapping per line, e.g.&#10;GROUP_NAME=value1,value2&#10;Americas=North,South&#10;EMEA=Europe,Middle East"
                            className="min-h-[120px] font-mono text-xs"
                            value={groupReportConfig.mappings}
                            onChange={(e) => setGroupReportConfig(c => ({...c, mappings: e.target.value}))}
                        />
                        <p className="text-xs text-muted-foreground">
                            Each line defines a new group. The format is `GROUP_NAME=value1,value2,value3`. Values are comma-separated.
                        </p>
                    </div>
                </div>

                {isGeneratingGroupReport && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <p>Generating group report...</p>
                    </div>
                )}
                
                {groupReportData.length > 0 && !isGeneratingGroupReport && (
                    <div className="space-y-4">
                        <h4 className="font-medium">Report Preview</h4>
                        <ScrollArea className="h-60 border rounded-md p-2">
                            <Accordion type="multiple" className="w-full">
                                {groupReportData.map((item) => (
                                    <AccordionItem value={item.group} key={item.group}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <span>{item.group}</span>
                                                <span className="text-muted-foreground">Total: {item.total.toLocaleString()}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Table>
                                                <TableBody>
                                                    {item.breakdown.map((b) => (
                                                        <TableRow key={b.value}>
                                                            <TableCell className="pl-8">{b.value}</TableCell>
                                                            <TableCell className="text-right">{b.count.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollArea>
                    </div>
                )}
                
                <div className="flex items-center space-x-2 pt-4 mt-4 border-t">
                    <Checkbox
                        id="include-data-group"
                        checked={includeOriginalDataInReport}
                        onCheckedChange={(checked) => setIncludeOriginalDataInReport(Boolean(checked))}
                    />
                    <label htmlFor="include-data-group" className="text-sm font-medium">
                        Include original data sheets in download
                    </label>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleDownloadGroupReport}
                        disabled={groupReportData.length === 0 || isGeneratingGroupReport}
                    >
                        Download as XLSX
                    </Button>
                    <Button
                        onClick={handleGenerateGroupReport}
                        disabled={isGeneratingGroupReport || groupReportSheets.length === 0 || !groupReportConfig.column || !groupReportConfig.mappings}
                    >
                        {isGeneratingGroupReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Generate Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <header className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold font-headline text-primary">DataDive Dashboard</h1>
                <p className="text-muted-foreground mt-2">Your dynamic tool to analyze and update data on the fly.</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 cursor-help">
                          <HardDrive className="h-4 w-4" />
                          <span>{memoryUsage.text}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{memoryUsage.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2 flex-wrap">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button>
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsHistoryDialogOpen(true)} disabled={isUploading}>
                              <History className="mr-2 h-4 w-4" /> View Filter History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsNocoBaseOpen(true)} disabled={isUploading}>
                              <Database className="mr-2 h-4 w-4" /> Connect to NocoBase
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLoadSettings} disabled={isUploading}>
                              <FolderOpen className="mr-2 h-4 w-4" /> Load Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleInitiateSaveSettings} disabled={isUploading}>
                              <Save className="mr-2 h-4 w-4" /> Save Settings
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={handleOpenSummaryReport} disabled={isUploading || allHeaders.length === 0}>
                              <FilePieChart className="mr-2 h-4 w-4" /> Custom Pivot Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleOpenGroupReport} disabled={isUploading || allHeaders.length === 0}>
                            <Tags className="mr-2 h-4 w-4" /> Custom Group Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsMemorySettingsOpen(true)}>
                              <HardDrive className="mr-2 h-4 w-4" /> Memory Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsPerformanceSettingsOpen(true)}>
                              <Zap className="mr-2 h-4 w-4" /> Performance Settings
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </div>
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search across all data..."
                  className="w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </header>

        {showDataMissingAlert && (
            <Alert className="mb-4">
                <Upload className="h-4 w-4" />
                <AlertTitle>Configuration Loaded, Data Missing</AlertTitle>
                <AlertDescription>
                    Your saved settings have been applied, but the workbook data was not included. Please re-upload the correct data file to see your dashboard.
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={handleFileSelect}>
                        Upload File
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        {addedColumns.length > 0 && (
            <Alert variant="info" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>You've added temporary columns</AlertTitle>
                <AlertDescription>
                    The columns ({addedColumns.join(', ')}) exist only in this session. To save them, download the data and re-upload the file.
                </AlertDescription>
            </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-3 mb-4">
            <TabsTrigger value="dashboard"><FileSpreadsheet className="mr-2 h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="charts"><BarChart2 className="mr-2 h-4 w-4" /> Charts</TabsTrigger>
            <TabsTrigger value="templates"><Layers className="mr-2 h-4 w-4" /> Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <DataDiveDashboardUI
              workbook={workbook}
              selectedSheets={selectedSheets}
              onSheetSelect={handleSheetSelect}
              onSelectAllSheets={handleSelectAllSheets}
              columnMaps={columnMaps}
              onColumnMapChange={handleColumnMapChange}
              dataForTable={processedData.paginatedData}
              columnValueCounts={columnValueCounts}
              filterOptions={filterOptions}
              allHeaders={allHeaders}
              filterableHeaders={filterableHeaders}
              onFilterableColumnChange={handleFilterableColumnChange}
              activeFilters={activeFilters}
              onActiveFilterChange={applyFiltersAndRecordHistory}
              onClearFilters={handleClearFilters}
              onCommitFilters={handleInitiateCommitFilters}
              onCellEdit={handleCellEdit}
              onSaveChanges={handleSaveChanges}
              editedData={editedData}
              onFileSelect={handleFileSelect}
              isProcessing={isAnyProcessing}
              uploadProgress={uploadProgress}
              uploadMessage={processingMessage}
              headerRow={headerRow}
              onHeaderRowChange={handleHeaderRowChange}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalRows={processedData.totalRows}
              onPageChange={handlePageChange}
              onDownloadData={handleDownload}
              onBulkEdit={() => setIsBulkEditDialogOpen(true)}
              onReloadData={handleReloadData}
              onViewRowDetails={handleViewRowDetails}
              onUndoFilter={handleUndoFilter}
              onRedoFilter={handleRedoFilter}
              canUndo={canUndo}
              canRedo={canRedo}
              onAddColumn={() => {
                setAddColumnError('');
                setIsAddColumnDialogOpen(true);
              }}
              onSplitColumn={() => {
                setSplitColumnError('');
                setIsSplitColumnDialogOpen(true);
              }}
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onOpenSummaryReport={handleOpenSummaryReport}
            />
          </TabsContent>
          <TabsContent value="charts">
            <DataCharts 
              fullFilteredData={processedData.processedDataForCharts}
              allHeaders={allHeaders}
              charts={charts}
              onChartsChange={setCharts}
              columnValueCounts={columnValueCounts}
              totalRowsInDataset={processedData.totalRows}
              onSaveAsTemplate={handleOpenSaveTemplateDialog}
              memoryUsageBytes={memoryUsage.bytes}
              memoryThresholdBytes={memoryThresholdBytes}
              isProcessing={isAnyProcessing}
              isChartDataSampled={isChartDataSampled}
              onForceFullChartUpdate={() => setForceFullChartUpdate(true)}
            />
          </TabsContent>
          <TabsContent value="templates">
            <TemplateManager
                templates={templates}
                isUnlocked={isTemplatesUnlocked}
                onUnlock={() => {
                  setTemplateUnlockError('');
                  setTemplateUnlockPassword('');
                  setIsTemplateUnlockDialogOpen(true);
                }}
                onSaveTemplate={handleOpenSaveTemplateDialog}
                onApplyTemplate={handleApplyTemplate}
                onApplyTemplateWithData={handleApplyTemplateWithData}
                onEditTemplate={handleOpenEditTemplateDialog}
                onDeleteTemplate={handleDeleteTemplate}
                onApplySuggestedMap={handleApplySuggestedMap}
                allHeaders={allHeaders}
                workbook={workbook}
             />
          </TabsContent>
        </Tabs>
        <footer className="text-center mt-8">
            <Button variant="link" onClick={() => setIsUserGuideOpen(true)}>
                User Guide
            </Button>
        </footer>
      </div>
    </main>
  );
}
