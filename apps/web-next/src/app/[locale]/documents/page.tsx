"use client";

import React from "react";
import Link from "next/link";
import { listDocuments } from "@/lib/documentsApi";

export default function DocumentsPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const docs = await listDocuments();
        if (mounted) setItems(docs);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <section className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <Link className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500" href="new">Upload</Link>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-slate-300">No documents yet. Click Upload to add one.</div>
        ) : (
          <ul className="divide-y divide-slate-700 border border-slate-700 rounded">
            {items.map((d) => {
              const title = d.title || d.file_name;
              const status = d.processing_status;
              const exp = d.expiration_date || (d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : null);
              return (
                <li key={d.id} className="p-3 hover:bg-slate-900">
                  <Link href={`documents/${d.id}`} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-slate-400">{d.category || "Uncategorized"} • {new Date(d.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {exp ? <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">Expires: {exp}</span> : null}
                      <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">{status}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
