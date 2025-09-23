import React from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocumentAndAnalyze } from '../api/documentApi';

import { Button } from '@/components/ui/button';

export function DocumentUpload() {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      setError('Select a document to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const { document } = await uploadDocumentAndAnalyze(file);
      navigate(`/documents/${document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6 text-slate-100">
      <h1 className="text-2xl font-semibold">Upload document</h1>
      <p className="text-sm text-slate-300">
        Upload wills, letters of instruction, and other estate documents. We will store the file securely and extract a text preview for quick searching.
      </p>
      <input
        type="file"
        className="block w-full text-sm text-slate-200"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="text-sm text-slate-300">Selected: {file.name}</div>
      ) : null}
      {error ? (
        <div className="text-sm text-red-400" role="alert">{error}</div>
      ) : null}
      <div className="flex gap-3">
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/documents')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default DocumentUpload;
