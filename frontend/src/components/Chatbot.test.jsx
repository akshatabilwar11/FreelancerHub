import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chatbot from './Chatbot';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chatbot toggle button initially', () => {
    render(<Chatbot />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });

  it('toggles chat window on click', () => {
    const { container } = render(<Chatbot />);
    
    // Open chat
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('AI Support')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    expect(screen.getByText(/Hi! I'm your FreelencerHub Assistant/i)).toBeInTheDocument();

    // Close chat using its class name to avoid name-less button conflicts
    fireEvent.click(container.querySelector('.chatbot-close'));
    expect(screen.queryByText('AI Support')).not.toBeInTheDocument();
  });

  it('handles sending query successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { reply: 'Sure, I can help with that.' } });
    render(<Chatbot />);

    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Fill query
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'How does this work?' } });
    
    // Submit query
    const form = screen.getByPlaceholderText('Ask me anything...').closest('form');
    fireEvent.submit(form);

    // Verify user message appears
    expect(screen.getByText('How does this work?')).toBeInTheDocument();

    // Verify loading message / typing indicator appears
    expect(screen.getByText('...')).toBeInTheDocument();

    // Wait for bot response
    await waitFor(() => {
      expect(screen.getByText('Sure, I can help with that.')).toBeInTheDocument();
    });

    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('handles query submission failure gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    render(<Chatbot />);

    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Fill and submit query
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Error query' } });
    const form = screen.getByPlaceholderText('Ask me anything...').closest('form');
    fireEvent.submit(form);

    // Wait for error bot message
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I'm having trouble connecting right now/i)).toBeInTheDocument();
    });
  });

  it('does not send empty queries', async () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByRole('button'));

    const form = screen.getByPlaceholderText('Ask me anything...').closest('form');
    fireEvent.submit(form);

    expect(axios.post).not.toHaveBeenCalled();
  });
});
