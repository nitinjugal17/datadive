
'use server';

/**
 * @fileOverview AI-powered template suggestion flow.
 *
 * - suggestTemplate - A function that suggests a template based on worksheet headers.
 * - SuggestTemplateInput - The input type for the suggestTemplate function.
 * - SuggestTemplateOutput - The return type for the suggestTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STANDARDIZED_HEADERS } from '@/lib/mock-data';

const SuggestTemplateInputSchema = z.object({
  worksheetHeaders: z.array(z.string()).describe('An array of column headers from the user\'s uploaded worksheet.'),
});
export type SuggestTemplateInput = z.infer<typeof SuggestTemplateInputSchema>;

const SuggestTemplateOutputSchema = z.object({
  name: z.string().describe('A concise, descriptive name for the template. e.g., "Sales Analysis" or "Inventory Management".'),
  description: z.string().describe('A brief, one-sentence description of what this template is useful for.'),
  columnMaps: z.record(z.string()).describe('A JSON object mapping the original worksheet headers to the standardized headers. Only include mappings that are highly relevant. Omit headers that do not have a clear mapping.'),
});
export type SuggestTemplateOutput = z.infer<typeof SuggestTemplateOutputSchema>;

export async function suggestTemplate(input: SuggestTemplateInput): Promise<SuggestTemplateOutput> {
  return suggestTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTemplatePrompt',
  input: {schema: SuggestTemplateInputSchema},
  output: {schema: SuggestTemplateOutputSchema},
  prompt: `You are an expert in data analysis and dashboard configuration. Your task is to suggest a useful template for a user based on the column headers from their uploaded data.

The user has a dataset with the following headers:
{{#each worksheetHeaders}}
- {{{this}}}
{{/each}}

You need to provide a template name, a description, and a mapping of their headers to a predefined list of standardized headers.

The available standardized headers are: ${STANDARDIZED_HEADERS.join(', ')}.

Based on the user's headers, create a relevant template name and description. Then, create a 'columnMaps' object. In this object, the keys should be the original headers from the user's data, and the values should be the most appropriate standardized header from the list.

**IMPORTANT RULES:**
1. Only map headers that have a strong, logical connection.
2. If an original header doesn't fit any standardized header well, DO NOT include it in the 'columnMaps' object.
3. The output must be a valid JSON object matching the provided schema.

Analyze the user's headers and provide your suggestion.`,
});

const suggestTemplateFlow = ai.defineFlow(
  {
    name: 'suggestTemplateFlow',
    inputSchema: SuggestTemplateInputSchema,
    outputSchema: SuggestTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
