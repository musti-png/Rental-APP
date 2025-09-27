/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { DocumentUploadField } from './utils';

interface FileState {
    name: string;
    data: string; // base64
    mimeType: string;
}

export const IncomeVerificationTool = () => {
    const [idFront, setIdFront] = useState<FileState[]>([]);
    const [idBack, setIdBack] = useState<FileState[]>([]);
    const [bankStatements, setBankStatements] = useState<FileState[]>([]);
    const [creditStatements, setCreditStatements] = useState<FileState[]>([]);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalysis = async () => {
        if (idFront.length === 0 || idBack.length === 0 || bankStatements.length === 0 || creditStatements.length === 0) {
            setError('Please upload all required documents: ID (front and back), at least one bank statement, and at least one credit card statement.');
            return;
        }
        setError('');
        setIsLoading(true);
        setAnalysisResult('');
        
        const analysisPrompt = `You are a financial analyst specializing in tenant screening. Analyze the provided Tenant ID, bank statements, and credit card statements. Your analysis must be objective, strictly based on the documents, and presented in a clear format for a landlord.

**1. Identity Verification:**
- Cross-reference the name on the ID with the names on the financial statements to check for consistency.

**2. Financial Analysis:**
- **Income & Money Flow:** Describe regular income sources, calculate the average monthly income, and summarize general spending patterns.
- **Account Stability:** Report the average account balance, and note any instances of low balances or overdrafts.
- **Rent Payment History:** Identify recurring payments that appear to be rent. Assess their timeliness and consistency.
- **Utility & Bill Payments:** Track payments to utility companies. Note if payments are regular, on-time, and if there are any recorded late fees.
- **Debt & Payment Prioritization:** Analyze credit card usage, balances, and payment history. Comment on the applicant's apparent payment prioritization (e.g., are essential bills like rent/utilities paid before discretionary spending?).

**3. Summary & Red Flags:**
- Provide a concise summary of the applicant's financial responsibility.
- List any potential red flags (e.g., inconsistent income, frequent late payments, high debt-to-income ratio, evidence of returned payments).

Structure your response with clear headings for each section.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const allFiles = [...idFront, ...idBack, ...bankStatements, ...creditStatements];
            const imageParts: Part[] = allFiles.map(file => ({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data.split(',')[1],
                },
            }));
            
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{text: analysisPrompt}, ...imageParts] },
            });
            
            setAnalysisResult(response.text);

        } catch (err) {
            console.error('AI Analysis Error:', err);
            setError('An error occurred during the analysis. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <main className="main-content">
            <div className="income-verification-container">
                <h1 className="income-verification-title">AI Income & Identity Verification</h1>
                <p style={{textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem'}}>
                    Upload an applicant's documents to generate an instant, unbiased financial summary and identity check.
                </p>

                <div className="upload-section">
                    <h3>1. Tenant Identification</h3>
                    <div className="id-upload-grid">
                        <DocumentUploadField
                            id="idFront"
                            label="ID Front"
                            files={idFront}
                            onFilesUpdate={setIdFront}
                        />
                        <DocumentUploadField
                            id="idBack"
                            label="ID Back"
                            files={idBack}
                            onFilesUpdate={setIdBack}
                        />
                    </div>
                </div>

                <div className="upload-section">
                    <h3>2. Financial Documents</h3>
                    <div className="form-group">
                        <DocumentUploadField
                            id="bankStatementsUpload"
                            label="Bank Statements (6-12 months)"
                            files={bankStatements}
                            onFilesUpdate={setBankStatements}
                            multiple
                        />
                    </div>
                    <div className="form-group" style={{marginTop: '1.5rem'}}>
                        <DocumentUploadField
                            id="creditStatementsUpload"
                            label="Credit Card Statements (3-12 months)"
                            files={creditStatements}
                            onFilesUpdate={setCreditStatements}
                            multiple
                        />
                    </div>
                </div>

                <div className="analysis-section">
                    <button className="btn btn-primary btn-large" onClick={handleAnalysis} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                    </button>

                    {error && <p className="error-message" style={{textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
                    
                    {isLoading && <div className="loader">Analyzing documents, this may take a moment...</div>}
                    
                    {analysisResult && (
                         <div className="analysis-result-box">
                            <h4>Analysis Report</h4>
                            {analysisResult}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};