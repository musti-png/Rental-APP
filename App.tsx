/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { HomePage } from './HomePage';
import { ListingsPage } from './ListingsPage';
import { ApplicationForm } from './ApplicationForm';
import { MoveInChecklist } from './MoveInChecklist';
import { LeaseAgreementForm } from './LeaseAgreementForm';
import { ShareLinksPage } from './ShareLinksPage';

export const App = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'listings', 'application', 'checklist', 'lease', 'shareLinks'
  const [initialReferenceId, setInitialReferenceId] = useState(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const formView = params.get('form');
      const refId = params.get('ref');

      if (formView === 'application') {
        setCurrentView('application');
        if (refId) {
          setInitialReferenceId(refId);
        }
      }
    };

    // Listen for history changes (e.g., back/forward buttons)
    window.addEventListener('popstate', handleUrlChange);
    
    // Check the URL on initial load
    handleUrlChange();

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      try {
        const savedData = localStorage.getItem('rental-app-autosave');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const refId = parsedData?.personalInfo?.referenceId;
            if (refId) {
                localStorage.removeItem(refId);
            }
        }
        localStorage.removeItem('rental-app-autosave');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear application data from localStorage:', error);
      }
    }
  };

  const handleNav = (e, view) => {
    e.preventDefault();
    setInitialReferenceId(null);
    setCurrentView(view);
    // Clean up URL when navigating manually
    if (window.location.search) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onSelectApplication={() => setCurrentView('application')} onSelectChecklist={() => setCurrentView('checklist')} onSelectLease={() => setCurrentView('lease')} />;
      case 'listings':
        return <ListingsPage onSelectApplication={() => setCurrentView('application')} onSelectChecklist={() => setCurrentView('checklist')} onSelectLease={() => setCurrentView('lease')} />;
      case 'application':
        return <ApplicationForm initialReferenceId={initialReferenceId} />;
      case 'checklist':
        return <MoveInChecklist />;
      case 'lease':
        return <LeaseAgreementForm />;
      case 'shareLinks':
        return <ShareLinksPage />;
      default:
        return <HomePage onSelectApplication={() => setCurrentView('application')} onSelectChecklist={() => setCurrentView('checklist')} onSelectLease={() => setCurrentView('lease')} />;
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <a href="#" className="company-logo" onClick={(e) => handleNav(e, 'home')}>Your Company</a>
          <nav className="header-nav">
            <a href="#" onClick={(e) => handleNav(e, 'home')}>Home</a>
            <a href="#" onClick={(e) => handleNav(e, 'listings')}>Listings</a>
            <a href="#" onClick={(e) => handleNav(e, 'shareLinks')}>For Landlords</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
            {currentView === 'application' && (
                <button type="button" className="btn btn-danger" onClick={handleClearForm}>Clear Form</button>
            )}
          </nav>
        </div>
      </header>
      {renderView()}
    </>
  );
};
