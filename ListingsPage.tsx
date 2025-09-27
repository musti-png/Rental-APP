/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const ListingsPage = ({ onSelectApplication, onSelectChecklist, onSelectLease }) => {
    return (
        <main className="main-content listings-page-cards">
            <div className="app-banner">
                <h1>Our Toolkit</h1>
                <p>A complete suite of tools for modern landlords and property managers.</p>
            </div>
            <div className="listings-grid-container">
                <div className="listings-grid">
                    <div className="listing-card">
                        <h2>Interactive Tenant Application</h2>
                        <p>A fully digital, interactive form with auto-save, document uploads, and one-click PDF creation. Streamline the application process for everyone.</p>
                        <button className="btn btn-primary" onClick={onSelectApplication}>Start Application</button>
                    </div>
                     <div className="listing-card">
                        <h2>AI Screening Score & Report</h2>
                        <p>Leverage AI to analyze financial documents directly within the application. Get a clear, unbiased summary and risk score to make confident decisions.</p>
                        <button className="btn btn-secondary" onClick={onSelectApplication}>Start Application</button>
                    </div>
                    <div className="listing-card">
                        <h2>Move-In/Move-Out Checklist</h2>
                        <p>Protect your investment. Document property condition with our AI-powered checklist, generating an undisputed record with photos and itemized lists.</p>
                        <button className="btn btn-secondary" onClick={onSelectChecklist}>Create Checklist</button>
                    </div>
                    <div className="listing-card">
                        <h2>Customizable Lease Agreement</h2>
                        <p>Generate professional, state-specific lease agreements in minutes. Covers all critical clauses to ensure you're fully protected.</p>
                        <button className="btn btn-secondary" onClick={onSelectLease}>Create Lease</button>
                    </div>
                </div>
            </div>
        </main>
    );
};