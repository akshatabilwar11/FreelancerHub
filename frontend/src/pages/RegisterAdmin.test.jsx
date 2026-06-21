import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterAdmin from './RegisterAdmin';
import axios from 'axios';

// Mock axios
vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterAdmin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <RegisterAdmin />
      </BrowserRouter>
    );
  };

  it('renders all fields and title correctly', () => {
    renderComponent();
    expect(screen.getByText('Create Admin Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Admin Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@freelencerhub.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter SECRET123')).toBeInTheDocument();
  });

  it('shows error if fields are missing on submit', async () => {
    renderComponent();
    
    const submitBtn = screen.getByRole('button', { name: /Register as Admin/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('calls axios.post on submit with valid data and redirects', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Admin Name'), { target: { value: 'Super Admin' } });
    fireEvent.change(screen.getByPlaceholderText('admin@freelencerhub.com'), { target: { value: 'superadmin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter SECRET123'), { target: { value: 'SECRET123' } });

    const submitBtn = screen.getByRole('button', { name: /Register as Admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/auth/register-admin', {
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: 'password123',
        code: 'SECRET123'
      });
    });

    await screen.findByText('Admin account created successfully! Redirecting...');

    // Wait 2100ms for the redirect timeout to complete
    await new Promise((resolve) => setTimeout(resolve, 2100));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  }, 10000); // 10s timeout for this test

  it('shows api error on registration failure', async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: 'Invalid secret verification code' } }
    });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Admin Name'), { target: { value: 'Super Admin' } });
    fireEvent.change(screen.getByPlaceholderText('admin@freelencerhub.com'), { target: { value: 'superadmin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter SECRET123'), { target: { value: 'WRONGCODE' } });

    const submitBtn = screen.getByRole('button', { name: /Register as Admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid secret verification code')).toBeInTheDocument();
    });
  });
});
