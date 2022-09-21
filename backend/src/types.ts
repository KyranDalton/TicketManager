export type TicketSeverity = 1 | 2 | 3 | 4 | 5;
export type TicketStatus = 'ASSIGNED' | 'WORK_IN_PROGRESS' | 'RESOLVED';

export interface Ticket {
    ticketId: string;
    title: string;
    description: string;
    severity: TicketSeverity;
    requester: string;
    status: TicketStatus;
    createDate: Date;
    lastModifiedBy: string;
    lastModifiedDate: Date;
}
