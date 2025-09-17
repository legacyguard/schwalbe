import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { reminderService } from '@schwalbe/shared';
import { InAppReminderBanner } from '../InAppReminderBanner';

// Mock reminderService
jest.mock('@schwalbe/shared', () => ({
  reminderService: {
    fetchPendingInApp: jest.fn(),
    markInAppDelivered: jest.fn(),
  }
}));

describe('InAppReminderBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when there are no items', async () => {
    // Arrange
    (reminderService.fetchPendingInApp as jest.Mock).mockResolvedValue([]);

    // Act
    const { container } = render(<InAppReminderBanner />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('renders reminders with title and body', async () => {
    // Arrange
    const mockItems = [
      {
        id: '1',
        provider_response: {
          title: 'Test Reminder',
          body: 'Test Body'
        }
      }
    ];
    (reminderService.fetchPendingInApp as jest.Mock).mockResolvedValue(mockItems);

    // Act
    render(<InAppReminderBanner />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Reminder')).toBeInTheDocument();
      expect(screen.getByText('Test Body')).toBeInTheDocument();
    });
  });

  it('uses fallback text when title/body missing', async () => {
    // Arrange
    const mockItems = [{ id: '1' }];
    (reminderService.fetchPendingInApp as jest.Mock).mockResolvedValue(mockItems);

    // Act
    render(<InAppReminderBanner />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Reminder')).toBeInTheDocument();
      expect(screen.getByText('You have a scheduled reminder. Open reminders to review.')).toBeInTheDocument();
    });
  });

  it('dismisses reminder on click', async () => {
    // Arrange
    const mockItems = [
      {
        id: '1',
        provider_response: {
          title: 'Test Reminder',
          body: 'Test Body'
        }
      }
    ];
    (reminderService.fetchPendingInApp as jest.Mock).mockResolvedValue(mockItems);
    (reminderService.markInAppDelivered as jest.Mock).mockResolvedValue(undefined);

    // Act
    render(<InAppReminderBanner />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Reminder')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissButton);

    // Assert
    await waitFor(() => {
      expect(reminderService.markInAppDelivered).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Test Reminder')).not.toBeInTheDocument();
    });
  });
});