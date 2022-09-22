import React, { useEffect, useState } from 'react';
import { Flex, Button, Text } from '@aws-amplify/ui-react';
import { Ticket as TicketType } from '../types';
import { Ticket } from './Ticket';
import { AddTicketModal } from './AddTicketModal';
import { getAllTickets, userIsAdmin } from '../client';

interface MainProps {
    tickets: TicketType[];
    isAdmin: boolean;
    setTickets: (tickets: TicketType[]) => void;
}

export function MainWrapper() {
    const [isLoading, setIsLoading] = useState(false);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function loadTickets() {
            setIsLoading(true);
            const response = await getAllTickets();
            setTickets(response);
            setIsLoading(false);
        }

        async function loadIsAdmin() {
            setIsAdmin(await userIsAdmin());
        }

        loadTickets();
        loadIsAdmin();
    }, []);

    if (isLoading) {
        return (
            <Flex direction="row" justifyContent="center">
                <Text>Loading tickets...</Text>
            </Flex>
        );
    }

    return (
        <>
            <Main tickets={tickets} isAdmin={isAdmin} setTickets={setTickets} />
        </>
    );
}

export function Main({ tickets, isAdmin, setTickets }: MainProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    if (tickets.length === 0) {
        return (
            <>
                <Flex direction="row" justifyContent="center">
                    <Text>There are currently no tickets</Text>
                </Flex>
                <Flex paddingTop="1rem"></Flex>
                <Flex direction="row" justifyContent="center">
                    <Button variation="primary" onClick={() => setShowAddModal(true)}>
                        Create New Ticket
                    </Button>
                    <AddTicketModal isOpen={showAddModal} setIsOpen={setShowAddModal} setTickets={setTickets} />
                </Flex>
            </>
        );
    }

    return (
        <>
            <Flex direction="row" justifyContent="right">
                <Button variation="primary" onClick={() => setShowAddModal(true)}>
                    Create New Ticket
                </Button>
            </Flex>
            <AddTicketModal isOpen={showAddModal} setIsOpen={setShowAddModal} setTickets={setTickets} />
            <Flex paddingTop="1rem"></Flex>
            {tickets
                .sort((a, b) => b.createDate.localeCompare(a.createDate))
                .map((ticket) => {
                    return (
                        <div key={ticket.ticketId}>
                            <Flex paddingTop="1rem"></Flex>
                            <Ticket ticketProps={ticket} isAdmin={isAdmin} setTickets={setTickets} />
                        </div>
                    );
                })}
        </>
    );
}
