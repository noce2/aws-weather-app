import * as core from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export class BucketCdkStack extends core.Stack {
    constructor(scope: core.App, id: string, props?: core.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'WebUIBucket', {
            versioned: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: true
        })
    }
}
