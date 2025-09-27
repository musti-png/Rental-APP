/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { US_STATES, STATE_SPECIFIC_INFO, LEGAL_CLAUSES, STATE_REQUIRED_CLAUSES } from './constants';
import { FormInput } from './utils';


const LeaseAgreementPrintView = ({ data }) => {
    return (
        <div className="lease-print-view">
            <h1>Residential Lease Agreement</h1>
            
            <section>
                <h2>1. The Parties</h2>
                <div className="print-grid">
                    <div>
                        <h3>Landlord / Lessor</h3>
                        <p><strong>Name:</strong> {data.parties.lessor.name || 'N/A'}</p>
                        <p><strong>Address:</strong> {data.parties.lessor.address || 'N/A'}</p>
                        <p><strong>Phone:</strong> {data.parties.lessor.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> {data.parties.lessor.email || 'N/A'}</p>
                    </div>
                    <div>
                        <h3>Tenant / Lessee</h3>
                        <p><strong>Name:</strong> {data.parties.lessee.name || 'N/A'}</p>
                        <p><strong>Address:</strong> {data.parties.lessee.address || 'N/A'}</p>
                        <p><strong>Phone:</strong> {data.parties.lessee.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> {data.parties.lessee.email || 'N/A'}</p>
                    </div>
                </div>
            </section>

            <section>
                <h2>2. The Leased Property</h2>
                <p><strong>Address:</strong> {`${data.property.streetAddress}, ${data.property.city}, ${data.property.state} ${data.property.zipCode}`}</p>
                <p><strong>Lease Term:</strong> {data.property.term}</p>
                <p><strong>Start Date:</strong> {data.property.startDate}</p>
                <p><strong>End Date:</strong> {data.property.endDate}</p>
                <p><strong>Monthly Rent:</strong> ${data.property.rentAmount}</p>
                <p><strong>Security Deposit:</strong> ${data.property.securityDeposit}</p>
                <p><strong>Utilities Included:</strong> {Object.entries(data.property.utilities).filter(([, val]) => val).map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)).join(', ') || 'None'}</p>
            </section>
            
            {data.stateInfo.disclosures.length > 0 && (
                <section>
                    <h2>3. State-Specific Disclosures for {data.property.state}</h2>
                    {data.stateInfo.disclosures.map((disc, index) => (
                        <div key={index} className="print-disclosure">
                            <strong>{disc.title}</strong>
                            <p>{disc.text}</p>
                        </div>
                    ))}
                </section>
            )}

            <section>
                <h2>4. Legal Clauses & Addenda</h2>
                {Object.entries(data.clauses).length > 0 ? Object.entries(data.clauses).map(([key, clause]) => {
                    const typedClause = clause as { included: boolean; text: string; };
                    if (!typedClause.included) return null;
                    return (
                        <div key={key} className="print-clause">
                            <h3 style={{textTransform: 'capitalize'}}>{key}</h3>
                            <p>{typedClause.text}</p>
                        </div>
                    )
                }) : <p>No additional clauses included.</p>}
            </section>
            
            <section>
                <h2>5. Rent Payment Information</h2>
                <p><strong>Payable To:</strong> {data.payment.recipientName}</p>
                <p><strong>Mailing Address for Checks:</strong> {data.payment.paymentAddress}</p>
                <p><strong>Bank Name:</strong> {data.payment.bankName}</p>
                <p><strong>Account Number:</strong> {data.payment.accountNumber}</p>
                <p><strong>Routing Number:</strong> {data.payment.routingNumber}</p>
            </section>

            <section className="print-signatures">
                <h2>6. Signatures</h2>
                <p>The parties listed below hereby agree to the terms and conditions of this lease agreement.</p>
                <div className="print-grid">
                    <div className="signature-box">
                        <p className="signature-line"><strong>Lessor Signature:</strong> {data.signatures.lessorSignature}</p>
                        <p><strong>Date:</strong> {data.signatures.lessorDate}</p>
                    </div>
                    <div className="signature-box">
                        <p className="signature-line"><strong>Lessee Signature:</strong> {data.signatures.lesseeSignature}</p>
                        <p><strong>Date:</strong> {data.signatures.lesseeDate}</p>
                    </div>
                </div>
            </section>
        </div>
    )
};

export const LeaseAgreementForm = () => {
    const [leaseData, setLeaseData] = useState({
        parties: {
            lessor: { name: '', address: '', phone: '', email: '' },
            lessee: { name: '', address: '', phone: '', email: '' },
        },
        property: {
            streetAddress: '', city: '', state: 'California', zipCode: '',
            rentAmount: '', startDate: '', endDate: '', term: '12 Months Fixed',
            securityDeposit: '', utilities: { water: false, gas: false, electricity: false, trash: false, internet: false }
        },
        stateInfo: {
            disclosures: STATE_SPECIFIC_INFO['California'] || []
        },
        clauses: LEGAL_CLAUSES,
        payment: {
            recipientName: '', bankName: '', accountNumber: '', routingNumber: '', paymentAddress: ''
        },
        signatures: {
            lessorSignature: '', lessorDate: '', lesseeSignature: '', lesseeDate: '',
        }
    });

    const handlePartyChange = (party, field, value) => {
        setLeaseData(prev => ({
            ...prev,
            parties: { ...prev.parties, [party]: { ...prev.parties[party], [field]: value } }
        }));
    };
    
    const handlePropertyChange = (field, value) => {
        setLeaseData(prev => ({
            ...prev,
            property: { ...prev.property, [field]: value }
        }));
    };

    const handleUtilityChange = (utility, isChecked) => {
        setLeaseData(prev => ({
            ...prev,
            property: {
                ...prev.property,
                utilities: { ...prev.property.utilities, [utility]: isChecked }
            }
        }));
    };

    const handleStateChange = (e) => {
        const newState = e.target.value;
        const requiredClausesForState = STATE_REQUIRED_CLAUSES[newState] || [];
        const newDisclosures = STATE_SPECIFIC_INFO[newState] || [];

        setLeaseData(prev => {
            const updatedClauses = { ...prev.clauses };
            // Set required clauses to true
            requiredClausesForState.forEach(key => {
                if (updatedClauses[key]) {
                    updatedClauses[key].included = true;
                }
            });

            return {
                ...prev,
                property: { ...prev.property, state: newState },
                stateInfo: { disclosures: newDisclosures },
                clauses: updatedClauses,
            };
        });
    };

    const handleClauseChange = (clauseKey, field, value) => {
        setLeaseData(prev => ({
            ...prev,
            clauses: {
                ...prev.clauses,
                [clauseKey]: { ...prev.clauses[clauseKey], [field]: value }
            }
        }));
    };

    const handlePaymentChange = (field, value) => {
        setLeaseData(prev => ({
            ...prev,
            payment: { ...prev.payment, [field]: value }
        }));
    };

    const handleSignatureChange = (party, field, value) => {
        setLeaseData(prev => ({
            ...prev,
            signatures: { ...prev.signatures, [`${party}${field}`]: value }
        }));
    };
    
    const handleGeneratePdf = async () => {
        const printContainer = document.createElement('div');
        // Style for offscreen rendering
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-10000px';
        printContainer.style.top = '0';
        printContainer.style.width = '8.5in'; // Standard letter size width for better canvas scaling
        printContainer.style.padding = '0.5in';
        printContainer.style.background = 'white';
        printContainer.style.fontFamily = 'var(--font-family)';
        printContainer.style.color = 'black';
        document.body.appendChild(printContainer);

        const root = ReactDOM.createRoot(printContainer);
        
        try {
            // Use flushSync to ensure the component renders synchronously before capturing
            flushSync(() => {
                root.render(<LeaseAgreementPrintView data={leaseData} />);
            });

            // Small delay to ensure styles and images are loaded, if any
            await new Promise(resolve => setTimeout(resolve, 200));

            const canvas = await html2canvas(printContainer, {
                scale: 2,
                useCORS: true,
                windowWidth: printContainer.scrollWidth,
                windowHeight: printContainer.scrollHeight,
            });

            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pageWidth / imgWidth;
            const canvasHeightInPdf = imgHeight * ratio;

            const pageData = canvas.toDataURL('image/png', 1.0);
            
            let heightLeft = canvasHeightInPdf;
            let position = 0;
            
            pdf.addImage(pageData, 'PNG', 0, position, pageWidth, canvasHeightInPdf);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(pageData, 'PNG', 0, position, pageWidth, canvasHeightInPdf);
                heightLeft -= pageHeight;
            }

            pdf.save('lease-agreement.pdf');
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Could not generate PDF. See console for details.");
        } finally {
            // Cleanup: also use flushSync for unmounting
            flushSync(() => {
                root.unmount();
            });
            document.body.removeChild(printContainer);
        }
    };

    return (
        <main className="main-content">
            <div className="lease-agreement-container">
                <h1 className="lease-title">Residential Lease Agreement</h1>

                <div className="lease-section">
                    <h2>1. The Parties</h2>
                    <p>This agreement is made between the following parties.</p>
                    <div className="form-grid">
                        <div className="form-subsection">
                            <h3>Landlord / Lessor</h3>
                            <FormInput id="lessorName" label="Full Name" value={leaseData.parties.lessor.name} onChange={e => handlePartyChange('lessor', 'name', e.target.value)} />
                            <FormInput id="lessorAddress" label="Mailing Address" value={leaseData.parties.lessor.address} onChange={e => handlePartyChange('lessor', 'address', e.target.value)} />
                            <FormInput id="lessorPhone" label="Phone Number" type="tel" value={leaseData.parties.lessor.phone} onChange={e => handlePartyChange('lessor', 'phone', e.target.value)} />
                            <FormInput id="lessorEmail" label="Email Address" type="email" value={leaseData.parties.lessor.email} onChange={e => handlePartyChange('lessor', 'email', e.target.value)} />
                        </div>
                        <div className="form-subsection">
                            <h3>Tenant / Lessee</h3>
                            <FormInput id="lesseeName" label="Full Name" value={leaseData.parties.lessee.name} onChange={e => handlePartyChange('lessee', 'name', e.target.value)} />
                            <FormInput id="lesseeAddress" label="Current Mailing Address" value={leaseData.parties.lessee.address} onChange={e => handlePartyChange('lessee', 'address', e.target.value)} />
                            <FormInput id="lesseePhone" label="Phone Number" type="tel" value={leaseData.parties.lessee.phone} onChange={e => handlePartyChange('lessee', 'phone', e.target.value)} />
                            <FormInput id="lesseeEmail" label="Email Address" type="email" value={leaseData.parties.lessee.email} onChange={e => handlePartyChange('lessee', 'email', e.target.value)} />
                        </div>
                    </div>
                </div>
                
                <div className="lease-section">
                    <h2>2. The Leased Property</h2>
                    <p>Details of the property being leased.</p>
                    <div className="form-grid">
                        <FormInput containerClassName="full-width-grid-item" id="streetAddress" label="Street Address" value={leaseData.property.streetAddress} onChange={e => handlePropertyChange('streetAddress', e.target.value)} />
                        <FormInput id="city" label="City" value={leaseData.property.city} onChange={e => handlePropertyChange('city', e.target.value)} />
                        <div className="form-group">
                            <label htmlFor="propertyState">State</label>
                            <select id="propertyState" value={leaseData.property.state} onChange={handleStateChange}>
                                {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                        </div>
                        <FormInput id="zipCode" label="Zip Code" value={leaseData.property.zipCode} onChange={e => handlePropertyChange('zipCode', e.target.value)} />
                        <FormInput id="rentAmount" label="Monthly Rent ($)" type="number" value={leaseData.property.rentAmount} onChange={e => handlePropertyChange('rentAmount', e.target.value)} />
                        <FormInput id="startDate" label="Lease Start Date" type="date" value={leaseData.property.startDate} onChange={e => handlePropertyChange('startDate', e.target.value)} />
                        <FormInput id="endDate" label="Lease End Date" type="date" value={leaseData.property.endDate} onChange={e => handlePropertyChange('endDate', e.target.value)} />
                        <div className="form-group">
                            <label htmlFor="leaseTerm">Lease Term</label>
                            <select id="leaseTerm" value={leaseData.property.term} onChange={e => handlePropertyChange('term', e.target.value)}>
                                <option>12 Months Fixed</option>
                                <option>6 Months Fixed</option>
                                <option>Month-to-Month</option>
                            </select>
                        </div>
                        <FormInput id="securityDeposit" label="Security Deposit ($)" type="number" value={leaseData.property.securityDeposit} onChange={e => handlePropertyChange('securityDeposit', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Utilities Included in Rent (check all that apply)</label>
                        <div className="checkbox-grid">
                            {Object.keys(leaseData.property.utilities).map(util => (
                                <div className="checkbox-group" key={util}>
                                    <input type="checkbox" id={`util-${util}`} checked={leaseData.property.utilities[util]} onChange={e => handleUtilityChange(util, e.target.checked)} />
                                    <label htmlFor={`util-${util}`} style={{textTransform: 'capitalize'}}>{util}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lease-section state-specific-section">
                    <h2>3. State-Specific Disclosures for {leaseData.property.state}</h2>
                    <p>These disclosures may be required by law in your state.</p>
                    {leaseData.stateInfo.disclosures.length > 0 ? leaseData.stateInfo.disclosures.map((disc, index) => (
                        <div key={index} className="disclosure-text">
                            <strong>{disc.title}</strong>
                            <p>{disc.text}</p>
                        </div>
                    )) : <p>No specific disclosures listed for the selected state.</p>}
                </div>

                <div className="lease-section">
                    <h2>4. Legal Clauses & Addenda</h2>
                    <p>Select the clauses to include in the lease agreement.</p>
                    <div className="clauses-list">
                        {Object.entries(leaseData.clauses).map(([key, clause]) => {
                            // Fix: Add type assertion to correctly access properties on the `clause` object.
                            const typedClause = clause as { included: boolean; text: string; };
                            const isRequired = (STATE_REQUIRED_CLAUSES[leaseData.property.state] || []).includes(key);
                            return (
                                <div key={key} className="clause-item">
                                    <div className="checkbox-group">
                                        <input type="checkbox" id={`clause-${key}`} checked={typedClause.included} onChange={e => !isRequired && handleClauseChange(key, 'included', e.target.checked)} disabled={isRequired} />
                                        <label htmlFor={`clause-${key}`} style={{textTransform: 'capitalize'}}>
                                            {key}
                                            {isRequired && <span className="mandatory-indicator">(Mandatory for {leaseData.property.state})</span>}
                                        </label>
                                    </div>
                                    {typedClause.included && (
                                        <div className="form-group">
                                            <textarea value={typedClause.text} onChange={e => handleClauseChange(key, 'text', e.target.value)} rows={4} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="lease-section">
                    <h2>5. Rent Payment Information</h2>
                    <p>Provide details for where and how rent payments should be made.</p>
                    <div className="form-grid">
                        <FormInput id="recipientName" label="Payable To (Recipient Name)" value={leaseData.payment.recipientName} onChange={e => handlePaymentChange('recipientName', e.target.value)} />
                        <FormInput id="paymentAddress" label="Mailing Address for Checks" value={leaseData.payment.paymentAddress} onChange={e => handlePaymentChange('paymentAddress', e.target.value)} />
                        <FormInput id="bankName" label="Bank Name (for transfers)" value={leaseData.payment.bankName} onChange={e => handlePaymentChange('bankName', e.target.value)} />
                        <FormInput id="accountNumber" label="Account Number" value={leaseData.payment.accountNumber} onChange={e => handlePaymentChange('accountNumber', e.target.value)} />
                        <FormInput id="routingNumber" label="Routing Number" value={leaseData.payment.routingNumber} onChange={e => handlePaymentChange('routingNumber', e.target.value)} />
                    </div>
                </div>

                <div className="lease-section">
                    <h2>6. Signatures</h2>
                    <p>By signing below, the parties agree to the terms and conditions of this lease agreement.</p>
                    <div className="form-grid">
                        <div className="form-subsection">
                            <h3>Lessor</h3>
                            <FormInput id="lessorSignature" label="Lessor Signature" value={leaseData.signatures.lessorSignature} onChange={e => handleSignatureChange('lessor', 'Signature', e.target.value)} placeholder="Type full name to sign" />
                            <FormInput id="lessorDate" label="Date" type="date" value={leaseData.signatures.lessorDate} onChange={e => handleSignatureChange('lessor', 'Date', e.target.value)} />
                        </div>
                        <div className="form-subsection">
                            <h3>Lessee</h3>
                            <FormInput id="lesseeSignature" label="Lessee Signature" value={leaseData.signatures.lesseeSignature} onChange={e => handleSignatureChange('lessee', 'Signature', e.target.value)} placeholder="Type full name to sign" />
                            <FormInput id="lesseeDate" label="Date" type="date" value={leaseData.signatures.lesseeDate} onChange={e => handleSignatureChange('lessee', 'Date', e.target.value)} />
                        </div>
                    </div>
                </div>
                
                <div className="lease-actions">
                    <button type="button" className="btn btn-primary" onClick={handleGeneratePdf}>Generate Lease PDF</button>
                </div>
            </div>
        </main>
    );
};
