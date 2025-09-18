/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const CompletionProgress = ({ status }) => {
  if (!status) return null;
  const { percentage, completedCount, totalRequired } = status;
  return (
    <div className="completion-progress-container">
      <div className="progress-bar-labels">
        <span>Application Progress</span>
        <span className="progress-percentage">{percentage.toFixed(0)}%</span>
      </div>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="completion-summary">
        You have completed <strong>{completedCount}</strong> of <strong>{totalRequired}</strong> required sections.
      </p>
    </div>
  );
};

export const FormInput = ({ id, label, error = null, containerClassName = '', ...props }) => (
  <div className={`form-group ${containerClassName}`}>
    <label htmlFor={id}>{label}</label>
    <input 
      id={id} 
      className={error ? 'error-input' : ''} 
      {...props} 
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && <p id={`${id}-error`} className="error-message" role="alert">{error}</p>}
  </div>
);

export const FileUploadField = ({ id, label, file, onUpload, onRemove }) => {
  return (
    <div className="file-upload-field">
      <label className="file-upload-label" htmlFor={id}>{label}</label>
      <div className="file-upload-actions">
        {file ? (
          <div className="file-chip">
            <span title={file.name}>{file.name}</span>
            <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>&times;</button>
          </div>
        ) : (
          <>
            <input 
              type="file" 
              id={id} 
              onChange={onUpload} 
              style={{ display: 'none' }}
              aria-label={label}
            />
            <label htmlFor={id} className="btn btn-secondary">
              Upload File
            </label>
          </>
        )}
      </div>
    </div>
  );
};
