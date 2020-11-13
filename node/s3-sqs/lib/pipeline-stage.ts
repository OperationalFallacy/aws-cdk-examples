import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { S3SqsStack } from './s3-sqs-stack';

/**
 * Deployable unit of web service app
 */
export class PipelinesDemoStage extends Stage {
  public readonly BucketName: CfnOutput;
  
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new S3SqsStack(this, 'S3SqsStackDev', {
        env : {
            region : 'us-east-1'
        }
    });
    
    // Expose S3SqsStack's output one level higher
    this.BucketName = service.BucketName;
  }
}