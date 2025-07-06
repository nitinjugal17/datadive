'use server';
/**
 * @fileOverview This file defines a Genkit flow for retrieving details about rows and columns from a worksheet.
 *
 * - getRowColumnDetails - A function that handles the retrieval of details about rows and columns from a worksheet.
 * - GetRowColumnDetailsInput - The input type for the getRowColumnDetails function.
 * - GetRowColumnDetailsOutput - The return type for the getRowColumnDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRowColumnDetailsInputSchema = z.object({
  worksheetData: z.string().describe('The data from the uploaded worksheet, expected in JSON format.'),
  query: z.string().describe('The user query for details about specific rows, columns, or values.'),
});
export type GetRowColumnDetailsInput = z.infer<typeof GetRowColumnDetailsInputSchema>;

const GetRowColumnDetailsOutputSchema = z.object({
  details: z.string().describe('The details about the requested rows, columns, or values.'),
});
export type GetRowColumnDetailsOutput = z.infer<typeof GetRowColumnDetailsOutputSchema>;

export async function getRowColumnDetails(input: GetRowColumnDetailsInput): Promise<GetRowColumnDetailsOutput> {
  return getRowColumnDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRowColumnDetailsPrompt',
  input: {schema: GetRowColumnDetailsInputSchema},
  output: {schema: GetRowColumnDetailsOutputSchema},
  prompt: `You are an AI assistant designed to provide details about data from a worksheet.

You have access to the following worksheet data in JSON format:
{{{worksheetData}}}

The user has the following query:
{{{query}}}

Provide a detailed explanation based on the worksheet data to fulfill the user's query.`,
});

const getRowColumnDetailsFlow = ai.defineFlow(
  {
    name: 'getRowColumnDetailsFlow',
    inputSchema: GetRowColumnDetailsInputSchema,
    outputSchema: GetRowColumnDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
