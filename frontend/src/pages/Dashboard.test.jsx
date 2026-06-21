import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as AuthContext from '../context/AuthContext';
import projectService from '../services/projectService';
import userService from '../services/userService';
import paymentService from '../services/paymentService';

// Mock context and services
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(),
    getProjectsByClient: vi.fn(),
    getActiveHiresCount: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
  }
}));

vi.mock('../services/userService', () => ({
  default: {
    getAllUsers: vi.fn(() => Promise.resolve([])),
    deleteUser: vi.fn(),
  }
}));

vi.mock('../services/paymentService', () => ({
  default: {
    getProjectsSpent: vi.fn(() => Promise.resolve(0)),
    getFreelancerEarnings: vi.fn(() => Promise.resolve(0)),
  }
}));

describe('Dashboard Component - Multi-Role Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 9, name: 'Admin User', email: 'admin@test.com', roles: ['ADMIN'] },
        logout: vi.fn(),
      });
      userService.getAllUsers.mockResolvedValue([
        { id: 1, name: 'User One', email: 'user1@test.com', role: 'FREELANCER' },
        { id: 2, name: 'User Two', email: 'user2@test.com', role: 'CLIENT' }
      ]);
    });

    it('renders Admin Dashboard correctly with system stats and users', async () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(await screen.findByText('System Control Center')).toBeInTheDocument();
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('2 Active')).toBeInTheDocument(); // Active reports
    });
  });

  describe('Client Role', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 2, name: 'Client User', email: 'client@test.com', roles: ['CLIENT'] },
        logout: vi.fn(),
      });
      projectService.getProjectsByClient.mockResolvedValue([
        { id: 101, title: 'Client Project A', budget: 5000, clientId: 2, status: 'OPEN', createdAt: '2026-05-20T10:00:00Z' },
        { id: 102, title: 'Client Project B', budget: 10000, clientId: 2, status: 'PENDING', createdAt: '2026-05-20T10:00:00Z' }
      ]);
      projectService.getActiveHiresCount.mockResolvedValue(1);
      paymentService.getProjectsSpent.mockResolvedValue(15000);
    });

    it('renders Client Dashboard and lists active client projects', async () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(await screen.findByText('Find the Best Talent')).toBeInTheDocument();
      expect(screen.getByText('Client Project A')).toBeInTheDocument();
      expect(screen.getByText('Client Project B')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Active Hires
    });

    it('creates project successfully', async () => {
      projectService.createProject.mockResolvedValueOnce({
        id: 103, title: 'New Test Project', description: 'New desc', budget: 12000, clientId: 2, status: 'PENDING'
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for projects loading to finish
      expect(await screen.findByText('Client Project A')).toBeInTheDocument();

      // Click create button
      fireEvent.click(screen.getByText(/Create New Project/i));

      // Fill in details
      fireEvent.change(screen.getByPlaceholderText('e.g. Website Redesign'), { target: { value: 'New Test Project' } });
      fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '12000' } });
      fireEvent.change(screen.getByPlaceholderText('Describe the requirements...'), { target: { value: 'New desc' } });

      // Click Publish
      fireEvent.click(screen.getByText('Publish Project'));

      await waitFor(() => {
        expect(projectService.createProject).toHaveBeenCalledWith({
          title: 'New Test Project',
          budget: 12000,
          description: 'New desc',
          clientId: 2,
          status: 'PENDING'
        });
        expect(screen.getByText('New Test Project')).toBeInTheDocument();
      });
    });
  });

  describe('Freelancer Role', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 3, name: 'Freelancer User', email: 'freelancer@test.com', roles: ['FREELANCER'] },
        logout: vi.fn(),
      });
      projectService.getAllProjects.mockResolvedValue([
        { id: 201, title: 'Freelancer Project X', description: 'Description X', budget: 4000, clientId: 2 }
      ]);
      paymentService.getFreelancerEarnings.mockResolvedValue(8000);
    });

    it('renders Freelancer Dashboard correctly with stats and recommended projects', async () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(await screen.findByText('Welcome, Freelancer User!')).toBeInTheDocument();
      expect(screen.getByText('Freelancer Project X')).toBeInTheDocument();
      expect(screen.getByText('₹8,000')).toBeInTheDocument(); // Earnings
    });
  });
});
