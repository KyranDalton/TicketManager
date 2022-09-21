import { z } from 'zod';
import { TicketManagerStore } from '../storage/database';
import { Ticket, ticketSeveritySchema, ticketStatusSchema } from '../types';

export const editTicketRequestSchema = z.object({
    ticketId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: ticketStatusSchema.optional(),
    severity: ticketSeveritySchema.optional(),
});

type EditTicketRequest = z.infer<typeof editTicketRequestSchema>;
type EditTicketResponse = Ticket;

export const handler = async (
    request: EditTicketRequest,
    user: string,
    store: TicketManagerStore,
): Promise<EditTicketResponse> => {
    return store.editTicket(request, user);
};
