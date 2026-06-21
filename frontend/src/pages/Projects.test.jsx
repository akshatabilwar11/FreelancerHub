import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Projects from './Projects';
import projectService from '../services/projectService';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(),
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Projects Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', roles: ['CLIENT'] }
    });
  });

  it('renders projects successfully', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([
      { id: 1, title: 'Real Estate App', description: 'Desc', budget: 10000, clientId: 1 },
      { id: 2, title: 'Crypto Bot', description: 'Desc', budget: 5000, clientId: 2 }
    ]);

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Real Estate App')).toBeInTheDocument();
      expect(screen.getByText('Crypto Bot')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search_projects_placeholder/i);
    fireEvent.change(searchInput, { target: { value: 'Real Estate' } });
    expect(screen.getByText('Real Estate App')).toBeInTheDocument();
    expect(screen.queryByText('Crypto Bot')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    const budgetInput = screen.getByPlaceholderText(/max_budget/i);
    fireEvent.change(budgetInput, { target: { value: '6000' } });
    expect(screen.queryByText('Real Estate App')).not.toBeInTheDocument();
    expect(screen.getByText('Crypto Bot')).toBeInTheDocument();
  });
});
