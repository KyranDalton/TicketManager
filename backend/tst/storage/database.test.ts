import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mock, instance, when, verify, anyOfClass, reset } from 'ts-mockito';
import { TicketManagerStore } from '../../src/storage/database';
import { Ticket } from '../../src/types';

const USER = 'kyran';
const UID = '1111-1111-1111-1111';
const UID_2 = '2222-2222-2222-2222';
const DATE = new Date('09/20/2022');
const TABLE_NAME = 'TestTableName';

const DYNAMO_MOCK = mock(DynamoDBDocumentClient);
const UUID_MOCK = () => UID;
const DATE_MOCK = () => DATE;

const TICKET_MANAGER_STORE = new TicketManagerStore(
    {
        dynamo: instance(DYNAMO_MOCK),
        uuidGenerator: UUID_MOCK,
        dateGenerator: DATE_MOCK,
    },
    { ticketTableName: TABLE_NAME },
);

const TITLE = 'Test Ticket Title';
const DESCRIPTION = 'Some ticket description';
const SEVERITY = 5;
const STATUS = 'ASSIGNED';

const TICKET_RECORD = {
    TicketId: UID,
    Title: TITLE,
    Description: DESCRIPTION,
    Severity: SEVERITY,
    Requester: USER,
    Status: STATUS,
    CreateDate: DATE.toUTCString(),
    LastModifiedBy: USER,
    LastModifiedDate: DATE.toUTCString(),
};

const TICKET: Ticket = {
    ticketId: UID,
    title: TITLE,
    description: DESCRIPTION,
    severity: SEVERITY,
    requester: USER,
    status: STATUS,
    createDate: DATE,
    lastModifiedBy: USER,
    lastModifiedDate: DATE,
};

describe('TicketManagerStore', () => {
    beforeEach(() => {
        reset(DYNAMO_MOCK);
    });

    describe('getAllTickets', () => {
        it('returns empty array when there are no items', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(ScanCommand))).thenResolve({
                $metadata: {},
                Items: undefined,
            });

            const response = await TICKET_MANAGER_STORE.getAllTickets();

            expect(response).toEqual([]);

            verify(DYNAMO_MOCK.send(anyOfClass(ScanCommand))).once();
        });

        it('returns items when only one request is needed', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(ScanCommand))).thenResolve({
                $metadata: {},
                Items: [TICKET_RECORD],
                LastEvaluatedKey: undefined,
            });

            const TICKET_MANAGER_STORE = new TicketManagerStore(
                {
                    dynamo: instance(DYNAMO_MOCK),
                    uuidGenerator: UUID_MOCK,
                    dateGenerator: DATE_MOCK,
                },
                { ticketTableName: TABLE_NAME },
            );

            const response = await TICKET_MANAGER_STORE.getAllTickets();

            expect(response).toEqual([TICKET]);

            verify(DYNAMO_MOCK.send(anyOfClass(ScanCommand))).once();
        });

        it('returns items when there are more last evaluated keys', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(ScanCommand)))
                // first call
                .thenResolve({
                    $metadata: {},
                    Items: [TICKET_RECORD],
                    LastEvaluatedKey: { TicketId: UID },
                })
                // second call
                .thenResolve({
                    $metadata: {},
                    Items: [{ ...TICKET_RECORD, TicketId: UID_2 }],
                    LastEvaluatedKey: undefined,
                });

            const response = await TICKET_MANAGER_STORE.getAllTickets();

            expect(response).toEqual([TICKET, { ...TICKET, ticketId: UID_2 }]);

            verify(DYNAMO_MOCK.send(anyOfClass(ScanCommand))).twice();
        });
    });

    describe('getTicket', () => {
        it('throws error if ticket cannot be found', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(GetCommand))).thenResolve({
                $metadata: {},
                Item: undefined,
            });

            await expect(TICKET_MANAGER_STORE.getTicket(UID)).rejects.toThrowError('Failed to find ticket');

            verify(DYNAMO_MOCK.send(anyOfClass(GetCommand))).once();
        });

        it('returns ticket correctly', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(GetCommand))).thenResolve({
                $metadata: {},
                Item: TICKET_RECORD,
            });

            const response = await TICKET_MANAGER_STORE.getTicket(UID);

            expect(response).toEqual(TICKET);

            verify(DYNAMO_MOCK.send(anyOfClass(GetCommand))).once();
        });
    });

    describe('createTicket', () => {
        it('creates new ticket correctly', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(PutCommand))).thenResolve({ $metadata: {} });

            const response = await TICKET_MANAGER_STORE.createTicket(
                {
                    title: TITLE,
                    description: DESCRIPTION,
                    severity: SEVERITY,
                },
                USER,
            );

            expect(response).toEqual(TICKET);

            verify(DYNAMO_MOCK.send(anyOfClass(PutCommand))).once();
        });
    });

    describe('editTicket', () => {
        it('updates ticket correctly', async () => {
            // First tries to get current item
            when(DYNAMO_MOCK.send(anyOfClass(GetCommand))).thenResolve({
                $metadata: {},
                Item: TICKET_RECORD,
            });
            // Then updates the item
            when(DYNAMO_MOCK.send(anyOfClass(PutCommand))).thenResolve({ $metadata: {} });

            const response = await TICKET_MANAGER_STORE.editTicket(
                {
                    ticketId: UID,
                    description: 'Updated description',
                },
                USER,
            );

            expect(response).toEqual({
                ...TICKET,
                description: 'Updated description',
            });

            verify(DYNAMO_MOCK.send(anyOfClass(PutCommand))).once();
        });
    });

    describe('deleteTicket', () => {
        it('deletes ticket correctly', async () => {
            when(DYNAMO_MOCK.send(anyOfClass(DeleteCommand))).thenResolve({ $metadata: {} });

            await TICKET_MANAGER_STORE.deleteTicket(UID);

            verify(DYNAMO_MOCK.send(anyOfClass(DeleteCommand))).once();
        });
    });
});
