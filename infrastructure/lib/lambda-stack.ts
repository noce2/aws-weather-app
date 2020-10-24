import * as apigateway from '@aws-cdk/aws-apigateway';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, CfnOutput, Stack, StackProps } from '@aws-cdk/core';
      
export class LambdaStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
      
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);
      
    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'index.main',
      runtime: lambda.Runtime.NODEJS_10_X,
    });

    new CfnOutput(this, 'testoutputvars', {
      exportName: 'myTestLambdaCfnKey',
      value: 'myTestLambdaCfnVar'
    })

    const api = new apigateway.RestApi(this, "AwsWeatherAppApi", {
      restApiName: "AWS Weather App Api",
      description: "Serves the weather for a location."
    });

    const getWeatherLambdaIntegration = new apigateway.LambdaIntegration(func, {
      proxy: true
    });

    api.root.addMethod("GET", getWeatherLambdaIntegration)

    new CfnOutput(this, 'apiurl', {
      exportName: 'AwsWeatherAppApiUrl',
      value: api.url
    })
      
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version: func.currentVersion,
    });
      
    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}
