'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  X, File, Trash2, ExternalLink, FileImage, RefreshCw,
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'id_card',          label: 'National ID / CNIC' },
  { value: 'income_proof',     label: 'Income Proof / Salary Slip' },
  { value: 'bank_statement',   label: 'Bank Statement' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'general',          label: 'Other Document' },
];

function DocIcon({ name }) {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','webp'].includes(ext)) return <FileImage className="w-5 h-5 text-purple-500" />;
  return <FileText className="w-5 h-5 text-blue-500" />;
}

export default function TenantDocumentsPage() {
  const [documentType, setDocumentType] = useState('general');
  const [files, setFiles]               = useState([]);
  const [uploading, setUploading]       = useState(false);
  const [vault, setVault]               = useState([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [deletingIdx, setDeletingIdx]   = useState(null);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  useEffect(() => { fetchVault(); }, []);

  const fetchVault = async () => {
    setVaultLoading(true);
    try {
      const { data } = await api.get('/upload/tenant-documents');
      setVault(data.documents || []);
    } catch (err) { console.error('Failed to load documents:', err); }
    finally { setVaultLoading(false); }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) { setError('Maximum 5 files at a time.'); return; }
    if (selected.some(f => f.size > 10 * 1024 * 1024)) { setError('Each file must be under 10MB.'); return; }
    setError(''); setFiles(selected);
  };

  const handleUpload = async () => {
    if (!files.length) { setError('Please select at least one file.'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('documents', f));
      formData.append('documentType', documentType);
      const { data } = await api.post('/upload/tenant-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles([]);
      setSuccess(`${data.documents.length} document(s) uploaded successfully.`);
      await fetchVault();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    setDeletingIdx(index);
    try {
      await api.delete(`/upload/tenant-documents/${index}`);
      await fetchVault();
    } catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    finally { setDeletingIdx(null); }
  };

  const grouped = vault.reduce((acc, doc, idx) => {
    const key = doc.documentType || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...doc, _vaultIdx: idx });
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-500 mt-1">Upload supporting documents for rental applications. All files are stored securely and shared only with landlords you apply to.</p>
      </div>

      {/* Upload Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-800">Upload New Document</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select value={documentType} onChange={e => setDocumentType(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Files <span className="text-gray-400 font-normal">(PDF, JPEG, PNG — max 5 files, 10MB each)</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload className="w-7 h-7 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to browse or drag & drop</span>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
        {success && <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-2.5 rounded-xl border border-green-100"><CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}</div>}
        <button type="button" onClick={handleUpload} disabled={uploading || !files.length}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
          {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : `Upload ${files.length ? files.length + ' ' : ''}Document${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Vault */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800">
            Document Vault
            {vault.length > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{vault.length}</span>}
          </h2>
          <button onClick={fetchVault} className="p-1.5 text-gray-400 hover:text-blue-600 transition" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {vaultLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin w-6 h-6 text-blue-500" /></div>
        ) : vault.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
            <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500">No documents uploaded yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload your first document above</p>
          </div>
        ) : (
          <div className="space-y-5">
            {DOCUMENT_TYPES.map(type => {
              const docs = grouped[type.value];
              if (!docs) return null;
              return (
                <div key={type.value}>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{type.label}</p>
                  <div className="space-y-2">
                    {docs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/30 transition-colors group">
                        <DocIcon name={doc.originalName} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{doc.originalName || 'Document'}</p>
                          <p className="text-xs text-gray-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition" title="View">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleDelete(doc._vaultIdx)} disabled={deletingIdx === doc._vaultIdx}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            {deletingIdx === doc._vaultIdx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <FileText className="w-4 h-4 inline mr-1.5" />
        <strong>Tip:</strong> Uploading complete documents (CNIC, salary slip, bank statements) speeds up landlord review and increases your approval chances.
      </div>
    </div>
  );
}