import { Environment } from 'aws-cdk-lib';

const REGION = 'us-east-1';

export type Stage = 'Beta' | 'Prod';
export const ENV: Environment = { region: REGION };
