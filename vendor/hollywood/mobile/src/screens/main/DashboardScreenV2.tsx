import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Divider,
  H1,
  H2,
  H3,
  Paragraph,
  Row,
  ScrollContainer,
  Stack,
} from '@legacyguard/ui';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Metrics Card Component
interface MetricCardProps {
  change?: number;
  changeLabel?: string;
  color: 'info' | 'primary' | 'success' | 'warning';
  icon: string;
  onPress?: () => void;
  title: string;
  trend?: 'down' | 'up';
  value: string;
}

const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  trend,
  icon,
  color,
  onPress,
}: MetricCardProps) => {
  const iconColor = {
    primary: '#1e40af',
    success: '#16a34a',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[color];

  return (
    <Card
      variant='elevated'
      padding='medium'
      clickable={!!onPress}
      style={{ flex: 1, minHeight: 120 }}
    >
      <Stack space='small'>
        <Row align='center' justify='between'>
          <Ionicons name={icon as any} size={24} color={iconColor} />
          {(change || changeLabel) && (
            <Row space='xs' align='center'>
              {trend && (
                <Ionicons
                  name={trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={trend === 'up' ? '#16a34a' : '#dc2626'}
                />
              )}
              <Paragraph size='small' color='muted'>
                {changeLabel ??
                  (typeof change === 'number'
                    ? `${change > 0 ? '+' : ''}${change}%`
                    : '')}
              </Paragraph>
            </Row>
          )}
        </Row>
        <H2>{value}</H2>
        <Paragraph size='small' color='muted'>
          {title}
        </Paragraph>
      </Stack>
    </Card>
  );
};

// Action Card Component
interface ActionCardProps {
  description: string;
  icon: string;
  onPress: () => void;
  title: string;
  variant?: 'premium' | 'primary' | 'success';
}

const ActionCard = ({
  title,
  description,
  icon,
  onPress,
  variant = 'primary',
}: ActionCardProps) => {
  return (
    <Card
      variant='default'
      padding='large'
      clickable
      onPress={onPress}
      fullWidth
    >
      <Row space='medium' align='center'>
        <Box
          padding='small'
          style={{
            backgroundColor:
              variant === 'primary'
                ? '#e0e7ff'
                : variant === 'success'
                  ? '#dcfce7'
                  : '#fef3c7',
            borderRadius: 12,
          }}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={
              variant === 'primary'
                ? '#1e40af'
                : variant === 'success'
                  ? '#16a34a'
                  : '#f59e0b'
            }
          />
        </Box>
        <Stack space='xs' style={{ flex: 1 }}>
          <H3>{title}</H3>
          <Paragraph size='small' color='muted'>
            {description}
          </Paragraph>
        </Stack>
        <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
      </Row>
    </Card>
  );
};

export function DashboardScreenV2() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics] = useState([
    {
      title: 'Documents Protected',
      value: '24',
      change: 12,
      trend: 'up' as const,
      icon: 'document-text',
      color: 'primary' as const,
      onPress: () => navigation.navigate('Documents' as never),
    },
    {
      title: 'Family Members',
      value: '8',
      change: 2,
      trend: 'up' as const,
      icon: 'people',
      color: 'success' as const,
      onPress: () => navigation.navigate('People' as never),
    },
    {
      title: 'Guardians',
      value: '3',
      changeLabel: 'Active',
      icon: 'shield',
      color: 'warning' as const,
      onPress: () => navigation.navigate('Guardians' as never),
    },
    {
      title: 'Days Protected',
      value: '147',
      icon: 'calendar',
      color: 'info' as const,
    },
  ]);

  const quickActions = [
    {
      title: 'Scan Document',
      description: 'Quickly add a new document',
      icon: 'camera',
      variant: 'primary' as const,
      onPress: () => navigation.navigate('Scanner' as never),
    },
    {
      title: 'Add Family Member',
      description: 'Expand your trusted circle',
      icon: 'person-add',
      variant: 'success' as const,
      onPress: () => navigation.navigate('People' as never),
    },
    {
      title: 'Create Will',
      description: 'Start your legacy planning',
      icon: 'document',
      variant: 'premium' as const,
      onPress: () => navigation.navigate('Will' as never),
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // const screenWidth = Dimensions.get('window').width;
  // const isTablet = screenWidth >= 768;

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
            <H1 color='primary'>
              Family Shield{user?.firstName ? `, ${user.firstName}` : ''}
            </H1>
            <Paragraph size='large' color='muted'>
              Overview of everything protecting your family
            </Paragraph>
          </Stack>

          {/* Primary Action Button */}
          <Button
            variant='primary'
            size='large'
            fullWidth
            onPress={() => navigation.navigate('Vault' as never)}
          >
            <Row space='small' align='center'>
              <Ionicons name='add-circle' size={20} color='white' />
              <Paragraph style={{ color: 'white', fontWeight: '600' }}>
                Secure New Information
              </Paragraph>
            </Row>
          </Button>

          <Divider />

          {/* Metrics Grid */}
          <Stack space='medium'>
            <H2>Your Legacy at a Glance</H2>
            <Stack space='medium'>
              <Row space='small'>
                <MetricCard {...metrics[0]} />
                <MetricCard {...metrics[1]} />
              </Row>
              <Row space='small'>
                <MetricCard {...metrics[2]} />
                <MetricCard {...metrics[3]} />
              </Row>
            </Stack>
          </Stack>

          <Divider />

          {/* Quick Actions */}
          <Stack space='medium'>
            <H2>Quick Actions</H2>
            <Stack space='small'>
              {quickActions.map((action, index) => (
                <ActionCard key={index} {...action} />
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Recent Activity */}
          <Stack space='medium'>
            <Row justify='between' align='center'>
              <H2>Recent Activity</H2>
              <Button
                variant='ghost'
                size='small'
                onPress={() => navigation.navigate('Activity' as never)}
              >
                View All
              </Button>
            </Row>

            <Stack space='small'>
              <Card variant='default' padding='medium'>
                <Row space='small' align='center'>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#16a34a',
                    }}
                  />
                  <Stack space='xs' style={{ flex: 1 }}>
                    <Paragraph weight='medium'>Document added</Paragraph>
                    <Paragraph size='small' color='muted'>
                      Insurance Policy - 2 hours ago
                    </Paragraph>
                  </Stack>
                </Row>
              </Card>

              <Card variant='default' padding='medium'>
                <Row space='small' align='center'>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#3b82f6',
                    }}
                  />
                  <Stack space='xs' style={{ flex: 1 }}>
                    <Paragraph weight='medium'>Guardian invited</Paragraph>
                    <Paragraph size='small' color='muted'>
                      John Doe - Yesterday
                    </Paragraph>
                  </Stack>
                </Row>
              </Card>
            </Stack>
          </Stack>

          {/* Trust Score */}
          <Card variant='premium' padding='large'>
            <CardHeader noBorder>
              <CardTitle>Your Trust Score</CardTitle>
              <CardDescription>
                Build trust by completing your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space='medium'>
                <Row justify='between' align='center'>
                  <H1 color='primary'>78</H1>
                  <Paragraph color='success'>+5 this month</Paragraph>
                </Row>
                <Box
                  style={{
                    height: 8,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: '78%',
                      height: '100%',
                      backgroundColor: '#f59e0b',
                    }}
                  />
                </Box>
                <Button
                  variant='premium'
                  size='medium'
                  fullWidth
                  onPress={() => navigation.navigate('Profile' as never)}
                >
                  Improve Score
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </ScrollContainer>
  );
}
