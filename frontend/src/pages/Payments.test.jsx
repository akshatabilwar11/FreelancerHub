import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Payments from './Payments';
import paymentService from '../services/paymentService';

vi.mock('../services/paymentService', () => ({
  default: {
    getAllPayments: vi.fn(),
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 } })
}));

describe('Payments Component', () => {
  it('renders payments successfully', async () => {
    paymentService.getAllPayments.mockResolvedValueOnce([
      { id: 1, amount: 5000, projectId: 1, freelancerId: 2, status: 'COMPLETED' },
      { id: 2, amount: 2000, projectId: 2, freelancerId: 3, status: 'PENDING' },
    ]);

    render(<Payments />);

    await waitFor(() => {
      expect(screen.getByText('Project #1')).toBeInTheDocument();
      expect(screen.getByText('₹7,000')).toBeInTheDocument(); // total earnings
    });
  });
});
