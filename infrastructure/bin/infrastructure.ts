#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WeatherAppStackDeploymentPipelineStack } from '../lib/weather-app-stack-deployment-pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    env: {
        region: 'eu-west-2'
    }
});

const weatherAppStackName = 'WeatherAppStack';

new WeatherAppStackDeploymentPipelineStack(app, 'WeatherAppStackDeploymentPipelineStack', {
    repoName: 'aws-weather-app',
    env: {
        region: 'eu-west-2'
    },
    branch: 'custom-res-soln',
    weatherAppStackName: weatherAppStackName
})
