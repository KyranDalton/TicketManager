import { TicketManagerStore } from '../storage/database';
import { Ticket } from '../types';

type GetAllTicketsResponse = Ticket[];

export const handler = async (store: TicketManagerStore): Promise<GetAllTicketsResponse> => {
    return store.getAllTickets();
};
