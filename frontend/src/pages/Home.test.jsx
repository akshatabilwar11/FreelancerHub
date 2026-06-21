import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import projectService from '../services/projectService';

vi.mock('../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(),
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section correctly', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([]);
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText(/Find the perfect/i)).toBeInTheDocument();
  });

  it('navigates on search submit', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([]);
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/What service are you looking for today?/i);
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.click(screen.getByText('Search'));

    expect(mockNavigate).toHaveBeenCalledWith('/projects?search=React');
  });

  it('displays featured projects from api', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([
      { id: 1, title: 'Test Project', budget: 1000, category: 'Web' }
    ]);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('handles api failure gracefully by showing no projects', async () => {
    projectService.getAllProjects.mockRejectedValueOnce(new Error('API Error'));
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/View Details/i)).not.toBeInTheDocument();
    });
  });

  it('navigates on "View All" click', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([]);
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/View All/i));
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('navigates to project details on button click', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([
      { id: 1, title: 'Test Project', budget: 1000, category: 'Web' }
    ]);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Test Project'));
    fireEvent.click(screen.getByText(/View Details/i));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('does not navigate on empty search', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([]);
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/What service are you looking for today?/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Search'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('uses default category if missing', async () => {
    projectService.getAllProjects.mockResolvedValueOnce([
      { id: 1, title: 'No Category', budget: 1000 }
    ]);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });
});
