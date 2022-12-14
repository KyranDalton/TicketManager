// TODO: Move these to a shared package between `frontend` and `backend` to avoid duplication
export type TicketSeverity = 1 | 2 | 3 | 4 | 5;
export type TicketStatus = 'ASSIGNED' | 'WORK_IN_PROGRESS' | 'RESOLVED';

export interface Ticket {
    ticketId: string;
    title: string;
    description: string;
    severity: TicketSeverity;
    requester: string;
    status: TicketStatus;
    createDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}
