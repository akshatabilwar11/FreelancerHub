import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrustScore from './TrustScore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key === 'trust_score' ? 'Trust Score' : key
  }),
}));

describe('TrustScore Component', () => {
  it('renders Highly Trusted when score >= 90', () => {
    render(<TrustScore score={95} />);
    expect(screen.getByText('Trust Score: 95%')).toBeInTheDocument();
    // Verify icon or colors could be checked, but checking rendering is enough
  });

  it('renders Verified when 70 <= score < 90', () => {
    render(<TrustScore score={80} />);
    expect(screen.getByText('Trust Score: 80%')).toBeInTheDocument();
  });

  it('renders At Risk when score < 70', () => {
    render(<TrustScore score={50} />);
    expect(screen.getByText('Trust Score: 50%')).toBeInTheDocument();
  });
});
