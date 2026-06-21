import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyBids from './MyBids';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Freelancer', email: 'freelancer@test.com', roles: ['FREELANCER'] } })
}));

// Mock projectService
vi.mock('../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(() => Promise.resolve([])),
    getProjectById: vi.fn((id) => {
      const projects = {
        101: { id: 101, title: 'AI-Powered E-commerce Platform', clientId: 1, freelancerId: null, status: 'OPEN' },
        102: { id: 102, title: 'Blockchain Smart Contract Audit', clientId: 2, freelancerId: 1, status: 'ASSIGNED' },
        103: { id: 103, title: 'Real Estate Mobile App', clientId: 3, freelancerId: 999, status: 'ASSIGNED' },
        104: { id: 104, title: 'Cloud Infrastructure Migration', clientId: 4, freelancerId: null, status: 'OPEN' }
      };
      return Promise.resolve(projects[id] || null);
    }),
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
      <MyBids />
    </BrowserRouter>
  );
};

describe('MyBids Component', () => {
  beforeEach(() => {
    const mockBids = [
      { id: 1, projectId: 101, projectTitle: 'AI-Powered E-commerce Platform', amount: 14000, duration: 30, status: 'PENDING', submittedOn: 'May 20, 2026', clientName: 'Client #1' },
      { id: 2, projectId: 102, projectTitle: 'Blockchain Smart Contract Audit', amount: 11000, duration: 25, status: 'ACCEPTED', submittedOn: 'May 19, 2026', clientName: 'Client #2' },
      { id: 3, projectId: 103, projectTitle: 'Real Estate Mobile App', amount: 8000, duration: 20, status: 'REJECTED', submittedOn: 'May 18, 2026', clientName: 'Client #3' },
      { id: 4, projectId: 104, projectTitle: 'Cloud Infrastructure Migration', amount: 19000, duration: 35, status: 'PENDING', submittedOn: 'May 17, 2026', clientName: 'Client #4' }
    ];
    localStorage.setItem('bids_1', JSON.stringify(mockBids));
    vi.clearAllMocks();
  });

  it('renders the header and stats correctly', async () => {
    renderComponent();
    expect(screen.getByText('My Bids & Proposals')).toBeInTheDocument();
    expect(screen.getByText('Total Submitted')).toBeInTheDocument();
    expect(screen.getByText('Won Projects')).toBeInTheDocument();
    expect(screen.getByText('Pending Decision')).toBeInTheDocument();
  });

  it('renders all mock bids initially', async () => {
    renderComponent();
    
    // Wait for the async component initialization
    expect(await screen.findByText('AI-Powered E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Smart Contract Audit')).toBeInTheDocument();
    expect(screen.getByText('Real Estate Mobile App')).toBeInTheDocument();
    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
  });

  it('filters by Pending status', async () => {
    renderComponent();
    await screen.findByText('AI-Powered E-commerce Platform');

    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    
    // Only pending bids should be visible
    expect(screen.getByText('AI-Powered E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    
    // Accepted/Rejected should NOT be visible
    expect(screen.queryByText('Blockchain Smart Contract Audit')).not.toBeInTheDocument();
    expect(screen.queryByText('Real Estate Mobile App')).not.toBeInTheDocument();
  });

  it('filters by Accepted status', async () => {
    renderComponent();
    await screen.findByText('AI-Powered E-commerce Platform');

    fireEvent.click(screen.getByRole('button', { name: 'Accepted' }));
    
    expect(await screen.findByText('Blockchain Smart Contract Audit')).toBeInTheDocument();
    expect(screen.queryByText('AI-Powered E-commerce Platform')).not.toBeInTheDocument();
  });

  it('filters by Rejected status', async () => {
    renderComponent();
    await screen.findByText('AI-Powered E-commerce Platform');

    fireEvent.click(screen.getByRole('button', { name: 'Rejected' }));
    
    expect(await screen.findByText('Real Estate Mobile App')).toBeInTheDocument();
    expect(screen.queryByText('AI-Powered E-commerce Platform')).not.toBeInTheDocument();
  });

  it('shows empty state when no bids match filter', async () => {
    localStorage.setItem('bids_1', JSON.stringify([]));
    renderComponent();
    
    expect(await screen.findByText('No bids found for this category.')).toBeInTheDocument();
  });

  it('calls navigate(-1) when back button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
