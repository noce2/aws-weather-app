#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Aws } from '@aws-cdk/core';
import { BucketCdkStack } from '../lib/bucket-stack';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {
    env: {
        region: 'eu-west-2'
    }
});
new BucketCdkStack(app, 'WebUIStack', {
    env: {
        region: 'eu-west-2'
    }
});
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    env: {
        region: 'eu-west-2'
    }
});

new PipelineStack(app, 'PipelineDeployingLambdaStack', {
    lambdaCode: lambdaStack.lambdaCode,
    repoName: 'aws-weather-app',
    env: {
        region: 'eu-west-2'
    }
})
