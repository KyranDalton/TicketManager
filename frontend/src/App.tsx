import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Header } from './components/Header';

export function App() {
    return (
        <Authenticator hideSignUp>
            {({ signOut, user }) => (
                <>
                    <Header signOut={signOut} username={user?.username}></Header>
                    <p>Main content</p>
                </>
            )}
        </Authenticator>
    );
}

export default App;
