import React from 'react';
import { render, screen } from '@testing-library/react';
import AddOffice from './AddOffice';

test('renders AddOffice component', () => {
    render(<AddOffice />);
    const linkElement = screen.getByText(/Add Office/i);
    expect(linkElement).toBeInTheDocument();
});