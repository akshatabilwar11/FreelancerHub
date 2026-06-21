import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '../services/authService';

vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  }
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides auth state and methods', async () => {
    authService.getProfile.mockResolvedValueOnce({ name: 'Test User', email: 'test@test.com' });
    localStorage.setItem('token', 'fake-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  it('handles login and logout successfully', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({ token: 'new-token' });
    authService.getProfile.mockResolvedValueOnce({ name: 'New User' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Test logout
    act(() => {
      screen.getByText('Logout').click();
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
});
