import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { PipelinesStage } from './pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();
 
    const pipeline = new CdkPipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 's3-sqs',
      cloudAssemblyArtifact,
      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        branch: 'codepipeline',
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
    pipeline.addApplicationStage(new PipelinesStage(this, 'DeployDev', {
      env: { region: 'us-east-1' }
    },
    {
      stacksettings: {
        environment: 'dev'
      }
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

