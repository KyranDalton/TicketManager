import { Auth } from 'aws-amplify';
import { isProd } from './util/stage';
import { Ticket } from './types';

const BETA_ENDPOINT = 'https://78yha4fupa.execute-api.us-east-1.amazonaws.com';
const PROD_ENDPOINT = 'https://k9lalokiqf.execute-api.us-east-1.amazonaws.com';

export const getAllTickets = () => callBackend('/getAllTickets', {});
export const createTicket = (request: Pick<Ticket, 'title' | 'description' | 'severity'>) =>
    callBackend('/createTicket', request);
export const editTicket = (request: Pick<Ticket, 'ticketId'> & Record<string, any>) =>
    callBackend('/editTicket', request);
export const deleteTicket = (ticketId: string) => callBackend('/deleteTicket', { ticketId });

const callBackend = async (path: string, payload: object): Promise<any> => {
    const endpoint = getEndpoint() + path;

    const token = await getToken();

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error calling: ${path}`);
    }

    try {
        const data = await response.json();
        return data;
    } catch {
        return {};
    }
};

const getEndpoint = () => {
    return isProd() ? PROD_ENDPOINT : BETA_ENDPOINT;
};

const getToken = async () => {
    const userSession = await Auth.currentSession();
    return userSession.getIdToken().getJwtToken();
};

export const userIsAdmin = async () => {
    const userSession = await Auth.currentSession();
    const groups = userSession.getAccessToken().payload['cognito:groups'] as string[] | undefined;
    return JSON.stringify(groups).includes('Admin');
};
