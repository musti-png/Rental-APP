/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { landlordConfigs } from './constants';

const ShareLinkCard = ({ refId, config }) => {
    const [referralCode, setReferralCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const generateReferralCode = () => {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        setReferralCode(randomString);
    };

    const shareUrl = useMemo(() => {
        const baseUrl = window.location.origin + window.location.pathname;
        let url = `${baseUrl}?form=application&ref=${refId}`;
        if (referralCode.trim()) {
            url += `&referral=${encodeURIComponent(referralCode.trim())}`;
        }
        return url;
    }, [refId, referralCode]);

    const handleCopy = () => {
        if (isCopied) return;

        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }, (err) => {
            alert('Failed to copy link.');
            console.error('Copy failed', err);
        });
    };

    return (
        <div className="share-link-card">
            <div className="share-link-card-header">
                <h3>{config.propertyName}</h3>
                <p className="ref-id">Reference ID: <strong>{refId}</strong></p>
            </div>
            
            <div className="share-link-card-body">
                <div className="referral-code-section">
                    <label htmlFor={`referral-${refId}`}>Customize with a Referral Code (Optional)</label>
                    <p className="referral-code-hint">
                        Add a tracking code to see where your applicants come from (e.g., ZILLOW, AGENT_BOB).
                    </p>
                    <div className="referral-input-group">
                        <input
                            id={`referral-${refId}`}
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            placeholder="Enter a tracking code"
                            aria-label="Referral code"
                        />
                        <button type="button" className="btn btn-outline" onClick={generateReferralCode}>Generate</button>
                    </div>
                </div>

                <div className="final-link-section">
                    <label htmlFor={`share-url-${refId}`}>Your Shareable Link</label>
                    <div className="share-link-container">
                        <input id={`share-url-${refId}`} type="text" value={shareUrl} readOnly aria-label="Shareable application link" />
                        <button 
                            className={`btn btn-primary ${isCopied ? 'btn-copied' : ''}`}
                            onClick={handleCopy}
                            disabled={isCopied}
                        >
                            {isCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ShareLinksPage = () => {
    const propertyConfigs = Object.entries(landlordConfigs);

    return (
        <>
            <div className="app-banner">
                <h1>Shareable Application Links</h1>
                <p>Send these links to prospective tenants to start the application process.</p>
            </div>
            <main className="main-content">
                <div className="share-links-list">
                    {propertyConfigs.map(([refId, config]) => (
                        <ShareLinkCard key={refId} refId={refId} config={config} />
                    ))}
                </div>
            </main>
        </>
    );
};