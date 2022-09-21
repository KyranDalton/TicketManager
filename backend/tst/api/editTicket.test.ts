import { editTicketRequestSchema } from '../../src/api/editTicket';

describe('editTicketRequestSchema', () => {
    it('succeeds for valid request', () => {
        const response = editTicketRequestSchema.safeParse({
            ticketId: 'some id',
            description: 'some new description',
        });

        expect(response.success).toBeTruthy();
    });

    it('fails for bad request', () => {
        const response = editTicketRequestSchema.safeParse({
            // missing ticketId
            title: 'some new title',
        });

        expect(response.success).toBeFalsy();
    });
});
