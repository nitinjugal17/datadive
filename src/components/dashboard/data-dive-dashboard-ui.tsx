
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Upload, FileText, SlidersHorizontal, ListTree, Save, ChevronsUpDown, Loader2, FilterX, Download, Edit, RefreshCw, Scissors, Info, Eye, Columns, Undo2, Redo2, PlusCircle, Split, ChevronDown, FilePieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Workbook, Sheet } from '@/lib/mock-data';
import type { ColumnMapping, Filter as FilterType, FilterOptions } from '@/lib/types';
import { STANDARDIZED_HEADERS } from '@/lib/mock-data';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DataDiveDashboardUIProps {
  workbook: Workbook;
  selectedSheets: string[];
  onSheetSelect: (sheetName: string, isSelected: boolean) => void;
  onSelectAllSheets: (isSelected: boolean) => void;
  columnMaps: Record<string, ColumnMapping>;
  onColumnMapChange: (sheetName: string, originalHeader: string, newHeader: string) => void;
  dataForTable: any[];
  columnValueCounts: Record<string, number>;
  filterOptions: FilterOptions;
  allHeaders: string[];
  filterableHeaders: string[];
  onFilterableColumnChange: (header: string, isFilterable: boolean) => void;
  activeFilters: FilterType[];
  onActiveFilterChange: (filters: FilterType[]) => void;
  onClearFilters: () => void;
  onCommitFilters: () => void;
  onCellEdit: (rowId: number, column: string, value: any) => void;
  onSaveChanges: () => void;
  editedData: Record<string, any>;
  onFileSelect: () => void;
  isProcessing: boolean;
  uploadProgress: number;
  uploadMessage: string;
  headerRow: number;
  onHeaderRowChange: (value: string) => void;
  currentPage: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onDownloadData: (format: 'csv' | 'xlsx') => void;
  onBulkEdit: () => void;
  onReloadData: () => void;
  onViewRowDetails: (row: any) => void;
  onUndoFilter: () => void;
  onRedoFilter: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddColumn: () => void;
  onSplitColumn: () => void;
  visibleColumns: string[];
  onColumnVisibilityChange: (header: string, checked: boolean) => void;
  onOpenSummaryReport: () => void;
}

const MultiSelectFilter = ({ options, onChange, selectedValues }: { options: { value: string; count: number }[], onChange: (values: string[]) => void, selectedValues: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => 
    options.filter(option => 
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [options, searchTerm]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onChange(options.map(opt => opt.value));
    } else {
      onChange([]);
    }
  };

  const allSelected = useMemo(() => 
    options.length > 0 && selectedValues.length === options.length,
    [selectedValues, options]
  );
  
  const isIndeterminate = selectedValues.length > 0 && !allSelected;

  const checkedState = allSelected ? true : isIndeterminate ? 'indeterminate' : false;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between">
           <span className="truncate">
            {selectedValues.length > 0 ? `${selectedValues.length} selected` : `Select...`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="p-2 border-b">
          <Input 
            placeholder="Search values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="flex items-center space-x-2 p-2 border-b">
           <Checkbox
              id={`select-all-${Math.random()}`}
              checked={checkedState}
              onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
              aria-label="Select all"
            />
          <label htmlFor={`select-all-${Math.random()}`} className="text-sm font-medium cursor-pointer">Select All ({options.length})</label>
        </div>
        <ScrollArea className="h-48">
          <div className="p-1">
            {filteredOptions.length > 0 ? filteredOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent">
                <Checkbox
                  id={`${Math.random()}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={checked => {
                    const newValues = checked ? [...selectedValues, option.value] : selectedValues.filter(v => v !== option.value);
                    onChange(newValues);
                  }}
                />
                <label htmlFor={`${Math.random()}-${option.value}`} className="flex justify-between w-full text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  <span className="truncate pr-2" title={option.value}>{option.value}</span>
                  <span className="text-muted-foreground ml-auto">{option.count}</span>
                </label>
              </div>
            )) : <p className="text-center text-sm text-muted-foreground p-2">No options found.</p>}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};


export default function DataDiveDashboardUI({
  workbook,
  selectedSheets,
  onSheetSelect,
  onSelectAllSheets,
  columnMaps,
  onColumnMapChange,
  dataForTable,
  columnValueCounts,
  filterOptions,
  allHeaders,
  filterableHeaders,
  onFilterableColumnChange,
  activeFilters,
  onActiveFilterChange,
  onClearFilters,
  onCommitFilters,
  onCellEdit,
  onSaveChanges,
  editedData,
  onFileSelect,
  isProcessing,
  uploadProgress,
  uploadMessage,
  headerRow,
  onHeaderRowChange,
  currentPage,
  rowsPerPage,
  totalRows,
  onPageChange,
  onDownloadData,
  onBulkEdit,
  onReloadData,
  onViewRowDetails,
  onUndoFilter,
  onRedoFilter,
  canUndo,
  canRedo,
  onAddColumn,
  onSplitColumn,
  visibleColumns,
  onColumnVisibilityChange,
  onOpenSummaryReport,
}: DataDiveDashboardUIProps) {

  const handleFilterChange = useCallback((column: string, values: string[]) => {
    const otherFilters = activeFilters.filter(f => f.column !== column);
    if (values.length > 0) {
      onActiveFilterChange([...otherFilters, { column, values }]);
    } else {
      onActiveFilterChange(otherFilters);
    }
  }, [activeFilters, onActiveFilterChange]);

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>View & Edit Data</CardTitle>
              <CardDescription>
                Displaying rows {totalRows > 0 ? Math.min(totalRows, (currentPage - 1) * rowsPerPage + 1) : 0}-{Math.min(totalRows, currentPage * rowsPerPage)} of {totalRows}. Edit cells by clicking and save your changes.
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
              <Button variant="outline" onClick={onReloadData} disabled={isProcessing || (Object.keys(editedData).length === 0 && activeFilters.length === 0)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reload
              </Button>
               <Button variant="outline" onClick={onAddColumn} disabled={isProcessing}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Column
              </Button>
               <Button variant="outline" onClick={onSplitColumn} disabled={isProcessing || allHeaders.length === 0}>
                  <Split className="mr-2 h-4 w-4" /> Split Column
              </Button>
              <Button variant="outline" onClick={onBulkEdit} disabled={isProcessing || dataForTable.length === 0}>
                  <Edit className="mr-2 h-4 w-4" /> Bulk Edit
              </Button>
               <Button variant="outline" onClick={onOpenSummaryReport} disabled={isProcessing || dataForTable.length === 0}>
                  <FilePieChart className="mr-2 h-4 w-4" /> Summary Report
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isProcessing || dataForTable.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Download <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDownloadData('csv')}>
                    Download as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadData('xlsx')}>
                    Download as XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={isProcessing || allHeaders.length === 0}>
                      <Columns className="mr-2 h-4 w-4" /> Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                    <p className="text-sm font-medium p-2 border-b">Display Columns</p>
                    <ScrollArea className="h-72">
                        <div className="p-2 space-y-1">
                        {allHeaders.map(header => (
                            <div key={header} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`col-select-${header}`}
                                    checked={visibleColumns.includes(header)}
                                    onCheckedChange={(checked) => onColumnVisibilityChange(header, !!checked)}
                                 />
                                 <Label htmlFor={`col-select-${header}`} className="font-normal truncate cursor-pointer flex-1" title={header}>
                                     {header}
                                 </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
              </Popover>
              <Button onClick={onSaveChanges} disabled={Object.keys(editedData).length === 0 || isProcessing}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4 p-2 border rounded-lg bg-secondary/30">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4"/>Data Source</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Data Source</h4>
                      <p className="text-sm text-muted-foreground">Upload a new file and select sheets to analyze.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header-row">Header Row Number</Label>
                      <Input 
                        id="header-row"
                        type="number"
                        value={headerRow}
                        onChange={(e) => onHeaderRowChange(e.target.value)}
                        min="1"
                        className="w-full"
                        disabled={isProcessing}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={onFileSelect} disabled={isProcessing}>
                      <Upload className="mr-2 h-4 w-4" /> Change File
                    </Button>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                            id="select-all-sheets"
                            checked={selectedSheets.length === workbook.sheets.length && workbook.sheets.length > 0}
                            onCheckedChange={(checked) => onSelectAllSheets(!!checked)}
                            disabled={isProcessing}
                            />
                            <label htmlFor="select-all-sheets" className="font-medium text-sm">Select All Sheets</label>
                        </div>
                        <ScrollArea className="h-40 border rounded-md p-2">
                            {workbook.sheets.map(sheet => (
                            <div key={sheet.name} className="flex items-center space-x-2 p-1">
                                <Checkbox
                                id={`sheet-select-${sheet.name}`}
                                checked={selectedSheets.includes(sheet.name)}
                                onCheckedChange={(checked) => onSheetSelect(sheet.name, !!checked)}
                                disabled={isProcessing}
                                />
                                <label htmlFor={`sheet-select-${sheet.name}`} className="text-sm">{sheet.name}</label>
                            </div>
                            ))}
                        </ScrollArea>
                    </div>
                     {isProcessing && uploadProgress > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center text-sm"><Loader2 className="mr-2 animate-spin" /> {uploadMessage}</div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                     )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}><ListTree className="mr-2 h-4 w-4"/>Map Columns</Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                   <div className="space-y-2">
                      <h4 className="font-medium leading-none">Map Columns</h4>
                      <p className="text-sm text-muted-foreground">Map columns to standardized headers for consistent analysis.</p>
                    </div>
                    <Accordion type="single" collapsible className="w-full mt-4" disabled={isProcessing}>
                        {workbook.sheets.filter(s => selectedSheets.includes(s.name)).map(sheet => (
                        <AccordionItem value={sheet.name} key={sheet.name}>
                            <AccordionTrigger>{sheet.name}</AccordionTrigger>
                            <AccordionContent>
                            <div className="space-y-2">
                                {sheet.data.length > 0 && Object.keys(sheet.data[0]).map(header => (
                                <div key={header} className="grid grid-cols-2 gap-2 items-center">
                                    <span className="text-sm truncate" title={header}>{header}</span>
                                    <Select onValueChange={value => onColumnMapChange(sheet.name, header, value)} defaultValue={columnMaps[sheet.name]?.[header]}>
                                    <SelectTrigger><SelectValue placeholder="Select header" /></SelectTrigger>
                                    <SelectContent>
                                        {STANDARDIZED_HEADERS.map(stdHeader => (
                                        <SelectItem key={stdHeader} value={stdHeader}>{stdHeader}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </div>
                                ))}
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing || allHeaders.length === 0}><SlidersHorizontal className="mr-2 h-4 w-4"/>Filter Data</Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                   <div className="space-y-2 mb-4">
                      <h4 className="font-medium leading-none">Filter Data</h4>
                      <p className="text-sm text-muted-foreground">Build and apply filters, or manage which columns are filterable. The view will update automatically.</p>
                    </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button size="sm" variant="destructive" onClick={onCommitFilters} disabled={activeFilters.length === 0 || isProcessing}>
                              <Scissors className="mr-2 h-4 w-4" />
                              Commit Filters
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-center">Permanently reduce the dataset to the current view. <br/> Improves performance but cannot be undone.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button variant="ghost" size="sm" onClick={onClearFilters} disabled={activeFilters.length === 0 || isProcessing}>
                          <FilterX className="mr-2 h-4 w-4" />
                          Clear All Filters
                      </Button>
                      <div className="flex items-center border rounded-md">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 px-2.5 rounded-r-none border-r" onClick={onUndoFilter} disabled={!canUndo || isProcessing}>
                                    <Undo2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Undo Filter Change</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 px-2.5 rounded-l-none" onClick={onRedoFilter} disabled={!canRedo || isProcessing}>
                                    <Redo2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Redo Filter Change</p></TooltipContent>
                        </Tooltip>
                    </div>
                  </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="filters">
                            <AccordionTrigger>Filter by Values</AccordionTrigger>
                            <AccordionContent>
                                <ScrollArea className="h-72">
                                <div className="grid grid-cols-1 gap-4 pr-4 pt-2">
                                    {filterableHeaders.map(header => (
                                    <div key={header}>
                                        <label className="text-sm font-medium mb-1 block truncate" title={header}>{header}</label>
                                        <MultiSelectFilter 
                                        options={filterOptions[header] || []}
                                        selectedValues={activeFilters.find(f => f.column === header)?.values || []}
                                        onChange={(values) => handleFilterChange(header, values)}
                                        />
                                    </div>
                                    ))}
                                    {filterableHeaders.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">
                                        No filterable columns selected. Use "Manage Columns" to enable filtering.
                                    </p>
                                    )}
                                </div>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="manage-columns">
                            <AccordionTrigger>Manage Filterable Columns</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-xs text-muted-foreground pb-2">Select columns to use for filtering. Unchecking a column can improve performance.</p>
                                <ScrollArea className="h-60">
                                    <div className="space-y-1 pr-4">
                                        {allHeaders.map(header => (
                                            <div key={header} className="flex items-center space-x-2">
                                               <Checkbox
                                                  id={`filter-col-${header}`}
                                                  checked={filterableHeaders.includes(header)}
                                                  onCheckedChange={(checked) => onFilterableColumnChange(header, !!checked)}
                                               />
                                               <Label htmlFor={`filter-col-${header}`} className="font-normal truncate cursor-pointer flex-1" title={header}>
                                                   {header}
                                               </Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </PopoverContent>
              </Popover>
          </div>
          <ScrollArea className="h-[calc(100vh-25rem)] border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-20 w-12"></TableHead>
                  {visibleColumns.map(header => (
                    <TableHead key={header}>
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={header}>{header}</span>
                        {columnValueCounts[header] !== undefined && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground focus:outline-none">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{columnValueCounts[header].toLocaleString()} non-empty values</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isProcessing ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                      <p className="text-muted-foreground">Updating data view...</p>
                    </TableCell>
                  </TableRow>
                ) : dataForTable.length > 0 ? dataForTable.map((row, rowIndex) => (
                  <TableRow key={row.__id || rowIndex}>
                    <TableCell className="sticky left-0 bg-card">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewRowDetails(row)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Full Row Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    {visibleColumns.map(header => (
                      <TableCell key={header}>
                        <Input
                          type="text"
                          defaultValue={row[header]}
                          onBlur={(e) => {
                            onCellEdit(row.__id, header, e.target.value);
                          }}
                          className="border-transparent hover:border-input focus:border-primary bg-transparent"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                      No results found. Try adjusting your selections or filters, or upload a new file.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t">
            <div className="flex items-center justify-end w-full pt-4">
                {totalPages > 1 && (
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isProcessing}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || isProcessing}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
