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
    { id: 'disclosures-section', title: 'Disclosures-And-Authorizations' }
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
    ],
  },
  'UNIT-A4': {
    propertyName: 'Unit A4, 456 Oak Ave, Anytown, USA',
    requiredSections: [
      FORM_KEYS.personalInfo,
      FORM_KEYS.employmentVerification,
      FORM_KEYS.disclosures,
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
    ],
  },
};
export const defaultConfig = {
    propertyName: 'General Application',
    requiredSections: Object.values(FORM_KEYS),
};

// --- VALIDATION RULES ---
const isNonEmptyString = (val) => val && typeof val === 'string' && val.trim() !== '';
const isFileUploaded = (file) => file && isNonEmptyString(file.name) && isNonEmptyString(file.data);

export const VALIDATION_RULES = {
  [FORM_KEYS.personalInfo]: (data) =>
    isNonEmptyString(data.fullName) &&
    isNonEmptyString(data.phone) &&
    isNonEmptyString(data.email) &&
    /\S+@\S+\.\S+/.test(data.email),
  [FORM_KEYS.rentalHistory]: (data) =>
    data.length > 0 && data.every(item => isNonEmptyString(item.address) && isNonEmptyString(item.landlordName)),
  [FORM_KEYS.employmentVerification]: (data) =>
    isNonEmptyString(data.employmentStatus) &&
    isNonEmptyString(data.grossMonthlyIncome) &&
    parseFloat(data.grossMonthlyIncome) > 0 &&
    isNonEmptyString(data.signature),
  [FORM_KEYS.householdOccupants]: () => true, // Optional by default
  [FORM_KEYS.references]: (data) =>
    data.length > 0 && data.every(item => isNonEmptyString(item.name) && isNonEmptyString(item.phone)),
  [FORM_KEYS.vehiclesAndPets]: () => true, // Optional by default
  [FORM_KEYS.creditHistory]: (data) =>
    isFileUploaded(data.transunionReport) ||
    isFileUploaded(data.experianReport) ||
    isFileUploaded(data.equifaxReport),
  [FORM_KEYS.criminalHistory]: (data) => data.fcraConsent,
  [FORM_KEYS.evictionHistory]: (data) => data.fcraConsent,
  [FORM_KEYS.disclosures]: (data) =>
    data.agreement && isNonEmptyString(data.signature) && isNonEmptyString(data.date),
};

// --- INITIAL FORM STATE ---
export const blankFormData = {
  personalInfo: {
    referenceId: '',
    fullName: '',
    dob: '',
    ssn: '',
    license: '',
    phone: '',
    email: '',
    photo: null,
  },
  rentalHistory: [
    { address: '', type: 'Rental', moveIn: '', moveOut: '', landlordName: '', landlordContact: '' },
  ],
  employmentVerification: {
    employmentStatus: '',
    employerName: '',
    jobTitle: '',
    grossMonthlyIncome: '',
    otherIncomeSources: [],
    signature: '',
    incomeDocuments: {
      payStubs: null, offerLetter: null, taxReturn: null, bankStatements: null,
    }
  },
  householdOccupants: [],
  references: [
    { name: '', relationship: '', phone: '', email: '' },
  ],
  vehiclesAndPets: {
    hasVehicle: 'No',
    vehicles: [],
    hasPets: 'No',
    pets: [],
  },
  creditHistory: {
    transunionReport: null,
    experianReport: null,
    equifaxReport: null
  },
  criminalHistory: {
    transunionReport: null,
    experianReport: null,
    availReport: null,
    myRentalReport: null,
    fcraConsent: false,
  },
  evictionHistory: {
    transunionEvictionReport: null,
    experianEvictionReport: null,
    availEvictionReport: null,
    myRentalEvictionReport: null,
    fcraConsent: false,
  },
  disclosures: { agreement: false, signature: '', date: '' },
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
