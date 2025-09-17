import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Text, Button, Card, Input } from '@tamagui/core';
import { Search, Plus, FileText, Download, Share, Eye, Filter } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockDocuments = [
  {
    id: '1',
    name: 'Last Will & Testament',
    type: 'Legal Document',
    lastModified: '2 days ago',
    status: 'Protected',
    size: '2.4 MB',
    icon: '📄',
  },
  {
    id: '2',
    name: 'Life Insurance Policy',
    type: 'Insurance',
    lastModified: '1 week ago',
    status: 'Active',
    size: '1.8 MB',
    icon: '🛡️',
  },
  {
    id: '3',
    name: 'Property Deed',
    type: 'Real Estate',
    lastModified: '2 weeks ago',
    status: 'Verified',
    size: '3.2 MB',
    icon: '🏠',
  },
  {
    id: '4',
    name: 'Family Photos Archive',
    type: 'Personal',
    lastModified: '3 days ago',
    status: 'Backed Up',
    size: '45.6 MB',
    icon: '📸',
  },
];

export default function DocumentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Protected': return '$green10';
      case 'Active': return '$blue10';
      case 'Verified': return '$purple10';
      case 'Backed Up': return '$orange10';
      default: return '$gray10';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <YStack f={1} p="$4" space="$4">
        {/* Header */}
        <XStack ai="center" jc="space-between">
          <H1 color="white" size="$8">
            Documents
          </H1>
          <Button size="$4" theme="blue">
            <Plus size={20} color="white" />
          </Button>
        </XStack>

        {/* Search and Filter */}
        <XStack space="$3" ai="center">
          <XStack f={1} ai="center" bc="$gray8" br="$4" p="$3">
            <Search size={20} color="$gray10" />
            <Input
              f={1}
              ml="$3"
              placeholder="Search documents..."
              placeholderTextColor="$gray10"
              value={searchQuery}
              onChangeText={setSearchQuery}
              bc="transparent"
              borderWidth={0}
              color="white"
            />
          </XStack>
          <Button size="$4" chromeless>
            <Filter size={20} color="white" />
          </Button>
        </XStack>

        {/* Stats */}
        <XStack space="$3">
          <Card f={1} p="$3" bc="$gray8">
            <Text color="white" size="$6" fontWeight="bold">
              {mockDocuments.length}
            </Text>
            <Text color="$gray10" size="$3">
              Total Documents
            </Text>
          </Card>
          <Card f={1} p="$3" bc="$gray8">
            <Text color="white" size="$6" fontWeight="bold">
              53.0 MB
            </Text>
            <Text color="$gray10" size="$3">
              Storage Used
            </Text>
          </Card>
        </XStack>

        {/* Documents List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack space="$3">
            <H2 color="white" size="$6">
              Your Documents
            </H2>
            
            {filteredDocuments.map((document) => (
              <Card key={document.id} p="$4" bc="$gray8">
                <XStack ai="center" space="$3">
                  <YStack
                    w={40}
                    h={40}
                    ai="center"
                    jc="center"
                    bc="$gray7"
                    br="$3"
                  >
                    <Text size="$5">{document.icon}</Text>
                  </YStack>
                  
                  <YStack f={1} space="$1">
                    <Text color="white" size="$5" fontWeight="600">
                      {document.name}
                    </Text>
                    <XStack ai="center" space="$2">
                      <Text color="$gray10" size="$3">
                        {document.type}
                      </Text>
                      <Text color="$gray10" size="$3">
                        •
                      </Text>
                      <Text color="$gray10" size="$3">
                        {document.size}
                      </Text>
                    </XStack>
                    <XStack ai="center" space="$2">
                      <YStack
                        w={6}
                        h={6}
                        br="$10"
                        bc={getStatusColor(document.status)}
                      />
                      <Text color={getStatusColor(document.status)} size="$3">
                        {document.status}
                      </Text>
                      <Text color="$gray10" size="$3">
                        • {document.lastModified}
                      </Text>
                    </XStack>
                  </YStack>

                  <XStack space="$2">
                    <Button size="$3" chromeless>
                      <Eye size={16} color="$gray10" />
                    </Button>
                    <Button size="$3" chromeless>
                      <Share size={16} color="$gray10" />
                    </Button>
                    <Button size="$3" chromeless>
                      <Download size={16} color="$gray10" />
                    </Button>
                  </XStack>
                </XStack>
              </Card>
            ))}

            {filteredDocuments.length === 0 && (
              <Card p="$6" bc="$gray8" ai="center">
                <FileText size={48} color="$gray10" mb="$3" />
                <Text color="white" size="$5" fontWeight="600" mb="$2">
                  No documents found
                </Text>
                <Text color="$gray10" size="$4" ta="center">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Add your first document to get started'
                  }
                </Text>
                {!searchQuery && (
                  <Button size="$4" theme="blue" mt="$4">
                    <XStack ai="center" space="$2">
                      <Plus size={16} color="white" />
                      <Text color="white">Add Document</Text>
                    </XStack>
                  </Button>
                )}
              </Card>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}