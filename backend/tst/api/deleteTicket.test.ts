import { deleteTicketRequestSchema } from '../../src/api/deleteTicket';

describe('deleteTicketRequestSchema', () => {
    it('succeeds for valid request', () => {
        const response = deleteTicketRequestSchema.safeParse({
            ticketId: 'some id',
        });

        expect(response.success).toBeTruthy();
    });

    it('fails for bad request', () => {
        const response = deleteTicketRequestSchema.safeParse({});

        expect(response.success).toBeFalsy();
    });
});
