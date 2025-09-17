/**
 * Example: Migrated Document List Component
 * Shows how to migrate from direct API calls to using centralized services
 */

import React, { useEffect, useState } from 'react';
import { useApi, withApiErrorHandling } from '@/lib/api/apiAdapter';
// Using a minimal Supabase document shape for this example UI
type SupabaseDocument = {
  created_at: string;
  document_type: string;
  file_name: string;
  id: string;
};

/**
 * BEFORE: Old way using direct fetch calls
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OldDocumentList = () => {
  const [_documents, _setDocuments] = useState<SupabaseDocument[]>([]);
  const [_loading, _setLoading] = useState(true);

  useEffect(() => {
    // ❌ Old way: Direct fetch call
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        _setDocuments(data.documents);
      } catch (error) {
        console.error('Failed to fetch documents', error);
      } finally {
        _setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const _deleteDocument = async (id: string) => {
    // ❌ Old way: Manual error handling and fetch
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Manually update state
      _setDocuments(docs => docs.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return <div>{/* Component JSX */}</div>;
};

/**
 * AFTER: New way using centralized API services
 */
const MigratedDocumentList: React.FC = () => {
  const { documents: documentService } = useApi();
  const [documents, setDocuments] = useState<SupabaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    // ✅ New way: Using centralized service with built-in error handling
    const fetchDocuments = async () => {
      try {
        const docs = (await withApiErrorHandling(
          () => documentService.getAll({ limit: 50 }),
          'Failed to fetch documents'
        )) as unknown as SupabaseDocument[];
        setDocuments(docs);
        setError(null);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load documents'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [documentService]);

  const deleteDocument = async (id: string) => {
    // ✅ New way: Service handles auth, error handling, and retries
    try {
      await withApiErrorHandling(
        () => documentService.delete(id),
        `Failed to delete document ${id}`
      );

      // Update state after successful deletion
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to delete document'
      );
    }
  };

  const searchDocuments = async (query: string) => {
    // ✅ New way: Additional methods available
    try {
      const results = (await documentService.search(
        query
      )) as unknown as SupabaseDocument[];
      setDocuments(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
    }
  };

  const filterByCategory = async (category: string) => {
    // ✅ New way: Specialized methods for common operations
    try {
      const filtered = (await documentService.getByCategory(
        category
      )) as unknown as SupabaseDocument[];
      setDocuments(filtered);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Filter failed');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
        <p className='font-bold'>Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Documents</h2>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Search documents...'
            className='px-3 py-2 border rounded'
            onChange={e => {
              if (e.target.value.length > 2) {
                searchDocuments(e.target.value);
              }
            }}
          />
          <select
            className='px-3 py-2 border rounded'
            onChange={e => filterByCategory(e.target.value)}
          >
            <option value=''>All Categories</option>
            <option value='personal'>Personal</option>
            <option value='financial'>Financial</option>
            <option value='legal'>Legal</option>
            <option value='medical'>Medical</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {documents.map(doc => (
          <div
            key={doc.id}
            className='border rounded-lg p-4 hover:shadow-lg transition-shadow'
          >
            <h3 className='font-semibold text-lg mb-2'>{doc.file_name}</h3>
            <p className='text-sm text-gray-600 mb-2'>
              Type: {doc.document_type || 'Unknown'}
            </p>
            <p className='text-sm text-gray-500'>
              Created: {new Date(doc.created_at).toLocaleDateString()}
            </p>
            <div className='mt-4 flex justify-end gap-2'>
              <button
                className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
              >
                View
              </button>
              <button
                className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600'
                onClick={() => deleteDocument(doc.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          No documents found. Upload your first document to get started.
        </div>
      )}
    </div>
  );
};

export default MigratedDocumentList;

/**
 * Benefits of Migration:
 *
 * 1. ✅ Automatic authentication handling
 * 2. ✅ Built-in error handling and retries
 * 3. ✅ Type safety with TypeScript
 * 4. ✅ Consistent API across all components
 * 5. ✅ Centralized configuration
 * 6. ✅ Request validation
 * 7. ✅ Response validation
 * 8. ✅ Better error messages
 * 9. ✅ Automatic retry with exponential backoff
 * 10. ✅ Specialized methods for common operations
 */
