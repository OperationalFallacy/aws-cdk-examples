import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, ShellScriptAction, SimpleSynthAction } from "@aws-cdk/pipelines";
import { PipelinesStage } from './pipeline-stage';
import { PolicyStatement } from "@aws-cdk/aws-iam"

/**
 * The stack that defines the application pipeline
 */
export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 's3-sqs',
      cloudAssemblyArtifact,
      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        branch: 'sqs_lambda_trigger',
        oauthToken:  SecretValue.secretsManager('github-token-new'),
        owner: 'OperationalFallacy',
        repo: 'aws-cdk-examples',
      }),

       // How it will be built and synthesized
       synthAction: SimpleSynthAction.standardNpmSynth({
         sourceArtifact,
         subdirectory: 'node/s3-sqs',
         cloudAssemblyArtifact,
         // We need a build step to compile the TypeScript Lambda
         buildCommand: 'npm run build'
       }),
    });

    // This is where we add the application stages - it should be branch-based perhaps
    const devstage = new PipelinesStage(this, 'DeployDev', {
      env: { region: 'us-east-1' }
    },
    {
      stacksettings: {
        environment: 'dev'
      }
    });
 
    const deploydev = pipeline.addApplicationStage(devstage);

    const policy = new PolicyStatement({ 
      actions: [ "s3:ListAllMyBuckets" ],
      resources: [ "arn:aws:s3:::*" ]
    });

    deploydev.addActions(new ShellScriptAction({
      actionName: 'TestInfra',
      rolePolicyStatements: [ policy ],
      useOutputs: {
        // Get the stack Output from the Stage and make it available in
        // the shell script as $BucketName.
        BucketName: pipeline.stackOutput(devstage.BucketName),
      },
      commands: [
        // Use 'curl' to GET the given URL and fail if it returns an error
        'aws s3 ls | grep $BucketName',
      ],
    }));

    pipeline.addApplicationStage(new PipelinesStage(this, 'DeployProd', {
      env: { region: 'us-east-1' }
    },
    {
      stacksettings: {
        environment: 'prod'
      }
    }));
    
  }
}

