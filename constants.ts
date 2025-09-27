/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- APPLICATION FORM CONSTANTS ---
export const TABS = [
  'Personal Information',
  'Rental History Verification',
  'Employment and Income Verification',
  'Household Information',
  'References',
  'Vehicles and Pets',
  'Credit Report',
  'Criminal History',
  'Eviction History',
  'Disclosures and Authorizations',
  'Screening Report',
];

export const FORM_SECTIONS = [
    { id: 'personal-info-section', title: 'Personal-Information' },
    { id: 'rental-history-section', title: 'Rental-History' },
    { id: 'employment-verification-section', title: 'Employment-Verification' },
    { id: 'household-info-section', title: 'Household-Information' },
    { id: 'references-section', title: 'References' },
    { id: 'vehicles-pets-section', title: 'Vehicles-And-Pets' },
    { id: 'credit-history-section', title: 'Credit-History' },
    { id: 'criminal-history-section', title: 'Criminal-History' },
    { id: 'eviction-history-section', title: 'Eviction-History' },
    { id: 'disclosures-section', title: 'Disclosures-And-Authorizations' },
    { id: 'screening-report-section', title: 'Screening-Report' },
];

export const FORM_KEYS = {
    personalInfo: 'personalInfo',
    rentalHistory: 'rentalHistory',
    employmentVerification: 'employmentVerification',
    householdOccupants: 'householdOccupants',
    references: 'references',
    vehiclesAndPets: 'vehiclesAndPets',
    creditHistory: 'creditHistory',
    criminalHistory: 'criminalHistory',
    evictionHistory: 'evictionHistory',
    disclosures: 'disclosures',
    screeningReport: 'screeningReport',
};

// --- MOCK LANDLORD CONFIGURATION ---
export const landlordConfigs = {
  'PROPERTY-123': {
    propertyName: '123 Main St, Anytown, USA',
    requiredSections: [
      FORM_KEYS.personalInfo,
      FORM_KEYS.rentalHistory,
      FORM_KEYS.employmentVerification,
      FORM_KEYS.creditHistory,
      FORM_KEYS.criminalHistory,
      FORM_KEYS.disclosures,
      FORM_KEYS.screeningReport,
    ],
  },
  'UNIT-A4': {
    propertyName: 'Unit A4, 456 Oak Ave, Anytown, USA',
    requiredSections: [
      FORM_KEYS.personalInfo,
      FORM_KEYS.employmentVerification,
      FORM_KEYS.disclosures,
      FORM_KEYS.screeningReport,
    ],
  },
  'CONDO-7B': {
    propertyName: 'Condo 7B, 789 Pine Ln, Anytown, USA',
    requiredSections: [
      FORM_KEYS.personalInfo,
      FORM_KEYS.rentalHistory,
      FORM_KEYS.employmentVerification,
      FORM_KEYS.references,
      FORM_KEYS.creditHistory,
      FORM_KEYS.criminalHistory,
      FORM_KEYS.evictionHistory,
      FORM_KEYS.disclosures,
      FORM_KEYS.screeningReport,
    ],
  },
};
export const defaultConfig = {
    propertyName: 'General Application',
    requiredSections: Object.values(FORM_KEYS),
};

// --- VALIDATION RULES ---
const isNonEmptyString = (val) => val && typeof val === 'string' && val.trim() !== '';
const isFileUploaded = (files) => Array.isArray(files) && files.length > 0;

export const VALIDATION_RULES = {
  [FORM_KEYS.personalInfo]: (data) =>
    isNonEmptyString(data.fullName) &&
    isNonEmptyString(data.phone) &&
    isNonEmptyString(data.email) &&
    /\S+@\S+\.\S+/.test(data.email) &&
    isFileUploaded(data.idFront) &&
    isFileUploaded(data.idBack),
  [FORM_KEYS.rentalHistory]: (data) =>
    data.length > 0 && data.every(item => isNonEmptyString(item.address) && isNonEmptyString(item.landlordName)),
  [FORM_KEYS.employmentVerification]: (data) =>
    isNonEmptyString(data.employmentStatus) &&
    isNonEmptyString(data.grossMonthlyIncome) &&
    parseFloat(data.grossMonthlyIncome) > 0 &&
    isNonEmptyString(data.signature) &&
    (isFileUploaded(data.incomeDocuments?.paySlips) && (isFileUploaded(data.incomeDocuments?.bankStatements6Month) || isFileUploaded(data.incomeDocuments?.bankStatementsLastYear))),
  [FORM_KEYS.householdOccupants]: () => true, // Optional by default
  [FORM_KEYS.references]: (data) =>
    data.length > 0 && data.every(item => isNonEmptyString(item.name) && isNonEmptyString(item.phone)),
  [FORM_KEYS.vehiclesAndPets]: () => true, // Optional by default
  [FORM_KEYS.creditHistory]: (data) =>
    isFileUploaded(data.transunionReport) ||
    isFileUploaded(data.experianReport) ||
    isFileUploaded(data.equifaxReport),
  [FORM_KEYS.criminalHistory]: (data) => data.fcraConsent && (
    isFileUploaded(data.transunionReport) ||
    isFileUploaded(data.experianReport) ||
    isFileUploaded(data.availReport) ||
    isFileUploaded(data.myRentalReport)
  ),
  [FORM_KEYS.evictionHistory]: (data) => data.fcraConsent && (
    isFileUploaded(data.transunionEvictionReport) ||
    isFileUploaded(data.experianEvictionReport) ||
    isFileUploaded(data.availEvictionReport) ||
    isFileUploaded(data.myRentalEvictionReport)
  ),
  [FORM_KEYS.disclosures]: (data) =>
    data.agreement && isNonEmptyString(data.signature) && isNonEmptyString(data.date),
  [FORM_KEYS.screeningReport]: (data) => data && data.generated === true,
};

// --- INITIAL FORM STATE (PRE-FILLED FOR DEMO) ---
// Placeholder for base64 encoded images (a 1x1 grey pixel GIF)
const placeholderImageBase64 = 'R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
// Placeholder for base64 encoded PDF documents ("fake pdf")
const placeholderPdfBase64 = 'data:application/pdf;base64,ZmFrZSBwZGY=';

export const blankFormData = {
  personalInfo: {
    referenceId: 'PROPERTY-123',
    fullName: 'John Appleseed',
    dob: '1990-05-15',
    ssn: '999-99-9999',
    license: 'F12345678',
    phone: '555-123-4567',
    email: 'john.appleseed@example.com',
    photo: `data:image/gif;base64,${placeholderImageBase64}`,
    idFront: [{ name: 'ID_Front.jpg', data: `data:image/jpeg;base64,${placeholderImageBase64}`, mimeType: 'image/jpeg' }],
    idBack: [{ name: 'ID_Back.jpg', data: `data:image/jpeg;base64,${placeholderImageBase64}`, mimeType: 'image/jpeg' }],
  },
  rentalHistory: [
    { address: '789 Maple St, Sometown, USA', type: 'Rental', moveIn: '2022-06-01', moveOut: '2024-05-31', landlordName: 'Sarah Connor', landlordContact: '555-987-6543' },
  ],
  employmentVerification: {
    employmentStatus: 'Full-Time',
    employerName: 'Acme Corporation',
    jobTitle: 'Senior Software Engineer',
    grossMonthlyIncome: '8000',
    otherIncomeSources: [{ source: 'Freelance Web Development', amount: '1000' }],
    signature: 'John Appleseed',
    incomeDocuments: {
      paySlips: [{ name: 'payslip_1.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }, { name: 'payslip_2.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
      bankStatements6Month: [{ name: 'bank_statements_6mo.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
      bankStatementsLastYear: [],
      creditCardStatements3Month: [{ name: 'cc_statements_3mo.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
      creditCardStatements6Month: [],
    }
  },
  householdOccupants: [
    {
      firstName: 'Jane',
      lastName: 'Appleseed',
      relationship: 'Spouse/Partner',
      dob: '1992-08-20',
      photo: `data:image/gif;base64,${placeholderImageBase64}`,
      idFront: [{ name: 'Jane_ID_Front.jpg', data: `data:image/jpeg;base64,${placeholderImageBase64}`, mimeType: 'image/jpeg' }],
      idBack: [{ name: 'Jane_ID_Back.jpg', data: `data:image/jpeg;base64,${placeholderImageBase64}`, mimeType: 'image/jpeg' }],
    }
  ],
  references: [
    { name: 'Mike Ross', relationship: 'Colleague', phone: '555-111-2222', email: 'mike.ross@example.com' },
    { name: 'Rachel Zane', relationship: 'Friend', phone: '555-333-4444', email: 'rachel.zane@example.com' },
  ],
  vehiclesAndPets: {
    hasVehicle: 'Yes',
    vehicles: [{ make: 'Tesla', model: 'Model 3', color: 'Blue' }],
    hasPets: 'Yes',
    pets: [{ type: 'Dog', breed: 'Golden Retriever', name: 'Buddy', age: '5', weight: '75' }],
  },
  creditHistory: {
    transunionReport: [{ name: 'transunion_report.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
    experianReport: [{ name: 'experian_report.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
    equifaxReport: []
  },
  criminalHistory: {
    transunionReport: [{ name: 'criminal_check_tu.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
    experianReport: [],
    availReport: [],
    myRentalReport: [],
    fcraConsent: true,
  },
  evictionHistory: {
    transunionEvictionReport: [{ name: 'eviction_check_tu.pdf', data: placeholderPdfBase64, mimeType: 'application/pdf' }],
    experianEvictionReport: [],
    availEvictionReport: [],
    myRentalEvictionReport: [],
    fcraConsent: true,
  },
  disclosures: { agreement: true, signature: 'John Appleseed', date: '2024-10-26' },
  screeningReport: {
      generated: true,
      screeningScore: 780,
      riskLevel: "Low",
      summary: "The applicant demonstrates a strong financial profile with consistent income well above the typical rent-to-income ratio requirements. Payment history appears reliable with no major red flags observed in the provided documents.",
      financialAnalysis: {
        cashFlow: "Consistent payroll deposits from 'Acme Corporation' noted twice a month. Average monthly deposits are approximately $9,000. Spending patterns are regular with no signs of financial distress.",
        rentPaymentHistory: "Recurring monthly payments of $2,200 to 'Sometown Properties' are observed, paid consistently on the 1st of each month.",
        utilityPaymentHistory: "Regular payments to 'Anytown Power & Light' and 'Sometown Internet' are noted, with no evidence of late fees.",
        debtCommitment: "The applicant shows a strong commitment to meeting financial obligations. Credit card balances are paid down regularly, and all recurring payments are timely."
      },
      scoreFactors: {
        positive: ["Consistent high income", "On-time rent payment history", "Stable employment"],
        negative: ["Moderate credit card utilization"]
      },
      redFlags: []
  },
};


// --- LEASE AGREEMENT CONSTANTS ---

export const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export const STATE_SPECIFIC_INFO = {
    'California': [
        { title: 'Proposition 65 Warning', text: 'This property may expose you to chemicals known to the State of California to cause cancer, birth defects, or other reproductive harm. For more information go to www.P65Warnings.ca.gov.' },
        { title: 'Megan\'s Law Disclosure', text: 'Notice: Pursuant to Section 290.46 of the Penal Code, information about specified registered sex offenders is made available to the public via an Internet Web site maintained by the Department of Justice at www.meganslaw.ca.gov.' }
    ],
    'Texas': [
        { title: 'Security Device Acknowledgment', text: 'Landlord has installed security devices on the property as required by the Texas Property Code. Tenant acknowledges receipt and instructions for use of all security devices.' },
        { title: 'Emergency Contact', text: 'Tenant must provide Landlord with the name, address, and telephone number of a person to contact in case of an emergency.' }
    ]
};

export const LEGAL_CLAUSES = {
    pets: {
        included: false,
        text: 'No pets are allowed on the premises without the prior written consent of the Landlord. Any authorized pets will require an additional pet deposit of [Specify Amount] and a monthly pet fee of [Specify Amount]. Tenant is responsible for any damage caused by the pet.'
    },
    smoking: {
        included: true,
        text: 'Smoking of any kind, including but not to limited to tobacco and cannabis, is strictly prohibited inside the rental unit and in all common areas of the property. A fine of [Specify Amount] will be assessed for each violation.'
    },
    subletting: {
        included: false,
        text: 'Tenant shall not sublet any part of the premises or assign this lease without the prior written consent of the Landlord.'
    },
    maintenance: {
        included: true,
        text: 'Tenant shall keep the premises in a clean and sanitary condition. Tenant is responsible for minor repairs, such as replacing light bulbs. Landlord is responsible for major repairs to the structure and systems (plumbing, electrical, HVAC).'
    },
    rightOfEntry: {
        included: true,
        text: 'Landlord shall have the right to enter the premises at reasonable times with at least 24 hours\' notice to the Tenant for the purpose of inspection, repairs, or showing the property to prospective tenants or purchasers.'
    }
};

export const STATE_REQUIRED_CLAUSES = {
    'California': ['rightOfEntry', 'smoking'],
    'Texas': ['maintenance'],
    'New York': ['maintenance', 'rightOfEntry'],
    'Florida': ['smoking', 'maintenance']
};