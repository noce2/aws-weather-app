import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, CfnOutput, Stack, StackProps } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
      
export class WeatherAppCustomResourceProviderStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
  public readonly provider: Provider
      
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);
      
    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'WeatherAppCustomResourceProviderLambda', {
      code: this.lambdaCode,
      handler: 'index.main',
      runtime: lambda.Runtime.NODEJS_10_X,
    });

    new CfnOutput(this, 'functionArn', {
      exportName: 'WeatherAppCustomResourceProviderArn',
      value: func.functionArn
    })
      
    const alias = new lambda.Alias(this, 'WeatherAppCustomResourceProviderLambdaAlias', {
      aliasName: 'Prod',
      version: func.currentVersion,
    });
      
    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
    });
  }
}
