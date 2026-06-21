import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FileUploader = ({ onUpload, multiple = false, accept = {} }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
    setFiles(newFiles);
    if (onUpload) onUpload(newFiles);
  }, [files, multiple, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple,
    accept 
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (onUpload) onUpload(newFiles);
  };

  return (
    <div className="file-uploader-wrapper">
      <div 
        {...getRootProps()} 
        className={`dropzone glass-panel ${isDragActive ? 'active' : ''}`}
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: isDragActive ? 'rgba(20, 184, 166, 0.05)' : 'transparent',
          borderColor: isDragActive ? 'var(--primary-color)' : 'var(--border-color)'
        }}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon-wrapper" style={{
            width: '64px',
            height: '64px',
            background: 'var(--surface-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--primary-color)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
          }}>
            <Upload size={32} />
          </div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {isDragActive ? 'Drop it here!' : t('drop_files')}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Drag and drop your files, or click to browse
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="uploaded-files-list" style={{ marginTop: '1.5rem' }}>
          {files.map((file, idx) => (
            <div key={idx} className="file-item glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <File size={20} className="text-primary" />
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: '#10b981' }} />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="remove-file-btn"
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
