/* global __DEV__ */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  H2,
  IconButton,
  Input,
  Paragraph,
  Row,
  ScrollContainer,
  Select,
  Stack,
  useMedia,
  useTheme,
} from '@legacyguard/ui';
import {
  Download,
  File,
  // Filter,
  FileText,
  Image,
  Plus,
  Search,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOfflineVault } from '@/hooks/useOfflineVault';

// Document types and categories
const DOCUMENT_CATEGORIES = [
  { value: 'all', label: 'All Documents' },
  { value: 'personal', label: 'Personal' },
  { value: 'financial', label: 'Financial' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'property', label: 'Property' },
  { value: 'other', label: 'Other' },
];

interface Document {
  category: string;
  id: string;
  isOffline?: boolean;
  name: string;
  size: number;
  type: 'document' | 'image' | 'pdf';
  uploadedAt: Date;
}

export const DocumentsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const media = useMedia();
  const { addDocument, isAvailable } = useOfflineVault();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const loadDocuments = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: Load from API/Supabase
      // For now, using mock data
      const mockDocs: Document[] = [
        {
          id: '1',
          name: 'Passport.pdf',
          category: 'personal',
          size: 2456789,
          uploadedAt: new Date('2024-01-15'),
          type: 'pdf',
          isOffline: true,
        },
        {
          id: '2',
          name: 'Insurance Policy.pdf',
          category: 'insurance',
          size: 1234567,
          uploadedAt: new Date('2024-02-20'),
          type: 'pdf',
        },
        {
          id: '3',
          name: 'Medical Records.jpg',
          category: 'medical',
          size: 987654,
          uploadedAt: new Date('2024-03-10'),
          type: 'image',
        },
      ];

      setDocuments(mockDocs);
    } catch (error) {
      if (__DEV__) console.error('Failed to load documents:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, selectedCategory, documents]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Filter documents when search or category changes
  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'image':
        return Image;
      default:
        return File;
    }
  };

  const _handleDocumentPress = (document: Document) => {
    // Navigate to document detail screen
    // navigation.navigate('DocumentDetail', { documentId: document.id })
    if (__DEV__) console.log('Document pressed:', document.id); // Temporary placeholder
  };

  const handleAddDocument = () => {
    navigation.navigate('Scan' as never);
  };

  const handleShareDocument = (document: Document) => {
    // TODO: Implement share functionality
    if (__DEV__) console.log('Share document:', document.name);
  };

  const handleDeleteDocument = (document: Document) => {
    // TODO: Implement delete functionality
    if (__DEV__) console.log('Delete document:', document.name);
  };

  const handleDownloadOffline = async (document: Document) => {
    if (isAvailable) {
      // Map to vault document shape
      await addDocument({
        id: document.id,
        fileName: document.name,
        documentType: document.type,
        content: '',
        uploadedAt: document.uploadedAt,
        fileSize: document.size,
        tags: [document.category],
      });
      // Update document state to show it's offline
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id ? { ...doc, isOffline: true } : doc
        )
      );
    }
  };

  const renderDocumentCard = (document: Document) => {
    const Icon = getDocumentIcon(document.type);
    const isTablet = media.gtSm;

    return (
      <Card
        key={document.id}
        animation='medium'
        pressStyle={{ scale: 0.98 }}
        marginBottom='$3'
        {...(isTablet && viewMode === 'grid' ? { width: '100%' } : {})}
      >
        <CardContent>
          <Row align='center' justify='between'>
            <Row align='center' space='small' flex={1}>
              <Icon size={24} color={theme.primaryBlue.val} />
              <Stack flex={1}>
                <Paragraph fontWeight='600' numberOfLines={1}>
                  {document.name}
                </Paragraph>
                <Row space='xs' align='center'>
                  <Paragraph size='small' color='muted'>
                    {document.category}
                  </Paragraph>
                  <Paragraph size='small' color='muted'>
                    •
                  </Paragraph>
                  <Paragraph size='small' color='muted'>
                    {formatFileSize(document.size)}
                  </Paragraph>
                  {document.isOffline && (
                    <>
                      <Paragraph size='small' color='muted'>
                        •
                      </Paragraph>
                      <Paragraph size='small' color='success'>
                        Offline
                      </Paragraph>
                    </>
                  )}
                </Row>
              </Stack>
            </Row>

            <Row space='xs'>
              {!document.isOffline && (
                <IconButton
                  size='small'
                  variant='ghost'
                  onPress={() => handleDownloadOffline(document)}
                >
                  <Download size={16} />
                </IconButton>
              )}
              <IconButton
                size='small'
                variant='ghost'
                onPress={() => handleShareDocument(document)}
              >
                <Share2 size={16} />
              </IconButton>
              <IconButton
                size='small'
                variant='ghost'
                onPress={() => handleDeleteDocument(document)}
              >
                <Trash2 size={16} color={theme.error.val} />
              </IconButton>
            </Row>
          </Row>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container>
      <Stack padding='$4' gap='$4'>
        {/* Header */}
        <Row justify='between' align='center'>
          <H2>Documents</H2>
          <Row space='xs'>
            {media.gtSm && (
              <Button
                size='medium'
                variant='ghost'
                onPress={() =>
                  setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                }
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
            )}
            <Button
              size='medium'
              variant='primary'
              icon={Plus}
              onPress={handleAddDocument}
            >
              {media.gtSm ? 'Add Document' : 'Add New'}
            </Button>
          </Row>
        </Row>

        {/* Search and Filter */}
        <Stack gap='$3'>
          <Row space='medium' flexDirection={media.gtSm ? 'row' : 'column'}>
            <Stack flex={media.gtSm ? 2 : 1}>
              <Input
                testID='search-input'
                placeholder='Search documents...'
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={Search}
              />
            </Stack>
            <Stack flex={1}>
              <Select
                options={DOCUMENT_CATEGORIES}
                value={selectedCategory}
                onValueChange={(val: string) => setSelectedCategory(val)}
                placeholder='Filter by category'
                size='medium'
              />
            </Stack>
          </Row>
        </Stack>

        <Divider />

        {/* Document List */}
        <ScrollContainer
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={loadDocuments}
              tintColor={theme.primaryBlue.val}
            />
          }
        >
          {filteredDocuments.length === 0 ? (
            <Stack alignItems='center' justifyContent='center' padding='$8'>
              <FileText size={48} color={theme.gray5.val} />
              <Paragraph color='muted' marginTop='$3'>
                {searchQuery || selectedCategory !== 'all'
                  ? 'No documents found matching your criteria'
                  : 'No documents uploaded yet'}
              </Paragraph>
              {!searchQuery && selectedCategory === 'all' && (
                <Button
                  variant='primary'
                  marginTop='$4'
                  onPress={handleAddDocument}
                >
                  Upload Your First Document
                </Button>
              )}
            </Stack>
          ) : media.gtSm && viewMode === 'grid' ? (
            <Grid columns={media.gtMd ? 3 : 2} gap='small'>
              {filteredDocuments.map(renderDocumentCard)}
            </Grid>
          ) : (
            <Stack>{filteredDocuments.map(renderDocumentCard)}</Stack>
          )}
        </ScrollContainer>
      </Stack>
    </Container>
  );
};

export default DocumentsScreen;
