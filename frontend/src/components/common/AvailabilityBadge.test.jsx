import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AvailabilityBadge from './AvailabilityBadge';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  }),
}));

describe('AvailabilityBadge Component', () => {
  it('renders AVAILABLE status correctly', () => {
    render(<AvailabilityBadge status="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders BUSY status correctly', () => {
    render(<AvailabilityBadge status="BUSY" />);
    expect(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('renders OVERLOADED status correctly', () => {
    render(<AvailabilityBadge status="OVERLOADED" />);
    expect(screen.getByText('Overloaded')).toBeInTheDocument();
  });

  it('renders default fallback status for unknown status', () => {
    render(<AvailabilityBadge status="UNKNOWN" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
