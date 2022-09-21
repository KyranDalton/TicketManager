import { Authenticator, Button } from '@aws-amplify/ui-react';

export function App() {
    return (
        <>
            <h1>Ticket Manager</h1>
            <Authenticator hideSignUp>
                {({ signOut, user }) => (
                    <main>
                        <h3>Hello {user?.username} </h3>
                        <Button onClick={signOut}>Sign out</Button>
                    </main>
                )}
            </Authenticator>
        </>
    );
}

export default App;
