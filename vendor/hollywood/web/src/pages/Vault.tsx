
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button } from '@/components/ui/button';
import { MetaTags } from '@/components/common/MetaTags';

import { Icon } from '@/components/ui/icon-library';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EnhancedDocumentUploader from '@/components/features/EnhancedDocumentUploader';
import {
  createActionsColumn,
  createSelectColumn,
  createSortableHeader,
  DataTable,
} from '@/components/enhanced/DataTable';
import { MetricsGrid } from '@/components/enhanced/MetricCard';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Shield,
  Trash2,
} from 'lucide-react';

// Document interface
interface Document {
  category: string;
  expiresAt?: Date;
  id: string;
  isEncrypted: boolean;
  name: string;
  ocrStatus?: 'complete' | 'failed' | 'none' | 'processing';
  size: string;
  status: 'encrypted' | 'pending' | 'processed' | 'processing';
  tags?: string[];
  uploadedAt: Date;
}

export default function VaultPage() {
  const { t } = useTranslation('ui/vault');
  usePageTitle(t('title'));
  const [showOcrInfo, setShowOcrInfo] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Confirmation dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

  // Load documents from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedDocs = localStorage.getItem('vault_documents');
      if (storedDocs) {
        const parsed = JSON.parse(storedDocs);
        // Convert date strings back to Date objects
        const docs = parsed.map((doc: Record<string, any>) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
        }));
        setDocuments(docs);
      } else {
        // Initialize with sample data
        const sampleDocs: Document[] = [
          {
            id: '1',
            name: 'Birth Certificate.pdf',
            category: 'Personal',
            size: '2.4 MB',
            uploadedAt: new Date(Date.now() - 86400000 * 30),
            status: 'processed',
            ocrStatus: 'complete',
            tags: ['identity', 'official'],
            isEncrypted: true,
          },
          {
            id: '2',
            name: 'Insurance Policy 2024.pdf',
            category: 'Financial',
            size: '1.8 MB',
            uploadedAt: new Date(Date.now() - 86400000 * 15),
            expiresAt: new Date(Date.now() + 86400000 * 320),
            status: 'processed',
            ocrStatus: 'complete',
            tags: ['health', 'annual'],
            isEncrypted: true,
          },
          {
            id: '3',
            name: 'Property Deed.pdf',
            category: 'Property',
            size: '5.2 MB',
            uploadedAt: new Date(Date.now() - 86400000 * 7),
            status: 'processed',
            ocrStatus: 'complete',
            tags: ['real-estate', 'ownership'],
            isEncrypted: true,
          },
          {
            id: '4',
            name: 'Will Draft v3.docx',
            category: 'Legal',
            size: '345 KB',
            uploadedAt: new Date(Date.now() - 86400000 * 2),
            status: 'processing',
            ocrStatus: 'processing',
            tags: ['draft', 'inheritance'],
            isEncrypted: false,
          },
          {
            id: '5',
            name: 'Medical Records 2024.pdf',
            category: 'Health',
            size: '3.1 MB',
            uploadedAt: new Date(Date.now() - 86400000 * 1),
            status: 'pending',
            ocrStatus: 'none',
            tags: ['medical', 'records'],
            isEncrypted: false,
          },
        ];
        setDocuments(sampleDocs);
        localStorage.setItem('vault_documents', JSON.stringify(sampleDocs));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrigger]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('vault_documents', JSON.stringify(documents));
    }
  }, [documents]);

  // Calculate metrics
  const metrics = useMemo(
    () => [
      {
        title: t('metrics.totalDocuments'),
        value: documents.length.toString(),
        icon: 'file-text' as const,
        color: 'primary' as const,
        change: 12,
        trend: 'up' as const,
      },
      {
        title: t('metrics.encrypted'),
        value: documents.filter(d => d.isEncrypted).length.toString(),
        icon: 'shield' as const,
        color: 'success' as const,
        changeLabel: t('metrics.labels.secured'),
      },
      {
        title: t('metrics.ocrProcessed'),
        value: documents
          .filter(d => d.ocrStatus === 'complete')
          .length.toString(),
        icon: 'search' as const,
        color: 'info' as const,
        changeLabel: t('metrics.labels.searchable'),
      },
      {
        title: t('metrics.expiringSoon'),
        value: documents
          .filter(d => {
            if (!d.expiresAt) return false;
            const daysUntilExpiry = Math.floor(
              (d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry <= 90;
          })
          .length.toString(),
        icon: 'alert-circle' as const,
        color: 'warning' as const,
        changeLabel: t('metrics.labels.within90Days'),
      },
    ],
    [documents]
  );

  // Define columns for DataTable
  const columns: ColumnDef<Document>[] = useMemo(
    () => [
      createSelectColumn<Document>(),
      {
        accessorKey: 'name',
        header: createSortableHeader(t('table.headers.documentName')),
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className='flex items-center space-x-2'>
              {doc.isEncrypted && <Shield className='h-4 w-4 text-green-600' />}
              <span className='font-medium'>{doc.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: createSortableHeader(t('table.headers.category')),
        cell: ({ row }) => (
          <Badge variant='outline' className='text-xs'>
            {row.getValue('category')}
          </Badge>
        ),
      },
      {
        accessorKey: 'size',
        header: t('table.headers.size'),
      },
      {
        accessorKey: 'uploadedAt',
        header: createSortableHeader(t('table.headers.uploaded')),
        cell: ({ row }) => {
          const date = row.getValue('uploadedAt') as Date;
          return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(date);
        },
      },
      {
        accessorKey: 'expiresAt',
        header: t('table.headers.expires'),
        cell: ({ row }) => {
          const date = row.getValue('expiresAt') as Date | undefined;
          if (!date) return <span className='text-muted-foreground'>-</span>;

          const daysUntilExpiry = Math.floor(
            (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isExpiringSoon = daysUntilExpiry <= 90;

          return (
            <div className='flex items-center space-x-1'>
              {isExpiringSoon && <Clock className='h-3 w-3 text-yellow-600' />}
              <span
                className={isExpiringSoon ? 'text-yellow-600 font-medium' : ''}
              >
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(date)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ocrStatus',
        header: t('table.headers.ocrStatus'),
        cell: ({ row }) => {
          const status = row.getValue('ocrStatus') as string | undefined;
          if (!status || status === 'none')
            return <span className='text-muted-foreground'>-</span>;

          const statusConfig = {
            complete: {
              color: 'bg-green-100 text-green-800',
              icon: CheckCircle,
              label: t('table.ocrStatus.complete'),
            },
            processing: {
              color: 'bg-yellow-100 text-yellow-800',
              icon: Clock,
              label: t('table.ocrStatus.processing'),
            },
            failed: {
              color: 'bg-red-100 text-red-800',
              icon: null,
              label: t('table.ocrStatus.failed'),
            },
          };

          const config = statusConfig[status as keyof typeof statusConfig];
          const StatusIcon = config?.icon;

          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config?.color || ''}`}
            >
              {StatusIcon && <StatusIcon className='h-3 w-3 mr-1' />}
              {config?.label || status}
            </span>
          );
        },
      },
      {
        accessorKey: 'tags',
        header: t('table.headers.tags'),
        cell: ({ row }) => {
          const tags = row.getValue('tags') as string[] | undefined;
          if (!tags || tags.length === 0) return null;
          return (
            <div className='flex flex-wrap gap-1'>
              {tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant='secondary' className='text-xs'>
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      createActionsColumn<Document>([
        {
          label: t('table.actions.view'),
          icon: <Eye className='h-4 w-4 mr-2' />,
          onClick: doc => {
            toast.info(t('messages.openingDocument', { name: doc.name }));
            // In production, this would open the document viewer
          },
        },
        {
          label: t('table.actions.download'),
          icon: <Download className='h-4 w-4 mr-2' />,
          onClick: doc => {
            toast.success(t('messages.downloadingDocument', { name: doc.name }));
            // In production, this would trigger the download
          },
        },
        {
          label: t('table.actions.delete'),
          icon: <Trash2 className='h-4 w-4 mr-2' />,
          onClick: doc => {
            setDocumentToDelete(doc);
            setIsConfirmDialogOpen(true);
          },
        },
      ]),
    ],
    []
  );

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!documentToDelete) return;

    setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
    toast.success(t('messages.deleteSuccess', { name: documentToDelete.name }));

    // Close dialog and reset state
    setIsConfirmDialogOpen(false);
    setDocumentToDelete(null);
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsConfirmDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Category', 'Size', 'Uploaded', 'Status', 'Encrypted'],
      ...documents.map(doc => [
        doc.name,
        doc.category,
        doc.size,
        doc.uploadedAt.toISOString(),
        doc.status,
        doc.isEncrypted ? 'Yes' : 'No',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-documents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('messages.documentsExported'));
  };

  return (
    <>
      <MetaTags
        title={t('meta.title')}
        description={t('meta.description')}
        keywords={t('meta.keywords')}
      />
      <DashboardLayout>
        <div className='min-h-screen bg-background'>
          <header className='bg-card border-b border-card-border'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
              <FadeIn duration={0.5} delay={0.2}>
                <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground mb-3'>
                  {t('header.title')}
                </h1>
              </FadeIn>
              <FadeIn duration={0.5} delay={0.4}>
                <p
                  className='text-lg leading-relaxed max-w-2xl'
                  style={{ color: 'hsl(var(--muted-text))' }}
                >
                  {t('header.subtitle')}
                </p>
              </FadeIn>
            </div>
          </header>

          <main className='max-w-7xl mx-auto px-6 lg:px-8 py-12'>
            <div className='space-y-8'>
              {/* Metrics Overview */}
              <FadeIn duration={0.5} delay={0.6}>
                <MetricsGrid metrics={metrics} columns={4} />
              </FadeIn>

              {/* OCR Feature Information */}
              {showOcrInfo && (
                <FadeIn duration={0.5} delay={0.8}>
                  <Alert className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
                    <Icon name='sparkles' className='h-4 w-4 text-blue-600' />
                    <AlertDescription className='flex items-center justify-between'>
                      <div>
                        <strong className='text-blue-900'>
                          {t('notifications.ocrInfo.title')}
                        </strong>
                        <p className='text-blue-700 mt-1'>
                          {t('notifications.ocrInfo.description')}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setShowOcrInfo(false)}
                        className='text-blue-600 hover:text-blue-800 ml-4'
                      >
                        <Icon name='x' className='h-4 w-4' />
                      </Button>
                    </AlertDescription>
                  </Alert>
                </FadeIn>
              )}

              {/* Enhanced Upload Section with OCR */}
              <div>
                <EnhancedDocumentUploader />
                <Button
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  variant='outline'
                  size='sm'
                  className='mt-4'
                >
                  <Icon name='refresh-cw' className='h-4 w-4 mr-2' />
                  {t('actions.refreshDocuments')}
                </Button>
              </div>

              {/* Enhanced Documents Table */}
              <FadeIn duration={0.5} delay={1}>
                <DataTable
                  columns={columns}
                  data={documents}
                  title={t('table.title')}
                  description={t('table.description')}
                  searchPlaceholder={t('table.searchPlaceholder')}
                  loading={isLoading}
                  onExport={handleExport}
                  pageSize={10}
                />
              </FadeIn>
            </div>
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.delete.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.delete.description', { name: documentToDelete?.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>
                {t('dialogs.delete.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {t('dialogs.delete.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </>
  );
}
