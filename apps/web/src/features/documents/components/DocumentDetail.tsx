import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDocument, updateDocument, type DocumentRow } from '../api/documentApi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


interface EditableFields {
  title: string;
  category: string;
}

export function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = React.useState<DocumentRow | null>(null);
  const [form, setForm] = React.useState<EditableFields | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (!id) {
      return;
    }
    (async () => {
      const doc = await getDocument(id);
      if (!active) return;
      setDocument(doc);
      setForm(doc ? { title: doc.title ?? '', category: doc.category ?? '' } : null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6 text-slate-200">Loading document…</div>;
  }

  if (!document || !form) {
    return <div className="p-6 text-slate-200">Document not found.</div>;
  }

  const handleChange = (field: keyof EditableFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDocument(document.id, {
        title: form.title.trim() || null,
        category: form.category.trim() || null
      });
      setDocument(updated);
      setForm({ title: updated.title ?? '', category: updated.category ?? '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-slate-100">
      <Link to="/documents" className="text-sm text-slate-300 underline">
        ← Back to documents
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{document.title || document.file_name}</h1>
        <p className="text-sm text-slate-300">Uploaded {new Date(document.created_at).toLocaleString()}</p>
        <p className="text-xs text-slate-400">Status: {document.processing_status}</p>
      </header>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <label className="text-xs text-slate-300" htmlFor="doc-title">Title</label>
        <Input id="doc-title" value={form.title} onChange={handleChange('title')} placeholder="Document title" />
        <label className="text-xs text-slate-300" htmlFor="doc-category">Category</label>
        <Input id="doc-category" value={form.category} onChange={handleChange('category')} placeholder="Category" />
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Extracted text</h2>
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-sm text-slate-200">
          {document.ocr_text ?? 'No text extracted yet.'}
        </pre>
      </section>
    </div>
  );
}

export default DocumentDetail;
