import React, { useState } from 'react';
import { Flex, Button, Text } from '@aws-amplify/ui-react';
import { Ticket as TicketType } from '../types';
import { Ticket } from './Ticket';
import { AddTicketModal } from './AddTicketModal';

interface MainProps {
    tickets: TicketType[];
    isAdmin: boolean;
}

export function Main({ tickets, isAdmin }: MainProps) {
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
                    <AddTicketModal isOpen={showAddModal} setIsOpen={setShowAddModal} />
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
            <AddTicketModal isOpen={showAddModal} setIsOpen={setShowAddModal} />
            <Flex paddingTop="1rem"></Flex>
            {tickets.map((ticket) => {
                return (
                    <div key={ticket.ticketId}>
                        <Flex paddingTop="1rem"></Flex>
                        <Ticket ticketProps={ticket} isAdmin={isAdmin} />
                    </div>
                );
            })}
        </>
    );
}
