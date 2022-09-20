import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthStack } from '../lib/auth';

describe('AuthStack', () => {
    it('creates pool and groups', () => {
        const app = new App();
        const authStack = new AuthStack(app, 'TestAuthStack', { stage: 'Beta' });

        const template = Template.fromStack(authStack);

        template.resourceCountIs('AWS::Cognito::UserPool', 1);
        template.resourceCountIs('AWS::Cognito::UserPoolGroup', 2);
    });
});
