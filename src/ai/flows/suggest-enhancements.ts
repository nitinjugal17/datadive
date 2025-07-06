'use server';

/**
 * @fileOverview Provides enhancement suggestions for the DataDive Dashboard using AI.
 *
 * - suggestEnhancements - A function that suggests enhancements for the dashboard based on user input.
 * - SuggestEnhancementsInput - The input type for the suggestEnhancements function.
 * - SuggestEnhancementsOutput - The return type for the suggestEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEnhancementsInputSchema = z.object({
  dashboardDescription: z
    .string()
    .describe('A description of the current DataDive Dashboard setup.'),
  userNeeds: z.string().describe('Specific user needs or desired improvements.'),
});
export type SuggestEnhancementsInput = z.infer<typeof SuggestEnhancementsInputSchema>;

const SuggestEnhancementsOutputSchema = z.object({
  enhancementSuggestions: z
    .string()
    .describe('AI-generated suggestions for enhancing the DataDive Dashboard.'),
});
export type SuggestEnhancementsOutput = z.infer<typeof SuggestEnhancementsOutputSchema>;

export async function suggestEnhancements(input: SuggestEnhancementsInput): Promise<SuggestEnhancementsOutput> {
  return suggestEnhancementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEnhancementsPrompt',
  input: {schema: SuggestEnhancementsInputSchema},
  output: {schema: SuggestEnhancementsOutputSchema},
  prompt: `You are an AI assistant that helps users improve their DataDive Dashboard.

The user will provide a description of their current dashboard setup and their specific needs or desired improvements.

Based on this information, provide actionable suggestions for enhancing the dashboard to better suit the user's needs.

Dashboard Description: {{{dashboardDescription}}}
User Needs: {{{userNeeds}}}

Enhancement Suggestions:`,
});

const suggestEnhancementsFlow = ai.defineFlow(
  {
    name: 'suggestEnhancementsFlow',
    inputSchema: SuggestEnhancementsInputSchema,
    outputSchema: SuggestEnhancementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
