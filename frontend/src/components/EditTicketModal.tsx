import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button, Divider, Flex, Heading, SelectField, TextAreaField, TextField } from '@aws-amplify/ui-react';
import { Ticket, TicketSeverity, TicketStatus } from '../types';

interface EditTicketModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    ticket: Ticket;
}

export function EditTicketModal({ isOpen, setIsOpen, ticket }: EditTicketModalProps) {
    const [title, setTitle] = useState(ticket.title);
    const [hasTitleError, setHasTitleError] = useState(false);
    const [description, setDescription] = useState(ticket.description);
    const [hasDescriptionError, setHasDescriptionError] = useState(false);
    const [severity, setSeverity] = useState(ticket.severity);
    const [status, setStatus] = useState(ticket.status);

    const [isLoading, setIsLoading] = useState(false);

    function clearAndClose() {
        // Reset fields
        setTitle(ticket.title);
        setDescription(ticket.description);
        setSeverity(ticket.severity);
        setStatus(ticket.status);

        setHasTitleError(false);
        setHasDescriptionError(false);

        setIsLoading(false);
        setIsOpen(false);
    }

    function onDelete() {
        setIsLoading(true);

        // TODO: Make API call for real
        const deleteTicket = async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            clearAndClose();
        };
        deleteTicket();
    }

    function onEdit() {
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

        // TODO: Make API call for real
        const updateTicket = async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(title);
            console.log(description);
            console.log(severity);
            console.log(status);
            clearAndClose();
        };
        updateTicket();
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                ariaHideApp={false}
                style={{ content: { width: '30%', margin: '0 auto', height: 'fit-content' } }}
            >
                <Heading level={3}>Edit Ticket</Heading>
                <Divider orientation="horizontal" paddingTop="1rem" />
                <Flex paddingBottom="1rem" />
                <TextField
                    descriptiveText="Overview of your issue"
                    errorMessage="Title is a required field"
                    hasError={hasTitleError}
                    label="Title"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
                    isRequired={true}
                />
                <Flex paddingBottom="1rem" />
                <TextAreaField
                    descriptiveText="Describe your issue in more detail"
                    errorMessage="Description is a required field"
                    hasError={hasDescriptionError}
                    label="Description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.currentTarget.value)}
                    isRequired={true}
                />
                <Flex paddingBottom="1rem" />
                <SelectField
                    descriptiveText="How severe is this issue"
                    label="Severity"
                    value={severity.toString()}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSeverity(Number(e.currentTarget.value) as TicketSeverity)
                    }
                    isRequired={true}
                >
                    <option value="1">1 - Severe Critical Business Issue</option>
                    <option value="2">2 - Critical Business Issue</option>
                    <option value="3">3 - Group productivity impacted</option>
                    <option value="4">4 - Individual productivity impacted</option>
                    <option value="5">5 - Productivity not immediately impacted</option>
                </SelectField>
                <Flex paddingBottom="1rem" />
                <SelectField
                    descriptiveText="The current state of the ticket"
                    label="Status"
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setStatus(e.currentTarget.value as TicketStatus)
                    }
                    isRequired={true}
                >
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="WORK_IN_PROGRESS">WORK_IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                </SelectField>
                <Flex paddingBottom="1rem" />
                <Flex direction="row" justifyContent="right">
                    <Button backgroundColor="red" variation="primary" onClick={onDelete} isLoading={isLoading}>
                        Delete
                    </Button>
                    <Button onClick={clearAndClose} isLoading={isLoading}>
                        Cancel
                    </Button>
                    <Button variation="primary" onClick={onEdit} isLoading={isLoading}>
                        Update Ticket
                    </Button>
                </Flex>
            </Modal>
        </>
    );
}
