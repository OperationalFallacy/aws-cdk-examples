const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const sqs = require('@aws-cdk/aws-sqs')
const s3_notify = require('@aws-cdk/aws-s3-notifications');
const iam = require('@aws-cdk/aws-iam');
class S3SqsStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const stack = cdk.Stack.of(this);
    
    const extAccount = new cdk.CfnParameter(this, "extAccount", {
      type: "String",
      description: "AWS account id that can assume CrossAccountRole role"});    

    const env = new cdk.CfnParameter(this, "environment", {
      type: "String",
      description: "Environment name"});    
       
    const bucket = new s3.Bucket(this, "myBucket", {
        bucketName: 'ets'+'-'+stack.account+'-'+env.valueAsString+'-'+'s3-bucket',
        removalPolicy : cdk.RemovalPolicy.DESTROY});
    
    const my_queue = new sqs.Queue(this, 'mySqs', {
      queueName: 'ets'+'-'+stack.account+'-'+env.valueAsString+'-'+'testQueue',
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.seconds(1209600)
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED,
      new s3_notify.SqsDestination(my_queue));
    
    // role and policy for Lambda to read from above bucket
    const role = new iam.Role(this, 'myRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addToPolicy(new iam.PolicyStatement({
      resources: [ bucket.bucketArn, bucket.bucketArn+'/*' ],
      actions: ['s3:Get*', 's3:List'] }));

    // IAM role Allow access from other accounts
    // for multiple accounts - use conditions with aws:PrincipalOrgPaths
    // https://aws.amazon.com/blogs/security/iam-share-aws-resources-groups-aws-accounts-aws-organizations/ 
    const cross_acct_role = new iam.Role(this, 'CrossAccountRole', {
      assumedBy: new iam.AccountPrincipal(extAccount.valueAsString),
    });

    cross_acct_role.addToPolicy(new iam.PolicyStatement({
      resources: [ bucket.bucketArn, bucket.bucketArn+'/*' ],
      actions: ['s3:Get*', 's3:List'] }));

    }
}

module.exports = { S3SqsStack }
