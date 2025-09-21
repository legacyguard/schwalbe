import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  H1,
  H2,
  Input,
  InputGroup,
  Paragraph,
  Row,
  ScrollContainer,
  Stack,
} from '@legacyguard/ui';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  type Document,
  DocumentService,
} from '@hollywood/shared/src/services/documentService';

// Document Categories (keys for translation)
const CATEGORY_KEYS = [
  { id: 'all', key: 'all', icon: 'folder', color: '#6b7280' },
  {
    id: 'insurance',
    key: 'insurance',
    icon: 'shield-checkmark',
    color: '#3b82f6',
  },
  { id: 'financial', key: 'financial', icon: 'wallet', color: '#16a34a' },
  { id: 'personal', key: 'personal', icon: 'person', color: '#f59e0b' },
  { id: 'medical', key: 'medical', icon: 'medical', color: '#dc2626' },
  { id: 'legal', key: 'legal', icon: 'document-text', color: '#8b5cf6' },
];

// Document Card Component
interface DocumentCardProps {
  categories: {
    color: string;
    icon: string;
    id: string;
    key: string;
    label?: string;
  }[];
  document: Document;
  onDelete: () => void;
  onPress: () => void;
}

const DocumentCard = ({
  document,
  onPress,
  onDelete,
  categories,
}: DocumentCardProps) => {
  const category =
    categories.find(c => c.id === document.category) || categories[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card variant='default' padding='medium' fullWidth>
        <Row space='medium' align='center'>
          <Box
            padding='small'
            style={{
              backgroundColor: `${category.color}20`,
              borderRadius: 12,
            }}
          >
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={category.color}
            />
          </Box>

          <Stack space='xs' style={{ flex: 1 }}>
            <Paragraph weight='semibold'>{document.name}</Paragraph>
            <Row space='small' align='center'>
              <Paragraph size='small' color='muted'>
                {category.label ?? ''}
              </Paragraph>
              {document.fileSize && (
                <>
                  <Paragraph size='small' color='muted'>
                    •
                  </Paragraph>
                  <Paragraph size='small' color='muted'>
                    {formatFileSize(document.fileSize)}
                  </Paragraph>
                </>
              )}
            </Row>
          </Stack>

          <TouchableOpacity onPress={onDelete}>
            <Ionicons name='trash-outline' size={20} color='#dc2626' />
          </TouchableOpacity>
        </Row>
      </Card>
    </TouchableOpacity>
  );
};

// Category Filter Component
interface CategoryFilterProps {
  categories: {
    color: string;
    icon: string;
    id: string;
    key: string;
    label?: string;
  }[];
  onSelect: (category: string) => void;
  selected: string;
}

const CategoryFilter = ({
  selected,
  onSelect,
  categories,
}: CategoryFilterProps) => {
  return (
    <ScrollContainer
      horizontal
      showsScrollIndicator={false}
      padding='none'
      style={{ maxHeight: 100 }}
    >
      <Row space='small'>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
          >
            <Card
              variant={selected === category.id ? 'filled' : 'default'}
              padding='small'
              style={{ minWidth: 80 }}
            >
              <Stack space='xs' align='center'>
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={selected === category.id ? '#ffffff' : category.color}
                />
                <Paragraph
                  size='small'
                  style={{
                    color: selected === category.id ? '#ffffff' : '#6b7280',
                  }}
                >
                  {category.label ?? ''}
                </Paragraph>
              </Stack>
            </Card>
          </TouchableOpacity>
        ))}
      </Row>
    </ScrollContainer>
  );
};

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function VaultScreenV2() {
  const { user } = useUser();
  const navigation = useNavigation();
  const { t } = useTranslation('mobile.native.screens');
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const CATEGORIES = CATEGORY_KEYS.map(c => ({
    ...c,
    label: t ? t(`vault.categories.${c.key}`) : c.key,
  }));

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const docs = await DocumentService.getDocuments(user.id);
      setDocuments(docs);
    } catch (_error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        doc =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, selectedCategory, searchQuery]);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Filter documents
  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDocuments();
  }, [loadDocuments]);

  const handleDeleteDocument = async (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DocumentService.deleteDocument(documentId);
              setDocuments(docs => docs.filter(d => d.id !== documentId));
            } catch (_error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleDocumentPress = (document: Document) => {
    (navigation as any).navigate('DocumentDetail', { document });
  };

  const handleAddDocument = () => {
    (navigation as any).navigate('Scanner');
  };

  return (
    <ScrollContainer
      padding='none'
      showsScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Container padding='medium'>
        <Stack space='large'>
          {/* Header */}
          <Stack space='small'>
            <H1>Document Vault</H1>
            <Paragraph color='muted'>
              {documents.length} documents secured
            </Paragraph>
          </Stack>

          {/* Search Bar */}
          <InputGroup>
            <Input
              placeholder='Search documents...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              variant='default'
            />
          </InputGroup>

          {/* Category Filter */}
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={CATEGORIES}
          />

          <Divider />

          {/* Documents List */}
          {loading ? (
            <Stack space='medium' align='center'>
              <Paragraph color='muted'>Loading documents...</Paragraph>
            </Stack>
          ) : filteredDocuments.length === 0 ? (
            <Card variant='default' padding='xlarge'>
              <Stack space='medium' align='center'>
                <Ionicons
                  name='folder-open-outline'
                  size={48}
                  color='#9ca3af'
                />
                <H2>No documents found</H2>
                <Paragraph color='muted' style={{ textAlign: 'center' }}>
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first document'}
                </Paragraph>
                <Button variant='primary' onPress={handleAddDocument}>
                  Add Document
                </Button>
              </Stack>
            </Card>
          ) : (
            <Stack space='small'>
              {filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPress={() => handleDocumentPress(document)}
                  onDelete={() => handleDeleteDocument(document.id)}
                  categories={CATEGORIES}
                />
              ))}
            </Stack>
          )}

          {/* Storage Info */}
          <Card variant='filled' padding='medium'>
            <Row justify='between' align='center'>
              <Stack space='xs'>
                <Paragraph weight='semibold'>Storage Used</Paragraph>
                <Paragraph size='small' color='muted'>
                  2.4 GB of 5 GB
                </Paragraph>
              </Stack>
              <Box
                style={{
                  width: 100,
                  height: 8,
                  backgroundColor: '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: '48%',
                    height: '100%',
                    backgroundColor: '#3b82f6',
                  }}
                />
              </Box>
            </Row>
          </Card>

          {/* Floating Action Button */}
          <Box style={{ height: 80 }} />
        </Stack>
      </Container>

      {/* FAB */}
      <Box
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
        }}
      >
        <Button
          variant='primary'
          size='large'
          rounded
          onPress={handleAddDocument}
          style={{
            width: 56,
            height: 56,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name='add' size={24} color='white' />
        </Button>
      </Box>
    </ScrollContainer>
  );
}
