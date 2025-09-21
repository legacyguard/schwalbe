
import _React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adaptDbDocumentToApp } from '@/lib/type-adapters';

interface Document {
  created_at: string;
  document_type: string;
  encrypted_at: string;
  expires_at?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  id: string;
}

interface LocalStorageDocument {
  created_at?: string;
  encrypted_at?: string;
  encryptedAt?: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  id?: number | string;
  uploadedAt?: string;
}

export const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [downloadingId, setDownloadingId] = useState<null | string>(null);
  const [deletingId, setDeletingId] = useState<null | string>(null);
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();
  const { t } = useTranslation('ui/document-list');

  // Fetch documents from database
  const fetchDocuments = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create Supabase client with Clerk token
      const supabase = await createSupabaseClient();

      // Filter documents by user_id
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId) // Explicitly filter by Clerk user ID
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments((data || []).map(adaptDbDocumentToApp));
    } catch (err: unknown) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');

      // Fallback to localStorage if database fails
      const documentsKey = `documents_${userId}`;
      const storedDocs = localStorage.getItem(documentsKey);
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          // Transform localStorage format to match database format
          const transformedDocs = parsedDocs.map(
            (doc: LocalStorageDocument) => ({
              id: doc.id?.toString() || '',
              file_name: doc.fileName || doc.file_name,
              file_type: doc.fileType || doc.file_type,
              file_size: doc.fileSize || doc.file_size,
              file_path: doc.filePath || doc.file_path,
              document_type: 'General',
              encrypted_at: doc.encryptedAt || doc.encrypted_at,
              created_at: doc.uploadedAt || doc.created_at,
            })
          );
          setDocuments(transformedDocs);
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, createSupabaseClient]);

  // Download document function
  const handleDownload = async (doc: Document) => {
    if (!userId) return;

    try {
      setDownloadingId(doc.id);
      const supabase = await createSupabaseClient();

      // Download encrypted file from storage
      const { data, error } = await supabase.storage
        .from('user_documents')
        .download(doc.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('toast.downloadSuccess'));
    } catch (err: unknown) {
      console.error('Error downloading document:', err);
      toast.error(t('toast.downloadError'));
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete document function
  const handleDelete = async (doc: Document) => {
    if (!userId) return;

    // Confirm deletion
    if (
      !confirm(
        `Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(doc.id);
      const supabase = await createSupabaseClient();

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('user_documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        throw dbError;
      }

      // Remove from local state
      setDocuments(prev => prev.filter(d => d.id !== doc.id));

      // Remove from localStorage backup
      const documentsKey = `documents_${userId}`;
      const existingDocs = JSON.parse(
        localStorage.getItem(documentsKey) || '[]'
      );
      const updatedDocs = existingDocs.filter(
        (d: { id: number | string }) => String(d.id) !== String(doc.id)
      );
      localStorage.setItem(documentsKey, JSON.stringify(updatedDocs));
      localStorage.setItem(documentsKey, JSON.stringify(updatedDocs));

      toast.success(t('toast.deleteSuccess'));
    } catch (err: unknown) {
      console.error('Error deleting document:', err);
      toast.error(t('toast.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId, fetchDocuments]);

  // Refresh documents when a new upload is completed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `documents_${userId}`) {
        fetchDocuments();
      }
    };

    const handleDocumentUploaded = (e: CustomEvent) => {
      if (e.detail.userId === userId) {
        fetchDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      'documentUploaded',
      handleDocumentUploaded as (event: Event) => void
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'documentUploaded',
        handleDocumentUploaded as (event: Event) => void
      );
    };
  }, [userId, fetchDocuments]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return 'documents';
    if (fileType.includes('pdf')) return 'documents';
    if (fileType.includes('image')) return 'eye';
    if (fileType.includes('doc')) return 'documents';
    return 'documents';
  };

  if (isLoading) {
    return (
      <FadeIn duration={0.5} delay={0.5}>
        <Card className='p-12 text-center bg-card border-card-border'>
          <Icon
            name="upload"
            className='w-8 h-8 text-muted-foreground mx-auto mb-4 animate-pulse'
          />
          <p className='text-muted-foreground'>{t('loading.message')}</p>
        </Card>
      </FadeIn>
    );
  }

  if (error) {
    return (
      <FadeIn duration={0.5} delay={0.5}>
        <Card className='p-12 text-center bg-card border-card-border border-status-error/20'>
          <Icon
            name="info"
            className='w-8 h-8 text-status-error mx-auto mb-4'
          />
          <h3 className='text-lg font-semibold mb-2 text-status-error'>
            {t('error.title')}
          </h3>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={fetchDocuments} variant="outline" size='sm'>
            <Icon name="upload" className='w-4 h-4 mr-2' />
            {t('error.retry')}
          </Button>
        </Card>
      </FadeIn>
    );
  }

  if (documents.length === 0) {
    return (
      <FadeIn duration={0.5} delay={0.5}>
        <Card className='p-12 text-center bg-card border-card-border'>
          <Icon
            name="documents"
            className='w-12 h-12 text-muted-foreground mx-auto mb-4'
          />
          <h3 className='text-lg font-semibold mb-2'>{t('empty.title')}</h3>
          <p className='text-muted-foreground'>
            {t('empty.message')}
          </p>
        </Card>
      </FadeIn>
    );
  }

  return (
    <div className='space-y-4'>
      <FadeIn duration={0.5} delay={0.5}>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>{t('header.title')}</h3>
          <span className='text-sm text-muted-foreground'>
            {t('header.count', { count: documents.length })}
          </span>
        </div>
      </FadeIn>

      <div className='grid gap-3'>
        {documents.map((doc, index) => (
          <FadeIn key={doc.id} duration={0.5} delay={0.6 + index * 0.1}>
            <Card className='p-4 bg-card border-card-border hover:border-primary/20 transition-colors'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Icon
                      name={getFileIcon(doc.file_type) as 'documents' | 'eye'}
                      className='w-5 h-5 text-primary'
                    />
                  </div>
                  <div>
                    <p className='font-medium'>{doc.file_name}</p>
                    <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                      <span>{t('document.size', { size: formatFileSize(doc.file_size) })}</span>
                      <span>•</span>
                      <span>
                        {t('document.uploaded', {
                          date: format(new Date(doc.encrypted_at), 'MMM d, yyyy')
                        })}
                      </span>
                      <span>•</span>
                      <span className='flex items-center gap-1'>
                        <Icon name="locked" className='w-3 h-3' />
                        {t('document.secure')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant="ghost"
                    size='sm'
                    className='text-muted-foreground hover:text-primary'
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    title={t('document.download')}
                  >
                    {downloadingId === doc.id ? (
                      <Icon
                        name="download"
                        className='w-4 h-4 animate-pulse'
                      />
                    ) : (
                      <Icon name="download" className='w-4 h-4' />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size='sm'
                    className='text-muted-foreground hover:text-status-error'
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    title={t('document.delete')}
                  >
                    {deletingId === doc.id ? (
                      <Icon
                        name="delete"
                        className='w-4 h-4 animate-pulse'
                      />
                    ) : (
                      <Icon name="delete" className='w-4 h-4' />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
};
