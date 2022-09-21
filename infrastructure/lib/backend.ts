import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
    CorsHttpMethod,
    HttpApi,
    HttpMethod,
    HttpNoneAuthorizer,
    HttpRoute,
    HttpRouteKey,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';
import { join } from 'path';
import { Stage } from './config';

interface BackendStackProps extends StackProps {
    stage: Stage;
    userPool: IUserPool;
    domainName: string;
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

        this.createAPIGateway(props.userPool, props.domainName);

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
            code: AssetCode.fromAsset(join(__dirname, '../../backend/dist')),
            handler: 'index.handler',
            timeout: Duration.seconds(5),
            memorySize: 256,
            environment: {
                STAGE: this.stage.toLowerCase(),
                TICKET_TABLE_NAME: this.ticketTable.tableName,
            },
        });
    }

    private createAPIGateway(userPool: IUserPool, domainName: string) {
        // Make API Gateway authenticate requests using the Cognito user pool.
        const authorizer = new HttpUserPoolAuthorizer(`${this.stage}TicketAuthorizer`, userPool);
        const integration = new HttpLambdaIntegration(`${this.stage}TicketHandlerIntegration`, this.ticketHandler);

        const api = new HttpApi(this, `${this.stage}TicketAPI`, {
            apiName: `${this.stage}TicketAPI`,
            defaultAuthorizer: authorizer,
            defaultIntegration: integration,
            corsPreflight: {
                allowCredentials: true,
                allowHeaders: ['*'],
                // For Beta allow localhost origin to make development easier
                allowOrigins: this.stage === 'Beta' ? ['http://localhost:3000', domainName] : [domainName],
                allowMethods: [CorsHttpMethod.ANY],
            },
        });

        // Add a custom route for OPTIONS requests without auth so
        // the CORS preflight request made by the browser can succeed.
        // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
        new HttpRoute(this, `${this.stage}OptionsRoute`, {
            integration,
            httpApi: api,
            routeKey: HttpRouteKey.with('/{proxy+}', HttpMethod.OPTIONS),
            authorizer: new HttpNoneAuthorizer(),
        });

        return api;
    }
}
