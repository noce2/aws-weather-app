import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { BucketCdkStack } from '../lib/bucket-stack';

test('Created bucket is website', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BucketCdkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResource("AWS::S3::Bucket",{
      isWebsite: true
    }));
});
