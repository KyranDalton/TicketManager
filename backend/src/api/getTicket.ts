import { z } from 'zod';
import { TicketManagerStore } from '../storage/database';
import { Ticket } from '../types';

export const getTicketRequestSchema = z.object({
    ticketId: z.string(),
});

type GetTicketRequest = z.infer<typeof getTicketRequestSchema>;
type GetTicketResponse = Ticket;

export const handler = async (
    { ticketId }: GetTicketRequest,
    store: TicketManagerStore,
): Promise<GetTicketResponse> => {
    return store.getTicket(ticketId);
};
