import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TooltipIcon from './TooltipIcon';

describe('TooltipIcon', () => {
  it('renders without crashing', () => {
    render(<TooltipIcon name="Lightbulb" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders a tooltip when tooltipText is provided', () => {
    render(<TooltipIcon name="Lightbulb" tooltipText="A tip" />);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('A tip')).toBeInTheDocument();
  });

  it('applies aria-label for accessibility', () => {
    render(<TooltipIcon name="Lightbulb" tooltipText="A tip" />);
    expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', 'A tip');
  });
});
