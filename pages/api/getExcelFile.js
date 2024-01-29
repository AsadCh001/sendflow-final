import fetch from 'node-fetch';
import ExcelJS from 'exceljs';

const processExcelFile = async (req, res) => {
  try {
    // Extract the excelFile URL from the request
    const excelFile = req.body.filename || req.query.filename;
    if (!excelFile) {
      return res.status(400).json({ message: 'No Excel file URL provided.' });
    }

    // Fetch the Excel file from the Cloudinary URL
    const response = await fetch(excelFile);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const fileData = await response.buffer();

    // Load the file data into ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileData);

    // Process the first worksheet
    const worksheet = workbook.getWorksheet(1);
    const jsonData = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData[`column${colNumber}`] = cell.value;
      });
      jsonData.push(rowData);
    });

    // Respond with the processed data
    res.status(200).json({ message: 'Excel file processed successfully.', data: jsonData });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ message: 'An error occurred while processing the Excel file.' });
  }
};

export default processExcelFile;
