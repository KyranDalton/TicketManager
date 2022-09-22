import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { EditTicketModal } from '../components/EditTicketModal';
import { Ticket } from '../types';

const USERNAME = 'kyran';
const UID = '1111-1111-1111-1111';
const TITLE = 'Test Ticket Title';
const DESCRIPTION = 'Some ticket description';
const SEVERITY = 5;
const STATUS = 'ASSIGNED';
const DATE = new Date('09/20/2022');

const TICKET: Ticket = {
    ticketId: UID,
    title: TITLE,
    description: DESCRIPTION,
    severity: SEVERITY,
    requester: USERNAME,
    status: STATUS,
    createDate: DATE,
    lastModifiedBy: USERNAME,
    lastModifiedDate: DATE,
};

describe('EditTicketModal', () => {
    it('renders the correct components when modal is open', () => {
        render(<EditTicketModal ticket={TICKET} isOpen={true} setIsOpen={(_) => {}} />);

        const header = screen.getByText(/Edit Ticket/i);
        const deleteButton = screen.getByText(/Delete/i);
        const cancelButton = screen.getByText(/Cancel/i);
        const createButton = screen.getByText(/Update Ticket/i);

        expect(header).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
        expect(createButton).toBeInTheDocument();
    });

    it('renders the correct components when modal is closed', () => {
        render(<EditTicketModal ticket={TICKET} isOpen={false} setIsOpen={(_) => {}} />);

        expect(() => screen.getByText(/Edit Ticket/i)).toThrowError();
    });
});
