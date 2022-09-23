import { Stack, StackProps, Stage as CDKStage, StageProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AuthStack } from './auth';
import { BackendStack } from './backend';
import { FrontendStack } from './frontend';
import { Stage, ENV } from './config';

const GITHUB_REPO = 'KyranDalton/TicketManager';
const REPO_BRANCH = 'master';

const HOSTED_ZONE_ID = 'Z06331312APR2JMEMPFYW';
const HOSTED_ZONE_NAME = 'kyrand.people.amazon.dev';

const DOMAIN_SUFFIX = `ticket-manager.${HOSTED_ZONE_NAME}`;

const BETA_DOMAIN_NAME = `beta.${DOMAIN_SUFFIX}`;
const PROD_DOMAIN_NAME = `${DOMAIN_SUFFIX}`;

interface TicketManagerStageProps extends StageProps {
    stage: Stage;
    hostedZoneId: string;
    hostedZoneName: string;
    domainName: string;
}

class TicketManagerStage extends CDKStage {
    constructor(scope: Construct, id: string, props: TicketManagerStageProps) {
        super(scope, id, props);

        const { stage } = props;

        const authStack = new AuthStack(this, `${stage}TicketManagerAuthStack`, props);

        new BackendStack(this, `${stage}TicketManagerBackendStack`, {
            ...props,
            userPool: authStack.userPool,
        });

        new FrontendStack(this, `${stage}TicketManagerFrontendStack`, props);
    }
}

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceAction = CodePipelineSource.gitHub(GITHUB_REPO, REPO_BRANCH);

        const frontendBuildAction = new CodeBuildStep('FrontendBuild', {
            input: sourceAction,
            commands: ['cd frontend', 'npm ci', 'npm run build', 'cd ..'],
            primaryOutputDirectory: './',
        });

        const backendBuildAction = new CodeBuildStep('BackendBuild', {
            input: frontendBuildAction,
            commands: ['cd backend', 'npm ci', 'npm run build', 'cd ..'],
            primaryOutputDirectory: './',
        });

        const synthAction = new CodeBuildStep('Synth', {
            input: backendBuildAction,
            installCommands: [
                // Globally install cdk in the container
                'npm install -g aws-cdk',
            ],
            commands: ['cd infrastructure', 'npm ci', 'npm run build', 'npx cdk synth', 'cd ..'],
            // Synth step must output to cdk.out for mutation/deployment
            primaryOutputDirectory: './infrastructure/cdk.out',
        });

        const pipeline = new CodePipeline(this, 'TicketManagerPipeline', {
            pipelineName: 'TicketManagerPipeline',
            synth: synthAction,
        });

        const betaStage = new TicketManagerStage(this, 'BetaTicketManagerStage', {
            env: ENV,
            stage: 'Beta',
            hostedZoneId: HOSTED_ZONE_ID,
            hostedZoneName: HOSTED_ZONE_NAME,
            domainName: BETA_DOMAIN_NAME,
        });

        const prodStage = new TicketManagerStage(this, 'ProdTicketManagerStage', {
            env: ENV,
            stage: 'Prod',
            hostedZoneId: HOSTED_ZONE_ID,
            hostedZoneName: HOSTED_ZONE_NAME,
            domainName: PROD_DOMAIN_NAME,
        });

        const betaHealthCheck = new ShellStep('BetaTicketManagerHealthCheck', {
            commands: [`ping -c ${BETA_DOMAIN_NAME}`],
        });

        const failHealthCheck = new ShellStep('BetaTicketManagerFailHealthCheck', {
            commands: [`ping -c fail.${BETA_DOMAIN_NAME}`],
        });

        pipeline.addStage(betaStage).addPost(betaHealthCheck, failHealthCheck);
        pipeline.addStage(prodStage);
    }
}
