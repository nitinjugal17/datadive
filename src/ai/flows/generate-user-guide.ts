'use server';

/**
 * @fileOverview AI-powered user guide generation flow.
 *
 * - generateUserGuide - A function that generates a user guide for the dashboard.
 * - GenerateUserGuideInput - The input type for the generateUserGuide function.
 * - GenerateUserGuideOutput - The return type for the generateUserGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUserGuideInputSchema = z.object({
  dashboardFeatures: z
    .string()
    .describe('A description of the dashboard features and functionalities.'),
});
export type GenerateUserGuideInput = z.infer<typeof GenerateUserGuideInputSchema>;

const GenerateUserGuideOutputSchema = z.object({
  userGuide: z.string().describe('The generated user guide for the dashboard.'),
});
export type GenerateUserGuideOutput = z.infer<typeof GenerateUserGuideOutputSchema>;

export async function generateUserGuide(input: GenerateUserGuideInput): Promise<GenerateUserGuideOutput> {
  return generateUserGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUserGuidePrompt',
  input: {schema: GenerateUserGuideInputSchema},
  output: {schema: GenerateUserGuideOutputSchema},
  prompt: `You are an AI assistant designed to create user guides for dashboards.

  Based on the provided dashboard features and functionalities, create a comprehensive user guide that includes clear instructions, examples, and tips for users to quickly understand and effectively use the dashboard.

  Dashboard Features and Functionalities: {{{dashboardFeatures}}}

  User Guide:
  `,
});

const generateUserGuideFlow = ai.defineFlow(
  {
    name: 'generateUserGuideFlow',
    inputSchema: GenerateUserGuideInputSchema,
    outputSchema: GenerateUserGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
