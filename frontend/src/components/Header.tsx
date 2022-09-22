import React from 'react';
import { Button, Divider, Grid, Heading } from '@aws-amplify/ui-react';

interface HeaderProps {
    signOut?: () => void;
    username?: string;
}

export function Header({ signOut, username }: HeaderProps) {
    return (
        <>
            <Grid>
                <Heading level={1} columnStart={1} columnEnd={3} rowStart={1} rowEnd={2} paddingLeft="1rem">
                    Ticket Manager
                </Heading>
                <Button onClick={signOut} disabled={!signOut} columnStart={14} columnEnd={15} rowStart={1} rowEnd={2}>
                    {username ? `Sign Out, ${username}` : 'Sign Out'}
                </Button>
            </Grid>
            <Divider orientation="horizontal" paddingTop="1rem" />
        </>
    );
}
