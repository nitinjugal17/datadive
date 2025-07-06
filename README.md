# DataDive Dashboard

DataDive Dashboard is a powerful, browser-based data analysis and visualization tool designed for rapid data exploration, transformation, and reporting. Built with a modern tech stack, it allows users to upload raw data from various sources, clean and map it, apply dynamic filters, and generate insightful charts and reports—all without writing a single line of code.

![DataDive Dashboard Screenshot](https://placehold.co/800x450.png?text=DataDive+Dashboard+UI)
*(A placeholder for a screenshot of the application UI)*

---

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started & Usage](#getting-started--usage)
  - [1. Loading Data](#1-loading-data)
  - [2. Mapping Columns](#2-mapping-columns)
  - [3. Filtering Data](#3-filtering-data)
  - [4. Editing & Transforming Data](#4-editing--transforming-data)
  - [5. Creating Visualizations](#5-creating-visualizations)
  - [6. Generating Reports](#6-generating-reports)
- [Technical Deep Dive](#technical-deep-dive)
  - [File Handling & Parsing](#file-handling--parsing)
  - [Data Processing Pipeline](#data-processing-pipeline)
  - [State & Session Management](#state--session-management)
  - [AI-Powered Features](#ai-powered-features)
- [Example Scenarios](#example-scenarios)
  - [Scenario 1: Sales Analysis](#scenario-1-sales-analysis)
  - [Scenario 2: Market Research](#scenario-2-market-research)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

DataDive provides a rich, interactive experience for data analysis with the following core features:

-   **Multi-Source Data Loading**: Upload data from local `.csv`, `.xls`, and `.xlsx` files. You can also connect directly to a NocoBase API endpoint to fetch live data.
-   **Multi-Sheet Analysis**: The application can read and process data from multiple sheets within an Excel workbook, allowing you to combine and analyze them as a single dataset.
-   **Dynamic Column Mapping**:
    -   **Manual Mapping**: Standardize your data by mapping original column headers to a predefined set of headers. This is crucial for combining data and creating consistent charts.
    -   **AI-Powered Suggestions**: Leverage AI to analyze your column headers and suggest a relevant template with appropriate mappings, saving you time and effort.
-   **Advanced Filtering & Search**:
    -   **Multi-Value Filtering**: Filter data by selecting multiple values within any designated column.
    -   **Global Search**: Instantly search across the entire dataset.
    -   **Filter History**: Undo and redo filter changes, allowing you to easily navigate through your analysis states.
    -   **Filter Committing**: For very large datasets, permanently reduce the in-session data to the filtered view to improve performance.
-   **In-Place Data Transformation**:
    -   **Cell Editing**: Click on any cell in the data table to edit its value directly.
    -   **Bulk Edit**: Apply a single value to an entire column for all visible rows.
    -   **Add & Split Columns**: Create new, empty columns or split an existing column into multiple new ones based on a delimiter.
-   **Interactive Charting Dashboard**:
    -   **Variety of Chart Types**: Includes Bar, Line, Area, Pie, Scatter, Bubble, Funnel, Radar, Histogram, Tree Maps, and Population Pyramids.
    -   **Deep Configurability**: Customize charts by changing axes, adding series for grouping/stacking, modifying aggregation methods (sum, average, count, etc.), changing layouts, and sorting.
    -   **Small Multiples (Faceting)**: Break down Line and Radar charts into smaller, segmented views based on a category column.
    -   **Expand View**: Enlarge any chart to a full-screen modal for detailed inspection.
-   **Powerful Reporting Tools**:
    -   **Custom Pivot Reports**: Generate detailed pivot tables by selecting columns for rows, a column to pivot into new headers, and a value column for aggregation.
    -   **Custom Group Reports**: Group unique values from one column into new categories (e.g., group "USA" and "Canada" into "North America") and see a breakdown of counts.
    -   **Formatted Excel Exports**: Download all reports as professionally formatted `.xlsx` files with styled headers, borders, and totals.
-   **Session & Template Management**:
    -   **Local Session Saving**: Save your entire dashboard state—including filters, mappings, and chart configurations—to your browser's local storage for your next session.
    -   **Server-Side Templates**: Save your dashboard layout as a reusable template. Templates can be saved with or without the associated data file and are protected by a password for deletion.
-   **Performance Management**:
    -   **Memory Monitoring**: A live memory usage indicator helps you monitor resource consumption.
    -   **Adjustable Performance Settings**: Fine-tune CSV parsing chunk size and processing yield rates to balance performance and UI responsiveness for your specific hardware.
    -   **Cancellable Operations**: All long-running operations (file uploads, data processing) can be cancelled, preventing browser lock-ups.
-   **AI-Assisted Analysis**:
    -   **Data Q&A**: Ask natural language questions about your data (e.g., "What is the total sales for the North region?") and get AI-generated answers.
    -   **Enhancement Suggestions**: Get AI-powered ideas on how to improve your dashboard based on your current setup.

---

## Technology Stack

This application is built using a modern, robust set of technologies:

-   **Frontend Framework**: [**Next.js**](https://nextjs.org/) (with App Router) for a high-performance, server-first React application.
-   **UI Library**: [**React**](https://react.dev/) for building the interactive user interface, heavily utilizing Hooks for state management.
-   **Language**: [**TypeScript**](https://www.typescriptlang.org/) for static typing, improving code quality and maintainability.
-   **Styling**: [**Tailwind CSS**](https://tailwindcss.com/) for a utility-first styling approach, combined with [**ShadCN UI**](https://ui.shadcn.com/) for a beautiful, accessible, and customizable component library.
-   **AI Integration**: [**Genkit**](https://firebase.google.com/docs/genkit) (from Google) is used for all generative AI features, orchestrating calls to large language models (LLMs).
-   **Charting**: [**Recharts**](https://recharts.org/) for creating responsive and highly customizable charts.
-   **File Parsing**: [**Papaparse**](https://www.papaparse.com/) for robust client-side CSV parsing and [**SheetJS (xlsx)**](https://sheetjs.com/) for handling Excel files.
-   **Deployment**: The application is configured for seamless deployment on [**Firebase App Hosting**](https://firebase.google.com/docs/app-hosting).

---

## Getting Started & Usage

### 1. Loading Data

You can load data in three ways from the "Data Source" popover in the Dashboard tab:

1.  **File Upload**: Click "Change File" to upload a `.csv`, `.xls`, or `.xlsx` file from your computer.
2.  **NocoBase API**: In the "Actions" dropdown, select "Connect to NocoBase", enter your API URL and token (if required) to load data directly.
3.  **Saved Template with Data**: In the "Templates" tab, apply a template that was previously saved with a data file.

After loading a file, select the sheets you want to analyze from the checklist. You can also specify the **Header Row Number** if your data doesn't start on the first line.

### 2. Mapping Columns

To ensure consistent analysis, especially when combining sheets, map your original column headers to standardized ones in the "Map Columns" popover. For example, you can map `Transaction_Value` and `SalePrice` from different sheets to a single standardized header called `Amount`.

For a head start, use the **AI Template Suggester** in the "Templates" tab to get an intelligent mapping suggestion based on your column names.

### 3. Filtering Data

In the "Filter Data" popover:

-   **Filter by Values**: Select one or more values from the multi-select dropdown for any filterable column. The dashboard updates automatically.
-   **Manage Columns**: To improve performance, you can choose which columns appear in the filter list.
-   **Undo/Redo**: Use the arrow buttons to step back and forth through your filter history.
-   **Commit Filters**: To improve performance on huge datasets, you can click "Commit Filters" to permanently reduce the in-memory dataset to only the filtered rows. **This action is irreversible for the current session.**

### 4. Editing & Transforming Data

Directly from the data table on the dashboard, you can:

-   **Edit a Cell**: Click any cell, type a new value, and click away. The change is staged. Click "Save Changes" to apply it to the session data.
-   **Add a Column**: Click "Add Column", provide a unique name, and a new empty column will be added.
-   **Split a Column**: Click "Split Column", select a source column, a delimiter (like a comma or space), and provide names for the new columns. This is useful for separating first and last names, for example.

### 5. Creating Visualizations

Navigate to the "Charts" tab to build your visual dashboard.

-   **Add a Chart**: Click "Add Chart" and select from a wide array of types.
-   **Configure**: For each chart card, use the dropdowns to select columns for the X-axis, Y-axis, Series, etc. The chart will update live as you configure it.
-   **Save & Rename**: Use the options menu (three dots) on each chart to rename it, clone it, or delete it.

### 6. Generating Reports

From the "Actions" menu, you can create two types of reports:

-   **Custom Pivot Report**: This powerful tool lets you create a pivot table.
    -   **Report on Sheet(s)**: Choose which of your selected sheets to include.
    -   **Group by (Rows)**: Select one or more columns that will define the rows of your report.
    -   **Pivot On (Columns)**: Select a column whose unique values will become the new columns of your report.
    -   **Values & Aggregation**: Select the column with the numbers to aggregate and how to aggregate them (e.g., Sum, Average).
-   **Custom Group Report**: This report is for categorizing data.
    -   **Column to Group**: The column containing values you want to group (e.g., a 'Country' column).
    -   **Mappings**: Define how to group them. Example: `North_America=USA,Canada,Mexico`.
    -   The report will show counts for each new group and a breakdown of the original values within it.

All generated reports can be downloaded as beautifully formatted Excel files.

---

## Technical Deep Dive

### File Handling & Parsing

The application performs all file parsing on the **client-side** to ensure data privacy and reduce server load.

-   **CSV Parsing**: `Papaparse` is used with its `worker: true` option, moving the parsing work to a separate thread to keep the UI responsive. For large files, it reads the file in chunks of a configurable size (`chunkSizeMB`).
-   **Excel Parsing**: `SheetJS (xlsx)` is used to read `.xls` and `.xlsx` files. It parses the entire file into a workbook structure in memory.
-   **Cancellable Operations**: All file parsing operations use a native `AbortController`. This allows the user to cancel a long-running upload at any time, immediately stopping the process and freeing up resources.
-   **Encoding**: CSV parsing is standardized to `UTF-8` to ensure correct handling of international characters. String comparisons during filtering and sorting use `localeCompare` to handle different languages and natural numeric sorting correctly.

### Data Processing Pipeline

The `useDataPipeline` hook is the core of the application's reactivity. It creates a processing chain that is re-evaluated whenever a dependency changes (e.g., filters are applied, search term is updated). The pipeline performs the following steps in order:

1.  **Combine & Map**: Merges data from all selected sheets and applies the user-defined column mappings.
2.  **Filter & Search**: Applies active filters and the global search term to the combined data.
3.  **Paginate**: Extracts the correct slice of data for the current page to be displayed in the table.
4.  **Chart Data Generation**: Prepares the full, filtered dataset for the charting components. For performance, if the dataset exceeds a threshold (`5000` rows), it will generate a representative sample. The user can force a one-time update using the full dataset if needed.

The entire pipeline is asynchronous and uses a `yieldToMain` helper function, which pauses execution briefly to allow the UI to update, preventing the browser from freezing during heavy operations.

### State & Session Management

-   **Component State**: Standard React `useState` and `useReducer` hooks manage the UI and data state.
-   **Local Session Persistence**: The "Save Settings" feature serializes the dashboard state (filters, mappings, chart layouts, and optionally the workbook data) into JSON and saves it to the browser's `localStorage`. This allows users to resume their session later.
-   **Server-Side Templates**: For more permanent and shareable configurations, templates are used.
    -   A template is a JSON object describing the entire dashboard layout.
    -   When saved, this JSON is sent to a Next.js API route (`/api/templates`) and stored in a JSON file (`/data/templates.json`) on the server.
    -   If "Save current data file" is checked, the original data file is first uploaded to the server (`/uploads` directory), and its path is stored in the template.
    -   Template deletion is protected by a password stored as an environment variable (`DELETE_PASSWORD`) on the server.

### AI-Powered Features

The application uses **Genkit** to integrate with Google's Generative AI models.

-   **Flows**: Genkit `flows` are defined in `src/ai/flows/`. These are server-side functions that structure prompts, define input/output schemas using `Zod`, and call the AI model.
-   **Template Suggestion**: The `suggest-template` flow receives the user's column headers and asks the model to return a suitable name, description, and column mapping based on its understanding of common data analysis patterns.
-   **Data Q&A**: The `get-row-column-details` flow receives the user's data (as a JSON string) and their natural language query. It instructs the model to act as a data analyst and answer the question based on the provided data.

---

## Example Scenarios

### Scenario 1: Sales Analysis

A sales manager receives two separate Excel files for Q1 and Q2 sales.

1.  She uploads the Q1 file and sees two sheets: `North_America_Sales` and `EMEA_Sales`. She selects both.
2.  She notices the amount column is named `TransactionTotal` in one sheet and `SaleValue` in the other. She uses the "Map Columns" feature to map both to the standardized header `Amount`.
3.  She loads the Q2 file, which replaces the Q1 data, and performs the same mapping. *(Note: A future feature could allow merging files.)*
4.  In the "Charts" tab, she creates a stacked bar chart with `Date` on the X-axis, `Amount` on the Y-axis, and `Region` as the series to see regional performance over time.
5.  She creates a "Custom Pivot Report" with `Product_Category` as the rows, `Region` as the pivot/columns, and `Amount` (sum) as the values.
6.  She downloads the report as a formatted Excel file to share with her team.
7.  Finally, she clicks "Save Layout as Template" to save this configuration as "Quarterly Sales Review" for future use.

### Scenario 2: Market Research

A researcher has a spreadsheet containing user preference survey data and another with neighborhood demographics.

1.  He uploads the preference data and maps the relevant columns.
2.  He uses the "Split Column" feature to separate a `City, State` column into two distinct columns.
3.  He uses the "Custom Group Report" feature to group several smaller neighborhoods into larger districts (e.g., `Downtown=Core,Wharf,Center`).
4.  He saves the cleaned data by downloading it as a CSV.
5.  He then loads the demographic data and creates a Scatter Plot chart to visualize the relationship between `Average_Income` and `Preference_Score`.
6.  He saves this layout as a "Demographic Analysis" template.

---

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine.
3.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/my-new-feature` or `bugfix/issue-name`.
4.  **Make your changes** and commit them with clear, descriptive messages.
5.  **Push your changes** to your fork: `git push origin feature/my-new-feature`.
6.  **Create a pull request** from your fork to the main repository, detailing the changes you've made.

Please ensure your code adheres to the existing coding style and all tests pass.

---

## License

This project is licensed under the GNU General Public License v3.0.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
