import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnUserPoolGroup, IUserPool, UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Stage } from './app';

interface AuthStackProps extends StackProps {
    stage: Stage;
}

export class AuthStack extends Stack {
    readonly stage: Stage;
    readonly userPool: IUserPool;

    constructor(scope: Construct, id: string, props: AuthStackProps) {
        super(scope, id, props);

        this.stage = props.stage;

        this.userPool = new UserPool(this, `${this.stage}TicketManagerPool`, {
            userPoolName: `${this.stage}TicketManagerPool`,
            passwordPolicy: {
                minLength: 6,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
        });

        this.createUserGroup('Regular');
        this.createUserGroup('Admin');
    }

    private createUserGroup(name: string) {
        new CfnUserPoolGroup(this, `${this.stage}${name}Group`, {
            userPoolId: this.userPool.userPoolId,
            groupName: `${this.stage}-TicketManagerGroup-${name}`,
        });
    }
}
