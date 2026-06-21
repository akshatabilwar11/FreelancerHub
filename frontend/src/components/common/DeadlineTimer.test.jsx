import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeadlineTimer from './DeadlineTimer';
import { addDays, subDays } from 'date-fns';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === 'days_left') return `${options.count} days left`;
      return key;
    }
  })
}));

describe('DeadlineTimer Component', () => {
  beforeEach(() => {
    // Lock system time to a fixed point: 2026-05-20T12:00:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null if no deadline is provided', () => {
    const { container } = render(<DeadlineTimer deadline={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders expired state for past deadlines', () => {
    // Deadline is in the past: 2026-05-18T12:00:00Z
    const pastDate = '2026-05-18T12:00:00Z';
    render(<DeadlineTimer deadline={pastDate} />);

    const text = screen.getByText('Expired');
    expect(text).toBeInTheDocument();
    // Color should be red (#ef4444)
    expect(text.parentElement.style.color).toBe('rgb(239, 68, 68)');
  });

  it('renders due today when deadline is today', () => {
    // Deadline is later today: 2026-05-20T18:00:00Z
    const today = '2026-05-20T18:00:00Z';
    render(<DeadlineTimer deadline={today} />);

    const text = screen.getByText('Due today');
    expect(text).toBeInTheDocument();
  });

  it('renders days left for future deadlines', () => {
    // Deadline is exactly 5 days in the future: 2026-05-25T12:00:00Z
    const futureDate = '2026-05-25T18:00:00Z';
    render(<DeadlineTimer deadline={futureDate} />);

    const text = screen.getByText('5 days left');
    expect(text).toBeInTheDocument();
    // Color should be green (#10b981)
    expect(text.parentElement.style.color).toBe('rgb(16, 185, 129)');
  });

  it('renders amber warning color when 3 or fewer days are left', () => {
    // Deadline is 2 days in the future: 2026-05-22T18:00:00Z
    const futureWarningDate = '2026-05-22T18:00:00Z';
    render(<DeadlineTimer deadline={futureWarningDate} />);

    const text = screen.getByText('2 days left');
    expect(text).toBeInTheDocument();
    // Color should be amber (#f59e0b)
    expect(text.parentElement.style.color).toBe('rgb(245, 158, 11)');
  });
});
