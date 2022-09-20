import { App } from 'aws-cdk-lib';
import { PipelineStack } from './pipeline';
import { ENV } from './config';

const app = new App();

// Instantiate main stack
new PipelineStack(app, 'TicketManagerPipelineStack', { env: ENV });
