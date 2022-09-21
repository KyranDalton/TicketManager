import { z } from 'zod';
import { TicketManagerStore } from '../storage/database';

export const deleteTicketRequestSchema = z.object({
    ticketId: z.string(),
});

type DeleteTicketRequest = z.infer<typeof deleteTicketRequestSchema>;
type DeleteTicketResponse = void;

export const handler = async (
    { ticketId }: DeleteTicketRequest,
    user: string,
    store: TicketManagerStore,
): Promise<DeleteTicketResponse> => {
    console.warn(`User ${user} is deleting ticket ${ticketId}`);
    return store.deleteTicket(ticketId);
};
