import { z } from 'zod';
import { TicketManagerStore } from '../storage/database';
import { Ticket, ticketSeveritySchema } from '../types';

export const createTicketRequestSchema = z.object({
    title: z.string(),
    description: z.string(),
    severity: ticketSeveritySchema,
});

type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>;
type CreateTicketResponse = Ticket;

export const handler = async (
    request: CreateTicketRequest,
    user: string,
    store: TicketManagerStore,
): Promise<CreateTicketResponse> => {
    return store.createTicket(request, user);
};
