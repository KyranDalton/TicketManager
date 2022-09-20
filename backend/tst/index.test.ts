import { handler } from '../src';

describe('handler', () => {
    it('returns correct response', async () => {
        const response = await handler();

        expect(response).toEqual({
            statusCode: 200,
            body: 'Hello World!',
        });
    });
});
