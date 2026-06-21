import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Notifications from './Notifications';
import notificationService from '../services/notificationService';

vi.mock('../services/notificationService', () => ({
  default: {
    getAllNotifications: vi.fn(),
  }
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 } })
}));

describe('Notifications Component', () => {
  it('renders notifications successfully', async () => {
    notificationService.getAllNotifications.mockResolvedValueOnce([
      { id: 1, message: 'Test Notif', isRead: false, userId: 1 },
      { id: 2, message: 'Read Notif', isRead: true, userId: 1 },
      { id: 3, message: 'Another Notif', isRead: false, userId: 1 },
    ]);

    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText('Test Notif')).toBeInTheDocument();
    });

    // Mark as read
    const markReadBtns = screen.getAllByTitle('Mark as read');
    fireEvent.click(markReadBtns[0]);
    
    // Mark all as read (still has one unread)
    fireEvent.click(screen.getByText('Mark all as read'));
  });

  it('shows error message on failure', async () => {
    notificationService.getAllNotifications.mockRejectedValueOnce(new Error('API Fail'));
    render(<Notifications />);
    await waitFor(() => {
      expect(screen.getByText(/Could not load notifications/i)).toBeInTheDocument();
    });
  });
});
