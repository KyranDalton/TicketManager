import { Stack, StackProps } from 'aws-cdk-lib';
import { DnsValidatedCertificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, IDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { join } from 'path';
import { Stage } from './config';

interface FrontendStackProps extends StackProps {
    stage: Stage;
    hostedZoneId: string;
    hostedZoneName: string;
    domainName: string;
}

export class FrontendStack extends Stack {
    private readonly stage: Stage;

    private readonly websiteBucket: IBucket;
    private readonly distribution: IDistribution;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        const { stage, hostedZoneId, hostedZoneName, domainName } = props;

        this.stage = stage;

        const identity = this.createCloudFrontIdentity();
        const hostedZone = this.getHostedZone(hostedZoneId, hostedZoneName);
        const certificate = this.createDomainCertificate(hostedZone, domainName);

        this.websiteBucket = this.createWebsiteBucket();
        this.distribution = this.createCloudFrontDistribution(identity, domainName, certificate);

        this.createBucketDeployment();
        this.createDomainRecord(this.distribution, hostedZone, domainName);

        // Allow CloudFront to read from the S3 bucket
        this.websiteBucket.grantRead(identity);
    }

    private getHostedZone(hostedZoneId: string, hostedZoneName: string) {
        return HostedZone.fromHostedZoneAttributes(this, `${this.stage}HostedZone`, {
            hostedZoneId,
            zoneName: hostedZoneName,
        });
    }

    private createDomainCertificate(hostedZone: IHostedZone, domainName: string) {
        return new DnsValidatedCertificate(this, `${this.stage}TicketCertificate`, {
            domainName,
            hostedZone,
        });
    }

    private createCloudFrontIdentity() {
        return new OriginAccessIdentity(this, `${this.stage}TicketIdentity`);
    }

    private createWebsiteBucket() {
        return new Bucket(this, `${this.stage}TicketBucket`);
    }

    private createCloudFrontDistribution(
        identity: OriginAccessIdentity,
        domainName: string,
        certificate: ICertificate,
    ) {
        return new Distribution(this, `${this.stage}TicketDistribution`, {
            certificate,
            domainNames: [domainName],
            enableLogging: true, // Assist in debugging + security investigations
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(this.websiteBucket, {
                    originAccessIdentity: identity,
                }),
            },
        });
    }

    private createBucketDeployment() {
        new BucketDeployment(this, `${this.stage}TicketBucketDeployment`, {
            // Use full path to assets so CodePipeline can find them
            // TODO: Update with real asset folder once it exists
            sources: [Source.asset(join(__dirname, '../../frontend/build'))],
            destinationBucket: this.websiteBucket,
            distribution: this.distribution, // Invalidates the CloudFront cache when assets change
            distributionPaths: ['/*'], // Invalidate when any file in the assets change
            memoryLimit: 512,
        });
    }

    private createDomainRecord(distribution: IDistribution, hostedZone: IHostedZone, domainName: string) {
        const target = new CloudFrontTarget(distribution);
        new ARecord(this, `${this.stage}TicketDistributionRecord`, {
            recordName: domainName,
            target: RecordTarget.fromAlias(target),
            zone: hostedZone,
        });
    }
}
