import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card, Input } from 'tamagui';
import { Search, Plus, FileText, Download, Share, Eye, Filter } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('screens');

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <YStack flex={1} padding="$4" space="$4">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <H1 color="$legacyTextPrimary" fontSize="$heroEmotional" fontWeight="800">
            {t('screens.documents.title')}
          </H1>
          <Button size="$4" backgroundColor="$legacyAccentGold" borderRadius="$3">
            <Plus size={20} color="$legacyBackgroundPrimary" />
          </Button>
        </XStack>

        {/* Search and Filter */}
        <XStack space="$3" alignItems="center">
          <XStack flex={1} alignItems="center" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4" padding="$3">
            <Search size={20} color="$legacyTextMuted" />
            <Input
              flex={1}
              marginLeft="$3"
              placeholder={t('screens.documents.searchPlaceholder')}
              placeholderTextColor="$legacyTextMuted"
              value={searchQuery}
              onChangeText={setSearchQuery}
              backgroundColor="transparent"
              borderWidth={0}
              color="$legacyTextPrimary"
            />
          </XStack>
          <Button size="$4" chromeless>
            <Filter size={20} color="$legacyAccentGold" />
          </Button>
        </XStack>

        {/* Stats */}
        <XStack space="$3">
          <Card flex={1} padding="$3" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$3">
            <Text color="$legacyTextPrimary" fontSize="$6" fontWeight="bold">
              {mockDocuments.length}
            </Text>
            <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
              {t('screens.documents.stats.seeds')}
            </Text>
          </Card>
          <Card flex={1} padding="$3" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$3">
            <Text color="$legacyTextPrimary" fontSize="$6" fontWeight="bold">
              53.0 MB
            </Text>
            <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
              {t('screens.documents.stats.preserved')}
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
            <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
              {t('screens.documents.yourCollection')}
            </H2>

            {filteredDocuments.map((document) => (
              <Card key={document.id} padding="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4">
                <XStack alignItems="center" space="$3">
                  <YStack
                    width={40}
                    height={40}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$legacyBackgroundTertiary"
                    borderRadius="$3"
                  >
                    <Text fontSize="$5">{document.icon}</Text>
                  </YStack>

                  <YStack flex={1} space="$1">
                    <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
                      {document.name}
                    </Text>
                    <XStack alignItems="center" space="$2">
                      <Text color="$legacyTextMuted" fontSize="$3">
                        {document.type}
                      </Text>
                      <Text color="$legacyTextMuted" fontSize="$3">
                        •
                      </Text>
                      <Text color="$legacyTextMuted" fontSize="$3">
                        {document.size}
                      </Text>
                    </XStack>
                    <XStack alignItems="center" space="$2">
                      <YStack
                        width={6}
                        height={6}
                        borderRadius="$10"
                        backgroundColor={getStatusColor(document.status)}
                      />
                      <Text color={getStatusColor(document.status)} fontSize="$3">
                        {document.status}
                      </Text>
                      <Text color="$legacyTextMuted" fontSize="$3">
                        • {document.lastModified}
                      </Text>
                    </XStack>
                  </YStack>

                  <XStack space="$2">
                    <Button size="$3" chromeless>
                      <Eye size={16} color="$legacyAccentGold" />
                    </Button>
                    <Button size="$3" chromeless>
                      <Share size={16} color="$legacyAccentGold" />
                    </Button>
                    <Button size="$3" chromeless>
                      <Download size={16} color="$legacyAccentGold" />
                    </Button>
                  </XStack>
                </XStack>
              </Card>
            ))}

            {filteredDocuments.length === 0 && (
              <Card padding="$6" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4" alignItems="center">
                <FileText size={48} color="$legacyTextMuted" marginBottom="$3" />
                <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600" marginBottom="$2">
                  {t('screens.documents.empty.title')}
                </Text>
                <Text color="$legacyTextMuted" fontSize="$4" textAlign="center">
                  {searchQuery
                    ? t('screens.documents.empty.subtitleSearchEmpty')
                    : t('screens.documents.empty.subtitleDefault')}
                </Text>
                {!searchQuery && (
                  <Button size="$4" backgroundColor="$legacyAccentGold" borderRadius="$3" marginTop="$4">
                    <XStack alignItems="center" space="$2">
                      <Plus size={16} color="$legacyBackgroundPrimary" />
                      <Text color="$legacyBackgroundPrimary" fontWeight="600">{t('screens.documents.empty.plantFirstSeed')}</Text>
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