import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { uuid } from 'uuidv4';
import { Ticket, TicketSeverity, TicketStatus } from '../types';

type UUIDGenerator = () => string;
type DateGenerator = () => Date;

interface Clients {
    dynamo: DynamoDBDocumentClient;
    uuidGenerator: UUIDGenerator;
    dateGenerator: DateGenerator;
}

interface DynamoConfig {
    ticketTableName: string;
}

/** A single record stored in the database */
interface TicketRecord {
    TicketId: string;
    Title: string;
    Description: string;
    Severity: TicketSeverity;
    Requester: string;
    Status: TicketStatus;
    CreateDate: string;
    LastModifiedBy: string;
    LastModifiedDate: string;
}

type CreateTicketProps = Pick<Ticket, 'title' | 'description' | 'severity'>;
type EditTicketProps = Pick<Ticket, 'ticketId'> &
    Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'severity'>>;

export class TicketManagerStore {
    private dynamo: DynamoDBDocumentClient;
    private uuidGenerator: UUIDGenerator;
    private dateGenerator: DateGenerator;
    private config: DynamoConfig;

    constructor({ dynamo, uuidGenerator, dateGenerator }: Clients, config: DynamoConfig) {
        this.dynamo = dynamo;
        this.uuidGenerator = uuidGenerator;
        this.dateGenerator = dateGenerator;
        this.config = config;
    }

    async getAllTickets(): Promise<Ticket[]> {
        let ticketRecords: TicketRecord[] = [];
        let lastEvaluatedKey: ScanCommandOutput['LastEvaluatedKey'];

        do {
            const response = await this.dynamo.send(
                new ScanCommand({
                    TableName: this.config.ticketTableName,
                    ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {}),
                }),
            );

            if (response.Items) {
                ticketRecords = ticketRecords?.concat(response.Items as TicketRecord[]);
            }

            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        return ticketRecords.map((record) => ticketRecordToTicket(record));
    }

    async getTicket(ticketId: string): Promise<Ticket> {
        const response = await this.dynamo.send(
            new GetCommand({
                TableName: this.config.ticketTableName,
                Key: { TicketId: ticketId },
            }),
        );

        if (!response.Item) {
            throw new Error(`Failed to find ticket: ${ticketId}`);
        }

        const record = response.Item as TicketRecord;

        return ticketRecordToTicket(record);
    }

    async createTicket(props: CreateTicketProps, user: string): Promise<Ticket> {
        const { title, description, severity } = props;

        const now = this.dateGenerator();

        const ticketRecord: TicketRecord = {
            TicketId: this.uuidGenerator(),
            Title: title,
            Description: description,
            Severity: severity,
            Requester: user,
            Status: 'ASSIGNED', // New tickets go into status assigned
            CreateDate: now.toUTCString(),
            LastModifiedBy: user,
            LastModifiedDate: now.toUTCString(),
        };

        await this.dynamo.send(
            new PutCommand({
                TableName: this.config.ticketTableName,
                Item: ticketRecord,
            }),
        );

        return ticketRecordToTicket(ticketRecord);
    }

    async editTicket(props: EditTicketProps, user: string): Promise<Ticket> {
        const ticket = await this.getTicket(props.ticketId);

        const ticketRecord: TicketRecord = ticketToTicketRecord({
            ...ticket,
            ...props,
            lastModifiedBy: user,
            lastModifiedDate: this.dateGenerator(),
        });

        await this.dynamo.send(
            new PutCommand({
                TableName: this.config.ticketTableName,
                Item: ticketRecord,
            }),
        );

        return ticketRecordToTicket(ticketRecord);
    }

    async deleteTicket(ticketId: string): Promise<void> {
        await this.dynamo.send(
            new DeleteCommand({
                TableName: this.config.ticketTableName,
                Key: { TicketId: ticketId },
            }),
        );
    }

    static create(): TicketManagerStore {
        const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        const ticketTableName = process.env.TICKET_TABLE_NAME;

        if (!ticketTableName) {
            throw new Error('Require TICKET_TABLE_NAME environment variable');
        }

        const clients: Clients = {
            dynamo,
            uuidGenerator: uuid,
            dateGenerator: () => new Date(),
        };

        return new TicketManagerStore(clients, { ticketTableName });
    }
}

const ticketRecordToTicket = (record: TicketRecord): Ticket => {
    return {
        ticketId: record.TicketId,
        title: record.Title,
        description: record.Description,
        severity: record.Severity,
        requester: record.Requester,
        status: record.Status,
        createDate: new Date(record.CreateDate),
        lastModifiedBy: record.LastModifiedBy,
        lastModifiedDate: new Date(record.LastModifiedDate),
    };
};

const ticketToTicketRecord = (ticket: Ticket): TicketRecord => {
    return {
        TicketId: ticket.ticketId,
        Title: ticket.title,
        Description: ticket.description,
        Severity: ticket.severity,
        Requester: ticket.requester,
        Status: ticket.status,
        CreateDate: ticket.createDate.toUTCString(),
        LastModifiedBy: ticket.lastModifiedBy,
        LastModifiedDate: ticket.lastModifiedDate.toUTCString(),
    };
};
