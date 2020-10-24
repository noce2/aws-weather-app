import * as core from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';
import { CfnOutput } from '@aws-cdk/core';

export class BucketCdkStack extends core.Stack {
    public readonly StaticSiteUrl: CfnOutput
    public readonly BucketArn: CfnOutput

    constructor(scope: core.App, id: string, props?: core.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'noce2-dev-aws-weather-app-webui-bucket', {
            versioned: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: true
        });

        this.StaticSiteUrl = new CfnOutput(this, 'StaticSiteUrl', {
            exportName: 'AwsWeatherAppWebUiUrl',
            value: bucket.bucketWebsiteUrl
        });

        this.BucketArn = new CfnOutput(this, 'BucketArn', {
            exportName: 'AwsWeatherAppWebUiUrl',
            value: bucket.bucketArn
        });
    }
}
