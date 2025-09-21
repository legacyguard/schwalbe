/**
 * Upgrade Prompt Component
 * Displays upgrade prompts and handles upgrade flow
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type {
  FeatureAccess,
  FreemiumManager,
  UsageLimits,
} from '../services/FreemiumManager';

interface UpgradePromptProps {
  action?:
    | 'create_capsule'
    | 'offline_save'
    | 'scan_document'
    | 'upload_document';
  feature?: string;
  freemiumManager: FreemiumManager;
  onClose?: () => void;
  onUpgrade?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  freemiumManager,
  feature,
  action,
  onClose,
  onUpgrade,
}) => {
  const [visible, setVisible] = useState(false);
  const [limits, setLimits] = useState<null | UsageLimits>(null);
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState<string[]>([]);

  const checkAccess = useCallback(async () => {
    setLoading(true);

    try {
      // Check feature access
      if (feature) {
        const access = freemiumManager.checkFeatureAccess(feature);
        setFeatureAccess(access);
        if (!access.hasAccess) {
          setVisible(true);
        }
      }

      // Check action limits
      if (action) {
        const canPerform = await freemiumManager.canPerformAction(action);
        if (!canPerform) {
          const currentLimits = await freemiumManager.checkLimits();
          setLimits(currentLimits);
          setVisible(true);
        }
      }

      // Get upgrade benefits
      const upgradeBenefits = freemiumManager.getUpgradeBenefits();
      setBenefits(upgradeBenefits);
    } catch (error) {
      console.error('UpgradePrompt: Error checking access', error);
    } finally {
      setLoading(false);
    }
  }, [freemiumManager, feature, action]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const handleUpgrade = async () => {
    await freemiumManager.openUpgradeFlow(feature);
    onUpgrade?.();
    handleClose();
  };

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const getLimitMessage = () => {
    if (!limits || !action) return '';

    const messages: Record<string, (limits: UsageLimits) => string> = {
      upload_document: l =>
        `You've reached your document limit (${l.documents.current}/${l.documents.limit})`,
      scan_document: l =>
        `You've used all your scans this month (${l.scannerUsage.current}/${l.scannerUsage.limit})`,
      create_capsule: l =>
        `You've reached your time capsule limit (${l.timeCapsules.current}/${l.timeCapsules.limit})`,
      offline_save: l =>
        `You've reached your offline document limit (${l.offlineDocuments.current}/${l.offlineDocuments.limit})`,
    };

    return messages[action]?.(limits) || "You've reached your limit";
  };

  const getFeatureMessage = () => {
    if (!featureAccess) return '';

    const featureNames: Record<string, string> = {
      advanced_ocr: 'Advanced OCR Scanning',
      family_sharing: 'Family Sharing',
      unlimited_storage: 'Unlimited Storage',
      legal_templates: 'Legal Templates',
      will_generator: 'Will Generator',
      emergency_access: 'Emergency Access',
      api_access: 'API Access',
    };

    const featureName = featureNames[feature || ''] || feature;
    return `${featureName} is a premium feature`;
  };

  const getPlanName = (plan: string) => {
    const names: Record<string, string> = {
      essential: 'Essential',
      family: 'Family',
      premium: 'Premium',
    };
    return names[plan] || plan;
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType='fade'>
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#1e40af' />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#1e40af', '#1e3a8a']} style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name='close' size={24} color='white' />
            </TouchableOpacity>

            <Ionicons name='lock-closed' size={48} color='white' />

            <Text style={styles.headerTitle}>
              {action ? 'Limit Reached' : 'Premium Feature'}
            </Text>

            <Text style={styles.headerMessage}>
              {action ? getLimitMessage() : getFeatureMessage()}
            </Text>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {featureAccess && featureAccess.requiredPlan && (
              <View style={styles.requiredPlan}>
                <Text style={styles.requiredPlanText}>
                  Requires {getPlanName(featureAccess.requiredPlan)} Plan or
                  higher
                </Text>
              </View>
            )}

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Unlock These Benefits</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name='checkmark-circle' size={20} color='#16a34a' />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <Ionicons name='document-text' size={32} color='#1e40af' />
                <Text style={styles.featureTitle}>More Documents</Text>
                <Text style={styles.featureDescription}>
                  Store more documents securely
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Ionicons name='scan' size={32} color='#1e40af' />
                <Text style={styles.featureTitle}>Advanced Scanning</Text>
                <Text style={styles.featureDescription}>
                  AI-powered document analysis
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Ionicons name='people' size={32} color='#1e40af' />
                <Text style={styles.featureTitle}>Family Sharing</Text>
                <Text style={styles.featureDescription}>
                  Share with loved ones
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Ionicons name='shield-checkmark' size={32} color='#1e40af' />
                <Text style={styles.featureTitle}>Legal Tools</Text>
                <Text style={styles.featureDescription}>
                  Will generator & templates
                </Text>
              </View>
            </View>

            <View style={styles.ctaSection}>
              <Text style={styles.ctaText}>
                Complete your legacy protection with full access to all features
              </Text>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeButtonText}>Continue on Web</Text>
                  <Ionicons name='arrow-forward' size={20} color='white' />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.webNote}>
                You'll be redirected to our secure web platform to complete your
                upgrade
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  headerMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  requiredPlan: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  requiredPlanText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: (width - 72) / 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 12,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  webNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
