import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Ticket } from '../components/Ticket';

const ID = '1234-1234-1234-1234';
const TITLE = 'Test Title';
const DESCRIPTION = 'Test Description';
const USER = 'kyran';
const SEVERITY = 5;
const STATUS = 'ASSIGNED';
const DATE = new Date('09/20/2022').toUTCString();

describe('Ticket', () => {
    it('renders the correct information for admins', () => {
        render(
            <Ticket
                ticketProps={{
                    ticketId: ID,
                    title: TITLE,
                    description: DESCRIPTION,
                    requester: USER,
                    severity: SEVERITY,
                    status: STATUS,
                    createDate: DATE,
                    lastModifiedBy: USER,
                    lastModifiedDate: DATE,
                }}
                isAdmin={true}
                setTickets={() => {}}
            />,
        );

        const title = screen.getByText(TITLE);
        const description = screen.getByText(DESCRIPTION);
        const severity = screen.getByText(SEVERITY.toString());
        const requester = screen.getByText(new RegExp(USER));
        const status = screen.getByText(new RegExp(STATUS));
        const createdOn = screen.getByText(new RegExp(DATE));
        const editButton = screen.getByText(/Edit Ticket/);

        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        expect(severity).toBeInTheDocument();
        expect(requester).toBeInTheDocument();
        expect(status).toBeInTheDocument();
        expect(createdOn).toBeInTheDocument();
        expect(editButton).toBeInTheDocument();

        // Admins should be able to edit
        expect(editButton).not.toHaveAttribute('disabled');
    });

    it('renders the correct information for non-admins', () => {
        render(
            <Ticket
                ticketProps={{
                    ticketId: ID,
                    title: TITLE,
                    description: DESCRIPTION,
                    requester: USER,
                    severity: SEVERITY,
                    status: STATUS,
                    createDate: DATE,
                    lastModifiedBy: USER,
                    lastModifiedDate: DATE,
                }}
                isAdmin={false}
                setTickets={() => {}}
            />,
        );

        const title = screen.getByText(TITLE);
        const description = screen.getByText(DESCRIPTION);
        const severity = screen.getByText(SEVERITY.toString());
        const requester = screen.getByText(new RegExp(USER));
        const status = screen.getByText(new RegExp(STATUS));
        const createdOn = screen.getByText(new RegExp(DATE));
        const editButton = screen.getByText(/Edit Ticket/);

        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        expect(severity).toBeInTheDocument();
        expect(requester).toBeInTheDocument();
        expect(status).toBeInTheDocument();
        expect(createdOn).toBeInTheDocument();
        expect(editButton).toBeInTheDocument();

        // Only admins should be able to edit
        expect(editButton).toHaveAttribute('disabled');
    });
});
