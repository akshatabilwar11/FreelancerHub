import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import authService from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    forgotPassword: vi.fn(),
    verifyOtp: vi.fn(),
    resetPassword: vi.fn()
  }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () => {
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 1 (Email Input) initially', () => {
    renderComponent();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Recovery Code/i })).toBeInTheDocument();
  });

  it('handles successful forgotPassword and moves to Step 2', async () => {
    authService.forgotPassword.mockResolvedValue({});
    renderComponent();

    const emailInput = screen.getByPlaceholderText('name@company.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText("We've sent a 6-digit code to test@example.com.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });
  });

  it('handles forgotPassword error correctly', async () => {
    authService.forgotPassword.mockRejectedValue({ response: { status: 404, data: { error: 'User not found' } } });
    renderComponent();

    const emailInput = screen.getByPlaceholderText('name@company.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    await waitFor(() => {
      expect(screen.getByText('[404] User not found')).toBeInTheDocument();
    });
  });

  it('handles missing response data in forgotPassword error', async () => {
    authService.forgotPassword.mockRejectedValue(new Error('Network Error'));
    renderComponent();

    const emailInput = screen.getByPlaceholderText('name@company.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to send OTP. Please check your email.')).toBeInTheDocument();
    });
  });

  it('handles successful verifyOtp and moves to Step 3', async () => {
    // Navigate directly to step 2 by succeeding step 1 first
    authService.forgotPassword.mockResolvedValue({});
    authService.verifyOtp.mockResolvedValue({});
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    // Wait for step 2
    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());

    const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
    fireEvent.change(otpInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Code/i }));

    await waitFor(() => {
      expect(authService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
      expect(screen.getByText('Choose a strong new password.')).toBeInTheDocument();
    });
  });

  it('handles verifyOtp error correctly', async () => {
    authService.forgotPassword.mockResolvedValue({});
    authService.verifyOtp.mockRejectedValue({ response: { data: { error: 'Invalid OTP' } } });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit code'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Code/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });

  it('allows user to go back to step 1 from step 2', async () => {
    authService.forgotPassword.mockResolvedValue({});
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());

    fireEvent.click(screen.getByText("Didn't get the code? Try again"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    });
  });

  it('handles successful resetPassword and moves to Step 4', async () => {
    authService.forgotPassword.mockResolvedValue({});
    authService.verifyOtp.mockResolvedValue({});
    authService.resetPassword.mockResolvedValue({});
    renderComponent();

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    // Step 2
    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Code/i }));

    // Step 3
    await waitFor(() => expect(screen.getByText('Choose a strong new password.')).toBeInTheDocument());
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'NewPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'NewPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'NewPass123!');
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Your password has been updated.')).toBeInTheDocument();
    });

    // Verify navigation on success screen
    fireEvent.click(screen.getByRole('button', { name: /Sign In Now/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error when passwords do not match in step 3', async () => {
    authService.forgotPassword.mockResolvedValue({});
    authService.verifyOtp.mockResolvedValue({});
    renderComponent();

    // Skip to step 3
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Code/i }));
    await waitFor(() => expect(screen.getByText('Choose a strong new password.')).toBeInTheDocument());

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'NewPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'DifferentPass!' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('handles resetPassword API error', async () => {
    authService.forgotPassword.mockResolvedValue({});
    authService.verifyOtp.mockResolvedValue({});
    authService.resetPassword.mockRejectedValue({ response: { data: { error: 'Password too weak' } } });
    renderComponent();

    // Skip to step 3
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Code/i }));
    await waitFor(() => expect(screen.getByText('Choose a strong new password.')).toBeInTheDocument());

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'weak' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password too weak')).toBeInTheDocument();
    });
  });
});
