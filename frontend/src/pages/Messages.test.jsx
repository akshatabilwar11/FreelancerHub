import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Messages from './Messages';
import notificationService from '../services/notificationService';
import userService from '../services/userService';

// Mock Services
vi.mock('../services/notificationService', () => ({
  default: {
    getNotificationsByUser: vi.fn(),
    getNotificationsBySender: vi.fn(),
    getAllNotifications: vi.fn(),
  }
}));

vi.mock('../services/userService', () => ({
  default: {
    getUserById: vi.fn(),
  }
}));

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Messages Component', () => {
  const mockInbox = [
    { id: 1, senderId: 10, userId: 1, message: 'Inbox Message 1', isRead: false, createdAt: '2026-05-20T12:00:00.000Z' }
  ];

  const mockSent = [
    { id: 2, senderId: 1, userId: 20, message: 'Sent Message 1', isRead: true, createdAt: '2026-05-20T11:00:00.000Z' }
  ];

  const mockGlobal = [
    { id: 3, senderId: 10, userId: 20, message: 'Global Message 1', isRead: true, createdAt: '2026-05-20T10:00:00.000Z' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Freelancer', roles: ['FREELANCER'] }
    });
    userService.getUserById.mockImplementation((id) => {
      const names = { 10: 'Alice Client', 20: 'Bob Freelancer' };
      return Promise.resolve({ name: names[id] || `User #${id}` });
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Messages />
      </BrowserRouter>
    );
  };

  it('renders messages and tabs for standard user', async () => {
    notificationService.getNotificationsByUser.mockResolvedValueOnce(mockInbox);
    notificationService.getNotificationsBySender.mockResolvedValueOnce(mockSent);
    
    renderComponent();

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Inbox Message 1')).toBeInTheDocument();
      expect(screen.getByText('Alice Client')).toBeInTheDocument();
    });

    // Check tabs
    expect(screen.getByRole('button', { name: /Inbox/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sent/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Global Log/i })).not.toBeInTheDocument();
  });

  it('allows tab switching to Sent messages', async () => {
    notificationService.getNotificationsByUser.mockResolvedValueOnce(mockInbox);
    notificationService.getNotificationsBySender.mockResolvedValueOnce(mockSent);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Inbox Message 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Sent/i }));

    await waitFor(() => {
      expect(screen.getByText('Sent Message 1')).toBeInTheDocument();
      expect(screen.getByText('Bob Freelancer')).toBeInTheDocument();
    });
  });

  it('renders Global tab for Admin role', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Admin User', roles: ['ADMIN'] }
    });
    notificationService.getNotificationsByUser.mockResolvedValueOnce(mockInbox);
    notificationService.getNotificationsBySender.mockResolvedValueOnce(mockSent);
    notificationService.getAllNotifications.mockResolvedValueOnce(mockGlobal);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Global Log/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Global Log/i }));

    await waitFor(() => {
      expect(screen.getByText('Global Message 1')).toBeInTheDocument();
    });
  });
});
