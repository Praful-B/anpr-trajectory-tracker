import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ComplaintTracker from './ComplaintTracker';

describe('ComplaintTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders complaint details', () => {
    render(<ComplaintTracker />);
    expect(screen.getByText('Complaint #CMP-890123')).toBeInTheDocument();
    expect(screen.getByText(/MH 12 AB 1234/)).toBeInTheDocument();
  });

  it('starts with a 48-hour countdown', () => {
    render(<ComplaintTracker />);
    // 48 hours is 48:00:00
    expect(screen.getByText('48:00:00')).toBeInTheDocument();
  });

  it('updates the countdown timer', () => {
    render(<ComplaintTracker />);
    
    // Fast-forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('47:59:59')).toBeInTheDocument();
  });

  it('displays the timeline steps correctly', () => {
    render(<ComplaintTracker />);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Added to Hotlist (48h Window)')).toBeInTheDocument();
    expect(screen.getByText('FIR Verified')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Sighted / Recovered')).toBeInTheDocument();
  });
});
