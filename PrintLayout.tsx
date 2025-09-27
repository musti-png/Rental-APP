/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

// --- HELPER COMPONENTS for printing ---

// Fix: Define PrintField as a React.FC with an explicit props interface.
// This ensures it's correctly typed as a React component, allowing the use of
// the `key` prop when rendering lists, which resolves the TypeScript error.
interface PrintFieldProps {
    label: string;
    value: any;
}
const PrintField: React.FC<PrintFieldProps> = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
        <p className="print-field">
            <strong className="print-label">{label}:</strong>
            <span className="print-value">{Array.isArray(displayValue) ? displayValue.join(', ') : displayValue}</span>
        </p>
    );
};

const PrintImage = ({ label, src, altText = 'Uploaded Image' }) => {
    if (!src) return null;
    return (
        <div className="print-image-container">
            <strong>{label}</strong>
            <img src={src} alt={altText} className="print-image" />
        </div>
    );
};

// --- MAIN PRINT LAYOUT COMPONENT ---

export const PrintLayout = ({ formData, propertyName }) => {
    const {
        personalInfo = {},
        rentalHistory = [],
        employmentVerification = {},
        householdOccupants = [],
        references = [],
        vehiclesAndPets = {},
        creditHistory = {},
        criminalHistory = {},
        evictionHistory = {},
        disclosures = {},
        screeningReport = {},
    } = formData;

    const hasData = (obj) => obj && Object.values(obj).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0));

    const renderDocuments = (label, files) => {
        if (!files || files.length === 0) return null;
        return (
            <div className="print-subsection" style={{ marginTop: '1rem' }}>
                <h3>{label}</h3>
                <div className="print-document-grid">
                    {files.map((file, index) => (
                        <div key={index} className="print-document-item">
                            <p title={file.name} className="print-document-name">{file.name}</p>
                            {file.mimeType.startsWith('image/') ? (
                                <img src={file.data} alt={file.name} className="print-document-image" />
                            ) : (
                                <div className="file-placeholder">
                                    <span role="img" aria-label="document icon">📄</span>
                                    <p>PDF Document</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="print-layout">
            <h1>Rental Application</h1>
            <section className="print-header-info">
                <PrintField label="Applying for Property" value={propertyName} />
                <PrintField label="Application Date" value={new Date().toLocaleDateString()} />
            </section>

            {hasData(personalInfo) && (
                <section>
                    <h2>Personal Information</h2>
                    <div className="print-grid">
                        <PrintImage label="Applicant Photo" src={personalInfo.photo} altText="Applicant Photo" />
                        <div>
                            <PrintField label="Full Legal Name" value={personalInfo.fullName} />
                            <PrintField label="Date of Birth" value={personalInfo.dob} />
                            <PrintField label="SSN" value={personalInfo.ssn} />
                            <PrintField label="Driver's License / ID" value={personalInfo.license} />
                        </div>
                        <div>
                            <PrintField label="Phone Number" value={personalInfo.phone} />
                            <PrintField label="Email Address" value={personalInfo.email} />
                        </div>
                    </div>
                    <div className="print-grid" style={{ marginTop: '1rem' }}>
                        <PrintImage label="ID Front" src={personalInfo.idFront?.[0]?.data} altText="ID Front" />
                        <PrintImage label="ID Back" src={personalInfo.idBack?.[0]?.data} altText="ID Back" />
                    </div>
                </section>
            )}

            {rentalHistory.length > 0 && hasData(rentalHistory[0]) && (
                <section>
                    <h2>Rental History</h2>
                    {rentalHistory.map((res, index) => (
                        <div key={index} className="print-subsection">
                            <h3>Residence #{index + 1}</h3>
                            <PrintField label="Address" value={res.address} />
                            <div className="print-grid">
                                <PrintField label="Type" value={res.type} />
                                <PrintField label="Move-in Date" value={res.moveIn} />
                                <PrintField label="Move-out Date" value={res.moveOut} />
                                <PrintField label="Landlord Name" value={res.landlordName} />
                                <PrintField label="Landlord Contact" value={res.landlordContact} />
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {hasData(employmentVerification) && (
                <section>
                    <h2>Employment & Income</h2>
                    <PrintField label="Employment Status" value={employmentVerification.employmentStatus} />
                    <PrintField label="Employer Name" value={employmentVerification.employerName} />
                    <PrintField label="Job Title" value={employmentVerification.jobTitle} />
                    <PrintField label="Gross Monthly Income" value={employmentVerification.grossMonthlyIncome ? `$${parseFloat(employmentVerification.grossMonthlyIncome).toFixed(2)}` : ''} />
                    {employmentVerification.otherIncomeSources?.length > 0 && (
                        <div className="print-subsection">
                            <h3>Other Income Sources</h3>
                            {employmentVerification.otherIncomeSources.map((s, i) => (
                                <PrintField key={i} label={`Source ${i+1}`} value={`${s.source}: $${parseFloat(s.amount || 0).toFixed(2)}`} />
                            ))}
                        </div>
                    )}
                    <PrintField label="Applicant Signature (Authorization)" value={employmentVerification.signature} />
                </section>
            )}
            
             {householdOccupants.length > 0 && (
                <section>
                    <h2>Household Occupants</h2>
                    {householdOccupants.map((occ, index) => (
                         <div key={index} className="print-subsection">
                            <h3>Occupant #{index + 1}</h3>
                             <div className="print-grid">
                                <PrintImage label="Photo" src={occ.photo} altText={`Occupant ${index + 1} Photo`} />
                                <div>
                                    <PrintField label="Name" value={`${occ.firstName} ${occ.lastName}`} />
                                    <PrintField label="Relationship" value={occ.relationship} />
                                    <PrintField label="Date of Birth" value={occ.dob} />
                                </div>
                             </div>
                             <div className="print-grid" style={{ marginTop: '1rem' }}>
                                 <PrintImage label="ID Front" src={occ.idFront?.[0]?.data} altText="Occupant ID Front" />
                                 <PrintImage label="ID Back" src={occ.idBack?.[0]?.data} altText="Occupant ID Back" />
                             </div>
                         </div>
                    ))}
                </section>
            )}

            {references.length > 0 && hasData(references[0]) && (
                 <section>
                    <h2>References</h2>
                    {references.map((ref, index) => (
                        <div key={index} className="print-subsection">
                             <h3>Reference #{index + 1}</h3>
                             <PrintField label="Name" value={ref.name} />
                             <PrintField label="Relationship" value={ref.relationship} />
                             <PrintField label="Phone" value={ref.phone} />
                             <PrintField label="Email" value={ref.email} />
                        </div>
                    ))}
                 </section>
            )}
            
            {hasData(vehiclesAndPets) && (vehiclesAndPets.hasVehicle === 'Yes' || vehiclesAndPets.hasPets === 'Yes') && (
                <section>
                    <h2>Vehicles & Pets</h2>
                    {vehiclesAndPets.hasVehicle === 'Yes' && vehiclesAndPets.vehicles?.length > 0 && (
                         <div className="print-subsection">
                            <h3>Vehicles</h3>
                            {vehiclesAndPets.vehicles.map((v, i) => (
                                <PrintField key={i} label={`Vehicle ${i+1}`} value={`${v.color} ${v.make} ${v.model}`} />
                            ))}
                         </div>
                    )}
                     {vehiclesAndPets.hasPets === 'Yes' && vehiclesAndPets.pets?.length > 0 && (
                         <div className="print-subsection">
                             <h3>Pets</h3>
                            {vehiclesAndPets.pets.map((p, i) => (
                                <PrintField key={i} label={`Pet ${i+1}`} value={`${p.name} (${p.type}, ${p.breed}), Age: ${p.age}, Weight: ${p.weight}lbs`} />
                            ))}
                         </div>
                    )}
                </section>
            )}

            <section>
                <h2>Uploaded Documents</h2>
                <p>The following documents were uploaded with this application. Images are embedded below. Please refer to the original files for PDF review.</p>
                {renderDocuments("Pay Slips", employmentVerification.incomeDocuments?.paySlips)}
                {renderDocuments("Bank Statements (6-Month)", employmentVerification.incomeDocuments?.bankStatements6Month)}
                {renderDocuments("Bank Statements (Last Year)", employmentVerification.incomeDocuments?.bankStatementsLastYear)}
                {renderDocuments("Credit Card Statements (3-Month)", employmentVerification.incomeDocuments?.creditCardStatements3Month)}
                {renderDocuments("Credit Card Statements (6-Month)", employmentVerification.incomeDocuments?.creditCardStatements6Month)}
                {renderDocuments("TransUnion Credit Report", creditHistory.transunionReport)}
                {renderDocuments("Experian Credit Report", creditHistory.experianReport)}
                {renderDocuments("Equifax Credit Report", creditHistory.equifaxReport)}
                {renderDocuments("Criminal History Reports", [...(criminalHistory.transunionReport || []), ...(criminalHistory.experianReport || []), ...(criminalHistory.availReport || []), ...(criminalHistory.myRentalReport || [])])}
                {renderDocuments("Eviction History Reports", [...(evictionHistory.transunionEvictionReport || []), ...(evictionHistory.experianEvictionReport || []), ...(evictionHistory.availEvictionReport || []), ...(evictionHistory.myRentalEvictionReport || [])])}
            </section>
            
            {hasData(disclosures) && (
                <section>
                    <h2>Disclosures and Authorization</h2>
                     <div className="print-subsection">
                        <PrintField label="Agreement to Terms" value={disclosures.agreement} />
                        <PrintField label="Applicant Signature" value={disclosures.signature} />
                        <PrintField label="Date" value={disclosures.date} />
                     </div>
                </section>
            )}

            {screeningReport.generated && (
                <section>
                    <h2>AI Screening Report</h2>
                    <div className="print-subsection">
                        <PrintField label="Screening Score" value={screeningReport.screeningScore} />
                        <PrintField label="Risk Level" value={screeningReport.riskLevel} />
                        <h3>Summary</h3>
                        <p>{screeningReport.summary}</p>
                    </div>
                     <div className="print-subsection">
                        <h3>Financial Analysis</h3>
                        <PrintField label="Cash Flow & Payroll" value={screeningReport.financialAnalysis?.cashFlow} />
                        <PrintField label="Rent Payment History" value={screeningReport.financialAnalysis?.rentPaymentHistory} />
                        <PrintField label="Utility Payment History" value={screeningReport.financialAnalysis?.utilityPaymentHistory} />
                        <PrintField label="Commitment to Paying Debts" value={screeningReport.financialAnalysis?.debtCommitment} />
                    </div>
                    {screeningReport.redFlags?.length > 0 && (
                        <div className="print-subsection">
                            <h3>Red Flags</h3>
                            <ul>{screeningReport.redFlags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};