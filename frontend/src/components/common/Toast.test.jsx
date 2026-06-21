import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing initially', () => {
    const { container } = render(<Toast />);
    expect(container.firstChild).toBeNull();
  });

  it('shows message when new-notification event is dispatched and auto-hides after 5s', async () => {
    render(<Toast />);

    // Dispatch event
    act(() => {
      window.dispatchEvent(
        new CustomEvent('new-notification', {
          detail: { message: 'Test notification message' }
        })
      );
    });

    // Message should be displayed
    expect(screen.getByText('New Notification')).toBeInTheDocument();
    expect(screen.getByText('Test notification message')).toBeInTheDocument();

    // Verify it auto-hides after 5 seconds (5000ms)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // After hiding, it still renders (the state show changes, but notification is still set)
    // The class show is removed
    const toastElement = screen.getByText('New Notification').closest('.toast-notification');
    expect(toastElement).not.toHaveClass('show');
  });

  it('hides message when close button is clicked', () => {
    render(<Toast />);

    // Dispatch event
    act(() => {
      window.dispatchEvent(
        new CustomEvent('new-notification', {
          detail: { message: 'Close me notification' }
        })
      );
    });

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);

    const toastElement = screen.getByText('New Notification').closest('.toast-notification');
    expect(toastElement).not.toHaveClass('show');
  });
});
