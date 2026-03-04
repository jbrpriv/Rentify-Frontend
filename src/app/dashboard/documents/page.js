'use client';

import { useState } from 'react';
import api from '@/utils/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, File } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'id_card',          label: 'National ID / CNIC' },
  { value: 'income_proof',     label: 'Income Proof / Salary Slip' },
  { value: 'bank_statement',   label: 'Bank Statement' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'general',          label: 'Other Document' },
];

export default function TenantDocumentsPage() {
  const [documentType, setDocumentType] = useState('general');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      setError('Maximum 5 files at a time.');
      return;
    }
    const oversized = selected.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setError('Each file must be under 10MB.');
      return;
    }
    setError('');
    setFiles(selected);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('documents', f));
      formData.append('documentType', documentType);

      const { data } = await api.post('/upload/tenant-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDocs((prev) => [...prev, ...data.documents]);
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-500 mt-1">
          Upload supporting documents for your rental applications. These are stored securely
          and shared only with landlords you apply to.
        </p>
      </div>

      {/* Upload Panel */}
      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        <h2 className="font-semibold text-gray-800">Upload New Document</h2>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Files <span className="text-gray-400 font-normal">(PDF, JPEG, PNG — max 5 files, 10MB each)</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to browse or drag & drop</span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Selected files preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={() => handleRemoveFile(i)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
          {uploading ? 'Uploading…' : `Upload ${files.length > 0 ? files.length : ''} Document${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Uploaded documents this session */}
      {uploadedDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recently Uploaded</h2>
          <div className="space-y-3">
            {uploadedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.originalName}</p>
                  <p className="text-xs text-gray-500 capitalize">{doc.documentType.replace('_', ' ')}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <FileText className="w-4 h-4 inline mr-1" />
        <strong>Tip:</strong> Uploading complete documents (CNIC, salary slip, bank statements)
        speeds up landlord review and increases your chances of approval.
      </div>
    </div>
  );
}
