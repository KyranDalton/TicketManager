import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FrontendStack } from '../lib/frontend';

describe('FrontendStack', () => {
    it('contains expected resources', () => {
        const app = new App();
        const frontendStack = new FrontendStack(app, 'TestFrontendStack', {
            stage: 'Beta',
            hostedZoneId: 'ABCDEFGHIJK',
            hostedZoneName: 'test.com',
            domainName: 'mywebsite.test.com',
        });

        const template = Template.fromStack(frontendStack);

        template.resourceCountIs('AWS::S3::Bucket', 2); // Frontend asset bucket + CloudFront logging bucket
        template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1);
        template.resourceCountIs('AWS::CloudFront::Distribution', 1);
        template.resourceCountIs('AWS::Route53::RecordSet', 1);
        template.resourceCountIs('Custom::CDKBucketDeployment', 1);
    });
});
