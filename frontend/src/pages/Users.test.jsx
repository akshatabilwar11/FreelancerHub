import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersPage from './Users';
import userService from '../services/userService';

// Mock userService
vi.mock('../services/userService', () => ({
  default: {
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
  }
}));

describe('UsersPage Component', () => {
  const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@test.com', role: 'ADMIN', trustScore: 95 },
    { id: 2, name: 'Bob Jones', email: 'bob@test.com', role: 'CLIENT', trustScore: 80 },
    { id: 3, name: 'Charlie Brown', email: 'charlie@test.com', role: 'FREELANCER', trustScore: 75 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });

  it('renders loading state initially and then shows user list', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers);

    render(<UsersPage />);

    expect(screen.getByText(/Loading user database.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('bob@test.com')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });

  it('filters user list based on search term', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers);

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or email.../i);
    fireEvent.change(searchInput, { target: { value: 'bob' } });

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('deletes user on confirmation', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers);
    userService.deleteUser.mockResolvedValueOnce({});

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    // Find the first delete button (usually the trash icon)
    // The trash icon is inside button style color: '#ef4444'
    const trashButtons = deleteButtons.filter(btn => btn.style.color === 'rgb(239, 68, 68)');
    fireEvent.click(trashButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this user?');
    expect(userService.deleteUser).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });
  });

  it('handles delete failure gracefully', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers);
    userService.deleteUser.mockRejectedValueOnce(new Error('Failed to delete'));

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const trashButtons = screen.getAllByRole('button').filter(btn => btn.style.color === 'rgb(239, 68, 68)');
    fireEvent.click(trashButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete user');
      expect(screen.getByText('Alice Smith')).toBeInTheDocument(); // still in the list
    });
  });
});
