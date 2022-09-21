import { z } from 'zod';

export const ticketSeveritySchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export const ticketStatusSchema = z.union([
    z.literal('ASSIGNED'),
    z.literal('WORK_IN_PROGRESS'),
    z.literal('RESOLVED'),
]);

export type TicketSeverity = z.infer<typeof ticketSeveritySchema>;
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

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
