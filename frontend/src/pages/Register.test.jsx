import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import * as AuthContext from '../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Register Component', () => {
  let registerMock;

  beforeEach(() => {
    vi.clearAllMocks();
    registerMock = vi.fn();
    AuthContext.useAuth.mockReturnValue({
      register: registerMock,
    });
  });

  it('renders form and handles password strength', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const pwInput = screen.getByLabelText('Password');
    
    // Weak
    fireEvent.change(pwInput, { target: { value: 'abc' } });
    expect(screen.getByText('Weak')).toBeInTheDocument();

    // Medium
    fireEvent.change(pwInput, { target: { value: 'Abc12345' } });
    expect(screen.getByText('Medium')).toBeInTheDocument();

    // Strong
    fireEvent.change(pwInput, { target: { value: 'Abc12345!' } });
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Different1!' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows error if password is weak', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weakpass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'weakpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText('Password must be 8+ chars with upper, lower, number & special character.')).toBeInTheDocument();
  });

  it('calls register on successful validation', async () => {
    registerMock.mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'ValidPass123!' } });
    
    // Select Client Role
    fireEvent.click(screen.getByText('Client'));

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@test.com',
        password: 'ValidPass123!',
        role: 'CLIENT' // Actually the onClick toggles it, but the state should be updated. Let's just check call.
      });
      expect(screen.getByText(/Account created!/i)).toBeInTheDocument();
    });
  });

  it('handles backend error gracefully', async () => {
    registerMock.mockRejectedValueOnce({ message: 'Email already exists' });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'ValidPass123!' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
});
