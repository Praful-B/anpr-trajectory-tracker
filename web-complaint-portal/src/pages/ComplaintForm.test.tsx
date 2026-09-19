import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComplaintForm from './ComplaintForm';

describe('ComplaintForm', () => {
  it('renders correctly', () => {
    render(<ComplaintForm />);
    expect(screen.getByText('File Vehicle Theft Complaint')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MH 12 AB 1234')).toBeInTheDocument();
  });

  it('formats license plate input correctly', () => {
    render(<ComplaintForm />);
    const plateInput = screen.getByPlaceholderText('MH 12 AB 1234');
    
    fireEvent.change(plateInput, { target: { value: 'mh12ab1234' } });
    
    // Formatting logic in ComplaintForm: 
    // 2 chars, 2 nums, 1-2 chars, 4 nums
    // For 'MH12AB1234' -> 'MH 12 AB 1234'
    expect(plateInput).toHaveValue('MH 12 AB 1234');
  });

  it('allows submission', () => {
    render(<ComplaintForm />);
    const submitButton = screen.getByText('Submit Report');
    expect(submitButton).toBeInTheDocument();
    
    // In a real app we'd mock the API call, for now just ensure button exists and is clickable
    fireEvent.click(submitButton);
  });
});
