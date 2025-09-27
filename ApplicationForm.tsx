/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TABS, FORM_KEYS, VALIDATION_RULES, FORM_SECTIONS, landlordConfigs, defaultConfig, blankFormData } from './constants';
import { FormInput, DocumentUploadField, CompletionProgress } from './utils';
import { PdfButtonsPanel } from './pdfUtils';
import { ScreeningReport } from './ScreeningReport';


const useDynamicList = (formData, setFormData, listKey, itemTemplate) => {
  const list = formData[listKey];

  const handleChange = (index, field, value) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setFormData(prev => ({ ...prev, [listKey]: newList }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, [listKey]: [...list, itemTemplate] }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, [listKey]: list.filter((_, i) => i !== index) }));
  };
  
  return { list, handleChange, addItem, removeItem };
};


// --- FORM NAVIGATION ---
const FormNavigation = ({ activeTab, setActiveTab, totalTabs, formData, propertyName, isSubmittable, incompleteSections }) => {
    const handleNext = () => {
        if (activeTab < totalTabs - 1) {
            setActiveTab(activeTab + 1);
        }
    };

    const handleSubmit = () => {
        alert('Application submitted successfully!');
    };

    const disabledTitle = `Please complete the following sections first: ${incompleteSections.join(', ')}`;

    return (
        <div className="form-actions-container">
            <PdfButtonsPanel
                formData={formData}
                propertyName={propertyName}
                isSubmittable={isSubmittable}
                incompleteSections={incompleteSections}
            />
            <div className="navigation-buttons">
                {activeTab < totalTabs - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="btn btn-primary"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={!isSubmittable}
                        title={!isSubmittable ? disabledTitle : ''}
                    >
                        Submit Application
                    </button>
                )}
            </div>
        </div>
    );
};


// --- FORM TAB COMPONENTS ---

const PersonalInfoForm = ({ data, setData, onReferenceIdChange, isReadOnly }) => {
  const [photoPreview, setPhotoPreview] = useState(data.photo || null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setPhotoPreview(data.photo || null);
  }, [data.photo]);
  
  const handleReferenceIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const referenceId = e.target.value;
    onReferenceIdChange(referenceId); // Notify parent about the change
  };
  
  const handleChange = (field, value) => {
    if (errors[field]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }
    setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result as string;
      setPhotoPreview(base64String);
      handleChange('photo', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleIdDocsUpdate = (field, newFiles) => {
    setData(prev => ({
        ...prev,
        personalInfo: {
            ...prev.personalInfo,
            [field]: newFiles,
        },
    }));
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id: field, value } = e.target;
    const newErrors = { ...errors };

    switch (field) {
        case 'fullName':
            if (!value.trim()) newErrors.fullName = 'Full Legal Name is required.';
            else delete newErrors.fullName;
            break;
        case 'email':
            if (!value) newErrors.email = 'Email Address is required.';
            else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Please enter a valid email address.';
            else delete newErrors.email;
            break;
        case 'phone':
            if (!value.trim()) newErrors.phone = 'Phone Number is required.';
            else delete newErrors.phone;
            break;
        default:
            break;
    }
    setErrors(newErrors);
  };

  return (
    <div className="form-section" id="personal-info-section">
      <h2 className="form-section-title">Personal Information</h2>
      <p>Please provide your full legal and contact information.</p>

      <div className="form-group">
        <label htmlFor="referenceId">Reference ID</label>
        <input 
          id="referenceId" 
          type="text" 
          value={data.referenceId || ''} 
          onChange={e => handleChange('referenceId', e.target.value)}
          onBlur={handleReferenceIdBlur}
          placeholder="Enter ID to load/save progress"
          aria-describedby="referenceId-hint"
          readOnly={isReadOnly}
        />
        <p id="referenceId-hint" className="field-hint" style={{textAlign: 'left', marginTop: '0.25rem', marginBottom: 0}}>
          Enter a Property Reference ID. Test with `PROPERTY-123` or `UNIT-A4`.
        </p>
      </div>
      
      <div className="form-group photo-upload-area">
        <label>Applicant Photo</label>
        <div className="photo-upload-container">
          <div className="photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt="Applicant Preview" />
            ) : (
              <span>Photo Preview</span>
            )}
          </div>
          <input 
            type="file" 
            id="photoUpload" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            style={{ display: 'none' }} 
            aria-label="Upload applicant photo"
          />
          <label htmlFor="photoUpload" className="btn btn-secondary">
            Upload Photo
          </label>
        </div>
        <p className="field-hint">Upload a passport-style photo or a clear selfie.</p>
      </div>
      
      <FormInput 
        id="fullName" 
        label="Full Legal Name" 
        value={data.fullName} 
        onChange={e => handleChange('fullName', e.target.value)}
        onBlur={handleBlur}
        error={errors.fullName}
        required
      />
      <div className="form-grid">
        <FormInput id="dob" label="Date of Birth" type="date" value={data.dob} onChange={e => handleChange('dob', e.target.value)} required />
        <FormInput id="ssn" label="Social Security Number (SSN)" value={data.ssn} onChange={e => handleChange('ssn', e.target.value)} required />
        <FormInput id="license" label="Driver's License or State ID Number" value={data.license} onChange={e => handleChange('license', e.target.value)} />
        <FormInput 
          id="phone" 
          label="Phone Number" 
          type="tel" 
          value={data.phone} 
          onChange={e => handleChange('phone', e.target.value)}
          onBlur={handleBlur}
          error={errors.phone} 
          required
        />
        <FormInput 
          id="email" 
          label="Email Address" 
          type="email" 
          value={data.email} 
          onChange={e => handleChange('email', e.target.value)}
          onBlur={handleBlur}
          error={errors.email}
          required
        />
      </div>

       <div className="form-subsection">
          <h3>Identification Documents</h3>
          <p>Please upload clear images of the front and back of your government-issued ID (e.g., Driver's License, State ID).</p>
          <div className="document-upload-list">
              <DocumentUploadField
                  id="idFront"
                  label="ID Front"
                  files={data.idFront}
                  onFilesUpdate={(files) => handleIdDocsUpdate('idFront', files)}
              />
              <DocumentUploadField
                  id="idBack"
                  label="ID Back"
                  files={data.idBack}
                  onFilesUpdate={(files) => handleIdDocsUpdate('idBack', files)}
              />
          </div>
      </div>
    </div>
  );
};

const RentalHistoryForm = ({ formData, setFormData }) => {
  const { list, handleChange, addItem, removeItem } = useDynamicList(
    formData, setFormData, 'rentalHistory',
    { address: '', type: 'Rental', moveIn: '', moveOut: '', landlordName: '', landlordContact: '' }
  );

  return (
    <div className="form-section" id="rental-history-section">
      <h2 className="form-section-title">Rental History Verification</h2>
      <p>Please list your previous addresses for the past 2-3 years. We will contact your previous landlords to verify your rental history.</p>
      {list.map((res, index) => (
        <div key={index} className="form-subsection">
          <h3>Residence #{index + 1}</h3>
          {list.length > 1 && <button type="button" className="remove-btn" onClick={() => removeItem(index)} aria-label={`Remove Residence #${index + 1}`}>&times;</button>}
          <FormInput id={`resAddress${index}`} label="Full Address" value={res.address} onChange={e => handleChange(index, 'address', e.target.value)} />
          <div className="form-grid">
             <div className="form-group">
                <label htmlFor={`resType${index}`}>Type of Residence</label>
                <select id={`resType${index}`} value={res.type} onChange={e => handleChange(index, 'type', e.target.value)}>
                    <option>Rental</option>
                    <option>Owned</option>
                </select>
            </div>
            <FormInput id={`resMoveIn${index}`} label="Move-in Date" type="date" value={res.moveIn} onChange={e => handleChange(index, 'moveIn', e.target.value)} />
            <FormInput id={`resMoveOut${index}`} label="Move-out Date" type="date" value={res.moveOut} onChange={e => handleChange(index, 'moveOut', e.target.value)} />
            <FormInput id={`resLandlordName${index}`} label="Landlord Name" value={res.landlordName} onChange={e => handleChange(index, 'landlordName', e.target.value)} />
            <FormInput id={`resLandlordContact${index}`} label="Landlord Contact" value={res.landlordContact} onChange={e => handleChange(index, 'landlordContact', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn btn-secondary">Add Another Residence</button>
    </div>
  );
};

const EmploymentVerificationForm = ({ data, setData }) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (field, value) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        setData(prev => ({
            ...prev,
            employmentVerification: { ...prev.employmentVerification, [field]: value }
        }));
    };
    
    const handleOtherIncomeChange = (index, field, value) => {
        setData(prev => {
            const newList = [...prev.employmentVerification.otherIncomeSources];
            newList[index] = { ...newList[index], [field]: value };
            return {
                ...prev,
                employmentVerification: {
                    ...prev.employmentVerification,
                    otherIncomeSources: newList
                }
            };
        });
    };

    const addOtherIncomeSource = () => {
        setData(prev => ({
            ...prev,
            employmentVerification: {
                ...prev.employmentVerification,
                otherIncomeSources: [...prev.employmentVerification.otherIncomeSources, { source: '', amount: '' }]
            }
        }));
    };

    const removeOtherIncomeSource = (index) => {
        setData(prev => ({
            ...prev,
            employmentVerification: {
                ...prev.employmentVerification,
                otherIncomeSources: prev.employmentVerification.otherIncomeSources.filter((_, i) => i !== index)
            }
        }));
    };

    const handleIncomeDocsUpdate = (field, newFiles) => {
        setData(prev => ({
            ...prev,
            employmentVerification: {
                ...prev.employmentVerification,
                incomeDocuments: {
                    ...prev.employmentVerification.incomeDocuments,
                    [field]: newFiles,
                },
            },
        }));
    };

    const totalIncome =
        (parseFloat(data.grossMonthlyIncome) || 0) +
        data.otherIncomeSources.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const showEmployerFields = data.employmentStatus && !['Student', 'Retired', 'Unemployed'].includes(data.employmentStatus);
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const newErrors = { ...errors };

        switch (id) {
            case 'employerName':
                if (showEmployerFields && !value.trim()) {
                    newErrors.employerName = 'Employer / Company Name is required.';
                } else {
                    delete newErrors.employerName;
                }
                break;
            case 'jobTitle':
                if (showEmployerFields && !value.trim()) {
                    newErrors.jobTitle = 'Job Title is required.';
                } else {
                    delete newErrors.jobTitle;
                }
                break;
            case 'grossMonthlyIncome':
                if (!value.trim()) {
                    newErrors.grossMonthlyIncome = 'Gross Monthly Income is required.';
                } else if (parseFloat(value) <= 0) {
                    newErrors.grossMonthlyIncome = 'Income must be a positive number.';
                } else {
                    delete newErrors.grossMonthlyIncome;
                }
                break;
            case 'employmentSignature':
                if (!value.trim()) {
                    newErrors.employmentSignature = 'Signature is required to authorize verification.';
                } else {
                    delete newErrors.employmentSignature;
                }
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    return (
        <div className="form-section" id="employment-verification-section">
            <h2 className="form-section-title">Employment and Income Verification</h2>
            <p>Please provide your current employment and income details. This information will be used to verify your ability to pay rent.</p>
            
            <div className="form-group">
                <label htmlFor="employmentStatus">Current Employment Status</label>
                <select id="employmentStatus" value={data.employmentStatus} onChange={e => handleChange('employmentStatus', e.target.value)}>
                    <option value="">Select Status</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                    <option value="Unemployed">Unemployed</option>
                </select>
            </div>
            
            {showEmployerFields && (
                <div className="form-grid">
                    <FormInput 
                        id="employerName" 
                        label="Employer / Company Name" 
                        value={data.employerName} 
                        onChange={e => handleChange('employerName', e.target.value)}
                        onBlur={handleBlur}
                        error={errors.employerName}
                    />
                    <FormInput 
                        id="jobTitle" 
                        label="Job Title / Position" 
                        value={data.jobTitle} 
                        onChange={e => handleChange('jobTitle', e.target.value)}
                        onBlur={handleBlur}
                        error={errors.jobTitle}
                    />
                </div>
            )}

            <FormInput
                id="grossMonthlyIncome"
                label="Gross Monthly Income (from primary employment)"
                type="number"
                placeholder="e.g., 5000"
                value={data.grossMonthlyIncome}
                onChange={e => handleChange('grossMonthlyIncome', e.target.value)}
                onBlur={handleBlur}
                error={errors.grossMonthlyIncome}
                required
            />

            <div className="form-subsection">
                <h3>Other Income Sources</h3>
                <p>Include any additional income (e.g., freelance, part-time, benefits). Proof of income will be required.</p>
                {data.otherIncomeSources.map((source, index) => (
                    <div key={index} className="form-grid" style={{position: 'relative', paddingBottom: '1rem'}}>
                        <FormInput id={`incomeSource${index}`} label="Source of Income" value={source.source} onChange={e => handleOtherIncomeChange(index, 'source', e.target.value)} />
                        <FormInput id={`incomeAmount${index}`} label="Monthly Amount" type="number" value={source.amount} onChange={e => handleOtherIncomeChange(index, 'amount', e.target.value)} />
                        {data.otherIncomeSources.length > 0 && <button type="button" className="remove-btn" onClick={() => removeOtherIncomeSource(index)} style={{top: '-0.5rem', right: '-0.5rem'}} aria-label={`Remove Income Source #${index + 1}`}>&times;</button>}
                    </div>
                ))}
                <button type="button" onClick={addOtherIncomeSource} className="btn btn-secondary">Add Income Source</button>
            </div>
            
            <div className="form-group">
                <label>Total Gross Monthly Income</label>
                <input type="text" value={`$${totalIncome.toFixed(2)}`} readOnly aria-label="Total Gross Monthly Income" />
            </div>

            <div className="form-subsection">
                <h3>Proof of Income Documents</h3>
                <p>Please upload the following documents. These are required for your application to be processed.</p>
                <div className="document-upload-list">
                    <DocumentUploadField
                        id="paySlips"
                        label="Last 2 Pay Slips"
                        files={data.incomeDocuments?.paySlips}
                        onFilesUpdate={(files) => handleIncomeDocsUpdate('paySlips', files)}
                        multiple
                    />
                    <DocumentUploadField
                        id="bankStatements6Month"
                        label="6-Month Bank Statements"
                        files={data.incomeDocuments?.bankStatements6Month}
                        onFilesUpdate={(files) => handleIncomeDocsUpdate('bankStatements6Month', files)}
                    />
                    <DocumentUploadField
                        id="bankStatementsLastYear"
                        label="Last Year Bank Statements"
                        files={data.incomeDocuments?.bankStatementsLastYear}
                        onFilesUpdate={(files) => handleIncomeDocsUpdate('bankStatementsLastYear', files)}
                    />
                    <DocumentUploadField
                        id="creditCardStatements3Month"
                        label="Last 3-Month Credit Card Statements"
                        files={data.incomeDocuments?.creditCardStatements3Month}
                        onFilesUpdate={(files) => handleIncomeDocsUpdate('creditCardStatements3Month', files)}
                    />
                    <DocumentUploadField
                        id="creditCardStatements6Month"
                        label="Last 6-Month Credit Card Statements"
                        files={data.incomeDocuments?.creditCardStatements6Month}
                        onFilesUpdate={(files) => handleIncomeDocsUpdate('creditCardStatements6Month', files)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Authorization for Verification</label>
                <p className="field-hint" style={{textAlign: 'left', margin: 0}}>
                    By signing below, I authorize the landlord or their agent to verify all the information provided in this section, including contacting my employer.
                </p>
                <FormInput
                    id="employmentSignature"
                    label="Applicant Signature"
                    value={data.signature}
                    onChange={e => handleChange('signature', e.target.value)}
                    onBlur={handleBlur}
                    error={errors.employmentSignature}
                    placeholder="Type your full name to sign"
                    required
                />
            </div>
        </div>
    );
};

const HouseholdForm = ({ data, setData }) => {
  const occupants = data || [];

  const handleOccupantChange = (index: number, field: string, value: string | null) => {
    const newList = [...occupants];
    newList[index] = { ...newList[index], [field]: value };
    setData(prev => ({ ...prev, householdOccupants: newList }));
  };

  const addOccupant = () => {
    setData(prev => ({ ...prev, householdOccupants: [...(prev.householdOccupants || []), { firstName: '', lastName: '', relationship: '', dob: '', photo: null, idFront: [], idBack: [] }] }));
  };

  const removeOccupant = (index: number) => {
    setData(prev => ({ ...prev, householdOccupants: (prev.householdOccupants || []).filter((_, i) => i !== index) }));
  };
  
  const handleOccupantPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result as string;
      handleOccupantChange(index, 'photo', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleOccupantIdDocsUpdate = (index: number, field: string, files: any[]) => {
    const newList = [...occupants];
    newList[index] = { ...newList[index], [field]: files };
    setData(prev => ({ ...prev, householdOccupants: newList }));
  };
  
  return (
    <div className="form-section" id="household-info-section">
      <h2 className="form-section-title">Household Information</h2>
      <p>List all other individuals who will be occupying the rental unit, including children.</p>
      {occupants.map((occ, index) => (
        <div key={index} className="form-subsection">
          <h3>Occupant #{index + 1}</h3>
          {occupants.length > 0 && <button type="button" className="remove-btn" onClick={() => removeOccupant(index)} aria-label={`Remove Occupant #${index + 1}`}>&times;</button>}
          
          <div className="form-group occupant-photo-upload-area">
            <div className="photo-upload-container">
              <div className="photo-preview">
                {occ.photo ? <img src={occ.photo} alt={`Occupant ${index + 1} Preview`} /> : <span>Photo</span>}
              </div>
               <input 
                type="file" 
                id={`occupantPhoto${index}`} 
                accept="image/*" 
                onChange={e => handleOccupantPhotoUpload(e, index)} 
                style={{ display: 'none' }} 
              />
              <label htmlFor={`occupantPhoto${index}`} className="btn btn-secondary">Upload Photo</label>
            </div>
          </div>
          
          <div className="form-grid">
            <FormInput id={`occFirstName${index}`} label="First Name" value={occ.firstName || ''} onChange={e => handleOccupantChange(index, 'firstName', e.target.value)} />
            <FormInput id={`occLastName${index}`} label="Last Name" value={occ.lastName || ''} onChange={e => handleOccupantChange(index, 'lastName', e.target.value)} />
            <div className="form-group">
                <label htmlFor={`occRelationship${index}`}>Relationship to Applicant</label>
                <select id={`occRelationship${index}`} value={occ.relationship} onChange={e => handleOccupantChange(index, 'relationship', e.target.value)}>
                    <option value="">Select Relationship</option>
                    <option value="Spouse/Partner">Spouse/Partner</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Great-Grandfather">Great-Grandfather</option>
                    <option value="Great-Grandmother">Great-Grandmother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Nephew">Nephew</option>
                    <option value="Niece">Niece</option>
                    <option value="Other Relative">Other Relative</option>
                    <option value="Roommate">Roommate</option>
                    <option value="Other Non-Relative">Other Non-Relative</option>
                </select>
            </div>
            <FormInput id={`occDob${index}`} label="Date of Birth" type="date" value={occ.dob} onChange={e => handleOccupantChange(index, 'dob', e.target.value)} />
          </div>
          <div className="document-upload-list" style={{ marginTop: '1rem' }}>
              <DocumentUploadField
                  id={`occupantIdFront${index}`}
                  label="ID Front"
                  files={occ.idFront}
                  onFilesUpdate={(files) => handleOccupantIdDocsUpdate(index, 'idFront', files)}
              />
              <DocumentUploadField
                  id={`occupantIdBack${index}`}
                  label="ID Back"
                  files={occ.idBack}
                  onFilesUpdate={(files) => handleOccupantIdDocsUpdate(index, 'idBack', files)}
              />
          </div>
        </div>
      ))}
      <button type="button" onClick={addOccupant} className="btn btn-secondary">Add Another Occupant</button>
    </div>
  );
};

const ReferencesForm = ({ formData, setFormData }) => {
  const { list, handleChange, addItem, removeItem } = useDynamicList(
    formData, setFormData, 'references',
    { name: '', relationship: '', phone: '', email: '' }
  );

  return (
    <div className="form-section" id="references-section">
      <h2 className="form-section-title">References</h2>
      <p>Please provide at least two personal or professional references who are not related to you.</p>
      {list.map((ref, index) => (
        <div key={index} className="form-subsection">
          <h3>Reference #{index + 1}</h3>
          {list.length > 1 && <button type="button" className="remove-btn" onClick={() => removeItem(index)} aria-label={`Remove Reference #${index + 1}`}>&times;</button>}
          <div className="form-grid">
            <FormInput id={`refName${index}`} label="Full Name" value={ref.name} onChange={e => handleChange(index, 'name', e.target.value)} />
            <FormInput id={`refRelationship${index}`} label="Relationship" value={ref.relationship} onChange={e => handleChange(index, 'relationship', e.target.value)} />
            <FormInput id={`refPhone${index}`} label="Phone Number" type="tel" value={ref.phone} onChange={e => handleChange(index, 'phone', e.target.value)} />
            <FormInput id={`refEmail${index}`} label="Email Address" type="email" value={ref.email} onChange={e => handleChange(index, 'email', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn btn-secondary">Add Another Reference</button>
    </div>
  );
};

const VehiclesPetsForm = ({ data, setData }) => {
  const vehicles = data.vehicles || [];
  const pets = data.pets || [];
  const hasVehicle = data.hasVehicle === 'Yes';
  const hasPets = data.hasPets === 'Yes';

  const handleVehicleChange = (index: number, field: string, value: string) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, vehicles: newVehicles }
    }));
  };

  const addVehicle = () => {
    const newVehicles = [...vehicles, { make: '', model: '', color: '' }];
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, vehicles: newVehicles }
    }));
  };

  const removeVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, vehicles: newVehicles }
    }));
  };

  const handlePetChange = (index: number, field: string, value: string) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [field]: value };
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, pets: newPets }
    }));
  };

  const addPet = () => {
    const newPets = [...pets, { type: '', breed: '', name: '', age: '', weight: '' }];
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, pets: newPets }
    }));
  };

  const removePet = (index: number) => {
    const newPets = pets.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      vehiclesAndPets: { ...prev.vehiclesAndPets, pets: newPets }
    }));
  };

  const handleHasVehicleChange = (e) => {
    const value = e.target.value;
    setData(prev => {
      const currentVehicles = prev.vehiclesAndPets.vehicles || [];
      const newVehicles = value === 'No'
        ? []
        : (currentVehicles.length > 0 ? currentVehicles : [{ make: '', model: '', color: '' }]);

      return {
        ...prev,
        vehiclesAndPets: {
            ...prev.vehiclesAndPets,
            hasVehicle: value,
            vehicles: newVehicles,
        }
      };
    });
  };

  const handleHasPetsChange = (e) => {
    const value = e.target.value;
    setData(prev => {
      const currentPets = prev.vehiclesAndPets.pets || [];
      const newPets = value === 'No'
        ? []
        : (currentPets.length > 0 ? currentPets : [{ type: '', breed: '', name: '', age: '', weight: '' }]);

      return {
        ...prev,
        vehiclesAndPets: {
            ...prev.vehiclesAndPets,
            hasPets: value,
            pets: newPets,
        }
      };
    });
  };

  return (
    <div className="form-section" id="vehicles-pets-section">
      <div className="form-subsection">
        <h2 className="form-section-title">Vehicles</h2>
        <div className="form-group">
            <label>Do you have a vehicle?</label>
            <div className="radio-group">
                <label>
                    <input type="radio" name="hasVehicle" value="Yes" checked={hasVehicle} onChange={handleHasVehicleChange} />
                    Yes
                </label>
                <label>
                    <input type="radio" name="hasVehicle" value="No" checked={!hasVehicle} onChange={handleHasVehicleChange} />
                    No
                </label>
            </div>
        </div>

        {hasVehicle && vehicles.map((v, index) => (
          <div key={index} className="form-subsection">
            <h3>Vehicle #{index + 1}</h3>
            {vehicles.length > 1 && <button type="button" className="remove-btn" onClick={() => removeVehicle(index)} aria-label={`Remove Vehicle #${index + 1}`}>&times;</button>}
            <div className="form-grid">
              <FormInput id={`vMake${index}`} label="Make" value={v.make} onChange={e => handleVehicleChange(index, 'make', e.target.value)} />
              <FormInput id={`vModel${index}`} label="Model" value={v.model} onChange={e => handleVehicleChange(index, 'model', e.target.value)} />
              <FormInput id={`vColor${index}`} label="Color" value={v.color} onChange={e => handleVehicleChange(index, 'color', e.target.value)} />
            </div>
          </div>
        ))}
        {hasVehicle && <button type="button" onClick={addVehicle} className="btn btn-secondary">Add Another Vehicle</button>}
      </div>

      <div className="form-subsection">
        <h2 className="form-section-title">Pets</h2>
        <div className="form-group">
            <label>Do you have any pets?</label>
            <div className="radio-group">
                <label>
                    <input type="radio" name="hasPets" value="Yes" checked={hasPets} onChange={handleHasPetsChange} />
                    Yes
                </label>
                <label>
                    <input type="radio" name="hasPets" value="No" checked={!hasPets} onChange={handleHasPetsChange} />
                    No
                </label>
            </div>
        </div>
        {hasPets && pets.map((p, index) => (
          <div key={index} className="form-subsection">
            <h3>Pet #{index + 1}</h3>
            {pets.length > 1 && <button type="button" className="remove-btn" onClick={() => removePet(index)} aria-label={`Remove Pet #${index + 1}`}>&times;</button>}
            <div className="form-grid">
              <FormInput id={`pType${index}`} label="Type (e.g., Dog, Cat)" value={p.type} onChange={e => handlePetChange(index, 'type', e.target.value)} />
              <FormInput id={`pBreed${index}`} label="Breed" value={p.breed} onChange={e => handlePetChange(index, 'breed', e.target.value)} />
              <FormInput id={`pName${index}`} label="Name" value={p.name} onChange={e => handlePetChange(index, 'name', e.target.value)} />
              <FormInput id={`pAge${index}`} label="Age" value={p.age} onChange={e => handlePetChange(index, 'age', e.target.value)} />
              <FormInput id={`pWeight${index}`} label="Weight (lbs)" value={p.weight} onChange={e => handlePetChange(index, 'weight', e.target.value)} />
            </div>
          </div>
        ))}
        {hasPets && <button type="button" onClick={addPet} className="btn btn-secondary">Add Another Pet</button>}
      </div>
    </div>
  );
};

const CreditHistoryForm = ({ data, setData }) => {
    const handleFilesUpdate = (field, newFiles) => {
        setData(prev => ({
            ...prev,
            creditHistory: {
                ...prev.creditHistory,
                [field]: newFiles,
            },
        }));
    };

    return (
        <div className="form-section" id="credit-history-section">
            <h2 className="form-section-title">Credit History & Reports</h2>
            <p>As part of the application process, we require a recent credit report, including your credit score and payment history, from each of the three major credit bureaus. Please obtain and upload your reports from the following services:</p>
            <ul className="info-list">
                <li><strong>TransUnion</strong> (via SmartMove)</li>
                <li><strong>Experian</strong> (via Experian Connect)</li>
                <li><strong>Equifax</strong></li>
            </ul>
            <p className="field-hint" style={{textAlign: 'left', marginTop: 0}}>While you can request a free annual report, these often do not include your credit score. Please use the paid services listed to obtain a complete report. Upload each report in the designated section below.</p>

            <div className="document-upload-list">
                <DocumentUploadField
                    id="transunionReport"
                    label="TransUnion SmartMove Report"
                    files={data.transunionReport}
                    onFilesUpdate={(files) => handleFilesUpdate('transunionReport', files)}
                />
                <DocumentUploadField
                    id="experianReport"
                    label="Experian Connect Report"
                    files={data.experianReport}
                    onFilesUpdate={(files) => handleFilesUpdate('experianReport', files)}
                />
                <DocumentUploadField
                    id="equifaxReport"
                    label="Equifax Credit Report"
                    files={data.equifaxReport}
                    onFilesUpdate={(files) => handleFilesUpdate('equifaxReport', files)}
                />
            </div>
        </div>
    );
};

const CriminalHistoryForm = ({ data, setData }) => {
    const handleFilesUpdate = (field, newFiles) => {
        setData(prev => ({
            ...prev,
            criminalHistory: {
                ...prev.criminalHistory,
                [field]: newFiles,
            },
        }));
    };
  
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setData(prev => ({
        ...prev,
        criminalHistory: { ...prev.criminalHistory, fcraConsent: checked }
    }));
  };

  return (
    <div className="form-section" id="criminal-history-section">
      <h2 className="form-section-title">Criminal History Verification</h2>
      <p>Please obtain and upload your criminal history report from each of the following services. A comprehensive background check is a required step in our screening process.</p>
      <ul className="info-list">
          <li><strong>TransUnion SmartMove</strong></li>
          <li><strong>Experian Connect</strong></li>
          <li><strong>Avail</strong></li>
          <li><strong>MyRental</strong></li>
      </ul>
      <p className="field-hint" style={{textAlign: 'left', marginTop: 0}}>Upload the requested documents to the relevant institution's upload section below.</p>

      <div className="document-upload-list">
            <DocumentUploadField
              id="transunionCriminalReport"
              label="TransUnion SmartMove Report"
              files={data.transunionReport}
              onFilesUpdate={(files) => handleFilesUpdate('transunionReport', files)}
            />
            <DocumentUploadField
                id="experianCriminalReport"
                label="Experian Connect Report"
                files={data.experianReport}
                onFilesUpdate={(files) => handleFilesUpdate('experianReport', files)}
            />
            <DocumentUploadField
                id="availCriminalReport"
                label="Avail Criminal History Report"
                files={data.availReport}
                onFilesUpdate={(files) => handleFilesUpdate('availReport', files)}
            />
            <DocumentUploadField
                id="myRentalCriminalReport"
                label="MyRental Criminal History Report"
                files={data.myRentalReport}
                onFilesUpdate={(files) => handleFilesUpdate('myRentalReport', files)}
            />
      </div>
      
      <div className="form-subsection">
          <h3>Fair Credit Reporting Act (FCRA) Consent</h3>
          <div className="disclosure-text" style={{backgroundColor: 'var(--surface-color)', marginTop: 0}}>
              <p>By checking this box, I provide my express written consent under the Fair Credit Reporting Act (FCRA) for the landlord and/or their designated agents to obtain and review consumer reports, including criminal history records, as part of my rental application screening process. I understand this consent applies to this application and any future updates or renewals of my tenancy.</p>
          </div>
          <div className="checkbox-group">
              <input
                  type="checkbox"
                  id="fcraConsent"
                  checked={data.fcraConsent}
                  onChange={handleConsentChange}
              />
              <label htmlFor="fcraConsent">I agree and provide my express written consent.</label>
          </div>
      </div>
    </div>
  );
};

const EvictionHistoryForm = ({ data, setData }) => {
    const handleFilesUpdate = (field, newFiles) => {
        setData(prev => ({
            ...prev,
            evictionHistory: {
                ...prev.evictionHistory,
                [field]: newFiles,
            },
        }));
    };

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setData(prev => ({
            ...prev,
            evictionHistory: { ...prev.evictionHistory, fcraConsent: checked }
        }));
    };

    return (
        <div className="form-section" id="eviction-history-section">
            <h2 className="form-section-title">Eviction History</h2>
            <p>A review of eviction history is a standard part of our application process. Please obtain and upload your eviction history report from each of the following tenant screening services.</p>
            <ul className="info-list">
                <li><strong>TransUnion SmartMove</strong></li>
                <li><strong>Experian Connect</strong></li>
                <li><strong>Avail</strong></li>
                <li><strong>MyRental</strong></li>
            </ul>
            <div className="document-upload-list">
                <DocumentUploadField
                    id="transunionEvictionReport"
                    label="TransUnion SmartMove Eviction Report"
                    files={data.transunionEvictionReport}
                    onFilesUpdate={(files) => handleFilesUpdate('transunionEvictionReport', files)}
                />
                <DocumentUploadField
                    id="experianEvictionReport"
                    label="Experian Connect Eviction Report"
                    files={data.experianEvictionReport}
                    onFilesUpdate={(files) => handleFilesUpdate('experianEvictionReport', files)}
                />
                <DocumentUploadField
                    id="availEvictionReport"
                    label="Avail Eviction History Report"
                    files={data.availEvictionReport}
                    onFilesUpdate={(files) => handleFilesUpdate('availEvictionReport', files)}
                />
                <DocumentUploadField
                    id="myRentalEvictionReport"
                    label="MyRental Eviction History Report"
                    files={data.myRentalEvictionReport}
                    onFilesUpdate={(files) => handleFilesUpdate('myRentalEvictionReport', files)}
                />
            </div>

            <div className="form-subsection">
                <h3>Fair Credit Reporting Act (FCRA) Consent</h3>
                <div className="disclosure-text" style={{backgroundColor: 'var(--surface-color)', marginTop: 0}}>
                    <p>By checking this box, I provide my express written consent under the Fair Credit Reporting Act (FCRA) for the landlord and/or their designated agents to obtain and review consumer reports, including eviction history records, as part of my rental application screening process. I understand this consent applies to this application and any future updates or renewals of my tenancy.</p>
                </div>
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="evictionFcraConsent"
                        checked={data.fcraConsent}
                        onChange={handleConsentChange}
                    />
                    <label htmlFor="evictionFcraConsent">I agree and provide my express written consent.</label>
                </div>
            </div>
        </div>
    );
};

const DisclosuresForm = ({ data, setData }) => {
    const handleChange = (field, value) => {
        setData(prev => ({
            ...prev,
            disclosures: { ...prev.disclosures, [field]: value }
        }));
    };
    
    const isFormValid = data.agreement && data.signature && data.date;

    return (
        <div className="form-section" id="disclosures-section">
            <h2 className="form-section-title">Disclosures and Authorizations</h2>
            <p>Please carefully read the following statements and provide your final authorization to process this application.</p>
            <div className="disclosure-text">
                <p>I certify that all the information provided in this rental application is true, accurate, and complete to the best of my knowledge. I understand that any false statements, misrepresentations, or omissions may result in the denial of my application or the termination of my lease agreement.</p>
                <p>I authorize the landlord or their agents to verify all information provided, including but not to, contacting previous landlords, employers, and references. I also authorize them to perform a background check, which may include credit history, criminal records, and eviction history.</p>
                <p>I understand that a non-refundable application fee may be required to process this application. This fee is for the cost of screening and is not a deposit or rent payment.</p>
            </div>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="agreement"
                    checked={data.agreement}
                    onChange={(e) => handleChange('agreement', e.target.checked)}
                />
                <label htmlFor="agreement">I have read, understood, and agree to the terms above.</label>
            </div>
            <FormInput
                id="finalSignature"
                label="Applicant Signature"
                value={data.signature}
                onChange={(e) => handleChange('signature', e.target.value)}
                placeholder="Type your full name to sign"
                required
            />
            <FormInput
                id="finalDate"
                label="Date"
                type="date"
                value={data.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
            />
        </div>
    );
};


// Fix: Defined the `useAutoSave` custom hook. This hook automatically saves
// form data to localStorage, persisting user progress and fixing the "Cannot find name" error.
const useAutoSave = (data, key) => {
  useEffect(() => {
    if (!key) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to auto-save form data:', error);
      }
    }, 500); // Debounce to prevent excessive writes

    return () => clearTimeout(timeoutId);
  }, [data, key]);
};


// --- MAIN APPLICATION FORM COMPONENT ---
export const ApplicationForm = ({ initialReferenceId = null }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState(() => {
        try {
            const savedData = localStorage.getItem('rental-app-autosave');
            return savedData ? JSON.parse(savedData) : blankFormData;
        } catch {
            return blankFormData;
        }
    });
    const [landlordConfig, setLandlordConfig] = useState(defaultConfig);
    
    const referenceId = formData?.personalInfo?.referenceId || 'rental-app-autosave';
    useAutoSave(formData, referenceId);
    
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleReferenceIdChange = (id: string) => {
        if (!id) return;
        const config = landlordConfigs[id] || defaultConfig;
        setLandlordConfig(config);

        const savedDataJSON = localStorage.getItem(id);
        if (savedDataJSON) {
            try {
                const savedData = JSON.parse(savedDataJSON);
                setFormData(savedData);
                return; // Exit after setting state from saved data
            } catch (err) {
                console.error('Error parsing saved application data:', err);
            }
        }

        // If no saved data, just update the reference ID in the current state
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, referenceId: id }
        }));
    };

    useEffect(() => {
        if (initialReferenceId) {
            handleReferenceIdChange(initialReferenceId);
        }
    }, [initialReferenceId]);
    
    const completionStatus = useMemo(() => {
        const { requiredSections } = landlordConfig;
        if (!requiredSections || requiredSections.length === 0) {
            return {
                percentage: 100,
                completedCount: TABS.length,
                totalRequired: TABS.length,
                isSubmittable: true,
                completedSections: Object.values(FORM_KEYS),
                incompleteSections: [],
                incompleteSectionsText: [],
            };
        }

        const completedSections = [];
        const incompleteSections = [];
        
        const keyToTabName = {
            [FORM_KEYS.personalInfo]: TABS[0],
            [FORM_KEYS.rentalHistory]: TABS[1],
            [FORM_KEYS.employmentVerification]: TABS[2],
            [FORM_KEYS.householdOccupants]: TABS[3],
            [FORM_KEYS.references]: TABS[4],
            [FORM_KEYS.vehiclesAndPets]: TABS[5],
            [FORM_KEYS.creditHistory]: TABS[6],
            [FORM_KEYS.criminalHistory]: TABS[7],
            [FORM_KEYS.evictionHistory]: TABS[8],
            [FORM_KEYS.disclosures]: TABS[9],
            [FORM_KEYS.screeningReport]: TABS[10],
        };

        requiredSections.forEach(sectionKey => {
            const validationFn = VALIDATION_RULES[sectionKey];
            const sectionData = formData[sectionKey];
            if (validationFn && sectionData && validationFn(sectionData)) {
                completedSections.push(sectionKey);
            } else {
                incompleteSections.push(sectionKey);
            }
        });

        const completedCount = completedSections.length;
        const totalRequired = requiredSections.length;
        const percentage = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 100;

        return {
            percentage,
            completedCount,
            totalRequired,
            isSubmittable: incompleteSections.length === 0,
            completedSections,
            incompleteSections,
            incompleteSectionsText: incompleteSections.map(key => keyToTabName[key] || key),
        };
    }, [formData, landlordConfig]);


    const handleTabClick = (index) => {
        setActiveTab(index);
        tabRefs.current[index]?.focus();
    };

    const getFormComponent = (index) => {
        switch (index) {
            case 0: return <PersonalInfoForm data={formData.personalInfo} setData={setFormData} onReferenceIdChange={handleReferenceIdChange} isReadOnly={!!initialReferenceId} />;
            case 1: return <RentalHistoryForm formData={formData} setFormData={setFormData} />;
            case 2: return <EmploymentVerificationForm data={formData.employmentVerification} setData={setFormData} />;
            case 3: return <HouseholdForm data={formData.householdOccupants} setData={setFormData} />;
            case 4: return <ReferencesForm formData={formData} setFormData={setFormData} />;
            case 5: return <VehiclesPetsForm data={formData.vehiclesAndPets} setData={setFormData} />;
            case 6: return <CreditHistoryForm data={formData.creditHistory} setData={setFormData} />;
            case 7: return <CriminalHistoryForm data={formData.criminalHistory} setData={setFormData} />;
            case 8: return <EvictionHistoryForm data={formData.evictionHistory} setData={setFormData} />;
            case 9: return <DisclosuresForm data={formData.disclosures} setData={setFormData} />;
            case 10: return <ScreeningReport formData={formData} setFormData={setFormData} />;
            default: return null;
        }
    };

    const formKeyMapping = Object.values(FORM_KEYS);

    return (
        <>
            <div className="app-banner">
                <h1>Rental Application Form</h1>
                <p>Applying for: <strong>{landlordConfig.propertyName}</strong></p>
            </div>

            <main className="main-content">
                <CompletionProgress status={completionStatus} />
                <div className="progress-indicator" role="tablist" aria-label="Application Sections">
                {TABS.map((tab, index) => {
                    const sectionKey = formKeyMapping[index];
                    const isRequired = landlordConfig.requiredSections.includes(sectionKey);
                    const isComplete = completionStatus.completedSections.includes(sectionKey);

                    return (
                    <div
                        key={index}
                        id={`tab-${index}`}
                        className={`progress-step ${index === activeTab ? 'active' : ''} ${isComplete ? 'completed' : ''}`}
                        onClick={() => handleTabClick(index)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTabClick(index)}
                        ref={el => { tabRefs.current[index] = el; }}
                        role="tab"
                        aria-selected={index === activeTab}
                        aria-controls={`tab-panel-${index}`}
                        tabIndex={0}
                    >
                        <div className="step-circle">{index + 1}</div>
                        <div className={`step-title ${isRequired ? 'required' : ''}`}>{tab}</div>
                    </div>
                    );
                })}
                </div>

                <div className="module-container">
                <div>
                    {TABS.map((_, index) => (
                    <div
                        key={index}
                        className={`form-tab-content ${activeTab === index ? 'active' : ''}`}
                        id={`tab-panel-${index}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${index}`}
                    >
                        {getFormComponent(index)}
                    </div>
                    ))}
                    <FormNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        totalTabs={TABS.length}
                        formData={formData}
                        propertyName={landlordConfig.propertyName}
                        isSubmittable={completionStatus.isSubmittable}
                        incompleteSections={completionStatus.incompleteSectionsText}
                    />
                </div>
                </div>
            </main>
        </>
    );
};