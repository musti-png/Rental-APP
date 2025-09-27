/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

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

// Fix: Add an explicit props interface and define the component as a React.FC
// to correctly handle React-specific props like `key` and avoid type errors.
interface FileChipProps {
    file: { name: string };
    onRemove: () => void;
}

/**
 * A chip component to display a file's name with a remove button.
 */
export const FileChip: React.FC<FileChipProps> = ({ file, onRemove }) => (
    <div className="file-chip">
        <span title={file.name}>{file.name}</span>
        <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>&times;</button>
    </div>
);


/**
 * A robust document upload component with progress, multi-file support, and error handling.
 */
export const DocumentUploadField = ({
    id,
    label,
    files = [],
    onFilesUpdate,
    multiple = false,
    acceptedFileTypes = "image/*,application/pdf",
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsLoading(true);
        setError('');

        const newFiles = Array.from(selectedFiles);

        const readFileAsBase64 = (file: File): Promise<{ name: string; data: string; mimeType: string; }> => {
            return new Promise((resolve, reject) => {
                // File type validation
                const allowedTypes = acceptedFileTypes.split(',').map(t => t.trim());
                const isAllowed = allowedTypes.includes('*/*') ||
                                allowedTypes.includes(file.type) ||
                                allowedTypes.includes(`${file.type.split('/')[0]}/*`);

                if (!isAllowed) {
                    return reject(new Error(`Unsupported file type: ${file.type}`));
                }

                const reader = new FileReader();
                reader.onload = () => resolve({
                    name: file.name,
                    data: reader.result as string,
                    mimeType: file.type,
                });
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        };

        try {
            const processedFiles = await Promise.all(newFiles.map(readFileAsBase64));
            
            if (multiple) {
                onFilesUpdate([...files, ...processedFiles]);
            } else {
                onFilesUpdate([processedFiles[0]]); // Replace for single file mode
            }
        } catch (err) {
            console.error("File reading error:", err);
            setError((err as Error).message || "An error occurred while reading files.");
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Clear input
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const updatedFiles = files.filter((_, index) => index !== indexToRemove);
        onFilesUpdate(updatedFiles);
    };

    return (
        <div className="document-upload-container">
            <div className="document-upload-header">
                <label htmlFor={id} className="document-upload-label">{label}</label>
                {isLoading && <span className="upload-progress-indicator">Processing...</span>}
            </div>
            
            <div className="document-upload-actions">
                <input
                    type="file"
                    id={id}
                    multiple={multiple}
                    accept={acceptedFileTypes}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    aria-label={label}
                    disabled={isLoading}
                />
                <label htmlFor={id} className={`btn btn-secondary ${isLoading ? 'btn-disabled' : ''}`}>
                    Select File{multiple ? 's' : ''}
                </label>
            </div>

            {error && <p className="error-message document-upload-error">{error}</p>}

            {files && files.length > 0 && (
                <div className="file-list-container">
                    {files.map((file, index) => (
                        <FileChip key={`${file.name}-${index}`} file={file} onRemove={() => handleRemove(index)} />
                    ))}
                </div>
            )}
        </div>
    );
};