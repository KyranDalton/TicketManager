import { getTicketRequestSchema } from '../../src/api/getTicket';

describe('getTicketRequestSchema', () => {
    it('succeeds for valid request', () => {
        const response = getTicketRequestSchema.safeParse({
            ticketId: 'some id',
        });

        expect(response.success).toBeTruthy();
    });

    it('fails for bad request', () => {
        const response = getTicketRequestSchema.safeParse({});

        expect(response.success).toBeFalsy();
    });
});
