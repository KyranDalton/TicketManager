import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { TicketManagerStore } from './storage/database';
import { createTicketRequestSchema, handler as createTicket } from './api/createTicket';
import { deleteTicketRequestSchema, handler as deleteTicket } from './api/deleteTicket';
import { editTicketRequestSchema, handler as editTicket } from './api/editTicket';
import { handler as getAllTickets } from './api/getAllTickets';
import { getTicketRequestSchema, handler as getTicket } from './api/getTicket';

const unwrappedHandler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
    store: TicketManagerStore,
): Promise<APIGatewayProxyResultV2> => {
    const path = event.rawPath;

    const username = getUsername(event);
    const userIsAdmin = isAdmin(event);

    const body = JSON.parse(event.body || '{}');

    switch (path) {
        case '/createTicket':
            const createTicketRequest = createTicketRequestSchema.parse(body);
            return handleAPI(() => createTicket(createTicketRequest, username, store));

        case '/deleteTicket':
            // This API is for admins only.
            if (!userIsAdmin) {
                return notAuthorizedResponse(username, path);
            }

            const deleteTicketRequest = deleteTicketRequestSchema.parse(body);
            return handleAPI(() => deleteTicket(deleteTicketRequest, username, store));

        case '/editTicket':
            // This API is for admins only.
            if (!userIsAdmin) {
                return notAuthorizedResponse(username, path);
            }

            const editTicketRequest = editTicketRequestSchema.parse(body);
            return handleAPI(() => editTicket(editTicketRequest, username, store));

        case '/getAllTickets':
            // This API takes no props so needs no validation.
            return handleAPI(() => getAllTickets(store));

        case '/getTicket':
            const getTicketRequest = getTicketRequestSchema.parse(body);
            return handleAPI(() => getTicket(getTicketRequest, store));

        default:
            return {
                statusCode: 404,
                body: `Unknown API: ${path}`,
            };
    }
};

const handleAPI = async (apiCall: () => Promise<any>): Promise<APIGatewayProxyResultV2> => {
    try {
        const response = await apiCall();
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (err) {
        // for debugging
        console.error(err);

        return {
            statusCode: 500,
            body: err.toString(),
        };
    }
};

const notAuthorizedResponse = (username: string, path: string): APIGatewayProxyResultV2 => ({
    statusCode: 401,
    body: `User ${username} is not authorized to access ${path} (not admin)`,
});

const getUsername = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    return event.requestContext.authorizer.jwt.claims['cognito:username'] as string;
};

const isAdmin = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const groups = event.requestContext.authorizer.jwt.claims['cognito:groups'] as string | undefined;

    return groups?.includes('Admin');
};

export const handler = (event: APIGatewayProxyEventV2WithJWTAuthorizer) =>
    unwrappedHandler(event, TicketManagerStore.create());

// for testing
export { unwrappedHandler, handleAPI, isAdmin };
