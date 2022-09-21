import { createTicketRequestSchema } from '../../src/api/createTicket';

describe('createTicketRequestSchema', () => {
    it('succeeds for valid request', () => {
        const response = createTicketRequestSchema.safeParse({
            title: 'test',
            description: 'testing',
            severity: 5,
        });

        expect(response.success).toBeTruthy();
    });

    it('fails for bad request', () => {
        const response = createTicketRequestSchema.safeParse({
            title: 'test',
            description: 'testing',
            // no severity
        });

        expect(response.success).toBeFalsy();
    });
});
