import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';
import { join } from 'path';
import { Stage } from './app';

interface BackendStackProps extends StackProps {
    stage: Stage;
    userPool: IUserPool;
}

export class BackendStack extends Stack {
    private readonly stage: Stage;

    private readonly ticketTable: ITable;
    private readonly ticketHandler: IFunction;

    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props);

        this.stage = props.stage;

        this.ticketTable = this.createDatabase();
        this.ticketHandler = this.createLambdaHandler();

        this.createAPIGateway(props.userPool);

        this.ticketTable.grantReadWriteData(this.ticketHandler);
    }

    private createDatabase() {
        return new Table(this, `${this.stage}TicketTable`, {
            tableName: `${this.stage}TicketTable`,
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            partitionKey: {
                name: 'TicketId',
                type: AttributeType.STRING,
            },
        });
    }

    private createLambdaHandler() {
        return new Function(this, `${this.stage}TicketHandler`, {
            functionName: `${this.stage}TicketHandler`,
            runtime: Runtime.NODEJS_14_X,
            // Use full path to assets so CodePipeline can find them
            // TODO: Update with real asset folder once it exists
            code: AssetCode.fromAsset(join(__dirname, '../lib')),
            handler: 'index.handler',
            timeout: Duration.seconds(5),
            memorySize: 256,
            environment: {
                STAGE: this.stage.toLowerCase(),
                TICKET_TABLE_NAME: this.ticketTable.tableName,
            },
        });
    }

    private createAPIGateway(userPool: IUserPool) {
        // Make API Gateway authenticate requests using the Cognito user pool.
        const authorizer = new HttpUserPoolAuthorizer(`${this.stage}TicketAuthorizer`, userPool);
        const integration = new HttpLambdaIntegration(`${this.stage}TicketHandlerIntegration`, this.ticketHandler);

        return new HttpApi(this, `${this.stage}TicketAPI`, {
            apiName: `${this.stage}TicketAPI`,
            defaultAuthorizer: authorizer,
            defaultIntegration: integration,
        });
    }
}
