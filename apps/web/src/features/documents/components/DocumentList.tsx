import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { DocumentRow, listDocuments } from '../api/documentApi';

export function DocumentList() {
  const [items, setItems] = React.useState<DocumentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const docs = await listDocuments();
        if (active) {
          setItems(docs);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6 text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button onClick={() => navigate('/documents/new')}>Upload</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-300">No documents yet. Upload your first will, trust, or instruction letter.</p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded border border-slate-800">
          {items.map((doc) => (
            <li key={doc.id} className="p-3 hover:bg-slate-900">
              <Link to={`/documents/${doc.id}`} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{doc.title || doc.file_name}</div>
                  <div className="text-xs text-slate-400">Uploaded {new Date(doc.created_at).toLocaleString()}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded border border-slate-700 bg-slate-800 capitalize">
                  {doc.processing_status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DocumentList;
