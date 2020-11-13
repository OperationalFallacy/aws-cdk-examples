import { Duration, RemovalPolicy, CfnOutput, CfnParameter, Stack } from '@aws-cdk/core';
import { EventType, Bucket } from '@aws-cdk/aws-s3';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsDestination} from '@aws-cdk/aws-s3-notifications';
import { AccountPrincipal, ServicePrincipal, Role, PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct, StackProps } from '@aws-cdk/core';

export class S3SqsStack extends Stack {
  public readonly BucketName: CfnOutput;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const stack = Stack.of(this);

    const extAccount = new CfnParameter(this, "extAccount", {
      type: "String",
      description: "AWS account id that can assume CrossAccountRole role"});    

    const env = new CfnParameter(this, "environment", {
      type: "String",
      description: "Environment name"});

    const bucket = new Bucket(this, "myBucket", {
        bucketName: 'ets'+'-'+stack.account+'-'+env.valueAsString+'-'+'s3-bucket',
        removalPolicy : RemovalPolicy.DESTROY});

    const my_queue = new Queue(this, 'mySqs', {
      queueName: 'ets'+'-'+stack.account+'-'+env.valueAsString+'-'+'testQueue',
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

    // IAM role Allow access from other accounts
    // for multiple accounts - use conditions with aws:PrincipalOrgPaths
    // https://aws.amazon.com/blogs/security/iam-share-aws-resources-groups-aws-accounts-aws-organizations/ 
    const cross_acct_role = new Role(this, 'CrossAccountRole', {
      assumedBy: new AccountPrincipal(extAccount.valueAsString),
    });

    cross_acct_role.addToPolicy(new PolicyStatement({
      resources: [ bucket.bucketArn, bucket.bucketArn+'//*' ],
      actions: ['s3:Get*', 's3:List'] }));

    this.BucketName = new CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    }
}