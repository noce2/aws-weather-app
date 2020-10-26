#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WeatherAppStackDeploymentPipelineStack } from '../lib/weather-app-stack-deployment-pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { WeatherAppStack } from '../lib/weather-app-stack';
import { WeatherAppCustomResourceProviderStack } from '../lib/weather-app-custom-resource-provider-stack';

const app = new cdk.App();

const weatherAppStackName = 'WeatherAppStack';
const weatherAppCustomResourceProviderStackName = WeatherAppCustomResourceProviderStack.name;

const weatherAppCustomResourceProviderStack = new WeatherAppCustomResourceProviderStack(app, weatherAppCustomResourceProviderStackName, {
    env: {
        region: 'eu-west-2'
    }
});

new WeatherAppStack(app, weatherAppStackName, {
    env: {
        region: 'eu-west-2'
    },
    customResourceProviderArn: weatherAppCustomResourceProviderStack.providerArn
});

new WeatherAppStackDeploymentPipelineStack(app, 'WeatherAppStackDeploymentPipelineStack', {
    repoName: 'aws-weather-app',
    env: {
        region: 'eu-west-2'
    },
    branch: 'custom-res-soln',
    weatherAppStackName: weatherAppStackName,
    weatherAppCustomerProviderLambdaCode: weatherAppCustomResourceProviderStack.lambdaCode,
    weatherAppCustomResourceProviderStackName: weatherAppCustomResourceProviderStackName
})
