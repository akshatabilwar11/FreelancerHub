import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactModal from './ContactModal';
import notificationService from '../services/notificationService';

// Mock notificationService
vi.mock('../services/notificationService', () => ({
  default: {
    sendNotification: vi.fn(),
  }
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Client User' } }),
}));

describe('ContactModal Component', () => {
  const mockFreelancer = { id: 10, name: 'Jane Doe', role: 'Developer' };
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it('renders modal content correctly', () => {
    render(<ContactModal freelancer={mockFreelancer} onClose={mockOnClose} />);

    expect(screen.getByText('Contact Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Hi Jane, I'm interested in working with you/i)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button or close icon is clicked', () => {
    render(<ContactModal freelancer={mockFreelancer} onClose={mockOnClose} />);

    // Cancel button click
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Close button click
    const closeBtns = screen.getAllByRole('button');
    // Close button has icon X
    fireEvent.click(closeBtns[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('sends message and dispatches custom event on success', async () => {
    notificationService.sendNotification.mockResolvedValueOnce({});
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    render(<ContactModal freelancer={mockFreelancer} onClose={mockOnClose} />);

    const textarea = screen.getByPlaceholderText(/Hi Jane, I'm interested in working with you/i);
    fireEvent.change(textarea, { target: { value: 'Hello Jane, lets collaborate!' } });

    const sendBtn = screen.getByRole('button', { name: /Send Message/i });
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: 10,
        senderId: 1,
        message: 'Hello Jane, lets collaborate!'
      });
      expect(dispatchSpy).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles send error gracefully', async () => {
    notificationService.sendNotification.mockRejectedValueOnce(new Error('Failed to send'));

    render(<ContactModal freelancer={mockFreelancer} onClose={mockOnClose} />);

    const textarea = screen.getByPlaceholderText(/Hi Jane, I'm interested in working with you/i);
    fireEvent.change(textarea, { target: { value: 'Hello Jane, lets collaborate!' } });

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to send message');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
