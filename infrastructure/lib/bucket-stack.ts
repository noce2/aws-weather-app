import * as core from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';
import { CfnOutput } from '@aws-cdk/core';

export class BucketCdkStack extends core.Stack {
    constructor(scope: core.App, id: string, props?: core.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'noce2-dev-aws-weather-app-webui-bucket', {
            versioned: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: true
        });

        new CfnOutput(this, 'static_site_url', {
            exportName: 'AwsWeatherAppWebUiUrl',
            value: bucket.bucketWebsiteUrl
          })
    }
}
