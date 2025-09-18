/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const HomePage = ({ onSelectApplication, onSelectChecklist, onSelectLease }) => {
    return (
        <main className="main-content home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>The Smart, Secure Way to Screen Tenants</h1>
                    <p className="hero-subheading">
                        Our Comprehensive Tenant Application Screening Form simplifies tenant selection for landlords and real estate agents. 
                        Collect all critical information in one place—from income and credit history to FCRA consent—and find honest, reliable, and hassle-free tenants, faster.
                    </p>
                    <button className="btn btn-primary btn-large" onClick={onSelectApplication}>Start a New Application</button>
                </div>
            </section>
            
            <section className="features-section">
                <h2 className="section-title">Powerful Features for Peace of Mind</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h3>Comprehensive Data Collection</h3>
                        <p>Gather all essential applicant data: income and employment history, previous landlord details, credit scores, criminal history, and more.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11l-6-6z"/><path d="M14 3v6h6"/><path d="m10 16-3-3 1.5-1.5 1.5 1.5 3-3L14.5 13 z"/></svg>
                        </div>
                        <h3>Customizable Mandatory Fields</h3>
                        <p>Assign a unique Reference ID to each property to define which sections are mandatory. Applicants cannot submit an incomplete form, ensuring you get all the information you need.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M4 14H2"/><path d="M20 14H22"/><path d="M15 12V8a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v4"/></svg>
                        </div>
                        <h3>AI-Powered Document Verification</h3>
                        <p>Our intelligent system reviews every uploaded document for accuracy and authenticity. Unverified or suspicious files are automatically flagged and rejected.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        </div>
                        <h3>Centralized Online Dashboard</h3>
                        <p>Easily track the status of all applications in one place. Filter candidates based on your specific requirements to quickly identify the best potential tenants.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </div>
                        <h3>Secure & Compliant</h3>
                        <p>Built-in Fair Credit Reporting Act (FCRA) consent and secure data handling mean you can screen tenants confidently and legally.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <h3>Eliminate Confusion</h3>
                        <p>Use the property Reference ID to link every application directly to the correct rental unit, keeping your listings organized and eliminating mix-ups.</p>
                    </div>
                </div>
            </section>
            
            <section className="audience-section">
                <h2 className="section-title">Ideal For</h2>
                 <div className="audience-grid">
                    <div className="audience-card">
                        <h4>Landlords</h4>
                        <p>Manage your properties with professional-grade tools without the high cost.</p>
                    </div>
                    <div className="audience-card">
                        <h4>Property Managers</h4>
                        <p>Standardize your application process across all your clients and properties.</p>
                    </div>
                    <div className="audience-card">
                        <h4>Tenants</h4>
                        <p>Present a professional, complete, and organized application to stand out from the crowd.</p>
                    </div>
                </div>
            </section>

            <section className="other-tools-section">
                <h2 className="section-title">A Complete Toolkit for Modern Landlords</h2>
                 <div className="listings-grid">
                    <div className="listing-card">
                        <h2>Move-In/Move-Out Checklist</h2>
                        <p>Protect your investment and prevent disputes. Our AI-powered checklist allows you to document the property's condition with photos and automatically generate an itemized list, creating a clear, undisputed record.</p>
                        <button className="btn btn-secondary" onClick={onSelectChecklist}>Create Checklist</button>
                    </div>
                    <div className="listing-card">
                        <h2>Customizable Lease Agreement</h2>
                        <p>Generate professional, state-specific lease agreements in minutes. Our template covers all critical clauses, from rent and security deposits to pet policies and maintenance rules, ensuring you're fully protected.</p>
                        <button className="btn btn-secondary" onClick={onSelectLease}>Create Lease</button>
                    </div>
                 </div>
            </section>
            
            <section className="call-to-action-section">
                <h2>The Smart, Secure Way to Screen Tenants</h2>
                <p>
                    Our Comprehensive Tenant Application Screening Form simplifies tenant selection for landlords and real estate agents. Collect all critical information in one place—from income and credit history to FCRA consent—and find honest, reliable, and hassle-free tenants, faster.
                </p>
                <button className="btn btn-primary btn-large" onClick={onSelectApplication}>Start a New Application</button>
            </section>
        </main>
    );
};