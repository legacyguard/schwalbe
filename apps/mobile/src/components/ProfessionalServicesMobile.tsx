import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input, Avatar } from 'tamagui';
import { Search, Filter, Star, MapPin, Clock, Phone, Mail, Shield, Award, Heart } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { SofiaFirefly } from './sofia-firefly';
import { useHapticFeedback } from '../temp-emotional-sync/hooks';
import { isFeatureEnabled } from '../config/featureFlags';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Professional {
  id: string;
  name: string;
  title: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: number;
  avatar: string;
  verified: boolean;
  responseTime: string;
  languages: string[];
  specializations: string[];
  trustScore: number;
}

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    title: 'Estate Planning Attorney',
    specialty: 'Digital Assets & Cryptocurrency',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 350,
    experience: 12,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseTime: '< 2 hours',
    languages: ['English', 'Spanish'],
    specializations: ['Digital Assets', 'Cryptocurrency', 'International Law'],
    trustScore: 98,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Family Law Specialist',
    specialty: 'Multi-Generational Planning',
    location: 'New York, NY',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 320,
    experience: 15,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseTime: '< 1 hour',
    languages: ['English', 'Mandarin'],
    specializations: ['Family Trusts', 'Estate Tax', 'Succession Planning'],
    trustScore: 95,
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Trust & Estate Psychologist',
    specialty: 'Family Dynamics & Legacy Planning',
    location: 'Austin, TX',
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 280,
    experience: 8,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseTime: '< 3 hours',
    languages: ['English', 'Spanish'],
    specializations: ['Family Psychology', 'Grief Counseling', 'Legacy Planning'],
    trustScore: 97,
  },
];

const ProfessionalCard = ({ professional, onPress }: { professional: Professional; onPress: () => void }) => {
  const { triggerSuccess } = useHapticFeedback();

  const handlePress = () => {
    triggerSuccess();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Card
        padding="$4"
        marginBottom="$3"
        backgroundColor="$legacyBackgroundSecondary"
        borderColor="$legacyAccentGold"
        borderWidth={0.5}
        borderRadius="$4"
      >
        <XStack space="$3" alignItems="flex-start">
          <Avatar size="$6" circular>
            <Avatar.Image src={professional.avatar} />
            <Avatar.Fallback backgroundColor="$legacyAccentGold" />
          </Avatar>

          <YStack flex={1} space="$2">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1}>
                <XStack alignItems="center" space="$2">
                  <Text
                    color="$legacyTextPrimary"
                    fontSize="$5"
                    fontWeight="700"
                    numberOfLines={1}
                  >
                    {professional.name}
                  </Text>
                  {professional.verified && (
                    <Shield size={16} color="$legacySuccess" />
                  )}
                </XStack>
                <Text
                  color="$legacyTextMuted"
                  fontSize="$3"
                  fontWeight="500"
                >
                  {professional.title}
                </Text>
              </YStack>

              <YStack alignItems="flex-end" space="$1">
                <XStack alignItems="center" space="$1">
                  <Star size={14} color="$legacyAccentGold" fill="$legacyAccentGold" />
                  <Text color="$legacyTextPrimary" fontSize="$3" fontWeight="600">
                    {professional.rating}
                  </Text>
                </XStack>
                <Text color="$legacyTextMuted" fontSize="$2">
                  {professional.reviewCount} reviews
                </Text>
              </YStack>
            </XStack>

            <XStack space="$2" flexWrap="wrap">
              <Text
                backgroundColor="$legacyAccentGold"
                color="$legacyBackgroundPrimary"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
                fontSize="$2"
                fontWeight="600"
              >
                {professional.specialty}
              </Text>
              <Text
                backgroundColor="$legacySuccess"
                color="white"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
                fontSize="$2"
                fontWeight="600"
              >
                {professional.experience}y exp
              </Text>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$1">
                <MapPin size={12} color="$legacyTextMuted" />
                <Text color="$legacyTextMuted" fontSize="$2">
                  {professional.location}
                </Text>
              </XStack>

              <XStack alignItems="center" space="$1">
                <Clock size={12} color="$legacyTextMuted" />
                <Text color="$legacyTextMuted" fontSize="$2">
                  {professional.responseTime}
                </Text>
              </XStack>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text color="$legacyTextMuted" fontSize="$2">
                  Trust Score
                </Text>
                <XStack alignItems="center" space="$1">
                  <Heart size={12} color="$legacyAccentGold" fill="$legacyAccentGold" />
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="700">
                    {professional.trustScore}%
                  </Text>
                </XStack>
              </YStack>

              <YStack alignItems="flex-end">
                <Text color="$legacyTextMuted" fontSize="$2">
                  Starting at
                </Text>
                <Text color="$legacyAccentGold" fontSize="$5" fontWeight="700">
                  ${professional.hourlyRate}/hr
                </Text>
              </YStack>
            </XStack>

            <XStack space="$2" marginTop="$2">
              <Button
                flex={1}
                size="$3"
                backgroundColor="$legacyAccentGold"
                borderRadius="$3"
                onPress={handlePress}
              >
                <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                  View Profile
                </Text>
              </Button>
              <Button
                size="$3"
                backgroundColor="transparent"
                borderColor="$legacyAccentGold"
                borderWidth={1}
                borderRadius="$3"
                onPress={() => {
                  // Handle contact
                }}
              >
                <Mail size={16} color="$legacyAccentGold" />
              </Button>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </TouchableOpacity>
  );
};

export default function ProfessionalServicesMobile() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredProfessionals, setFilteredProfessionals] = useState(mockProfessionals);
  const { triggerEncouragement } = useHapticFeedback();
  const { t } = useTranslation();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const filtered = mockProfessionals.filter(pro =>
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProfessionals(filtered);
  }, [searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Sofia Firefly */}
      {isFeatureEnabled('sofiaFirefly') && (
        <SofiaFirefly
          variant="interactive"
          size="small"
          personality="empathetic"
          context="guiding"
          onTouch={() => triggerEncouragement()}
          glowIntensity={0.4}
          enableHaptics={true}
          enableAdvancedAnimations={true}
          accessibilityLabel="Sofia, your professional services guide"
          accessibilityHint="Touch to get help finding the right professional"
        />
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack padding="$4" space="$4">
          {/* Header */}
          <YStack space="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <YStack>
                <Text color="$legacyTextMuted" fontSize="$4">
                  Professional Services
                </Text>
                <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800">
                  Find Your Expert
                </Text>
              </YStack>
              <SofiaFirefly
                size="small"
                personality="empathetic"
                context="guiding"
                message="Sofia helps you find the perfect professional for your family's needs ✨"
                onTouch={async () => {
                  await triggerEncouragement();
                }}
                enableHaptics={true}
                enableAdvancedAnimations={true}
                accessibilityLabel="Sofia's guiding light"
                accessibilityHint="Touch for personalized recommendations"
              />
            </XStack>

            <Text color="$legacyTextMuted" fontSize="$3" textAlign="center">
              Connect with verified professionals who understand your family's unique legacy planning needs
            </Text>
          </YStack>

          {/* Search */}
          <Card
            padding="$3"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$3"
          >
            <XStack alignItems="center" space="$2">
              <Search size={20} color="$legacyAccentGold" />
              <Input
                flex={1}
                placeholder="Search by name, specialty, or location..."
                placeholderTextColor="$legacyTextMuted"
                value={searchQuery}
                onChangeText={setSearchQuery}
                backgroundColor="transparent"
                borderWidth={0}
                color="$legacyTextPrimary"
                fontSize="$4"
              />
              <TouchableOpacity>
                <Filter size={20} color="$legacyAccentGold" />
              </TouchableOpacity>
            </XStack>
          </Card>

          {/* Quick Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" paddingHorizontal="$1">
              {['All', 'Attorneys', 'Psychologists', 'Financial Advisors', 'Tax Specialists'].map((filter) => (
                <TouchableOpacity key={filter}>
                  <Text
                    backgroundColor={filter === 'All' ? '$legacyAccentGold' : 'transparent'}
                    color={filter === 'All' ? '$legacyBackgroundPrimary' : '$legacyAccentGold'}
                    borderColor="$legacyAccentGold"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    paddingVertical="$1"
                    borderRadius="$2"
                    fontSize="$3"
                    fontWeight="600"
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
          </ScrollView>

          {/* Results Count */}
          <Text color="$legacyTextMuted" fontSize="$3">
            {filteredProfessionals.length} professionals found
          </Text>

          {/* Professional Cards */}
          <YStack space="$2">
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onPress={() => {
                  // Navigate to professional detail
                  router.push(`/professional/${professional.id}`);
                }}
              />
            ))}
          </YStack>

          {/* Load More */}
          {filteredProfessionals.length > 0 && (
            <Button
              size="$4"
              backgroundColor="transparent"
              borderColor="$legacyAccentGold"
              borderWidth={1}
              borderRadius="$3"
              marginTop="$4"
            >
              <Text color="$legacyAccentGold" fontSize="$4" fontWeight="600">
                Load More Professionals
              </Text>
            </Button>
          )}

          {/* Empty State */}
          {filteredProfessionals.length === 0 && (
            <Card
              padding="$6"
              backgroundColor="$legacyBackgroundSecondary"
              borderColor="$legacyAccentGold"
              borderWidth={0.5}
              borderRadius="$4"
              alignItems="center"
            >
              <Award size={48} color="$legacyAccentGold" />
              <Text
                color="$legacyTextPrimary"
                fontSize="$5"
                fontWeight="600"
                textAlign="center"
                marginTop="$3"
                marginBottom="$2"
              >
                No professionals found
              </Text>
              <Text
                color="$legacyTextMuted"
                fontSize="$3"
                textAlign="center"
              >
                Try adjusting your search criteria or filters
              </Text>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}