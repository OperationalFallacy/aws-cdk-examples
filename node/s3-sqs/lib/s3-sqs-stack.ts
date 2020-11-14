import { Duration, RemovalPolicy, CfnOutput, Stack } from '@aws-cdk/core';
import { EventType, Bucket } from '@aws-cdk/aws-s3';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsDestination} from '@aws-cdk/aws-s3-notifications';
import { ServicePrincipal, Role, PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct, StackProps } from '@aws-cdk/core';

export class stackSettings {
  readonly stacksettings?: {
    readonly environment?: string
  }
}

export class S3SqsStack extends Stack {
  public readonly BucketName: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps, stackconfig?: stackSettings) {
    super(scope, id, props);

    const stack = Stack.of(this);

    const bucket = new Bucket(this, "myBucket", {
        bucketName: 'ets'+'-'+stack.account+'-'+ stackconfig?.stacksettings?.environment +'-'+'s3-bucket',
        removalPolicy : RemovalPolicy.DESTROY});

    const my_queue = new Queue(this, 'mySqs', {
      queueName: 'ets'+'-'+stack.account+'-'+ stackconfig?.stacksettings?.environment +'-'+'testQueue',
      visibilityTimeout: Duration.seconds(300),
      retentionPeriod: Duration.seconds(1209600)
    });

    bucket.addEventNotification(EventType.OBJECT_CREATED,
      new SqsDestination(my_queue));

    // role and policy for Lambda to read from above bucket
    const role = new Role(this, 'myRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addToPolicy(new PolicyStatement({
      resources: [ bucket.bucketArn, bucket.bucketArn + '//*' ],
      actions: ['s3:Get*', 's3:List'] }));

    this.BucketName = new CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    }
}