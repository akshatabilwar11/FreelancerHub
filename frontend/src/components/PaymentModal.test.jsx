import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentModal from './PaymentModal';
import paymentService from '../services/paymentService';
import projectService from '../services/projectService';

// Mock services
vi.mock('../services/paymentService', () => ({
  default: {
    processPayment: vi.fn(),
  }
}));

vi.mock('../services/projectService', () => ({
  default: {
    activateProject: vi.fn(),
  }
}));

// Mock PaymentScanner component
vi.mock('./common/PaymentScanner', () => ({
  default: ({ onScanSuccess }) => (
    <button data-testid="mock-scanner" onClick={onScanSuccess}>Simulate Scan Success</button>
  )
}));

describe('PaymentModal Component', () => {
  const mockProject = { id: 123, title: 'Build eCommerce Site', budget: 15000 };
  const mockOnClose = vi.fn();
  const mockOnActivated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders QR code and project details correctly', () => {
    render(<PaymentModal project={mockProject} onClose={mockOnClose} onActivated={mockOnActivated} />);

    expect(screen.getByText('Activate Project')).toBeInTheDocument();
    expect(screen.getByText(/deposit the project budget of ₹15000/i)).toBeInTheDocument();
    expect(screen.getByText('Show QR')).toBeInTheDocument();
    expect(screen.getByText('Scan to Pay')).toBeInTheDocument();
  });

  it('toggles mode between display QR and scan camera', () => {
    render(<PaymentModal project={mockProject} onClose={mockOnClose} onActivated={mockOnActivated} />);

    const scanBtn = screen.getByText('Scan to Pay');
    fireEvent.click(scanBtn);

    expect(screen.getByTestId('mock-scanner')).toBeInTheDocument();

    const qrBtn = screen.getByText('Show QR');
    fireEvent.click(qrBtn);
    expect(screen.queryByTestId('mock-scanner')).not.toBeInTheDocument();
  });

  it('processes payment and activates project successfully', async () => {
    paymentService.processPayment.mockResolvedValueOnce({});
    projectService.activateProject.mockResolvedValueOnce({});

    render(<PaymentModal project={mockProject} onClose={mockOnClose} onActivated={mockOnActivated} />);

    const simulateBtn = screen.getByRole('button', { name: /Simulate Payment/i });
    fireEvent.click(simulateBtn);

    await waitFor(() => {
      expect(paymentService.processPayment).toHaveBeenCalledWith({
        projectId: 123,
        freelancerId: 0,
        amount: 15000,
        status: 'ESCROWED'
      });
      expect(projectService.activateProject).toHaveBeenCalledWith(123);
      expect(mockOnActivated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error if payment fails', async () => {
    paymentService.processPayment.mockRejectedValueOnce(new Error('Network Error'));

    render(<PaymentModal project={mockProject} onClose={mockOnClose} onActivated={mockOnActivated} />);

    const simulateBtn = screen.getByRole('button', { name: /Simulate Payment/i });
    fireEvent.click(simulateBtn);

    await waitFor(() => {
      expect(screen.getByText('Payment or activation failed. Please check backend logs.')).toBeInTheDocument();
      expect(mockOnActivated).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
