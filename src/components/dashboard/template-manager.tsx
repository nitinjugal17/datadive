
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestTemplate } from '@/ai/flows/suggest-template';
import { Loader2, PlusCircle, Trash2, Wand2, Sparkles, CheckCircle, Pencil, Database, Lock } from 'lucide-react';
import type { Template, ColumnMapping } from '@/lib/types';
import type { Workbook } from '@/lib/mock-data';

interface TemplateManagerProps {
  templates: Template[];
  isUnlocked: boolean;
  onUnlock: () => void;
  onSaveTemplate: () => void;
  onApplyTemplate: (template: Template) => void;
  onApplyTemplateWithData: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  onApplySuggestedMap: (suggestedMap: Record<string, ColumnMapping>) => void;
  allHeaders: string[];
  workbook: Workbook;
}

export default function TemplateManager({
  templates,
  isUnlocked,
  onUnlock,
  onSaveTemplate,
  onApplyTemplate,
  onApplyTemplateWithData,
  onEditTemplate,
  onDeleteTemplate,
  onApplySuggestedMap,
  allHeaders,
  workbook,
}: TemplateManagerProps) {
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<{ name: string; description: string; columnMaps: Record<string, ColumnMapping> } | null>(null);
  const [suggestionError, setSuggestionError] = useState('');

  const originalHeaders = useMemo(() => {
    const headers = new Set<string>();
    workbook.sheets.forEach(sheet => {
        if (sheet.data.length > 0) {
            Object.keys(sheet.data[0]).forEach(header => headers.add(header));
        }
    });
    return Array.from(headers);
  }, [workbook]);

  const handleSuggestionSubmit = async () => {
    setIsSuggestionLoading(true);
    setSuggestionResult(null);
    setSuggestionError('');
    try {
      if (originalHeaders.length === 0) {
        setSuggestionError('No data loaded. Please upload a file to get suggestions.');
        return;
      }
      const result = await suggestTemplate({ worksheetHeaders: originalHeaders });
      setSuggestionResult(result);
    } catch (error) {
      console.error(error);
      setSuggestionError('An error occurred while fetching suggestions.');
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestionResult) {
        const suggestedMapForSheet: ColumnMapping = {};
        Object.entries(suggestionResult.columnMaps).forEach(([original, standardized]) => {
            suggestedMapForSheet[original] = standardized;
        });
        
        // Create a map object where each sheet gets the same suggested mapping
        const fullSuggestedMap: Record<string, ColumnMapping> = {};
        workbook.sheets.forEach(sheet => {
            fullSuggestedMap[sheet.name] = suggestedMapForSheet;
        });

        onApplySuggestedMap(fullSuggestedMap);
    }
  };
  
  if (!isUnlocked) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Template Library Locked</CardTitle>
                <CardDescription>
                    For security, the template library is locked. Please enter the password to proceed.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Button onClick={onUnlock}>Unlock Templates</Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Wand2 className="mr-2 text-primary" /> AI Template Suggester</CardTitle>
                <CardDescription>Get an AI-powered template suggestion based on your uploaded data's column headers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleSuggestionSubmit} disabled={isSuggestionLoading}>
                    {isSuggestionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Suggest a Template
                </Button>
                {suggestionError && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{suggestionError}</AlertDescription>
                    </Alert>
                )}
                {suggestionResult && (
                    <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle>AI Suggestion: {suggestionResult.name}</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>{suggestionResult.description}</p>
                            <div className="text-xs">
                                <h4 className="font-semibold">Suggested Mappings:</h4>
                                <ul className="list-disc pl-5">
                                    {Object.entries(suggestionResult.columnMaps).map(([original, standardized]) => (
                                        <li key={original}>`{original}` → `{standardized}`</li>
                                    ))}
                                </ul>
                            </div>
                           <Button size="sm" variant="outline" className="mt-2" onClick={handleApplySuggestion}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Apply this mapping
                           </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Template Library</CardTitle>
                    <CardDescription>Apply a saved template or create a new one from your current view.</CardDescription>
                </div>
                <Button onClick={onSaveTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save Current View as Template
                </Button>
            </CardHeader>
            <CardContent>
                {templates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No templates saved yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map(template => (
                            <Card key={template.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{template.name}</CardTitle>
                                    <CardDescription>{template.description || "No description."}</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto flex justify-between items-center">
                                     <Button variant="outline" onClick={() => template.dataFilePath ? onApplyTemplateWithData(template) : onApplyTemplate(template)}>
                                        {template.dataFilePath && <Database className="mr-2 h-4 w-4" />}
                                        {template.dataFilePath ? 'Apply with Data' : 'Apply'}
                                    </Button>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" onClick={() => onEditTemplate(template)}>
                                          <Pencil className="h-4 w-4" />
                                          <span className="sr-only">Edit template</span>
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => onDeleteTemplate(template.id)}>
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                          <span className="sr-only">Delete template</span>
                                      </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
