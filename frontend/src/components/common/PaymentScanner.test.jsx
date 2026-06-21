import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PaymentScanner from './PaymentScanner';

describe('PaymentScanner Component', () => {
  it('shows scanner progress and triggers success callback', async () => {
    const mockOnScanSuccess = vi.fn();
    render(<PaymentScanner onScanSuccess={mockOnScanSuccess} />);

    expect(screen.getByText('Align QR code within the frame')).toBeInTheDocument();

    // Use real timers (by not enabling fake timers)
    // Wait for the simulated scan to reach 100% progress and transition state
    await waitFor(() => {
      expect(screen.getByText('QR Code Detected!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for the success callback to be triggered after the 800ms delay
    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalled();
    }, { timeout: 1500 });
  });
});
