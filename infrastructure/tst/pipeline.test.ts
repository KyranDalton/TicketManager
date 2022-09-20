import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ENV } from '../lib/config';
import { PipelineStack } from '../lib/pipeline';

describe('PipelineStack', () => {
    it('creates the expected pipeline resources', () => {
        const app = new App();
        const pipelineStack = new PipelineStack(app, 'TestPipelineStack', { env: ENV });

        const template = Template.fromStack(pipelineStack);

        template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
    });
});
