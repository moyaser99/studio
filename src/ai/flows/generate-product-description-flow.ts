'use server';
/**
 * @fileOverview An AI agent for generating compelling product descriptions in both Arabic and English.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product (e.g., Makeup, Skincare, Haircare).'),
  keyFeatures: z
    .array(z.string())
    .describe('A list of key features or benefits of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  descriptionAr: z
    .string()
    .describe('A compelling and optimized product description in Arabic.'),
  descriptionEn: z
    .string()
    .describe('A compelling and optimized product description in English.'),
});
export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter for an e-commerce beauty store called 'YourGroceriesUSA'.
Your task is to create a compelling and optimized product description based on the provided details.
The description should be engaging, highlight key benefits, and encourage customers to purchase.
Focus on a modern, clean, and elegant tone consistent with beauty store aesthetics.

Please provide the output in BOTH Arabic and English.

Product Name: {{{productName}}}
Category: {{{category}}}
Key Features:
{{#each keyFeatures}}- {{{this}}}
{{/each}}`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
