import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Main } from '../components/Main';
import { Ticket } from '../types';

const USERNAME = 'kyran';
const UID = '1111-1111-1111-1111';
const TITLE = 'Test Ticket Title';
const DESCRIPTION = 'Some ticket description';
const SEVERITY = 5;
const STATUS = 'ASSIGNED';
const DATE = new Date('09/20/2022').toUTCString();

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

describe('Header', () => {
    it('renders tickets and add button when there are tickets', () => {
        render(<Main tickets={[TICKET]} isAdmin={false} setTickets={() => {}} />);

        const ticketTitle = screen.getByText(TITLE);
        const button = screen.getByText(/Create New Ticket/i);

        expect(ticketTitle).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    it('renders message and add button when there are no tickets', () => {
        render(<Main tickets={[]} isAdmin={false} setTickets={() => {}} />);

        const message = screen.getByText(/There are currently no tickets/i);
        const button = screen.getByText(/Create New Ticket/i);

        expect(message).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });
});
