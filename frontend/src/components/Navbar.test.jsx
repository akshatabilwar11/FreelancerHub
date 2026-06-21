import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as AuthContext from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  })),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login and signup buttons when not authenticated', () => {
    AuthContext.useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('renders dashboard and logout buttons when authenticated', () => {
    const logoutMock = vi.fn();
    AuthContext.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'John' },
      logout: logoutMock,
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Logout'));
    expect(logoutMock).toHaveBeenCalled();
  });

  it('toggles mobile menu', () => {
    AuthContext.useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const menuBtn = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuBtn);
    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
  });
});
