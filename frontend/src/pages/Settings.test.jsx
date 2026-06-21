import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Settings from './Settings';

vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  })),
}));

describe('Settings Component', () => {
  it('renders settings successfully', () => {
    render(<Settings />);
    
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    
    // Interact with dark mode toggle
    const toggles = screen.getAllByRole('button');
    // Assuming the first toggle button inside main is dark mode (index 4 because 0-3 are nav buttons)
    fireEvent.click(toggles[4]); 

    // Interact with notification toggles
    fireEvent.click(toggles[5]); // Email
    fireEvent.click(toggles[6]); // Push
    
    // Save button
    fireEvent.click(screen.getByText('Save Settings'));
  });
});
