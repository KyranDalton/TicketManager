import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mock, reset, instance, anything, when, verify } from 'ts-mockito';
import { unwrappedHandler, handleAPI, isAdmin } from '../src';
import { TicketManagerStore } from '../src/storage/database';
import { Ticket } from '../src/types';

const STORE_MOCK = mock(TicketManagerStore);

const USERNAME = 'kyran';
const UID = '1111-1111-1111-1111';
const TITLE = 'Test Ticket Title';
const DESCRIPTION = 'Some ticket description';
const SEVERITY = 5;
const STATUS = 'ASSIGNED';
const DATE = new Date('09/20/2022');

const TICKET: Ticket = {
    ticketId: UID,
    title: TITLE,
    description: DESCRIPTION,
    severity: SEVERITY,
    requester: USERNAME,
    status: STATUS,
    createDate: DATE,
    lastModifiedBy: USERNAME,
    lastModifiedDate: DATE,
};

describe('unwrappedHandler', () => {
    beforeEach(() => {
        reset(STORE_MOCK);
    });

    it('returns OPTIONS requests early for CORS', async () => {
        const event: APIGatewayProxyEventV2WithJWTAuthorizer = {
            ...createEvent('/doesNotMatter', {}),
            requestContext: {
                http: {
                    method: 'OPTIONS',
                },
            } as any,
        };

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({ statusCode: 200 });
    });

    it('returns failure for invalid API', async () => {
        const event = createEvent('/someInvalidAPI', {});
        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 404,
            body: 'Unknown API: /someInvalidAPI',
        });
    });

    it('createTicket handles okay', async () => {
        when(STORE_MOCK.createTicket(anything(), anything())).thenResolve(TICKET);

        const event = createEvent(
            '/createTicket',
            {
                title: TITLE,
                description: DESCRIPTION,
                severity: SEVERITY,
            },
            USERNAME,
        );

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify(TICKET),
        });
    });

    it('delete handles okay', async () => {
        when(STORE_MOCK.deleteTicket(anything())).thenResolve();

        const event = createEvent(
            '/deleteTicket',
            {
                ticketId: UID,
            },
            USERNAME,
            '[Beta-Admin]',
        );

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 200,
        });
    });

    it('deleteTicket fails if not admin', async () => {
        when(STORE_MOCK.deleteTicket(anything())).thenResolve();

        const event = createEvent(
            '/deleteTicket',
            {
                ticketId: UID,
            },
            USERNAME,
            '[Beta-Regular]',
        );

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 401,
            body: 'User kyran is not authorized to access /deleteTicket (not admin)',
        });

        verify(STORE_MOCK.deleteTicket(anything())).never();
    });

    it('editTicket handles okay', async () => {
        when(STORE_MOCK.editTicket(anything(), anything())).thenResolve(TICKET);

        const event = createEvent(
            '/editTicket',
            {
                ticketId: UID,
            },
            USERNAME,
            '[Beta-Admin]',
        );

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify(TICKET),
        });
    });

    it('editTicket fails if not admin', async () => {
        when(STORE_MOCK.editTicket(anything(), anything())).thenResolve(TICKET);

        const event = createEvent(
            '/editTicket',
            {
                ticketId: UID,
            },
            USERNAME,
            '[Beta-Regular]',
        );

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 401,
            body: 'User kyran is not authorized to access /editTicket (not admin)',
        });
    });

    it('getAllTickets handles okay', async () => {
        when(STORE_MOCK.getAllTickets()).thenResolve([TICKET]);

        const event = createEvent('/getAllTickets', {});

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify([TICKET]),
        });
    });

    it('getTicket handles okay', async () => {
        when(STORE_MOCK.getTicket(anything())).thenResolve(TICKET);

        const event = createEvent('/getTicket', { ticketId: UID });

        const response = await unwrappedHandler(event, instance(STORE_MOCK));

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify(TICKET),
        });
    });
});

describe('handleAPI', () => {
    it('returns success response when API succeeds', async () => {
        const response = await handleAPI(() => Promise.resolve({ hello: 'world' }));

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify({ hello: 'world' }),
        });
    });

    it('returns fail response when API fails', async () => {
        const response = await handleAPI(() => Promise.reject(new Error('some error')));

        expect(response).toEqual({
            statusCode: 500,
            body: 'Error: some error',
        });
    });
});

describe('isAdmin', () => {
    it('returns true for admin user', () => {
        const adminGroup = '[Beta-Admin]';
        expect(isAdmin(createEvent('/any', {}, USERNAME, adminGroup))).toBeTruthy();
    });

    it('returns false for non-admin', () => {
        const notAdminGroup = '[Beta-Regular]';
        expect(isAdmin(createEvent('/any', {}, USERNAME, notAdminGroup))).toBeFalsy();
    });
});

const createEvent = (
    path: string,
    body: object,
    username?: string,
    groups?: string,
): APIGatewayProxyEventV2WithJWTAuthorizer => {
    return {
        version: '2.0',
        routeKey: '$default',
        rawQueryString: '',
        rawPath: path,
        headers: {},
        requestContext: {
            accountId: '1234',
            apiId: 'ABCD',
            authorizer: {
                jwt: {
                    scopes: [''],
                    claims: {
                        'cognito:username': username || '',
                        'cognito:groups': groups || '',
                    },
                },
            },
            http: {
                method: 'POST',
            },
        } as any,
        body: JSON.stringify(body),
        isBase64Encoded: false,
    };
};
