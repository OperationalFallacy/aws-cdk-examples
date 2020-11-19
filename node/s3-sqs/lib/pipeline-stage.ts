import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { S3SqsStack, stackSettings } from './s3-sqs-stack';

/**
 * Deployable unit
 */

export class PipelinesStage extends Stage {
  public readonly BucketName: CfnOutput;
  
  constructor(scope: Construct, id: string, props: StageProps, stackconfig: stackSettings) {
    super(scope, id, props);
    const service = new S3SqsStack(this, 'S3SqsStack-'+stackconfig.stacksettings?.environment, {
      env: {
        region : 'us-east-1'
      }
    },
    stackconfig
    );
    
    // Expose S3SqsStack's output one level higher
    this.BucketName = service.BucketName;
  }
}