/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Part, GenerateContentResponse, Type } from '@google/genai';

// A component to display the score visually
const ScoreMeter = ({ score }) => {
    // Score is 300-850. Let's map it to a percentage.
    const minScore = 300;
    const maxScore = 850;
    const percentage = ((score - minScore) / (maxScore - minScore)) * 100;

    let color = '#DE350B'; // Red for High Risk
    if (score >= 670) color = '#FFAB00'; // Yellow for Medium Risk
    if (score >= 740) color = '#00A383'; // Green for Low Risk

    return (
        <div className="score-meter-container">
            <div className="score-meter-score">{score}</div>
            <div className="score-meter-label">Screening Score</div>
            <svg viewBox="0 0 36 36" className="score-meter-circle">
                <path className="score-meter-circle-bg"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="score-meter-circle-fg"
                    stroke={color}
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
        </div>
    );
};


export const ScreeningReport = ({ formData, setFormData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const screeningData = formData.screeningReport || {};

    const requiredDocuments = useMemo(() => {
        const incomeDocs = formData.employmentVerification?.incomeDocuments || {};
        const creditDocs = formData.creditHistory || {};
        const personalInfo = formData.personalInfo || {};
        const household = formData.householdOccupants || [];

        let allFiles = [
            ...(incomeDocs.paySlips || []),
            ...(incomeDocs.bankStatements6Month || []),
            ...(incomeDocs.bankStatementsLastYear || []),
            ...(incomeDocs.creditCardStatements3Month || []),
            ...(incomeDocs.creditCardStatements6Month || []),
            ...(creditDocs.transunionReport || []),
            ...(creditDocs.experianReport || []),
            ...(creditDocs.equifaxReport || []),
            ...(personalInfo.idFront || []),
            ...(personalInfo.idBack || []),
        ];

        household.forEach(occupant => {
            if (occupant.idFront) allFiles = [...allFiles, ...occupant.idFront];
            if (occupant.idBack) allFiles = [...allFiles, ...occupant.idBack];
        });
        
        return allFiles.filter(f => f && f.data);
    }, [formData]);

    const canGenerate = requiredDocuments.length >= 2; // e.g., at least a bank statement and a credit report

    const handleGenerateReport = async () => {
        if (!canGenerate) {
            setError('Please upload income and credit documents in the previous sections before generating a report.');
            return;
        }

        setError('');
        setIsLoading(true);

        const prompt = `As an expert tenant screening analyst, evaluate the following documents for a rental applicant. Your response must be in JSON format using the provided schema.

Your analysis must be comprehensive and include the following:

1.  **Cash Flow & Payroll Analysis:**
    *   Examine bank statements for cash flow patterns.
    *   Identify payroll deposits, noting their frequency, source, and consistency.
    *   Note regular income sources, average monthly deposits, and significant recurring outflows.

2.  **Payment History Analysis:**
    *   Analyze bank and credit statements to identify recurring payments for rent and utilities (water, electricity, phone, etc.).
    *   Assess the timeliness of these payments. Note any evidence of late payments, missed payments, or related fees.

3.  **Debt Commitment Assessment:**
    *   Evaluate the applicant's overall commitment to paying debts based on their payment patterns for rent, utilities, credit accounts, and any other loans visible in the documents.

4.  **Overall Financial Health:**
    *   Consider income stability, estimated debt-to-income ratio, and credit utilization.
    *   Identify financial red flags like frequent overdrafts, high credit card balances, collections, or previous evictions.

5.  **Final Assessment:**
    *   Provide a final summary, a risk level ("Low", "Medium", or "High"), and a screening score from 300-850. The score should reflect a comprehensive risk assessment based on all the above factors.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const fileParts: Part[] = requiredDocuments.map(file => ({
                inlineData: {
                    mimeType: file.mimeType || 'application/octet-stream',
                    data: file.data.split(',')[1],
                },
            }));

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }, ...fileParts] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            screeningScore: { type: Type.INTEGER, description: 'A numerical score from 300 to 850, where 300 is highest risk and 850 is lowest risk.' },
                            riskLevel: { type: Type.STRING, description: 'A categorical risk assessment: "Low", "Medium", or "High".' },
                            summary: { type: Type.STRING, description: 'A concise summary of the applicant\'s financial profile and payment habits.' },
                            financialAnalysis: {
                                type: Type.OBJECT,
                                properties: {
                                    cashFlow: { type: Type.STRING, description: "A summary of the applicant's cash flow, including regular income, payroll deposits, and general spending patterns." },
                                    rentPaymentHistory: { type: Type.STRING, description: "Analysis of rent payment history, noting consistency, timeliness, and any delays found in the documents." },
                                    utilityPaymentHistory: { type: Type.STRING, description: "Analysis of utility bill payments (water, electricity, phone, etc.), noting consistency and timeliness." },
                                    debtCommitment: { type: Type.STRING, description: "An assessment of the applicant's commitment to paying debts, based on all observed payment behaviors." }
                                },
                            },
                            scoreFactors: {
                                type: Type.OBJECT,
                                properties: {
                                    positive: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    negative: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                            },
                            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                    },
                }
            });
            
            const result = JSON.parse(response.text);
            
            setFormData(prev => ({
                ...prev,
                screeningReport: {
                    generated: true,
                    ...result,
                },
            }));

        } catch (err) {
            console.error('AI Screening Error:', err);
            setError('An error occurred during the analysis. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="form-section" id="screening-report-section" data-pdf-section="screening-report-section">
            <h2 className="form-section-title">AI Tenant Screening Report</h2>
            <p>Generate an automated screening report based on the financial and credit documents provided in the previous sections. This provides a quick, data-driven assessment of applicant risk.</p>
            
            {!screeningData.generated && (
                <div className="analysis-section" style={{textAlign: 'left', marginTop: '1rem'}}>
                    <button
                        className="btn btn-primary btn-large"
                        onClick={handleGenerateReport}
                        disabled={isLoading || !canGenerate}
                        title={!canGenerate ? 'Please upload income and credit documents first' : ''}
                    >
                        {isLoading ? 'Generating Report...' : 'Generate Screening Report'}
                    </button>
                    {error && <p className="error-message" style={{marginTop: '1rem'}}>{error}</p>}
                    {!canGenerate && <p className="field-hint" style={{textAlign: 'left', marginTop: '1rem'}}>
                        This feature requires documents to be uploaded in the 'Employment and Income' and 'Credit Report' sections.
                    </p>}
                </div>
            )}
            
            {isLoading && <div className="loader">Analyzing documents, this may take a moment...</div>}

            {screeningData.generated && (
                <div className="screening-report-results">
                    <ScoreMeter score={screeningData.screeningScore} />
                    <div className="report-details">
                        <div className="report-subsection">
                            <h3>Risk Level: <span className={`risk-level ${screeningData.riskLevel?.toLowerCase()}`}>{screeningData.riskLevel}</span></h3>
                            <p>{screeningData.summary}</p>
                        </div>
                        
                        {screeningData.financialAnalysis && (
                            <div className="report-subsection">
                                <h3>Financial Analysis</h3>
                                {screeningData.financialAnalysis.cashFlow && (
                                    <div>
                                        <h4>Cash Flow & Payroll</h4>
                                        <p>{screeningData.financialAnalysis.cashFlow}</p>
                                    </div>
                                )}
                                {screeningData.financialAnalysis.rentPaymentHistory && (
                                    <div className="sub-analysis">
                                        <h4>Rent Payment History</h4>
                                        <p>{screeningData.financialAnalysis.rentPaymentHistory}</p>
                                    </div>
                                )}
                                {screeningData.financialAnalysis.utilityPaymentHistory && (
                                    <div className="sub-analysis">
                                        <h4>Utility Payment History</h4>
                                        <p>{screeningData.financialAnalysis.utilityPaymentHistory}</p>
                                    </div>
                                )}
                                {screeningData.financialAnalysis.debtCommitment && (
                                    <div className="sub-analysis">
                                        <h4>Commitment to Paying Debts</h4>
                                        <p>{screeningData.financialAnalysis.debtCommitment}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="report-subsection">
                            <h3>Key Score Factors</h3>
                            <div className="factors-grid">
                                <div>
                                    <h4>Positive</h4>
                                    <ul>{screeningData.scoreFactors?.positive?.map((f, i) => <li key={i}>{f}</li>)}</ul>
                                </div>
                                <div>
                                    <h4>Negative</h4>
                                    <ul>{screeningData.scoreFactors?.negative?.map((f, i) => <li key={i}>{f}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                        {screeningData.redFlags?.length > 0 && (
                            <div className="report-subsection">
                                <h3>Red Flags</h3>
                                <ul>{screeningData.redFlags.map((f, i) => <li key={i} className="red-flag-item">{f}</li>)}</ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};