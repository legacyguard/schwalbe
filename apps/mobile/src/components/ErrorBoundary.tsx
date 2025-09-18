import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { YStack, Button, Card, H2, Paragraph, Text } from 'tamagui';
import { AlertTriangle, RefreshCw } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to your error reporting service
    if (__DEV__) {
      console.group('🚨 Error Boundary');
      console.error('Error:', error.message);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <ScrollView contentContainerStyle={{ flex: 1, padding: 20 }}>
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              space="$4"
              padding="$4"
            >
              <Card
                padding="$6"
                backgroundColor="$legacyBackgroundSecondary"
                borderColor="$legacyError"
                borderWidth={1}
                borderRadius="$6"
                maxWidth={400}
                width="100%"
              >
                <YStack alignItems="center" space="$4">
                  <AlertTriangle size={48} color="$legacyError" />

                  <H2 color="$legacyTextPrimary" textAlign="center" fontWeight="700">
                    Something went wrong
                  </H2>

                  <Paragraph
                    color="$legacyTextSecondary"
                    textAlign="center"
                    lineHeight={24}
                  >
                    We're sorry for the inconvenience. The app encountered an unexpected error.
                    Your data is safe and you can try again.
                  </Paragraph>

                  {__DEV__ && this.state.error && (
                    <Card
                      padding="$3"
                      backgroundColor="$legacyBackgroundPrimary"
                      borderColor="$legacyError"
                      borderWidth={0.5}
                      borderRadius="$3"
                      width="100%"
                    >
                      <Text
                        color="$legacyError"
                        fontSize="$2"
                        fontFamily="monospace"
                        numberOfLines={5}
                      >
                        {this.state.error.message}
                      </Text>
                    </Card>
                  )}

                  <YStack space="$3" width="100%">
                    <Button
                      size="$4"
                      backgroundColor="$legacyAccentGold"
                      borderRadius="$3"
                      onPress={this.handleRetry}
                    >
                      <YStack alignItems="center" space="$2">
                        <RefreshCw size={16} color="$legacyBackgroundPrimary" />
                        <Text color="$legacyBackgroundPrimary" fontWeight="600">
                          Try Again
                        </Text>
                      </YStack>
                    </Button>

                    <Button
                      size="$4"
                      backgroundColor="$legacyBackgroundSecondary"
                      borderColor="$legacyAccentGold"
                      borderWidth={1}
                      borderRadius="$3"
                      onPress={() => {
                        // In a real app, this would navigate to a support screen
                        console.log('Contact support');
                      }}
                    >
                      <Text color="$legacyAccentGold" fontWeight="600">
                        Contact Support
                      </Text>
                    </Button>
                  </YStack>
                </YStack>
              </Card>

              <Paragraph
                color="$legacyTextMuted"
                fontSize="$2"
                textAlign="center"
                marginTop="$4"
              >
                Error ID: {Date.now().toString(36)}
              </Paragraph>
            </YStack>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;