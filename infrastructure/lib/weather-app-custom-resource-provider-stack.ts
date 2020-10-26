import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, CfnOutput, Duration, Stack, StackProps } from '@aws-cdk/core';
      
export class WeatherAppCustomResourceProviderStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
  public readonly providerArn: string
      
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);
      
    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'WeatherAppCustomResourceProviderLambda', {
      code: this.lambdaCode,
      handler: 'index.main',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: Duration.seconds(900)
    });
    
    this.providerArn = func.functionArn;

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
