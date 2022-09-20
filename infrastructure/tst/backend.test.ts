import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthStack } from '../lib/auth';
import { BackendStack } from '../lib/backend';

describe('BackendStack', () => {
    it('creates table, handler and API gateway', () => {
        const app = new App();

        const authStack = new AuthStack(app, 'TestAuthStack', { stage: 'Beta' });
        const backendStack = new BackendStack(app, 'TestBackendStack', {
            stage: 'Beta',
            userPool: authStack.userPool,
        });

        const template = Template.fromStack(backendStack);

        template.resourceCountIs('AWS::DynamoDB::Table', 1);
        template.resourceCountIs('AWS::Lambda::Function', 1);
        template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
        template.resourceCountIs('AWS::ApiGatewayV2::Authorizer', 1);
        template.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
    });
});
