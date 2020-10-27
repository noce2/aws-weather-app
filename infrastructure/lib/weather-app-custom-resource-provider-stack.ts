import * as codedeploy from '@aws-cdk/aws-codedeploy';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
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

    const policyForCftManagement= new PolicyStatement({
      sid: 'allowCustomResourceProviderAccessToCloudFormation',
      effect: Effect.ALLOW,
      resources: [
        "*"
      ],
      actions: [
        "cloudformation:*"
      ]
    });

    const policyForKmsOperation= new PolicyStatement({
      sid: 'allowCustomResourceProviderAccessToKms',
      effect: Effect.ALLOW,
      resources: [
        "*"
      ],
      actions: [
        "kms:CreateAlias",
        "kms:CreateKey",
        "kms:DeleteAlias",
        "kms:Describe*",
        "kms:GenerateRandom",
        "kms:Get*",
        "kms:List*",
        "kms:TagResource",
        "kms:UntagResource",
        "iam:ListGroups",
        "iam:ListRoles",
        "iam:ListUsers"
      ]
    });

    const policyForS3Operation= new PolicyStatement({
      sid: 'allowCustomResourceProviderAccessToS3',
      effect: Effect.ALLOW,
      resources: [
        "*"
      ],
      actions: [
        "s3:*"
      ]
    });

    const policyForIamRoleCreation= new PolicyStatement({
      sid: 'allowCustomResourceProviderAccessToCreatePipelineIamRoles',
      effect: Effect.ALLOW,
      resources: [
        "*"
      ],
      actions: [
        "iam:*"
      ]
    });

    func.addToRolePolicy(policyForCftManagement);
    func.addToRolePolicy(policyForKmsOperation);
    func.addToRolePolicy(policyForS3Operation);
    func.addToRolePolicy(policyForIamRoleCreation);
  }
}
