import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Freelancers from './Freelancers';
import userService from '../services/userService';

vi.mock('../services/userService', () => ({
  default: {
    getAllUsers: vi.fn(),
  }
}));

vi.mock('../services/projectService', () => ({
  default: {
    getFreelancerAvailability: vi.fn(() => Promise.resolve({ days: [] })),
  }
}));

describe('Freelancers Component', () => {
  it('renders freelancers list and handles search', async () => {
    userService.getAllUsers.mockResolvedValueOnce([
      { id: 1, name: 'Alice', role: 'FREELANCER', rating: 4.5, location: 'UK' },
      { id: 2, name: 'Bob', role: 'FREELANCER', rating: 4.0, location: 'US' }
    ]);

    render(
      <BrowserRouter>
        <Freelancers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or skills/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('shows empty state when no freelancers match', async () => {
    userService.getAllUsers.mockResolvedValueOnce([
      { id: 1, name: 'Alice', role: 'FREELANCER' }
    ]);

    render(
      <BrowserRouter>
        <Freelancers />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Alice'));
    const input = screen.getByPlaceholderText(/Search by name or skills/i);
    fireEvent.change(input, { target: { value: 'Zebra' } });

    expect(screen.getByText(/No freelancers found/i)).toBeInTheDocument();
  });
});
