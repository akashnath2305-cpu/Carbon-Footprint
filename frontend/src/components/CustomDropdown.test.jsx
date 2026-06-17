import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomDropdown from './CustomDropdown';

describe('CustomDropdown', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders the selected value initially', () => {
    render(<CustomDropdown value="option1" onChange={() => {}} options={options} />);
    expect(screen.getByRole('button')).toHaveTextContent('Option 1');
  });

  it('opens dropdown when clicked', () => {
    render(<CustomDropdown value="option1" onChange={() => {}} options={options} />);
    const button = screen.getByRole('button');
    
    // Initially closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('calls onChange and closes when an option is selected', () => {
    const handleChange = vi.fn();
    render(<CustomDropdown value="option1" onChange={handleChange} options={options} />);
    
    // Open
    fireEvent.click(screen.getByRole('button'));
    
    // Select option2
    fireEvent.click(screen.getAllByRole('option')[1]);
    
    expect(handleChange).toHaveBeenCalledWith('option2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation (Enter to open/close)', () => {
    render(<CustomDropdown value="option1" onChange={() => {}} options={options} />);
    const button = screen.getByRole('button');
    
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
