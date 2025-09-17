import { waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { reminderService } from '@schwalbe/shared';
import { RemindersDashboard } from '../RemindersDashboard';

// Mock reminderService
jest.mock('@schwalbe/shared', () => ({
  reminderService: {
    list: jest.fn(),
  }
}));

describe('RemindersDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    // Act
    const { getByText } = render(<RemindersDashboard />);

    // Assert
    expect(getByText('Loading reminders...')).toBeInTheDocument();
  });

  it('shows empty state when no reminders', async () => {
    // Arrange
    (reminderService.list as jest.Mock).mockResolvedValue([]);

    // Act
    const { getByText } = render(<RemindersDashboard />);

    // Assert
    await waitFor(() => {
      expect(getByText('No reminders yet')).toBeInTheDocument();
    });
  });

  it('renders list of reminders', async () => {
    // Arrange
    const mockReminders = [
      {
        id: '1',
        title: 'Test Reminder 1',
        scheduled_at: '2025-12-25T12:00:00Z',
        status: 'active',
      },
      {
        id: '2',
        title: 'Test Reminder 2',
        scheduled_at: '2025-12-26T12:00:00Z',
        status: 'active',
      }
    ];
    (reminderService.list as jest.Mock).mockResolvedValue(mockReminders);

    // Act
    const { getByText } = render(<RemindersDashboard />);

    // Assert
    await waitFor(() => {
      expect(getByText('Test Reminder 1')).toBeInTheDocument();
      expect(getByText('Test Reminder 2')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    // Arrange
    const mockReminders = [
      {
        id: '1',
        title: 'Test Reminder',
        scheduled_at: '2025-12-25T12:00:00Z',
        status: 'active',
      }
    ];
    (reminderService.list as jest.Mock).mockResolvedValue(mockReminders);

    // Act
    const { getByText } = render(<RemindersDashboard />);

    // Assert
    await waitFor(() => {
      expect(getByText(/2025/)).toBeInTheDocument();
      // Timezones/locales vary; assert at least one time-like string appears
      const matches = document.querySelectorAll('p, span, div');
      const hasTime = Array.from(matches).some((el) => /\d{1,2}:\d{2}/.test(el.textContent || ''));
      expect(hasTime).toBe(true);
    });
  });

  it('shows error state gracefully', async () => {
    // Arrange
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (reminderService.list as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    // Act
    const { getByText } = render(<RemindersDashboard />);

    // Assert
    await waitFor(() => {
      expect(getByText('No reminders yet')).toBeInTheDocument();
    });
    expect(consoleError).toHaveBeenCalled();

    // Cleanup
    consoleError.mockRestore();
  });
});