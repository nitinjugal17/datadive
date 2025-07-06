
import fs from 'fs/promises';
import path from 'path';
import type { Template } from './types';

const templatesFilePath = path.join(process.cwd(), 'data', 'templates.json');

// Ensure the data directory and file exist with default content if needed
async function ensureFileExists() {
  try {
    await fs.access(templatesFilePath);
  } catch {
    const defaultTemplates: Template[] = [
        {
          id: 'population-data-template-1',
          name: 'Sales & Population Analysis',
          description: 'A starter template for analyzing sales and demographic data.',
          filters: [],
          columnMaps: {
            'Sales_Q1': { 'Region': 'Region', 'Sale_Date': 'Date', 'Sale_Amount': 'Amount' },
            'Sales_Q2': { 'Region': 'Region', 'Sale_Date': 'Date', 'Sale_Amount': 'Amount' }
          },
          chartConfigs: [
            { id: 'bar-template-1', type: 'bar', title: 'Sales by Region', size: 'medium', config: { xAxis: 'Region', yAxis: 'Amount' } },
          ],
          originalHeaders: [
            "Product ID",
            "Item Name",
            "Sale_Date",
            "Sale_Amount",
            "Region",
            "Neighborhood",
            "Preference_Type",
            "Users",
            "Stock ID",
            "Product Name",
            "Items In Stock",
            "Age",
            "Sex",
            "Population",
            "Population_Density",
            "Preference_Score",
            "Average_Income"
          ]
        }
    ];
    await fs.mkdir(path.dirname(templatesFilePath), { recursive: true });
    await fs.writeFile(templatesFilePath, JSON.stringify(defaultTemplates, null, 2), 'utf-8');
  }
}

export async function readTemplates(): Promise<Template[]> {
  await ensureFileExists();
  const fileContent = await fs.readFile(templatesFilePath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function writeTemplates(templates: Template[]): Promise<void> {
  await ensureFileExists();
  await fs.writeFile(templatesFilePath, JSON.stringify(templates, null, 2), 'utf-8');
}
