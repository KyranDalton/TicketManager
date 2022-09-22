import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

describe('Header', () => {
    it('renders the title and button', () => {
        render(<Header />);

        const title = screen.getByText(/Ticket Manager/i);
        const button = screen.getByText(/Sign out/i);

        expect(title).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });
});
