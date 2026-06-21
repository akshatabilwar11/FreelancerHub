import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetails from './ProjectDetails';
import projectService from '../services/projectService';

vi.mock('../services/projectService', () => ({
  default: {
    getProjectById: vi.fn(),
    getProjectsByClient: vi.fn(() => Promise.resolve([])),
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 2, name: 'Freelancer', roles: ['FREELANCER'] }
  })
}));

describe('ProjectDetails Component', () => {
  it('renders project details and allows bidding', async () => {
    projectService.getProjectById.mockResolvedValueOnce(
      { id: 1, title: 'Test Project Details', description: 'Desc', budget: 10000, clientId: 1 }
    );

    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project Details')).toBeInTheDocument();
    });

    // Try bidding
    fireEvent.change(screen.getByPlaceholderText('e.g. 10000'), { target: { value: '8000' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 30'), { target: { value: '15' } });
    fireEvent.change(screen.getByPlaceholderText('Why are you the best fit for this project?'), { target: { value: 'Hire me' } });
    
    fireEvent.click(screen.getByText(/Submit Bid/i));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Your bid has been submitted successfully!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Bid again
    fireEvent.click(screen.getByText('Bid Again'));
    expect(screen.getByText(/Submit Bid/i)).toBeInTheDocument();
  });

  it('falls back to mock data on error', async () => {
    projectService.getProjectById.mockRejectedValueOnce(new Error('Fail'));
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('AI-Powered E-commerce Platform')).toBeInTheDocument();
    });
  });

  it('falls back to mock data if data is null', async () => {
    projectService.getProjectById.mockResolvedValueOnce(null);
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('AI-Powered E-commerce Platform')).toBeInTheDocument();
    });
  });

  it('navigates back on "Back" click', async () => {
    projectService.getProjectById.mockResolvedValueOnce({ id: 1, title: 'Test', budget: 100 });
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Back'));
    fireEvent.click(screen.getByText('Back'));
  });

  it('shows loading state initially', async () => {
    projectService.getProjectById.mockReturnValue(new Promise(() => {})); // Never resolves
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading project details/i)).toBeInTheDocument();
  });
});
