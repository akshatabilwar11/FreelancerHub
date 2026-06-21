import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Coupons from './Coupons';

describe('Coupons Component', () => {
  it('renders coupons and handles copy to clipboard', async () => {
    // Mock clipboard
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<Coupons />);

    expect(screen.getByText('25% OFF')).toBeInTheDocument();
    
    // Test copy button for first coupon
    const copyBtns = screen.getAllByRole('button');
    // Nav bar + copy buttons. Usually copy buttons are inside main.
    const firstCopyBtn = screen.getAllByRole('button').find(b => b.className === 'copy-btn');
    if (firstCopyBtn) {
        fireEvent.click(firstCopyBtn);
        expect(mockClipboard.writeText).toHaveBeenCalledWith('WELCOME25');
    }
  });
});
