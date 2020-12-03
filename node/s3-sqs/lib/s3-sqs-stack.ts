import { Duration, RemovalPolicy, CfnOutput, Stack } from '@aws-cdk/core';
import { EventType, Bucket } from '@aws-cdk/aws-s3';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsDestination} from '@aws-cdk/aws-s3-notifications';
import { ServicePrincipal, Role, PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct, StackProps } from '@aws-cdk/core';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Function, Runtime, AssetCode } from '@aws-cdk/aws-lambda';
import { StringParameter } from '@aws-cdk/aws-ssm';

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
        bucketName: stack.account+'-'+ stackconfig?.stacksettings?.environment +'-'+'s3-bucket',
        removalPolicy : RemovalPolicy.DESTROY});
        
    const ext_q_arn = StringParameter.fromStringParameterAttributes(this, 'ext-account', {
      parameterName: '/sqs/ext-account-id',
    });
    
    const ext_q_name = 'arn:aws:sqs:us-east-1:'+ ext_q_arn.stringValue +':cross-prsnlaccount-test-sqs';

    const my_queue = new Queue(this, 'mySqs', {
      queueName: stack.account+'-'+ stackconfig?.stacksettings?.environment +'-'+'testQueue',
      visibilityTimeout: Duration.seconds(300),
      retentionPeriod: Duration.seconds(1209600)
    });

    const second_queue = Queue.fromQueueArn(this, 'SecondSqs', ext_q_name);

    bucket.addEventNotification(EventType.OBJECT_CREATED,
      new SqsDestination(my_queue));

    const lambda = new Function(this, 'Lambda', {
      memorySize: 512,
      code: new AssetCode('function'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_10_X,
    });

    lambda.addEventSource(new SqsEventSource(second_queue, {
      batchSize: 1
    }));

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