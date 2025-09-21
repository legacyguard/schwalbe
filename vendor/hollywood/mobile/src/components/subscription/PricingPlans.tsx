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
// import { subscriptionService, stripeService, SubscriptionLimits } from '@hollywood/shared';

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

const subscriptionService = {
  getAllPlans: async (): Promise<SubscriptionLimits[]> => {
    return [
      {
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
      },
      {
        plan: 'essential',
        max_documents: 100,
        max_storage_mb: 1000,
        max_time_capsules: 5,
        max_scans_per_month: 50,
        offline_access: true,
        ai_features: false,
        advanced_search: true,
        family_sharing: false,
        legal_tools: false,
        priority_support: false,
        max_family_members: 1,
        price_monthly: 9.99,
        price_yearly: 99.99,
      },
      {
        plan: 'family',
        max_documents: 500,
        max_storage_mb: 5000,
        max_time_capsules: 20,
        max_scans_per_month: 200,
        offline_access: true,
        ai_features: true,
        advanced_search: true,
        family_sharing: true,
        legal_tools: false,
        priority_support: true,
        max_family_members: 5,
        price_monthly: 19.99,
        price_yearly: 199.99,
      },
      {
        plan: 'premium',
        max_documents: 1000,
        max_storage_mb: 10000,
        max_time_capsules: 50,
        max_scans_per_month: 500,
        offline_access: true,
        ai_features: true,
        advanced_search: true,
        family_sharing: true,
        legal_tools: true,
        priority_support: true,
        max_family_members: 10,
        price_monthly: 29.99,
        price_yearly: 299.99,
      },
    ];
  },
  getCurrentSubscription: async (): Promise<null | {
    billing_cycle: string;
    plan: string;
  }> => ({
    plan: 'free',
    billing_cycle: 'month',
  }),
};

const stripeService = {
  createCheckoutSession: async (
    _priceId: string,
    _successUrl: string,
    _cancelUrl: string
  ) => ({ url: 'https://example.com' }),
};
import { useAuth } from '../../hooks/useAuth';

interface PlanFeature {
  included: boolean;
  name: string;
}

interface PlanCardProps {
  billingCycle: 'month' | 'year';
  currentPlan?: string;
  isLoading?: boolean;
  onSubscribe: (plan: string) => void;
  plan: SubscriptionLimits;
}

const PlanCard = React.memo<PlanCardProps>(({
  plan,
  currentPlan,
  billingCycle,
  onSubscribe,
  isLoading,
}) => {
  const isCurrentPlan = currentPlan === plan.plan;
  const isPremium = plan.plan === 'premium';

  const getPlanPrice = () => {
    const prices: Record<string, { month: number; year: number }> = {
      free: { month: 0, year: 0 },
      essential: { month: 9.99, year: 99.99 },
      family: { month: 19.99, year: 199.99 },
      premium: { month: 39.99, year: 399.99 },
    };
    return prices[plan.plan]?.[billingCycle] || 0;
  };

  const formatLimit = (limit: null | number) => {
    return limit === null ? 'Unlimited' : limit.toLocaleString();
  };

  const formatStorage = (mb: null | number) => {
    if (mb === null) return 'Unlimited';
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(0)} GB`;
  };

  const features: PlanFeature[] = [
    { name: `${formatLimit(plan.max_documents)} documents`, included: true },
    { name: `${formatStorage(plan.max_storage_mb)} storage`, included: true },
    {
      name: `${formatLimit(plan.max_time_capsules)} time capsules`,
      included: true,
    },
    {
      name: `${formatLimit(plan.max_scans_per_month)} scans/month`,
      included: true,
    },
    { name: 'Offline access', included: plan.offline_access },
    { name: 'AI features', included: plan.ai_features },
    { name: 'Advanced search', included: plan.advanced_search },
    { name: 'Priority support', included: plan.priority_support },
  ];

  if (plan.max_family_members > 1) {
    features.splice(4, 0, {
      name: `Up to ${plan.max_family_members} family members`,
      included: true,
    });
  }

  return (
    <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
      {isPremium && (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.popularBadge}
        >
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </LinearGradient>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.plan.toUpperCase()}</Text>
        {isCurrentPlan && (
          <Text style={styles.currentPlanLabel}>Current Plan</Text>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceAmount}>${getPlanPrice()}</Text>
        <Text style={styles.pricePeriod}>per {billingCycle}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name={feature.included ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={feature.included ? '#48bb78' : '#cbd5e0'}
            />
            <Text
              style={[
                styles.featureText,
                !feature.included && styles.featureTextDisabled,
              ]}
            >
              {feature.name}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          isCurrentPlan && styles.subscribeButtonDisabled,
          plan.plan === 'free' && styles.subscribeButtonDisabled,
        ]}
        onPress={() => onSubscribe(plan.plan)}
        disabled={isCurrentPlan || isLoading || plan.plan === 'free'}
      >
        {isLoading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.subscribeButtonText}>
            {isCurrentPlan
              ? 'Current Plan'
              : plan.plan === 'free'
                ? 'Free Forever'
                : `Upgrade to ${plan.plan}`}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

export const PricingPlans = React.memo(() => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionLimits[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      const [allPlans, subscription] = await Promise.all([
        subscriptionService.getAllPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);

      setPlans(allPlans);
      if (subscription) {
        setCurrentPlan(subscription.plan);
        setBillingCycle(subscription.billing_cycle as 'month' | 'year');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load pricing plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      const priceIds: Record<string, { month: string; year: string }> = {
        essential: {
          month: 'price_1S2AU9Fjl1oRWeU60ajoUhTz',
          year: 'price_1S2AU9Fjl1oRWeU6Crewzj5D',
        },
        family: {
          month: 'price_1S2AUAFjl1oRWeU6RGjCZX6S',
          year: 'price_1S2AUAFjl1oRWeU63cvXIf9o',
        },
        premium: {
          month: 'price_1S2AUAFjl1oRWeU64RKuOu7B',
          year: 'price_1S2AUBFjl1oRWeU6587z8bLh',
        },
      };

      const priceId = priceIds[planName]?.[billingCycle];
      if (!priceId) {
        throw new Error('Invalid plan selection');
      }

      // For mobile, we need to open the checkout in a web browser
      const { url } = await stripeService.createCheckoutSession(
        priceId,
        'documentsafe://subscription-success',
        'documentsafe://subscription-cancel'
      );

      if (url) {
        // Open Stripe Checkout in browser
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open checkout page');
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', 'Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#667eea' />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Secure your documents with the plan that fits your needs
        </Text>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'month' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingCycle('month')}
          >
            <Text
              style={[
                styles.billingOptionText,
                billingCycle === 'month' && styles.billingOptionTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'year' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingCycle('year')}
          >
            <Text
              style={[
                styles.billingOptionText,
                billingCycle === 'year' && styles.billingOptionTextActive,
              ]}
            >
              Yearly
            </Text>
            {billingCycle === 'year' && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save 17%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.plansContainer}>
        {plans.map(plan => (
          <PlanCard
            key={plan.plan}
            plan={plan}
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All plans include 256-bit encryption, automatic backups, and 24/7
          support
        </Text>
        <Text style={styles.footerText}>
          Cancel or change your plan anytime
        </Text>
      </View>
    </ScrollView>
  );
});

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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  billingOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  billingOptionText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  billingOptionTextActive: {
    color: '#2d3748',
  },
  saveBadge: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  currentPlanLabel: {
    fontSize: 14,
    color: '#667eea',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 8,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#2d3748',
    marginLeft: 12,
    flex: 1,
  },
  featureTextDisabled: {
    color: '#cbd5e0',
  },
  subscribeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 8,
  },
});
