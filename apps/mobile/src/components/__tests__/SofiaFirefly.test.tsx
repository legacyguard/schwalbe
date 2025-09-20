import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SofiaFirefly } from '../sofia-firefly';

describe('SofiaFirefly Component', () => {
  it('renders with default props', () => {
    const { getByLabelText } = render(<SofiaFirefly />);
    const firefly = getByLabelText(/Sofia/);
    expect(firefly).toBeTruthy();
  });

  it('renders with custom personality', () => {
    const { getByLabelText } = render(
      <SofiaFirefly personality="celebratory" context="guiding" />
    );
    const firefly = getByLabelText(/Sofia/);
    expect(firefly).toBeTruthy();
  });

  it('handles touch interactions', async () => {
    const mockOnTouch = jest.fn();
    const { getByLabelText } = render(
      <SofiaFirefly onTouch={mockOnTouch} />
    );

    const firefly = getByLabelText(/Sofia/);
    fireEvent.press(firefly);

    await waitFor(() => {
      expect(mockOnTouch).toHaveBeenCalled();
    });
  });

  it('renders in different variants', () => {
    const { getByLabelText, rerender } = render(
      <SofiaFirefly variant="floating" />
    );
    expect(getByLabelText(/Sofia/)).toBeTruthy();

    rerender(<SofiaFirefly variant="interactive" />);
    expect(getByLabelText(/Sofia/)).toBeTruthy();
  });

  it('respects accessibility props', () => {
    const { getByLabelText } = render(
      <SofiaFirefly
        accessibilityLabel="Custom Sofia label"
        accessibilityHint="Custom hint"
      />
    );

    const firefly = getByLabelText('Custom Sofia label');
    expect(firefly).toBeTruthy();
  });

  it('handles different sizes', () => {
    const { getByLabelText, rerender } = render(
      <SofiaFirefly size="small" />
    );
    expect(getByLabelText(/Sofia/)).toBeTruthy();

    rerender(<SofiaFirefly size="large" />);
    expect(getByLabelText(/Sofia/)).toBeTruthy();
  });

  it('renders with custom message', () => {
    const { getByLabelText } = render(
      <SofiaFirefly message="Custom message" />
    );
    const firefly = getByLabelText(/Sofia/);
    expect(firefly).toBeTruthy();
  });
});

describe('SofiaFirefly Integration', () => {
  it('can be imported from the main index', () => {
    // This test ensures the export structure works
    const { SofiaFirefly } = require('../sofia-firefly');
    expect(SofiaFirefly).toBeDefined();
  });

  it('exports all expected utilities', () => {
    const exports = require('../sofia-firefly');
    expect(exports.useSofiaAnimations).toBeDefined();
    expect(exports.useSofiaPersonality).toBeDefined();
    expect(exports.useSofiaAccessibility).toBeDefined();
    expect(exports.useSofiaPerformance).toBeDefined();
  });
});