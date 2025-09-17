import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { reminderService } from '@schwalbe/shared';
import { ReminderForm } from '../ReminderForm';

// Mock reminderService
jest.mock('@schwalbe/shared', () => ({
  reminderService: {
    create: jest.fn(),
  }
}));

describe('ReminderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    // Act
    const { getByLabelText, getByText } = render(<ReminderForm />);

    // Assert
    expect(getByLabelText('Title')).toBeInTheDocument();
    expect(getByLabelText('When')).toBeInTheDocument();
    expect(getByText('Create Reminder')).toBeInTheDocument();
  });

  it('disables submit button when fields are empty', () => {
    // Act
    const { getByText } = render(<ReminderForm />);
    const submitButton = getByText('Create Reminder');

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when fields are filled', () => {
    // Arrange
    const { getByLabelText, getByText } = render(<ReminderForm />);
    const titleInput = getByLabelText('Title');
    const whenInput = getByLabelText('When');

    // Act
    fireEvent.change(titleInput, { target: { value: 'Test Reminder' } });
    fireEvent.change(whenInput, { target: { value: '2025-12-25T12:00' } });

    // Assert
    const submitButton = getByText('Create Reminder');
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form with correct data', async () => {
    // Arrange
    const onSubmit = jest.fn();
    (reminderService.create as jest.Mock).mockResolvedValue({});

    const { getByLabelText, getByText } = render(
      <ReminderForm onSubmit={onSubmit} />
    );

    const titleInput = getByLabelText('Title');
    const whenInput = getByLabelText('When');

    // Act
    fireEvent.change(titleInput, { target: { value: 'Test Reminder' } });
    fireEvent.change(whenInput, { target: { value: '2025-12-25T12:00' } });
    fireEvent.click(getByText('Create Reminder'));

    // Assert
    await waitFor(() => {
      expect(reminderService.create).toHaveBeenCalledWith({
        user_id: 'anonymous',
        title: 'Test Reminder',
        scheduled_at: '2025-12-25T12:00',
        channels: ['in_app'],
        status: 'active',
      });
      expect(onSubmit).toHaveBeenCalled();
    });

    // Verify form was reset
    expect(titleInput).toHaveValue('');
    expect(whenInput).toHaveValue('');
  });

  it('shows loading state during submission', async () => {
    // Arrange
    (reminderService.create as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByLabelText, getByText } = render(<ReminderForm />);

    // Act
    fireEvent.change(getByLabelText('Title'), { target: { value: 'Test Reminder' } });
    fireEvent.change(getByLabelText('When'), { target: { value: '2025-12-25T12:00' } });
    fireEvent.click(getByText('Create Reminder'));

    // Assert
    expect(getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Create Reminder')).toBeInTheDocument();
    });
  });
});