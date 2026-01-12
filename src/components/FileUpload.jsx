import React, { useState } from 'react';
import { uploadFile } from '../services/uploadService';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
            setMessage('');
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus(null);
        setProgress(0);

        try {
            const result = await uploadFile(file, (percent) => {
                setProgress(percent);
            });

            console.log('Upload Result:', result);
            setStatus('success');
            setMessage('File uploaded successfully!');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>File Upload</h2>

            <div className="input-group">
                <input type="file" onChange={handleFileChange} />
            </div>

            {file && !uploading && status !== 'success' && (
                <div className="file-info">
                    <p>Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
                </div>
            )}

            {(uploading || progress > 0) && (
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    >
                        {progress}%
                    </div>
                </div>
            )}

            {message && <p className={`status-${status}`}>{message}</p>}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default FileUpload;
