import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Profile from './Profile';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User', email: 'test@example.com', roles: ['FREELANCER'] } })
}));

describe('Profile Component', () => {
  it('renders profile correctly', () => {
    render(<Profile />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Toggle edit mode
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});
