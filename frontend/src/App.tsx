import React from 'react';
import { Authenticator, Flex } from '@aws-amplify/ui-react';
import { Header } from './components/Header';
import { MainWrapper } from './components/Main';

export function App() {
    return (
        <Authenticator hideSignUp>
            {({ signOut, user }) => (
                <>
                    <Header signOut={signOut} username={user?.username}></Header>
                    <Flex paddingTop="1rem"></Flex>
                    <MainWrapper />
                </>
            )}
        </Authenticator>
    );
}

export default App;
