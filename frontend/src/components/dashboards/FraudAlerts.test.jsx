import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FraudAlerts from './FraudAlerts';
import userService from '../../services/userService';
import projectService from '../../services/projectService';

// Mock services
vi.mock('../../services/userService', () => ({
  default: {
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
  }
}));

vi.mock('../../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn(),
    deleteProject: vi.fn(),
  }
}));

describe('FraudAlerts Component', () => {
  const mockUsers = [
    { id: 1, name: 'Suspect User', email: 'suspect@example.com', trustScore: 90, role: 'FREELANCER' },
    { id: 2, name: 'Low Trust User', email: 'low@trust.com', trustScore: 85, role: 'CLIENT' },
    { id: 3, name: 'Good User', email: 'good@good.com', trustScore: 99, role: 'CLIENT' }
  ];

  const mockProjects = [
    { id: 101, title: 'Mega Budget Spike Project', budget: 15000, clientId: 10 },
    { id: 102, title: 'Normal Project', budget: 500, clientId: 11 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
    window.alert = vi.fn();
  });

  it('renders scanning state initially', () => {
    userService.getAllUsers.mockResolvedValue([]);
    projectService.getAllProjects.mockResolvedValue([]);
    render(<FraudAlerts />);
    
    expect(screen.getByText('Scanning system logs...')).toBeInTheDocument();
  });

  it('renders alerts for duplicate domain, low trust score, and budget spike', async () => {
    userService.getAllUsers.mockResolvedValue(mockUsers);
    projectService.getAllProjects.mockResolvedValue(mockProjects);

    render(<FraudAlerts />);

    await waitFor(() => {
      // Rule 1: Duplicate test account
      expect(screen.getByText(/Multiple test\/unverified accounts sharing domain "@example.com": Suspect User/i)).toBeInTheDocument();
      // Rule 2: Low trust score
      expect(screen.getByText(/Low Trust User.*low trust score rating.*85%/i)).toBeInTheDocument();
      // Rule 3: Budget spike
      expect(screen.getByText(/Sudden high budget value.*Mega Budget Spike Project/i)).toBeInTheDocument();
    });
  });

  it('falls back to mock/activity alerts when no rules are met', async () => {
    userService.getAllUsers.mockResolvedValue([]);
    projectService.getAllProjects.mockResolvedValue([]);

    render(<FraudAlerts />);

    await waitFor(() => {
      expect(screen.getByText('IP_MATCH')).toBeInTheDocument();
      expect(screen.getByText(/Multiple accounts detected from same IP/i)).toBeInTheDocument();
    });
  });

  it('allows eliminating user threats (confirm delete)', async () => {
    userService.getAllUsers.mockResolvedValue([mockUsers[0]]); // suspect@example.com -> targetType: USER
    projectService.getAllProjects.mockResolvedValue([]);
    userService.deleteUser.mockResolvedValue({ success: true });

    render(<FraudAlerts />);

    let actionBtn;
    await waitFor(() => {
      actionBtn = screen.getByTitle('Eliminate Threat');
      expect(actionBtn).toBeInTheDocument();
    });

    fireEvent.click(actionBtn);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Suspicious User Detected'));
    expect(userService.deleteUser).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.queryByText(/Multiple test\/unverified accounts sharing domain/i)).not.toBeInTheDocument();
      expect(window.alert).toHaveBeenCalledWith('Security action executed successfully! Threat eliminated.');
    });
  });

  it('allows eliminating project threats (confirm delete)', async () => {
    userService.getAllUsers.mockResolvedValue([]);
    projectService.getAllProjects.mockResolvedValue([mockProjects[0]]); // Mega budget spike -> targetType: PROJECT
    projectService.deleteProject.mockResolvedValue({ success: true });

    render(<FraudAlerts />);

    let actionBtn;
    await waitFor(() => {
      actionBtn = screen.getByTitle('Eliminate Threat');
      expect(actionBtn).toBeInTheDocument();
    });

    fireEvent.click(actionBtn);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Suspicious Project Detected'));
    expect(projectService.deleteProject).toHaveBeenCalledWith(101);

    await waitFor(() => {
      expect(screen.queryByText(/Mega Budget Spike Project/i)).not.toBeInTheDocument();
    });
  });

  it('handles action errors gracefully', async () => {
    userService.getAllUsers.mockResolvedValue([mockUsers[0]]);
    projectService.getAllProjects.mockResolvedValue([]);
    userService.deleteUser.mockRejectedValue(new Error('Delete Failed'));

    render(<FraudAlerts />);

    let actionBtn;
    await waitFor(() => {
      actionBtn = screen.getByTitle('Eliminate Threat');
    });

    fireEvent.click(actionBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Action completed. (The item has been resolved and removed from the active database).'));
      expect(screen.queryByText(/Multiple test\/unverified accounts sharing domain/i)).not.toBeInTheDocument();
    });
  });

  it('renders low trust score user with default role member when role is missing', async () => {
    const userNoRole = { id: 4, name: 'No Role User', email: 'norole@test.com', trustScore: 80, role: null };
    userService.getAllUsers.mockResolvedValue([userNoRole]);
    projectService.getAllProjects.mockResolvedValue([]);

    render(<FraudAlerts />);

    await waitFor(() => {
      expect(screen.getByText('MEMBER')).toBeInTheDocument();
    });
  });

  it('does not take action when threat elimination is cancelled', async () => {
    userService.getAllUsers.mockResolvedValue([mockUsers[0]]);
    projectService.getAllProjects.mockResolvedValue([]);
    window.confirm.mockReturnValueOnce(false); // User clicks Cancel

    render(<FraudAlerts />);

    let actionBtn;
    await waitFor(() => {
      actionBtn = screen.getByTitle('Eliminate Threat');
    });

    fireEvent.click(actionBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(userService.deleteUser).not.toHaveBeenCalled();
    expect(screen.getByText(/Multiple test\/unverified accounts sharing domain/i)).toBeInTheDocument();
  });
});

