import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import * as AuthContext from './context/AuthContext';

vi.mock('./context/AuthContext', async () => {
  const actual = await vi.importActual('./context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="mock-dashboard">Hey, Admin! Dashboard</div>
}));

describe('App Component Routes', () => {
  it('redirects to login when accessing protected route while unauthenticated', () => {
    AuthContext.useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
  });

  it('allows access to dashboard when authenticated', () => {
    AuthContext.useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { name: 'Admin', roles: ['ADMIN'] }
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Hey, Admin/i)).toBeInTheDocument();
  });
});
