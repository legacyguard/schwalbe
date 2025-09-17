import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import {
//   subscriptionService,
//   stripeService,
//   UserSubscription,
//   UserUsage,
//   SubscriptionLimits,
// } from '@hollywood/shared';

// Temporary placeholder types and services
interface SubscriptionLimits {
  advanced_search: boolean;
  ai_features: boolean;
  family_sharing: boolean;
  legal_tools: boolean;
  max_documents: number;
  max_family_members: number;
  max_scans_per_month: number;
  max_storage_mb: number;
  max_time_capsules: number;
  offline_access: boolean;
  plan: string;
  price_monthly: number;
  price_yearly: number;
  priority_support: boolean;
}

interface UserSubscription {
  billing_cycle: string;
  expires_at?: string;
  plan: string;
  status: string;
}

interface UserUsage {
  document_count: number;
  scans_this_month: number;
  storage_used_mb: number;
  time_capsule_count: number;
}

const subscriptionService = {
  getCurrentSubscription: async (): Promise<null | UserSubscription> => null,
  getCurrentUsage: async (): Promise<null | UserUsage> => ({
    document_count: 0,
    storage_used_mb: 0,
    time_capsule_count: 0,
    scans_this_month: 0,
  }),
  getPlanLimits: async (_plan: string): Promise<null | SubscriptionLimits> => ({
    plan: 'free',
    max_documents: 10,
    max_storage_mb: 100,
    max_time_capsules: 1,
    max_scans_per_month: 5,
    offline_access: false,
    ai_features: false,
    advanced_search: false,
    family_sharing: false,
    legal_tools: false,
    priority_support: false,
    max_family_members: 1,
    price_monthly: 0,
    price_yearly: 0,
  }),
  getDaysRemaining: async (): Promise<number> => 0,
};

const stripeService = {
  getCustomerPortalUrl: async (): Promise<null | string> => null,
};
// import { useAuth } from '../../hooks/useAuth';

interface UsageBarProps {
  current: number;
  label: string;
  max: null | number;
  unit?: string;
}

const UsageBar: React.FC<UsageBarProps> = ({
  label,
  current,
  max,
  unit = '',
}) => {
  const percentage = max ? Math.min((current / max) * 100, 100) : 0;
  const isUnlimited = max === null;

  const getBarColor = () => {
    if (isUnlimited) return '#48bb78';
    if (percentage >= 90) return '#f56565';
    if (percentage >= 75) return '#ed8936';
    return '#48bb78';
  };

  return (
    <View style={styles.usageBarContainer}>
      <View style={styles.usageBarHeader}>
        <Text style={styles.usageLabel}>{label}</Text>
        <Text style={styles.usageText}>
          {isUnlimited ? (
            <Text style={styles.unlimitedText}>Unlimited</Text>
          ) : (
            <>
              {current.toLocaleString()}
              {unit} / {max.toLocaleString()}
              {unit}
            </>
          )}
        </Text>
      </View>
      {!isUnlimited && (
        <View style={styles.usageBarBg}>
          <View
            style={[
              styles.usageBarFill,
              { width: `${percentage}%`, backgroundColor: getBarColor() },
            ]}
          />
        </View>
      )}
    </View>
  );
};

export const SubscriptionStatus: React.FC = () => {
  // const { user } = useAuth();
  const [subscription, setSubscription] = useState<null | UserSubscription>(
    null
  );
  const [usage, setUsage] = useState<null | UserUsage>(null);
  const [limits, setLimits] = useState<null | SubscriptionLimits>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<null | number>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [sub, usg] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getCurrentUsage(),
      ]);

      if (sub) {
        setSubscription(sub);
        const planLimits = await subscriptionService.getPlanLimits(sub.plan);
        setLimits(planLimits);

        if (sub.expires_at) {
          const days = await subscriptionService.getDaysRemaining();
          setDaysRemaining(days);
        }
      }

      if (usg) {
        setUsage(usg);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await stripeService.getCustomerPortalUrl();
      if (portalUrl) {
        const supported = await Linking.canOpenURL(portalUrl);
        if (supported) {
          await Linking.openURL(portalUrl);
        } else {
          Alert.alert('Error', 'Cannot open billing portal');
        }
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      Alert.alert('Error', 'Failed to open billing portal');
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing screen
    // navigation.navigate('Pricing');
  };

  // const formatStorageSize = (mb: number) => {
  //   if (mb < 1024) return `${mb.toFixed(1)} MB`;
  //   return `${(mb / 1024).toFixed(1)} GB`;
  // };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#667eea' />
      </View>
    );
  }

  const planColors: Record<string, string[]> = {
    free: ['#cbd5e0', '#a0aec0'],
    essential: ['#4299e1', '#3182ce'],
    family: ['#48bb78', '#38a169'],
    premium: ['#667eea', '#764ba2'],
  };

  const colors = planColors[subscription?.plan || 'free'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Plan Card */}
      <LinearGradient
        colors={colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planCard}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>
            {subscription?.plan?.toUpperCase() || 'FREE'} PLAN
          </Text>
          {subscription?.status && subscription.status !== 'active' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{subscription.status}</Text>
            </View>
          )}
        </View>

        {subscription?.billing_cycle && (
          <Text style={styles.billingCycle}>
            Billed{' '}
            {subscription.billing_cycle === 'month' ? 'Monthly' : 'Yearly'}
          </Text>
        )}

        {daysRemaining !== null && (
          <Text style={styles.expiryText}>
            {daysRemaining > 0
              ? `${daysRemaining} days remaining`
              : 'Expires today'}
          </Text>
        )}
      </LinearGradient>

      {/* Usage Statistics */}
      <View style={styles.usageSection}>
        <Text style={styles.sectionTitle}>Current Usage</Text>

        {usage && limits && (
          <>
            <UsageBar
              label='Documents'
              current={usage.document_count}
              max={limits.max_documents}
            />

            <UsageBar
              label='Storage'
              current={Number(usage.storage_used_mb)}
              max={limits.max_storage_mb}
              unit=' MB'
            />

            <UsageBar
              label='Time Capsules'
              current={usage.time_capsule_count}
              max={limits.max_time_capsules}
            />

            <UsageBar
              label='Scans this month'
              current={usage.scans_this_month}
              max={limits.max_scans_per_month}
            />
          </>
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Your Features</Text>

        {limits && (
          <View style={styles.featuresList}>
            <View style={styles.featureRow}>
              <Ionicons
                name={
                  limits.offline_access ? 'checkmark-circle' : 'close-circle'
                }
                size={24}
                color={limits.offline_access ? '#48bb78' : '#cbd5e0'}
              />
              <Text style={styles.featureText}>Offline Access</Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name={limits.ai_features ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={limits.ai_features ? '#48bb78' : '#cbd5e0'}
              />
              <Text style={styles.featureText}>AI Features</Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name={
                  limits.advanced_search ? 'checkmark-circle' : 'close-circle'
                }
                size={24}
                color={limits.advanced_search ? '#48bb78' : '#cbd5e0'}
              />
              <Text style={styles.featureText}>Advanced Search</Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name={
                  limits.priority_support ? 'checkmark-circle' : 'close-circle'
                }
                size={24}
                color={limits.priority_support ? '#48bb78' : '#cbd5e0'}
              />
              <Text style={styles.featureText}>Priority Support</Text>
            </View>

            {limits.max_family_members > 1 && (
              <View style={styles.featureRow}>
                <Ionicons name='people' size={24} color='#667eea' />
                <Text style={styles.featureText}>
                  {limits.max_family_members} Family Members
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {subscription?.plan === 'free' ? (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>

            {subscription?.plan !== 'premium' && (
              <TouchableOpacity
                style={styles.upgradeButtonOutline}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonOutlineText}>
                  Upgrade Plan
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  billingCycle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  usageSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  usageBarContainer: {
    marginBottom: 20,
  },
  usageBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#718096',
  },
  usageText: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },
  unlimitedText: {
    color: '#48bb78',
    fontWeight: '600',
  },
  usageBarBg: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  featuresSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresList: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#2d3748',
    marginLeft: 12,
  },
  actions: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  upgradeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  upgradeButtonOutline: {
    borderWidth: 2,
    borderColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonOutlineText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#2d3748',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
