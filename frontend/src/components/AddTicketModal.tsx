import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button, Divider, Flex, Heading, SelectField, TextAreaField, TextField } from '@aws-amplify/ui-react';
import { Ticket, TicketSeverity } from '../types';
import { createTicket as createTicketCall, getAllTickets } from '../client';

interface AddTicketModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setTickets: (tickets: Ticket[]) => void;
}

export function AddTicketModal({ isOpen, setIsOpen, setTickets }: AddTicketModalProps) {
    const [title, setTitle] = useState<string | undefined>();
    const [hasTitleError, setHasTitleError] = useState(false);
    const [description, setDescription] = useState<string | undefined>();
    const [hasDescriptionError, setHasDescriptionError] = useState(false);
    const [severity, setSeverity] = useState<TicketSeverity | undefined>();
    const [hasSeverityError, setHasSeverityError] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    function clearAndClose() {
        setTitle(undefined);
        setDescription(undefined);
        setSeverity(undefined);
        setHasTitleError(false);
        setHasDescriptionError(false);
        setHasSeverityError(false);
        setIsLoading(false);
        setIsOpen(false);
    }

    function onCreate() {
        setIsLoading(true);

        // validate the parameters
        if (!title) {
            setHasTitleError(true);
            return;
        }

        if (!description) {
            setHasDescriptionError(true);
            return;
        }

        if (!severity) {
            setHasSeverityError(true);
            return;
        }

        const createTicket = async () => {
            const response = await createTicketCall({ title, description, severity });

            if (!response.ticketId) {
                alert('Failed to create ticket... please try again');
            }

            const tickets = await getAllTickets();
            setTickets(tickets);

            clearAndClose();
        };
        createTicket();
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                ariaHideApp={false}
                style={{ content: { width: '30%', margin: '0 auto', height: 'fit-content' } }}
            >
                <Heading level={3}>Create New Ticket</Heading>
                <Divider orientation="horizontal" paddingTop="1rem" />
                <Flex paddingBottom="1rem" />
                <TextField
                    descriptiveText="Overview of your issue"
                    placeholder="e.g. Payroll tool failing to load"
                    errorMessage="Title is a required field"
                    hasError={hasTitleError}
                    label="Title"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
                    isRequired={true}
                />
                <Flex paddingBottom="1rem" />
                <TextAreaField
                    descriptiveText="Describe your issue in more detail"
                    placeholder="e.g. When I go onto the payroll tool I get..."
                    errorMessage="Description is a required field"
                    hasError={hasDescriptionError}
                    label="Description"
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.currentTarget.value)}
                    isRequired={true}
                />
                <Flex paddingBottom="1rem" />
                <SelectField
                    descriptiveText="How severe is this issue"
                    label="Severity"
                    errorMessage="Severity is a required field"
                    hasError={hasSeverityError}
                    placeholder="Please select a severity..."
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSeverity(Number(e.currentTarget.value) as TicketSeverity)
                    }
                    isRequired={true}
                >
                    <option value={1}>1 - Severe Critical Business Issue</option>
                    <option value={2}>2 - Critical Business Issue</option>
                    <option value={3}>3 - Group productivity impacted</option>
                    <option value={4}>4 - Individual productivity impacted</option>
                    <option value={5}>5 - Productivity not immediately impacted</option>
                </SelectField>
                <Flex paddingBottom="1rem" />
                <Flex direction="row" justifyContent="right">
                    <Button onClick={clearAndClose}>Cancel</Button>
                    <Button variation="primary" onClick={onCreate} isLoading={isLoading}>
                        Create Ticket
                    </Button>
                </Flex>
            </Modal>
        </>
    );
}
