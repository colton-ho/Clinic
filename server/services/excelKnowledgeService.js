const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

let knowledge = {
  customerFields: [],
  customerFieldsByCategory: {},
  preMedFields: [],
  marketing: null,
  staffFaqs: [],
  patientFaqs: [],
  bookingScript: [],
  reportTemplates: []
};

function sheetToJsonRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
}

function sheetToMatrix(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
}

function parseCustomerFields(workbook) {
  const rows = sheetToJsonRows(workbook, 'Customer information retrieval ');
  const customerFields = rows
    .map((row) => ({
      dataCategory: row.Data_Category || row.DataCategory || '',
      fieldName: row.Field_Name || row.FieldName || '',
      description: row.Field_Description || row.FieldDescription || '',
      dataType: row.Data_Type || row.DataType || '',
      validation: row.Validation_Rules || row.ValidationRules || ''
    }))
    .filter((f) => f.dataCategory || f.fieldName);

  const customerFieldsByCategory = customerFields.reduce((acc, field) => {
    if (!field.dataCategory) return acc;
    if (!acc[field.dataCategory]) acc[field.dataCategory] = [];
    acc[field.dataCategory].push(field);
    return acc;
  }, {});

  return { customerFields, customerFieldsByCategory };
}

function parsePreMedFields(workbook) {
  const rows = sheetToJsonRows(workbook, 'Pre-medical data collection');
  const preMedFields = rows
    .map((row) => ({
      category: row['Data Cat'] || row.DataCat || row['Data Category'] || '',
      name: row['Field Name'] || row.Field_Name || '',
      description: row.Field_descriptions || row.FieldDescription || row['Field Description'] || '',
      dataType: row['Data Type'] || row.Data_Type || '',
      validation: row.Validationrule || row.Validation || row['Validation Rule'] || ''
    }))
    .filter((f) => f.category || f.name || f.description);
  return { preMedFields };
}

function parseMarketing(workbook) {
  const rows = sheetToMatrix(workbook, 'Marketing material');
  if (!rows.length) return { marketing: null };
  const header = rows[0];
  const patientCol = 1;
  const serviceCol = 2;
  const lines = rows.slice(1).filter((r) => r && r.length);
  const patientEducation = {};
  const servicePromotion = {};
  lines.forEach((row) => {
    const label = (row[0] || '').toString().trim().toLowerCase();
    if (!label) return;
    if (label.includes('goal')) {
      patientEducation.goal = row[patientCol] || '';
      servicePromotion.goal = row[serviceCol] || '';
    } else if (label.includes('sms')) {
      patientEducation.smsDraft = row[patientCol] || '';
      servicePromotion.smsDraft = row[serviceCol] || '';
    } else if (label.includes('social')) {
      patientEducation.socialPost = row[patientCol] || '';
      servicePromotion.socialPost = row[serviceCol] || '';
    } else if (label.includes('leaflet')) {
      patientEducation.leafletDraft = row[patientCol] || '';
      servicePromotion.leafletDraft = row[serviceCol] || '';
    }
  });

  return {
    marketing: {
      patientEducation,
      servicePromotion,
      columns: {
        patientEducation: header[patientCol] || 'Patient Education',
        servicePromotion: header[serviceCol] || 'Service Promotion'
      }
    }
  };
}

function isQuoted(str) {
  return /^['"“”‘’]/.test(str.trim());
}

function startsWithNumber(str) {
  return /^\d+[\.|)]/.test(str.trim());
}

function stripQuotes(str) {
  return str.replace(/^['"“”‘’]+/, '').replace(/['"“”‘’]+$/, '').trim();
}

function parseFaqSheet(workbook, sheetName, skipTitleMatch) {
  const matrix = sheetToMatrix(workbook, sheetName);
  if (!matrix.length) return [];
  let startIndex = 0;
  if (skipTitleMatch) {
    startIndex = matrix.findIndex((row) => (row[0] || '').includes(skipTitleMatch)) + 1;
    if (startIndex <= 0) startIndex = 1;
  }
  const faqs = [];
  let currentCategory = null;

  for (let i = startIndex; i < matrix.length; i++) {
    const cell = (matrix[i][0] || '').toString().trim();
    if (!cell) {
      currentCategory = null;
      continue;
    }

    if (!currentCategory && !startsWithNumber(cell) && !isQuoted(cell)) {
      currentCategory = { category: cell, items: [] };
      faqs.push(currentCategory);
      continue;
    }

    if (!currentCategory) continue;

    if (startsWithNumber(cell) || isQuoted(cell)) {
      const question = stripQuotes(cell);
      const answerRow = matrix[i + 1] || [];
      const answer = stripQuotes((answerRow[0] || '').toString());
      currentCategory.items.push({ question, answer });
      i += 1; // skip answer row
    }
  }

  return faqs;
}

function parseBookingScript(workbook) {
  const rows = sheetToJsonRows(workbook, 'Booking');
  const stepsMap = new Map();
  rows.forEach((row) => {
    const stepNumber = (row['Step Number'] || '').toString().trim();
    const stepCategory = (row['Step Category'] || '').toString().trim();
    const prompt = (row['System Prompt/Question'] || '').toString().trim();
    const option = (row['User Input Options'] || '').toString().trim();

    if (!stepNumber || !stepCategory) return;
    if (stepNumber.toLowerCase().includes('mock')) return;
    const key = `${stepNumber}__${stepCategory}`;
    if (!stepsMap.has(key)) {
      stepsMap.set(key, { stepNumber, category: stepCategory, prompt, options: [] });
    }
    const step = stepsMap.get(key);
    if (option) step.options.push(option);
    if (!step.prompt && prompt) step.prompt = prompt;
  });

  return Array.from(stepsMap.values()).sort((a, b) => {
    const parseStep = (s) => s.split('.').map((n) => parseFloat(n));
    const A = parseStep(a.stepNumber);
    const B = parseStep(b.stepNumber);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const av = A[i] || 0;
      const bv = B[i] || 0;
      if (av !== bv) return av - bv;
    }
    return a.category.localeCompare(b.category);
  });
}

function parseReportTemplates(workbook) {
  const matrix = sheetToMatrix(workbook, 'Post-medical report generation');
  if (!matrix.length) return [];
  const templates = [];
  let current = { name: `Report Template ${templates.length + 1}`, sections: { lines: [] } };

  matrix.forEach((row) => {
    const text = (row[0] || '').toString().trim();
    if (!text) {
      if (current.sections.lines.length) {
        templates.push(current);
        current = { name: `Report Template ${templates.length + 1}`, sections: { lines: [] } };
      }
      return;
    }
    current.sections.lines.push(text);
  });

  if (current.sections.lines.length) templates.push(current);
  return templates;
}

function loadKnowledge(filePath = path.join(__dirname, '..', 'data', 'MT_Project_Chatbot.xlsx')) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[knowledge] Excel file not found at ${filePath}. Using empty knowledge.`);
      return knowledge;
    }
    const workbook = XLSX.readFile(filePath);
    const { customerFields, customerFieldsByCategory } = parseCustomerFields(workbook);
    const { preMedFields } = parsePreMedFields(workbook);
    const { marketing } = parseMarketing(workbook);
    const staffFaqs = parseFaqSheet(workbook, 'Internal enquiries', 'Internal FAQs for Clinic Staff');
    const patientFaqs = parseFaqSheet(workbook, 'Customer Enquiry Handling', 'Patient FAQs for Clinic Inquiry Handling');
    const bookingScript = parseBookingScript(workbook);
    const reportTemplates = parseReportTemplates(workbook);

    knowledge = {
      customerFields,
      customerFieldsByCategory,
      preMedFields,
      marketing,
      staffFaqs,
      patientFaqs,
      bookingScript,
      reportTemplates
    };

    console.info('[knowledge] Loaded MT_Project_Chatbot.xlsx', {
      customerFields: customerFields.length,
      preMedFields: preMedFields.length,
      marketing: marketing ? Object.keys(marketing).length : 0,
      staffFaqCategories: staffFaqs.length,
      patientFaqCategories: patientFaqs.length,
      bookingSteps: bookingScript.length,
      reportTemplates: reportTemplates.length
    });
    return knowledge;
  } catch (err) {
    console.error('[knowledge] Failed to load Excel knowledge', err);
    return knowledge;
  }
}

function getCustomerFields() {
  return knowledge.customerFields;
}

function getPreMedFields() {
  return knowledge.preMedFields;
}

function getMarketingMaterials() {
  return knowledge.marketing;
}

function getStaffFaqs() {
  return knowledge.staffFaqs;
}

function getPatientFaqs() {
  return knowledge.patientFaqs;
}

function getBookingScript() {
  return knowledge.bookingScript;
}

function getReportTemplates() {
  return knowledge.reportTemplates;
}

function searchFaqs(faqs = [], query = '') {
  const normalized = query.toLowerCase();
  for (const block of faqs) {
    for (const item of block.items || []) {
      const q = (item.question || '').toLowerCase();
      const a = (item.answer || '').toLowerCase();
      if (q.includes(normalized) || a.includes(normalized)) {
        return { category: block.category, item };
      }
    }
  }
  return null;
}

module.exports = {
  loadKnowledge,
  getCustomerFields,
  getPreMedFields,
  getMarketingMaterials,
  getStaffFaqs,
  getPatientFaqs,
  getBookingScript,
  getReportTemplates,
  searchFaqs
};
