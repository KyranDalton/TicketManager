import React, { useState } from 'react';
import { Badge, Card, Grid, Heading, Text, Flex, Divider, Button } from '@aws-amplify/ui-react';
import { Ticket as TicketType } from '../types';
import { EditTicketModal } from './EditTicketModal';

interface TicketProps {
    ticketProps: TicketType;
    isAdmin: boolean;
}

export function Ticket({ ticketProps, isAdmin }: TicketProps) {
    const { title, description, severity, requester, status, createDate } = ticketProps;

    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <>
            <Card variation="outlined">
                <Grid>
                    <Flex columnStart={1} columnEnd={1} rowStart={1} rowEnd={2} direction="row">
                        <Badge alignSelf="center" width="min-content">
                            {severity}
                        </Badge>
                        <Heading alignSelf="center" level={5}>
                            {title}
                        </Heading>
                        <Button
                            alignSelf="center"
                            marginLeft="auto"
                            variation="primary"
                            disabled={!isAdmin}
                            onClick={() => setShowEditModal(true)}
                        >
                            Edit Ticket
                        </Button>
                    </Flex>
                    <Flex columnStart={1} columnEnd={1} rowStart={2} rowEnd={3} paddingTop="1rem">
                        <Text>{description}</Text>
                    </Flex>
                    <Flex columnStart={1} columnEnd={1} rowStart={3} rowEnd={4} paddingTop="1rem">
                        <Text fontStyle="italic">Request by: {requester}</Text>
                        <Divider orientation="vertical" />
                        <Text fontStyle="italic">Status: {status}</Text>
                        <Divider orientation="vertical" />
                        <Text fontStyle="italic">Created on: {createDate.toUTCString()}</Text>
                    </Flex>
                </Grid>
            </Card>
            <EditTicketModal ticket={ticketProps} isOpen={showEditModal} setIsOpen={setShowEditModal} />
        </>
    );
}
