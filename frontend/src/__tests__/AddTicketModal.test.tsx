import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { AddTicketModal } from '../components/AddTicketModal';

describe('AddTicketModal', () => {
    it('renders the correct components when modal is open', () => {
        render(<AddTicketModal isOpen={true} setIsOpen={(_) => {}} setTickets={() => {}} />);

        const header = screen.getByText(/Create New Ticket/i);
        const titleBox = screen.getByText(/Title/i);
        const descriptionBox = screen.getByText(/Description/i);
        const severityDropdown = screen.getByText(/Please select a severity.../i);
        const cancelButton = screen.getByText(/Cancel/i);
        const createButton = screen.getByText(/Create Ticket/i);

        expect(header).toBeInTheDocument();
        expect(titleBox).toBeInTheDocument();
        expect(descriptionBox).toBeInTheDocument();
        expect(severityDropdown).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
        expect(createButton).toBeInTheDocument();
    });

    it('renders the correct components when modal is closed', () => {
        render(<AddTicketModal isOpen={false} setIsOpen={(_) => {}} setTickets={() => {}} />);

        expect(() => screen.getByText(/Create New Ticket/i)).toThrowError();
    });
});
