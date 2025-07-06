
export type Sheet = {
  name: string;
  data: Record<string, string | number>[];
};

export type Workbook = {
  sheets: Sheet[];
};

export const MOCK_WORKBOOK_DATA: Workbook = {
  sheets: [
    {
      name: 'Sales_Q1',
      data: [
        { 'Product ID': 'P001', 'Item Name': 'Laptop', 'Sale_Date': '2024-01-15', 'Sale_Amount': 1200, 'Region': 'North' },
        { 'Product ID': 'P002', 'Item Name': 'Mouse', 'Sale_Date': '2024-01-20', 'Sale_Amount': 25, 'Region': 'North' },
        { 'Product ID': 'P003', 'Item Name': 'Keyboard', 'Sale_Date': '2024-02-10', 'Sale_Amount': 75, 'Region': 'South' },
        { 'Product ID': 'P001', 'Item Name': 'Laptop', 'Sale_Date': '2024-02-18', 'Sale_Amount': 1250, 'Region': 'South' },
        { 'Product ID': 'P004', 'Item Name': 'Monitor', 'Sale_Date': '2024-03-05', 'Sale_Amount': 300, 'Region': 'East' },
      ],
    },
    {
      name: 'Sales_Q2',
      data: [
        { 'Product ID': 'P002', 'Item Name': 'Mouse', 'Sale_Date': '2024-04-12', 'Sale_Amount': 28, 'Region': 'East' },
        { 'Product ID': 'P005', 'Item Name': 'Webcam', 'Sale_Date': '2024-04-22', 'Sale_Amount': 50, 'Region': 'West' },
        { 'Product ID': 'P001', 'Item Name': 'Laptop', 'Sale_Date': '2024-05-10', 'Sale_Amount': 1150, 'Region': 'West' },
        { 'Product ID': 'P004', 'Item Name': 'Monitor', 'Sale_Date': '2024-05-25', 'Sale_Amount': 320, 'Region': 'North' },
        { 'Product ID': 'P003', 'Item Name': 'Keyboard', 'Sale_Date': '2024-06-15', 'Sale_Amount': 80, 'Region': 'North' },
      ],
    },
    {
      name: 'User_Preferences',
      data: [
        { 'Neighborhood': 'Downtown', 'Preference_Type': 'Restaurants', 'Users': 120 },
        { 'Neighborhood': 'Downtown', 'Preference_Type': 'Shopping', 'Users': 80 },
        { 'Neighborhood': 'Downtown', 'Preference_Type': 'Parks', 'Users': 45 },
        { 'Neighborhood': 'Uptown', 'Preference_Type': 'Restaurants', 'Users': 70 },
        { 'Neighborhood': 'Uptown', 'Preference_Type': 'Shopping', 'Users': 95 },
        { 'Neighborhood': 'Uptown', 'Preference_Type': 'Parks', 'Users': 60 },
        { 'Neighborhood': 'Suburbia', 'Preference_Type': 'Restaurants', 'Users': 50 },
        { 'Neighborhood': 'Suburbia', 'Preference_Type': 'Shopping', 'Users': 60 },
        { 'Neighborhood': 'Suburbia', 'Preference_Type': 'Parks', 'Users': 150 },
      ]
    },
    {
        name: 'Inventory',
        data: [
            { 'Stock ID': 'S001', 'Product Name': 'Laptop', 'Items In Stock': 50 },
            { 'Stock ID': 'S002', 'Product Name': 'Mouse', 'Items In Stock': 200 },
            { 'Stock ID': 'S003', 'Product Name': 'Keyboard', 'Items In Stock': 150 },
            { 'Stock ID': 'S004', 'Product Name': 'Monitor', 'Items In Stock': 75 },
            { 'Stock ID': 'S005', 'Product Name': 'Webcam', 'Items In Stock': 100 },
        ]
    },
    {
      name: 'Demographics',
      data: [
        { 'Age': '0-9', 'Sex': 'Male', 'Population': 1800 },
        { 'Age': '0-9', 'Sex': 'Female', 'Population': 1750 },
        { 'Age': '10-19', 'Sex': 'Male', 'Population': 2000 },
        { 'Age': '10-19', 'Sex': 'Female', 'Population': 1950 },
        { 'Age': '20-29', 'Sex': 'Male', 'Population': 2200 },
        { 'Age': '20-29', 'Sex': 'Female', 'Population': 2150 },
        { 'Age': '30-39', 'Sex': 'Male', 'Population': 2100 },
        { 'Age': '30-39', 'Sex': 'Female', 'Population': 2050 },
        { 'Age': '40-49', 'Sex': 'Male', 'Population': 1900 },
        { 'Age': '40-49', 'Sex': 'Female', 'Population': 1850 },
        { 'Age': '50-59', 'Sex': 'Male', 'Population': 1700 },
        { 'Age': '50-59', 'Sex': 'Female', 'Population': 1750 },
        { 'Age': '60-69', 'Sex': 'Male', 'Population': 1400 },
        { 'Age': '60-69', 'Sex': 'Female', 'Population': 1500 },
        { 'Age': '70-79', 'Sex': 'Male', 'Population': 900 },
        { 'Age': '70-79', 'Sex': 'Female', 'Population': 1100 },
        { 'Age': '80+', 'Sex': 'Male', 'Population': 400 },
        { 'Age': '80+', 'Sex': 'Female', 'Population': 600 },
      ]
    },
    {
      name: 'Neighborhood_Analysis',
      data: [
        { 'Neighborhood': 'Metro Core', 'Population_Density': 9500, 'Preference_Score': 85, 'Average_Income': 75000 },
        { 'Neighborhood': 'Historic District', 'Population_Density': 6200, 'Preference_Score': 92, 'Average_Income': 88000 },
        { 'Neighborhood': 'The Suburbs', 'Population_Density': 2100, 'Preference_Score': 65, 'Average_Income': 105000 },
        { 'Neighborhood': 'Lakeside', 'Population_Density': 3500, 'Preference_Score': 78, 'Average_Income': 92000 },
        { 'Neighborhood': 'University Heights', 'Population_Density': 8800, 'Preference_Score': 70, 'Average_Income': 55000 },
        { 'Neighborhood': 'Industrial Park', 'Population_Density': 500, 'Preference_Score': 25, 'Average_Income': 60000 },
      ]
    }
  ],
};

export const STANDARDIZED_HEADERS = ['Product', 'Date', 'Amount', 'Region', 'ID', 'Stock', 'Age', 'Sex', 'Population', 'Neighborhood', 'Preference_Type', 'Users', 'Population_Density', 'Preference_Score', 'Average_Income'];
