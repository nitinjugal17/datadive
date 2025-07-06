'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getRowColumnDetails } from '@/ai/flows/get-row-column-details';
import { suggestEnhancements } from '@/ai/flows/suggest-enhancements';
import { Loader2, Info, Sparkles, Lightbulb } from 'lucide-react';

interface UserGuideProps {
  workbookData: string;
}

export default function UserGuide({ workbookData }: UserGuideProps) {
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const [enhancementRequest, setEnhancementRequest] = useState('');
  const [enhancementResult, setEnhancementResult] = useState('');
  const [isEnhancementLoading, setIsEnhancementLoading] = useState(false);

  const handleQuerySubmit = async () => {
    if (!query) return;
    setIsQueryLoading(true);
    setQueryResult('');
    try {
      const result = await getRowColumnDetails({ worksheetData: workbookData, query });
      setQueryResult(result.details);
    } catch (error) {
      console.error(error);
      setQueryResult('An error occurred while fetching details.');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleEnhancementSubmit = async () => {
    setIsEnhancementLoading(true);
    setEnhancementResult('');
    try {
      const result = await suggestEnhancements({
        dashboardDescription: 'A dashboard for loading workbook data, mapping columns, filtering, and viewing data in a table with charts.',
        userNeeds: enhancementRequest || 'General improvements for data analysis and usability.',
      });
      setEnhancementResult(result.enhancementSuggestions);
    } catch (error) {
      console.error(error);
      setEnhancementResult('An error occurred while fetching suggestions.');
    } finally {
      setIsEnhancementLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>How to Use DataDive</CardTitle>
          <CardDescription>A quick guide to get you started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Step 1: Upload & Select Sheets</AccordionTrigger>
              <AccordionContent>
                Start by uploading an Excel or CSV file. Once uploaded, you'll see a list of all sheets in the workbook. Use the checkboxes to select the sheets you want to include in your analysis. You can select individual sheets or all of them at once.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Step 2: Map Columns</AccordionTrigger>
              <AccordionContent>
                For each selected sheet, map its original columns to the app's standardized headers (e.g., 'Product', 'Date', 'Amount'). This step is crucial for combining data from different sheets and enabling consistent filtering and charting.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Step 3: Filter Data</AccordionTrigger>
              <AccordionContent>
                Use the filter controls to narrow down your dataset. You can apply multiple filters across different columns. The data table and charts will update dynamically as you change your filter selections.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>Step 4: View, Edit & Save</AccordionTrigger>
              <AccordionContent>
                The main table displays your processed data. You can click on any cell to edit its value. Once you're done with your edits, click the "Save Changes" button. This will update the data for your current session.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Info className="mr-2 text-primary" /> Ask About Your Data</CardTitle>
          <CardDescription>Use AI to get insights from your uploaded data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 'What is the total sales amount for the North region?' or 'List all products with sales in Q1.'"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button onClick={handleQuerySubmit} disabled={isQueryLoading}>
            {isQueryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Details
          </Button>
          {queryResult && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Response</AlertTitle>
              <AlertDescription className="prose prose-sm max-w-none whitespace-pre-wrap">{queryResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Lightbulb className="mr-2 text-primary" /> Suggest Enhancements</CardTitle>
          <CardDescription>Get AI-powered ideas to improve your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Textarea
            placeholder="Describe any specific needs or improvements you have in mind (optional)."
            value={enhancementRequest}
            onChange={e => setEnhancementRequest(e.target.value)}
          />
          <Button onClick={handleEnhancementSubmit} disabled={isEnhancementLoading}>
            {isEnhancementLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Ideas
          </Button>
          {enhancementResult && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Suggestions</AlertTitle>
              <AlertDescription className="prose prose-sm max-w-none whitespace-pre-wrap">{enhancementResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
