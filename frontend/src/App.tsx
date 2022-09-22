import React from 'react';
import { Authenticator, Flex } from '@aws-amplify/ui-react';
import { Header } from './components/Header';
import { Ticket as TicketType } from './types';
import { Main } from './components/Main';

const SAMPLE_TICKET: TicketType = {
    ticketId: '1234-1234-1234',
    title: 'My Cool Ticket',
    description: 'Some really cool and slightly long description about this ticket and how its super super urgent',
    severity: 4,
    requester: 'kyran',
    status: 'ASSIGNED',
    createDate: new Date('September 20, 2022 12:24:00'),
    lastModifiedBy: 'kyran',
    lastModifiedDate: new Date('September 20, 2022 12:24:00'),
};

export function App() {
    return (
        <Authenticator hideSignUp>
            {({ signOut, user }) => (
                <>
                    <Header signOut={signOut} username={user?.username}></Header>
                    <Flex paddingTop="1rem"></Flex>
                    <Main tickets={[SAMPLE_TICKET, SAMPLE_TICKET]} isAdmin={false} />
                </>
            )}
        </Authenticator>
    );
}

export default App;
