
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { toast } from 'sonner';
import { withTranslation, type WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error?: Error;
  errorInfo?: ErrorInfo;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log error to monitoring service in production
    if (process.env['NODE_ENV'] === 'production') {
      // TODO: Send to error monitoring service (Sentry, etc.)
    }

    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Show user-friendly toast notification
    toast.error(
      this.props.t
        ? this.props.t(
            'toast',
            "Something went wrong. We're working on fixing this issue."
          )
        : "Something went wrong. We're working on fixing this issue."
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const t = this.props.t || ((key: string) => key);
      return (
        <div className='min-h-screen bg-background flex items-center justify-center p-6'>
          <Card className='max-w-md w-full p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Icon name='alert-triangle' className='w-8 h-8 text-red-600' />
            </div>

            <h2 className='text-2xl font-bold mb-4'>{t('title')}</h2>

            <p className='text-muted-foreground mb-6 leading-relaxed'>
              {t('description')}
            </p>

            <div className='space-y-3'>
              <Button
                onClick={this.handleRetry}
                className='w-full'
                variant='default'
              >
                <Icon name='refresh-cw' className='w-4 h-4 mr-2' />
                {t('actions.tryAgain')}
              </Button>

              <Button
                onClick={this.handleGoHome}
                className='w-full'
                variant='outline'
              >
                <Icon name='home' className='w-4 h-4 mr-2' />
                {t('actions.goHome')}
              </Button>

              <Button
                onClick={this.handleReload}
                className='w-full'
                variant='outline'
              >
                <Icon name='rotate-ccw' className='w-4 h-4 mr-2' />
                {t('actions.reloadPage')}
              </Button>
            </div>

            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <details className='mt-6 text-left'>
                <summary className='cursor-pointer text-sm text-muted-foreground hover:text-foreground'>
                  {t('details.dev')}
                </summary>
                <div className='mt-3 p-3 bg-muted rounded text-xs font-mono text-left overflow-auto max-h-40'>
                  <div className='text-red-600 font-semibold mb-2'>
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className='whitespace-pre-wrap text-muted-foreground'>
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}

            <p className='text-xs text-muted-foreground mt-6'>
              {t('support.message')}
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation('ui/error-boundary')(ErrorBoundary);
