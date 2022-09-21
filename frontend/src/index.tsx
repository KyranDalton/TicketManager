import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { App } from './App';
import { isProd } from './util/stage';
import { BETA_USER_POOL_ID, BETA_USER_POOL_CLIENT, PROD_USER_POOL_ID, PROD_USER_POOL_CLIENT } from './config/cognito';
import '@aws-amplify/ui-react/styles.css';

const IS_PROD = isProd();

Amplify.configure({
    Auth: {
        mandatorySignin: true,
        userPoolId: IS_PROD ? PROD_USER_POOL_ID : BETA_USER_POOL_ID,
        userPoolWebClientId: IS_PROD ? PROD_USER_POOL_CLIENT : BETA_USER_POOL_CLIENT,
    },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
