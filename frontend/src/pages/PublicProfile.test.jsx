import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PublicProfile from './PublicProfile';
import userService from '../services/userService';
import projectService from '../services/projectService';

// Mock services
vi.mock('../services/userService', () => ({
  default: {
    getUserById: vi.fn(),
  }
}));

vi.mock('../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(),
  }
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Client User' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '10' }),
    useNavigate: () => mockNavigate,
  };
});

describe('PublicProfile Component', () => {
  const mockFreelancer = {
    id: 10,
    name: 'Jane Expert',
    email: 'jane@expert.com',
    role: 'Full Stack Engineer',
    trustScore: 92,
    online: true
  };

  const mockProjects = [
    { id: 101, title: 'E-commerce Redesign', freelancerId: 10, status: 'COMPLETED' },
    { id: 102, title: 'Chat App', freelancerId: 99, status: 'OPEN' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks to avoid unhandled rejections
    userService.getUserById.mockResolvedValue(mockFreelancer);
    projectService.getAllProjects.mockResolvedValue(mockProjects);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <PublicProfile />
      </BrowserRouter>
    );
  };

  it('renders freelancer details and associated projects', async () => {
    const { container } = renderComponent();

    expect(container.querySelector('.spinner')).toBeInTheDocument();

    await waitFor(() => {
      // Use flexible regex matchers
      expect(screen.getByText(/Jane Expert/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Full Stack Engineer/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/E-commerce Redesign/i)).toBeInTheDocument();
      expect(screen.queryByText(/Chat App/i)).not.toBeInTheDocument();
      expect(screen.getByText(/92/)).toBeInTheDocument(); // matches the trustScore 92
      expect(screen.getByText(/Online/i)).toBeInTheDocument(); // OnlineStatus text
    });
  });

  it('handles user not found gracefully', async () => {
    userService.getUserById.mockResolvedValue(null);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Freelancer not found/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Back to List/i));
    expect(mockNavigate).toHaveBeenCalledWith('/freelancers');
  });

  it('toggles ContactModal when contact button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Jane Expert/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Contact Expert/i));

    expect(screen.getByText(/Contact Jane Expert/i)).toBeInTheDocument();
  });
});
