import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as kms from '@aws-cdk/aws-kms';
import * as s3 from '@aws-cdk/aws-s3';
import { App, Stack, StackProps, SecretValue, RemovalPolicy } from '@aws-cdk/core';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';

export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
  readonly repoName: string
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
    super(app, id, props);

    const keyPolicy = new PolicyStatement({
      sid: 'allow user access to update key policies',
      effect: Effect.ALLOW,
      resources: ["*"],
      actions: [
        "kms:Create*",
        "kms:Describe*",
        "kms:Enable*",
        "kms:List*",
        "kms:Put*",
        "kms:Update*",
        "kms:Revoke*",
        "kms:Disable*",
        "kms:Get*",
        "kms:Delete*",
        "kms:TagResource",
        "kms:UntagResource",
        "kms:ScheduleKeyDeletion",
        "kms:CancelKeyDeletion"
      ]
    })
    keyPolicy.addArnPrincipal('arn:aws:iam::892799438830:user/noce2-dev')

    const key = new kms.Key(this, 'CustomPipelineArtifactsBucketKey', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    key.addToResourcePolicy(keyPolicy)

    const pipelineArtifactsBucket = new s3.Bucket(this, 'PipelineArtifactsBucket', {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
                'cd infrastructure',
                'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist'
            ],
          },
        },
        artifacts: {
          'base-directory': 'infrastructure/dist',
          files: [
            'LambdaStack.template.json',
            'WebUIStack.template.json'
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });
    const lambdaBuild = new codebuild.PipelineProject(this, 'LambdaBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd backend',
              'npm install',
            ],
          },
          build: {
            commands: 'npm run build',
          },
        },
        artifacts: {
          'base-directory': 'backend',
          files: [
            'index.js',
            'node_modules/**/*',
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });
    const webUIBuild = new codebuild.PipelineProject(this, 'WebUIBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd web-app',
              'npm install',
            ],
          },
          build: {
            commands: [
              'npm run-script configure-environment-url -- --url https://ydple4g6hi.execute-api.eu-west-2.amazonaws.com/prod/ --configuration production',
              'npm run build:prod',
            ],
          },
        },
        artifacts: {
          'base-directory': 'web-app/dist/web-app',
          files: [
            'index.html',
            'favicon.ico',
            '*.js',
            '*.js.map'
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');
    const webUIBuildOutput = new codepipeline.Artifact('WebUIBuildOutput');
    const webStackCftOutput = new codepipeline.Artifact('WebStackDeployCftOutput');

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
                branch: 'main',
                owner: 'noce2',
                repo: props.repoName,
                oauthToken: SecretValue.secretsManager(
                    'arn:aws:secretsmanager:eu-west-2:892799438830:secret:prod/aws-weather-app/github-nYjmSc',
                    {jsonField: 'github-access-token'}
                    ),
                trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
                output: sourceOutput,
                actionName: 'Clone_aws-weather-app_repo'
              }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Lambda_Build',
              project: lambdaBuild,
              input: sourceOutput,
              outputs: [lambdaBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'WebUI_Build',
              project: webUIBuild,
              input: sourceOutput,
              outputs: [webUIBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CDK_Build',
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Lambda_CFN_Deploy',
              templatePath: cdkBuildOutput.atPath('LambdaStack.template.json'),
              stackName: 'LambdaDeploymentStack',
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
              },
              extraInputs: [lambdaBuildOutput],
            }),
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'WebUI_CFN_Deploy',
              templatePath: cdkBuildOutput.atPath('WebUIStack.template.json'),
              stackName: 'WebUIDeploymentStack',
              adminPermissions: true,
              output: webStackCftOutput,
              outputFileName: 'cftoutputs'
            }),
            new codepipeline_actions.S3DeployAction({
              actionName: 'WebUI_Code_Upload',
              input: webUIBuildOutput,
              bucket: Bucket.fromBucketName(this, 'noce2-dev-aws-weather-app-webui-bucket', 
              webStackCftOutput.getParam('cftoutputs','BucketArn'))
            })
          ],
        },
      ],
      artifactBucket: pipelineArtifactsBucket
    });
  }
}
