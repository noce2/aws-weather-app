import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as kms from '@aws-cdk/aws-kms';
import * as s3 from '@aws-cdk/aws-s3';
import { App, Stack, StackProps, SecretValue, RemovalPolicy } from '@aws-cdk/core';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { VariableExposedCloudFormationCreateUpdateStackAction } from './custom-cft-action';
import { BucketCdkStack } from './bucket-stack';

export interface WeatherAppStackDeploymentPipelineStackProps extends StackProps {
  readonly repoName: string
  readonly branch: string;
  readonly weatherAppStackName: string;
}

export class WeatherAppStackDeploymentPipelineStack extends Stack {

  constructor(app: App, id: string, props: WeatherAppStackDeploymentPipelineStackProps) {
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

    const key = new kms.Key(this, 'WeatherAppStackDeploymentArtifactsBucketKey', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    key.addToResourcePolicy(keyPolicy)

    const pipelineArtifactsBucket = new s3.Bucket(this, 'WeatherAppStackDeploymentPipelineArtifactsBucket', {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cdkBuild = new codebuild.PipelineProject(this, 'WeatherAppStackDeploymentCdkBuild', {
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
            `${props.weatherAppStackName}.template.json`
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');

    const noce2WeatherAppStackCftDeployAction = new VariableExposedCloudFormationCreateUpdateStackAction({
      actionName: 'WeatherAppStack_CFN_Deploy',
      templatePath: cdkBuildOutput.atPath(`${props.weatherAppStackName}.template.json`),
      stackName: `${props.weatherAppStackName}`,
      adminPermissions: true,
      variablesNamespace: 'WeatherAppStack_CFN_Deploy_Namespace'
    });

    const pipeline = new codepipeline.Pipeline(this, 'WeatherAppStackDeploymentPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
                branch: props.branch,
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
          stageName: 'Build_CDK_Apps',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CDK_Build',
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            })
          ],
        },
        {
          stageName: 'Deploy_WeatherAppStack',
          actions: [
            noce2WeatherAppStackCftDeployAction,
          ],
        }
      ],
      artifactBucket: pipelineArtifactsBucket
    });
  }
}
